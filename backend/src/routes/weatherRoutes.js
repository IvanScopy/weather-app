const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Route lấy thời tiết hiện tại theo tên thành phố
router.get('/current/:city', weatherController.getWeatherData);

// Route lấy dự báo thời tiết theo tên thành phố
router.get('/forecast/:city', weatherController.getWeatherForecast);

// Route lấy dự báo thời tiết theo tọa độ
router.get('/forecast/coords', weatherController.getWeatherForecastByCoords);

// Route tìm kiếm gợi ý thành phố
router.get('/suggest', weatherController.suggestCities);

// Route lấy thời tiết theo tọa độ
router.get('/coords', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ vĩ độ (lat) và kinh độ (lon)'
      });
    }
    
    const weatherData = await weatherController.getCurrentWeatherByCoords(lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error('Error in coords weather route:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu thời tiết',
      error: error.message
    });
  }
});

module.exports = router;