#!/bin/bash

echo "🤖 Khởi động Chatbot Workflow Builder..."

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function để in màu
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js chưa được cài đặt. Vui lòng cài đặt Node.js 18+ trước."
    exit 1
fi

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker chưa được cài đặt. Sẽ bỏ qua việc khởi động database."
    SKIP_DOCKER=true
fi

print_status "Bắt đầu khởi động các dịch vụ..."

# 1. Khởi động Database
if [ "$SKIP_DOCKER" != true ]; then
    print_status "Khởi động PostgreSQL với Docker..."
    cd database
    docker-compose up -d
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL đã khởi động thành công"
    else
        print_error "Không thể khởi động PostgreSQL"
        exit 1
    fi
    cd ..
    
    # Đợi database khởi động
    print_status "Đợi database khởi động hoàn tất..."
    sleep 10
fi

# 2. Khởi động Backend
print_status "Cài đặt dependencies cho Backend..."
cd backend

# Kiểm tra và cài đặt dependencies
if [ ! -d "node_modules" ]; then
    npm install
fi

# Tạo file .env nếu chưa có
if [ ! -f ".env" ]; then
    print_status "Tạo file .env từ mẫu..."
    cp config.example .env
    print_warning "Vui lòng kiểm tra và cập nhật thông tin database trong file backend/.env"
fi

print_status "Khởi động Backend..."
npm run start:dev &
BACKEND_PID=$!

if [ $? -eq 0 ]; then
    print_success "Backend đang khởi động tại http://localhost:3000"
else
    print_error "Không thể khởi động Backend"
    exit 1
fi

cd ..

# Đợi backend khởi động
sleep 5

# 3. Khởi động Frontend
print_status "Cài đặt dependencies cho Frontend..."
cd frontend

# Kiểm tra và cài đặt dependencies
if [ ! -d "node_modules" ]; then
    npm install
fi

# Tạo file .env.local nếu chưa có
if [ ! -f ".env.local" ]; then
    echo "REACT_APP_API_URL=http://localhost:3000" > .env.local
fi

print_status "Khởi động Frontend..."
npm start &
FRONTEND_PID=$!

if [ $? -eq 0 ]; then
    print_success "Frontend đang khởi động tại http://localhost:3001"
else
    print_error "Không thể khởi động Frontend"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

cd ..

# Đợi một chút để các service khởi động
sleep 3

print_success "🎉 Hệ thống đã khởi động thành công!"
echo ""
echo "📋 Thông tin dịch vụ:"
echo "   🌐 Frontend:  http://localhost:3001"
echo "   🔧 Backend:   http://localhost:3000"
if [ "$SKIP_DOCKER" != true ]; then
    echo "   🗄️  Database:  localhost:5432"
    echo "   📊 pgAdmin:   http://localhost:8080 (admin@admin.com / admin)"
fi
echo ""
echo "📖 Hướng dẫn:"
echo "   1. Mở http://localhost:3001 để sử dụng Workflow Builder"
echo "   2. Tạo workflow mới hoặc chọn workflow có sẵn"
echo "   3. Sử dụng panel test để thử nghiệm chatbot"
echo "   4. Cài đặt n8n để tích hợp với Facebook Messenger:"
echo "      npm install -g n8n && n8n start"
echo ""
echo "⚠️  Để dừng hệ thống, nhấn Ctrl+C"

# Function để cleanup khi script bị dừng
cleanup() {
    print_status "Đang dừng các dịch vụ..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    if [ "$SKIP_DOCKER" != true ]; then
        cd database
        docker-compose down
        cd ..
    fi
    print_success "Đã dừng tất cả dịch vụ"
    exit 0
}

# Bắt signal để cleanup
trap cleanup SIGINT SIGTERM

# Giữ script chạy
wait