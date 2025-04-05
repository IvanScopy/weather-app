const express = require('express');
const router = express.Router();
const airQualityController = require('../controllers/airQualityController');

// Route để lấy dữ liệu chất lượng không khí
router.get('/', airQualityController.getAirQuality);

module.exports = router;