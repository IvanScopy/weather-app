const axios = require('axios');
const Weather = require('../models/Weather');

// Cache cho kết quả tìm kiếm để tối ưu hiệu suất
const searchCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 giờ

// Hàm chuyển đổi tiếng Việt có dấu sang không dấu
const removeDiacritics = (str) => {
  return str.normalize('NFD')
            .replace(/[-]/g, '') // Loại bỏ dấu
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Hàm tìm kiếm thành phố từ WeatherAPI
const searchCitiesFromAPI = async (keyword) => {
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/search.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: keyword,
        type: 'city'
      }
    });
    return response.data.map(city => ({
      name: `${city.name}, ${city.country}`,
      normalized: `${city.lat},${city.lon}`,
      region: city.region
    }));
  } catch (error) {
    console.error('Error in WeatherAPI search:', error);
    return [];
  }
};

// Hàm tính độ tương đồng giữa hai chuỗi
const similarity = (s1, s2) => {
  const normalize = str => removeDiacritics(str.toLowerCase().trim());
  const str1 = normalize(s1);
  const str2 = normalize(s2);
  
  if (str2.includes(str1)) {
    if (str2.startsWith(str1)) {
      return 1;
    }
    return 0.8;
  }
  return 0;
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

const convertCityName = (city) => {
  const cityLower = city.toLowerCase().trim();
  
  // Kiểm tra nếu là tọa độ
  if (city.includes(',')) {
    return city;
  }
  
  if (cityMapping[cityLower]) {
    return cityMapping[cityLower];
  }
  
  const bestMatch = Object.entries(cityMapping)
    .map(([vn, en]) => ({
      name: vn,
      en: en,
      score: similarity(cityLower, vn)
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  if (bestMatch) {
    return bestMatch.en;
  }
  
  return removeDiacritics(cityLower);
};

// Hàm lấy dữ liệu thời tiết hiện tại từ WeatherAPI
const getCurrentWeather = async (city) => {
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

// API Controllers
exports.getWeatherData = async (req, res) => {
  const { city } = req.params;
  
  try {
    const weatherData = await getCurrentWeather(city);
    
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
    
    await newWeatherData.save();
    
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

exports.getWeatherForecast = async (req, res) => {
  const { city } = req.params;
  const days = req.query.days || 3;
  
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
    const days = Number(req.query.days || 3);
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)'
      });
    }
    
    const apiResponse = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: `${lat},${lon}`,
        days: days,
        aqi: 'no'
      }
    });
    
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
    
    res.json(forecastData);
  } catch (error) {
    console.error('Error in forecast by coords:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Không thể lấy dữ liệu dự báo thời tiết',
      error: error.message
    });
  }
};

// API Controller để tìm kiếm gợi ý thành phố
exports.suggestCities = async (req, res) => {
  const { keyword } = req.query;
  
  try {
    console.log('Received suggestion request with keyword:', keyword);
    
    if (!keyword || keyword.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Kiểm tra cache
    const cacheKey = keyword.toLowerCase();
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION)) {
      console.log('Returning cached results for:', keyword);
      return res.json({ suggestions: cachedResult.data });
    }

    // Tìm kiếm từ API
    const apiResults = await searchCitiesFromAPI(keyword);

    // Lưu vào cache và trả về kết quả
    searchCache.set(cacheKey, {
      data: apiResults,
      timestamp: Date.now()
    });

    console.log('Found suggestions:', apiResults);
    res.json({ suggestions: apiResults });
    
  } catch (error) {
    console.error('Error in city suggestion:', error);
    res.status(500).json({
      error: 'Không thể xử lý yêu cầu tìm kiếm',
      message: error.message
    });
  }
};

// API Controller để lấy thời tiết chi tiết theo giờ
exports.getHourlyWeather = async (req, res) => {
  const { city } = req.params;
  const convertedCity = convertCityName(city);
  
  try {
    console.log(`Fetching hourly weather for: ${convertedCity}`);
    
    const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json`, {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: convertedCity,
        days: 1, // Chỉ lấy ngày hôm nay
        aqi: 'no',
        alerts: 'no'
      }
    });
    
    const today = response.data.forecast.forecastday[0];
    const hourlyData = today.hour.map(hour => ({
      time: hour.time,
      temperature: hour.temp_c,
      feels_like: hour.feelslike_c,
      condition: hour.condition,
      humidity: hour.humidity,
      wind_speed: hour.wind_kph,
      wind_direction: hour.wind_dir,
      pressure: hour.pressure_mb,
      precip: hour.precip_mm,
      chance_of_rain: hour.chance_of_rain,
      uv: hour.uv,
      is_day: hour.is_day
    }));
    
    res.json({
      city: response.data.location.name,
      country: response.data.location.country,
      date: today.date,
      hourly: hourlyData
    });
  } catch (error) {
    console.error('Error getting hourly weather data:', error);
    res.status(500).json({ 
      error: 'Không thể lấy dữ liệu thời tiết theo giờ',
      message: error.message 
    });
  }
};

// API Controller để lấy thời tiết theo giờ bằng tọa độ
exports.getHourlyWeatherByCoords = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)'
      });
    }
    
    const apiResponse = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHERAPI_KEY,
        q: `${lat},${lon}`,
        days: 1,
        aqi: 'no'
      }
    });
    
    const today = apiResponse.data.forecast.forecastday[0];
    const hourlyData = today.hour.map(hour => ({
      time: hour.time,
      temperature: hour.temp_c,
      feels_like: hour.feelslike_c,
      condition: hour.condition,
      humidity: hour.humidity,
      wind_speed: hour.wind_kph,
      wind_direction: hour.wind_dir,
      pressure: hour.pressure_mb,
      precip: hour.precip_mm,
      chance_of_rain: hour.chance_of_rain,
      uv: hour.uv,
      is_day: hour.is_day
    }));
    
    res.json({
      city: apiResponse.data.location.name,
      country: apiResponse.data.location.country,
      date: today.date,
      hourly: hourlyData
    });
  } catch (error) {
    console.error('Error in hourly weather by coords:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Không thể lấy dữ liệu thời tiết theo giờ',
      error: error.message
    });
  }
};

module.exports = exports;