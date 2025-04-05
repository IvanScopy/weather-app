const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Route lấy dữ liệu thời tiết hiện tại
router.get('/current/:city', weatherController.getWeatherData);

// Route lấy dữ liệu dự báo theo tọa độ (phải đặt trước route động)
router.get('/forecast/coords', weatherController.getWeatherForecastByCoords);

// Route lấy dữ liệu dự báo theo tên thành phố
router.get('/forecast/:city', weatherController.getWeatherForecast);

module.exports = router;