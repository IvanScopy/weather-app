// src/controllers/combinedWeatherController.js
const axios = require('axios');
const Weather = require('../models/Weather');

// Hàm chuyển đổi tiếng Việt có dấu sang không dấu
const removeDiacritics = (str) => {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Danh sách các thành phố lớn - ánh xạ từ tiếng Việt sang tiếng Anh
const cityMapping = {
  'hà nội': 'hanoi',
  'hồ chí minh': 'ho chi minh city',
  'tp hồ chí minh': 'ho chi minh city',
  'tp. hồ chí minh': 'ho chi minh city',
  'đà nẵng': 'da nang',
  'cần thơ': 'can tho',
  'hải phòng': 'hai phong',
  'nha trang': 'nha trang',
  'huế': 'hue',
  'hạ long': 'ha long',
  'đà lạt': 'da lat',
  'vũng tàu': 'vung tau',
  'quy nhơn': 'quy nhon',
  'buôn ma thuột': 'buon ma thuot',
  'vinh': 'vinh',
  'hải dương': 'hai duong',
  'thái nguyên': 'thai nguyen',
  'bắc giang': 'bac giang',
  'nam định': 'nam dinh',
  'thái bình': 'thai binh',
  'thanh hóa': 'thanh hoa',
  'nghệ an': 'nghe an',
  'hà tĩnh': 'ha tinh',
  'quảng ninh': 'quang ninh',
  'quảng bình': 'quang binh',
  'quảng trị': 'quang tri',
  'quảng nam': 'quang nam',
  'quảng ngãi': 'quang ngai',
  'phú yên': 'phu yen',
  'khánh hòa': 'khanh hoa',
  'ninh thuận': 'ninh thuan',
  'bình thuận': 'binh thuan',
  'kon tum': 'kon tum',
  'gia lai': 'gia lai',
  'đắk lắk': 'dak lak',
  'đắk nông': 'dak nong',
  'lâm đồng': 'lam dong',
  'long an': 'long an',
  'đồng tháp': 'dong thap',
  'vĩnh long': 'vinh long',
  'bến tre': 'ben tre',
  'trà vinh': 'tra vinh',
  'sóc trăng': 'soc trang',
  'bạc liêu': 'bac lieu',
  'cà mau': 'ca mau',
  'kiên giang': 'kien giang',
  'an giang': 'an giang',
  'hậu giang': 'hau giang',
};

// Hàm chuyển đổi tên thành phố sang định dạng API hiểu được
const convertCityName = (city) => {
  // Chuyển thành chữ thường để so sánh
  const cityLower = city.toLowerCase().trim();
  
  // Kiểm tra trong danh sách ánh xạ
  if (cityMapping[cityLower]) {
    return cityMapping[cityLower];
  }
  
  // Nếu không có trong danh sách, loại bỏ dấu
  return removeDiacritics(cityLower);
};

exports.getCombinedWeatherData = async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên thành phố'
      });
    }
    
    // Chuyển đổi tên thành phố
    const convertedCity = convertCityName(city);
    console.log(`Searching for combined weather in: ${convertedCity}`);
    
    // 1. Lấy dữ liệu thời tiết
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY || process.env.WEATHER_API_KEY,
        q: convertedCity,
        aqi: 'no'
      }
    });
    
    // Kiểm tra xem có dữ liệu không
    if (!weatherResponse.data || !weatherResponse.data.location) {
      throw new Error('Không thể lấy dữ liệu thời tiết');
    }
    
    // Lấy dữ liệu thời tiết và định dạng lại
    const weatherData = {
      city: weatherResponse.data.location.name,
      country: weatherResponse.data.location.country,
      temperature: weatherResponse.data.current.temp_c,
      feels_like: weatherResponse.data.current.feelslike_c,
      humidity: weatherResponse.data.current.humidity,
      wind_speed: weatherResponse.data.current.wind_kph,
      wind_direction: weatherResponse.data.current.wind_dir,
      pressure: weatherResponse.data.current.pressure_mb,
      uv: weatherResponse.data.current.uv,
      condition: weatherResponse.data.current.condition,
      last_updated: weatherResponse.data.current.last_updated,
      timestamp: weatherResponse.data.location.localtime_epoch
    };
    
    // 2. Lấy tọa độ từ dữ liệu thời tiết
    const lat = weatherResponse.data.location.lat;
    const lon = weatherResponse.data.location.lon;
    
    console.log("Coordinates:", lat, lon);
    
    // 3. Lấy dữ liệu chất lượng không khí
    const airQualityResponse = await axios.get(`https://api.airvisual.com/v2/nearest_city`, {
      params: {
        lat,
        lon,
        key: process.env.IQAIR_API_KEY
      }
    });
    
    console.log("Air quality response:", airQualityResponse.data);
    
    // 4. Định dạng lại dữ liệu chất lượng không khí
    let airQualityData = null;
    
    if (airQualityResponse.data && airQualityResponse.data.status === 'success') {
      airQualityData = {
        index: airQualityResponse.data.data.current.pollution.aqius,
        components: {
          pm2_5: airQualityResponse.data.data.current.pollution.aqius / 2, // Ước tính từ AQI
          pm10: airQualityResponse.data.data.current.pollution.aqicn
        },
        city: airQualityResponse.data.data.city,
        timestamp: airQualityResponse.data.data.current.pollution.ts
      };
    }
    
    // 5. Kết hợp dữ liệu
    const combinedData = {
      ...weatherData,
      air_quality: airQualityData
    };
    
    // 6. Lưu dữ liệu vào MongoDB (như trong weather controller)
    try {
      const newWeatherData = new Weather({
        city: weatherData.city,
        country: weatherData.country,
        temperature: weatherData.temperature,
        feels_like: weatherData.feels_like,
        condition: weatherData.condition,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        wind_direction: weatherData.wind_direction,
        pressure: weatherData.pressure,
        uv: weatherData.uv,
        air_quality: airQualityData ? airQualityData.index : null,
        last_updated: new Date(weatherData.last_updated)
      });
      
      await newWeatherData.save();
      console.log("Weather data saved to MongoDB");
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Không trả về lỗi cho client nếu việc lưu vào DB thất bại
    }
    
    // 7. Trả về kết quả cho client
    return res.status(200).json({
      success: true,
      data: combinedData
    });
    
  } catch (error) {
    console.error('Error getting combined weather data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu thời tiết và chất lượng không khí',
      error: error.message
    });
  }
};

