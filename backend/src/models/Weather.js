const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  temperature: {
    type: Number,
    required: true
  },
  feels_like: Number,
  condition: {
    text: String,
    icon: String,
    code: Number
  },
  humidity: Number,
  wind_speed: Number,
  wind_direction: String,
  pressure: Number,
  precip: Number,
  uv: Number,
  last_updated: Date
});

module.exports = mongoose.model('Weather', WeatherSchema);