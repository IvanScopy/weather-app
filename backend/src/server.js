const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();
// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import routes
const weatherRoutes = require('./routes/weatherRoutes');
const airQualityRoutes = require('./routes/airQualityRoutes');
const combinedWeatherRoutes = require('./routes/combinedWeatherRoutes');

// Kết nối MongoDB với handling lỗi tốt hơn
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('MongoDB connection failed, continuing without database:', err.message);
    console.log('Application will run in demo mode without persistent data storage.');
  });

// Sử dụng routes
app.use('/api/weather', weatherRoutes);
app.use('/api/air-quality', airQualityRoutes); 
app.use('/api/combined-weather', combinedWeatherRoutes); // Thêm route mới

// Route đơn giản để kiểm tra
app.get('/', (req, res) => {
  res.send('API Dự báo thời tiết hoạt động!');
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});