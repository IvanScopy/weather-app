# Contributing to Weather App

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Weather App! 🌤️

## Cách đóng góp

### 1. Fork Repository
- Fork repository này về tài khoản GitHub của bạn
- Clone fork về máy local

```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
```

### 2. Cài đặt Dependencies
```bash
npm run install:all
```

### 3. Tạo Branch mới
```bash
git checkout -b feature/your-feature-name
```

### 4. Phát triển
- Thực hiện thay đổi của bạn
- Tuân thủ coding standards
- Thêm tests nếu cần thiết
- Đảm bảo code chạy được

### 5. Test
```bash
npm run dev
```

### 6. Commit
```bash
git add .
git commit -m "feat: add your feature description"
```

### 7. Push và tạo Pull Request
```bash
git push origin feature/your-feature-name
```

## Coding Standards

### JavaScript/React
- Sử dụng ES6+ syntax
- Functional components với hooks
- Prop types validation
- Meaningful variable names
- Comments cho logic phức tạp

### CSS/Styling
- Sử dụng Tailwind CSS classes
- Responsive design
- Consistent spacing
- Dark mode support

### Git Commit Messages
- `feat:` - tính năng mới
- `fix:` - sửa bug
- `docs:` - cập nhật documentation
- `style:` - thay đổi styling
- `refactor:` - refactor code
- `test:` - thêm tests
- `chore:` - maintenance tasks

## Báo cáo Bug

Khi báo cáo bug, vui lòng bao gồm:
- Mô tả chi tiết bug
- Các bước để reproduce
- Expected behavior
- Screenshots nếu có
- Environment (OS, browser, Node version)

## Đề xuất tính năng

Khi đề xuất tính năng mới:
- Mô tả rõ ràng tính năng
- Giải thích tại sao cần thiết
- Mockups hoặc wireframes nếu có
- Cân nhắc về performance impact

## Code Review Process

1. Tất cả PR sẽ được review
2. Cần ít nhất 1 approval
3. CI/CD tests phải pass
4. Conflicts phải được resolve

## Development Setup

### Environment Variables
Copy `.env.example` files và điền thông tin:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env
```

### Database
- MongoDB local hoặc MongoDB Atlas
- Tạo database `weather_app`

### API Keys
- WeatherAPI: https://www.weatherapi.com/
- IQAir API: https://www.iqair.com/air-pollution-data-api

## Questions?

Nếu có câu hỏi, vui lòng:
- Tạo issue với label `question`
- Email: your-email@example.com
- Discord: your-discord

Cảm ơn bạn đã đóng góp! 🙏
