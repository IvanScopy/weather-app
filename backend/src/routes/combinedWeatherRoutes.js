// src/routes/combinedWeatherRoutes.js
const express = require('express');
const router = express.Router();
const combinedWeatherController = require('../controllers/combinedWeatherController');

// Route để tìm kiếm theo tọa độ
router.get('/coords', combinedWeatherController.getCombinedWeatherDataByCoords);

// Route hiện tại cho tìm kiếm theo tên thành phố
router.get('/:city', combinedWeatherController.getCombinedWeatherData);

module.exports = router;