//lấy vị trí hiện tại 
exports.getCombinedWeatherDataByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)'
      });
    }
    
    console.log(`Searching for location at coordinates: lat=${lat}, lon=${lon}`);
    
    // 1. Lấy dữ liệu chất lượng không khí trước để có tên thành phố chính xác
    const airQualityResponse = await axios.get(`https://api.airvisual.com/v2/nearest_city`, {
      params: {
        lat,
        lon,
        key: process.env.IQAIR_API_KEY
      }
    });
    
    console.log("Air quality response:", airQualityResponse.data);
    
    // Lấy tên thành phố từ API chất lượng không khí
    let cityName = "Unknown";
    let airQualityData = null;
    
    if (airQualityResponse.data && airQualityResponse.data.status === 'success') {
      // Ưu tiên lấy state vì đó thường là thành phố lớn chúng ta cần
      cityName = airQualityResponse.data.data.state || airQualityResponse.data.data.city;
      
      airQualityData = {
        index: airQualityResponse.data.data.current.pollution.aqius,
        components: {
          pm2_5: airQualityResponse.data.data.current.pollution.aqius / 2,
          pm10: airQualityResponse.data.data.current.pollution.aqicn
        },
        city: cityName,
        timestamp: airQualityResponse.data.data.current.pollution.ts
      };
    }
    
    // 2. Lấy dữ liệu thời tiết dựa trên tọa độ
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY || process.env.WEATHER_API_KEY,
        q: `${lat},${lon}`,
        aqi: 'no'
      }
    });
    
    // Kiểm tra xem có dữ liệu không
    if (!weatherResponse.data || !weatherResponse.data.location) {
      throw new Error('Không thể lấy dữ liệu thời tiết cho tọa độ này');
    }
    
    // Lấy dữ liệu thời tiết và định dạng lại
    // QUAN TRỌNG: Sử dụng cityName từ AirVisual thay vì tên từ WeatherAPI
    const weatherData = {
      city: cityName, // Sử dụng tên thành phố từ AirVisual
      country: weatherResponse.data.location.country,
      temperature: weatherResponse.data.current.temp_c,
      feels_like: weatherResponse.data.current.feelslike_c,
      humidity: weatherResponse.data.current.humidity,
      wind_speed: weatherResponse.data.current.wind_kph,
      wind_direction: weatherResponse.data.current.wind_dir,
      pressure: weatherResponse.data.current.pressure_mb,
      uv: weatherResponse.data.current.uv,
      condition: weatherResponse.data.current.condition,
      last_updated: weatherResponse.data.current.last_updated,
      timestamp: weatherResponse.data.location.localtime_epoch
    };
    
    console.log("Using city name:", cityName);
    
    // 3. Kết hợp dữ liệu
    const combinedData = {
      ...weatherData,
      air_quality: airQualityData
    };
    
    // 4. Lưu dữ liệu vào MongoDB
    try {
      const newWeatherData = new Weather({
        city: cityName, // Lưu đúng tên thành phố
        country: weatherData.country,
        temperature: weatherData.temperature,
        feels_like: weatherData.feels_like,
        condition: weatherData.condition,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        wind_direction: weatherData.wind_direction,
        pressure: weatherData.pressure,
        uv: weatherData.uv,
        air_quality: airQualityData ? airQualityData.index : null,
        last_updated: new Date(weatherData.last_updated)
      });
      
      await newWeatherData.save();
      console.log("Weather data saved to MongoDB");
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Không trả về lỗi cho client nếu việc lưu vào DB thất bại
    }
    
    // 5. Trả về kết quả cho client
    return res.status(200).json({
      success: true,
      data: combinedData
    });
    
  } catch (error) {
    console.error('Error getting combined weather data by coordinates:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu thời tiết và chất lượng không khí cho tọa độ này',
      error: error.message
    });
  }
};