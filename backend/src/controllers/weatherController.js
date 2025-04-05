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

// Hàm lấy dữ liệu thời tiết hiện tại từ WeatherAPI
const getCurrentWeather = async (city) => {
  // Chuyển đổi tên thành phố
  const convertedCity = convertCityName(city);
  
  try {
    console.log(`Searching for weather in: ${convertedCity}`);
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: convertedCity,
        aqi: 'no'
      }
    });
    return response.data;
  } catch (error) {
    console.error('WeatherAPI Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// API Controller để lấy và lưu dữ liệu thời tiết
exports.getWeatherData = async (req, res) => {
  const { city } = req.params;
  
  try {
    // Lấy dữ liệu từ WeatherAPI
    const weatherData = await getCurrentWeather(city);
    
    // Tạo đối tượng dữ liệu để lưu vào MongoDB
    const newWeatherData = new Weather({
      city: weatherData.location.name,
      country: weatherData.location.country,
      temperature: weatherData.current.temp_c,
      feels_like: weatherData.current.feelslike_c,
      condition: {
        text: weatherData.current.condition.text,
        icon: weatherData.current.condition.icon,
        code: weatherData.current.condition.code
      },
      humidity: weatherData.current.humidity,
      wind_speed: weatherData.current.wind_kph,
      wind_direction: weatherData.current.wind_dir,
      pressure: weatherData.current.pressure_mb,
      precip: weatherData.current.precip_mm,
      uv: weatherData.current.uv,
      last_updated: new Date(weatherData.current.last_updated_epoch * 1000)
    });
    
    // Lưu vào MongoDB
    await newWeatherData.save();
    
    // Trả về dữ liệu
    res.json({
      city: newWeatherData.city,
      country: newWeatherData.country,
      temperature: newWeatherData.temperature,
      condition: newWeatherData.condition,
      humidity: newWeatherData.humidity,
      wind_speed: newWeatherData.wind_speed,
      wind_direction: newWeatherData.wind_direction,
      last_updated: newWeatherData.last_updated,
      timestamp: newWeatherData.timestamp
    });
  } catch (error) {
    console.error('Error processing weather data:', error);
    res.status(500).json({ 
      error: 'Không thể lấy dữ liệu thời tiết',
      message: error.message 
    });
  }
};

// API Controller để lấy dữ liệu dự báo
exports.getWeatherForecast = async (req, res) => {
  const { city } = req.params;
  const days = req.query.days || 3; // Mặc định lấy 3 ngày theo giới hạn của Free tier
  
  // Chuyển đổi tên thành phố
  const convertedCity = convertCityName(city);
  
  try {
    console.log(`Searching for forecast in: ${convertedCity}`);
    const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: convertedCity,
        days: days,
        aqi: 'no',
        alerts: 'no'
      }
    });
    
    const forecastData = response.data.forecast.forecastday.map(day => ({
      date: day.date,
      max_temp: day.day.maxtemp_c,
      min_temp: day.day.mintemp_c,
      avg_temp: day.day.avgtemp_c,
      condition: day.day.condition,
      humidity: day.day.avghumidity,
      max_wind: day.day.maxwind_kph,
      precip: day.day.totalprecip_mm,
      chance_of_rain: day.day.daily_chance_of_rain
    }));
    
    res.json({
      city: response.data.location.name,
      country: response.data.location.country,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Error getting forecast data:', error);
    res.status(500).json({ 
      error: 'Không thể lấy dữ liệu dự báo',
      message: error.message 
    });
  }
};

exports.getWeatherForecastByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const days = Number(req.query.days || 3); // Chuyển đổi thành số và mặc định là 3 theo giới hạn Free tier
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)'
      });
    }
    
    console.log(`Fetching forecast for coordinates: lat=${lat}, lon=${lon}`);
    console.log(`Requesting forecast with days=${days}`);

    // Gọi API thời tiết với tọa độ
    const weatherApiKey = process.env.WEATHERAPI_KEY || process.env.WEATHER_API_KEY;
    console.log('Using WeatherAPI key:', weatherApiKey ? 'Available' : 'Missing');
    
    const apiResponse = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: weatherApiKey,
        q: `${lat},${lon}`,
        days: days,
        aqi: 'no'
      }
    });
    
    console.log('WeatherAPI Response:', {
      location: apiResponse.data.location,
      forecast_days: apiResponse.data.forecast.forecastday.length,
      days_requested: days
    });
    
    // Xử lý và chuyển đổi dữ liệu sang định dạng chung
    const forecastData = {
      city: apiResponse.data.location.name,
      country: apiResponse.data.location.country,
      forecast: apiResponse.data.forecast.forecastday.map(day => ({
        date: day.date,
        max_temp: day.day.maxtemp_c,
        min_temp: day.day.mintemp_c,
        avg_temp: day.day.avgtemp_c,
        condition: day.day.condition,
        humidity: day.day.avghumidity,
        max_wind: day.day.maxwind_kph,
        precip: day.day.totalprecip_mm,
        chance_of_rain: day.day.daily_chance_of_rain
      }))
    };
    
    console.log(`Returning forecast data with ${forecastData.forecast.length} days`);
    res.json(forecastData);
  } catch (error) {
    console.error('Error in forecast by coords:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Không thể lấy dữ liệu dự báo thời tiết',
      error: error.message
    });
  }
};