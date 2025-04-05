// src/controllers/airQualityController.js
const axios = require('axios');

// Controller để lấy dữ liệu chất lượng không khí từ IQAir API
exports.getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)' 
      });
    }

    const response = await axios.get(`https://api.airvisual.com/v2/nearest_city`, {
      params: {
        lat,
        lon,
        key: process.env.IQAIR_API_KEY
      }
    });

    if (response.data.status !== 'success') {
      throw new Error('Không thể lấy dữ liệu chất lượng không khí');
    }

    // Format lại dữ liệu để phù hợp với cấu trúc cần thiết
    const airQualityData = {
      index: response.data.data.current.pollution.aqius,
      components: {
        pm2_5: response.data.data.current.pollution.pm25,
        pm10: response.data.data.current.pollution.aqicn // Sử dụng AQI Trung Quốc làm giá trị PM10
      },
      city: response.data.data.city,
      timestamp: response.data.data.current.pollution.ts
    };

    res.status(200).json({
      success: true,
      data: airQualityData
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    
    // Trả về dữ liệu ước tính khi không thể lấy dữ liệu thực
    if (req.query.fallback === 'true') {
      return res.status(200).json({
        success: true,
        data: generateEstimatedAirQuality(),
        estimated: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu chất lượng không khí',
      error: error.message
    });
  }
};

// Hàm tạo dữ liệu ước tính khi không thể lấy dữ liệu thực
const generateEstimatedAirQuality = () => {
  // Tạo giá trị AQI ngẫu nhiên trong khoảng hợp lý
  const aqiValue = Math.floor(Math.random() * 60) + 30; // AQI từ 30-90
  
  return {
    index: aqiValue,
    components: {
      pm2_5: Math.round(aqiValue * 0.4),
      pm10: Math.round(aqiValue * 0.6)
    },
    estimated: true
  };
};