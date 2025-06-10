# 🌤️ Weather App - Ứng dụng Dự báo Thời tiết

Ứng dụng dự báo thời tiết hiện đại với giao diện đẹp mắt, tích hợp dữ liệu thời tiết thời gian thực và chất lượng không khí.

## ✨ Tính năng

### 🌡️ Thời tiết
- Dự báo thời tiết hiện tại theo thành phố
- Dự báo 3-7 ngày tới
- Tìm kiếm thành phố với gợi ý thông minh
- Dữ liệu thời tiết theo vị trí hiện tại (GPS)

### 🌬️ Chất lượng không khí
- Chỉ số AQI (Air Quality Index)
- Thông tin PM2.5, PM10
- Cảnh báo chất lượng không khí

### 💫 Giao diện
- Thiết kế responsive, tương thích mobile
- Hiệu ứng animation mượt mà với Framer Motion
- Biểu đồ trực quan với Chart.js
- Dark/Light mode
- Giao diện 3D với Three.js

### 📊 Tính năng khác
- Lưu thành phố yêu thích
- Lịch sử tìm kiếm
- Chia sẻ thông tin thời tiết
- PWA (Progressive Web App)

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19** - UI Framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Chart.js** - Data visualization
- **Three.js** - 3D effects
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### APIs
- **WeatherAPI** - Dữ liệu thời tiết
- **IQAir API** - Chất lượng không khí

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- npm hoặc yarn
- MongoDB

### 1. Clone repository
```bash
git clone https://github.com/IvanScopy/weather-app.git
cd weather-app
```

### 2. Cài đặt dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Cấu hình environment variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/weather-app
WEATHERAPI_KEY=your_weatherapi_key
IQAIR_API_KEY=your_iqair_api_key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Chạy ứng dụng

#### Development mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Production build
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

## 📁 Cấu trúc dự án

```
weather-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── README.md
└── package.json
```

## 🔑 API Keys

### WeatherAPI
1. Đăng ký tại [WeatherAPI.com](https://www.weatherapi.com/)
2. Lấy API key miễn phí
3. Thêm vào file `.env` backend

### IQAir API
1. Đăng ký tại [IQAir.com](https://www.iqair.com/air-pollution-data-api)
2. Lấy API key
3. Thêm vào file `.env` backend

## 🌐 Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel --prod
```

### Heroku (Backend)
```bash
cd backend
git init
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Tác giả

**IvanScopy**
- GitHub: [@IvanScopy](https://github.com/IvanScopy)

## 🙏 Acknowledgments

- [WeatherAPI](https://www.weatherapi.com/) - Weather data
- [IQAir](https://www.iqair.com/) - Air quality data
- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
