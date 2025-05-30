# 🤖 Chatbot Workflow Builder

Hệ thống xây dựng và quản lý luồng hội thoại chatbot với giao diện kéo-thả trực quan, tích hợp với n8n và Facebook Messenger.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React +      │◄──►│   (NestJS +     │◄──►│  (PostgreSQL)   │
│   React Flow)   │    │   TypeScript)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│      User       │    │      n8n        │
│   (Web UI)      │    │  (Automation)   │
└─────────────────┘    └─────────────────┘
                              ▲
                              │
                              ▼
                    ┌─────────────────┐
                    │ Facebook        │
                    │ Messenger       │
                    └─────────────────┘
```

### Thành phần chính:

1. **Frontend (React + TypeScript + React Flow)**

   - Giao diện kéo-thả để tạo workflow
   - Editor trực quan với các node types: Bot, User, API, Condition
   - Panel test chatbot tích hợp
   - Quản lý danh sách workflows

2. **Backend (NestJS + TypeScript + TypeORM)**

   - API RESTful để quản lý workflows
   - Xử lý logic tin nhắn và trạng thái hội thoại
   - Tích hợp với n8n thông qua webhook
   - Clean Architecture với module tách biệt

3. **Database (PostgreSQL + JSONB)**

   - Lưu trữ workflows dưới dạng JSON linh hoạt
   - Theo dõi trạng thái hội thoại của từng user
   - Index GIN cho truy vấn JSON hiệu quả

4. **n8n (Automation Platform)**
   - Kết nối Facebook Messenger
   - Gọi API backend khi nhận tin nhắn
   - Gửi phản hồi về cho người dùng

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (tùy chọn)
- n8n

### 1. Thiết lập Database

#### Sử dụng Docker (Khuyến nghị):

```bash
cd database
docker-compose up -d
```

#### Hoặc cài đặt PostgreSQL thủ công:

```bash
# Tạo database và chạy script init
psql -U postgres -f database/init.sql
```

### 2. Thiết lập Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ mẫu
cp config.example .env

# Chỉnh sửa .env với thông tin database của bạn
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=chatbot_user
# DB_PASSWORD=chatbot_password
# DB_DATABASE=chatbot_db

# Chạy backend
npm run start:dev
```

Backend sẽ chạy tại: http://localhost:3000

### 3. Thiết lập Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local (tùy chọn)
echo "REACT_APP_API_URL=http://localhost:3000" > .env.local

# Chạy frontend
npm start
```

Frontend sẽ chạy tại: http://localhost:3001

### 4. Thiết lập n8n

```bash
# Cài đặt n8n global
npm install -g n8n

# Chạy n8n
n8n start
```

n8n sẽ chạy tại: http://localhost:5678

## 📋 API Endpoints

### Workflows

- `GET /api/workflows` - Lấy danh sách workflows
- `POST /api/workflows` - Tạo workflow mới
- `GET /api/workflows/:id` - Lấy workflow theo ID
- `PATCH /api/workflows/:id` - Cập nhật workflow
- `DELETE /api/workflows/:id` - Xóa workflow

### Messages (cho n8n)

- `POST /api/message` - Xử lý tin nhắn từ user
- `POST /api/conversations/:userId/reset` - Reset hội thoại
- `GET /api/conversations/:userId/history` - Lấy lịch sử hội thoại

### Ví dụ request từ n8n:

```json
POST /api/message
{
  "userId": "facebook_user_id",
  "text": "Xin chào",
  "flowId": 1
}
```

Response:

```json
{
  "replyText": "Xin chào! Tôi là chatbot hỗ trợ. Bạn cần giúp gì?",
  "quickReplies": ["Tư vấn sản phẩm", "Hỗ trợ kỹ thuật", "Thông tin liên hệ"],
  "metadata": {
    "nodeId": "start-1",
    "isEndOfFlow": false
  }
}
```

## 🎯 Cách sử dụng

### 1. Tạo Workflow mới

1. Mở giao diện web tại http://localhost:3001
2. Click "Tạo Workflow Mới"
3. Sử dụng toolbar bên trái để thêm các node:
   - **🤖 Bot Message**: Tin nhắn từ bot
   - **👤 User Input**: Chờ input từ user
   - **🔗 API Call**: Gọi API external
   - **❓ Condition**: Logic điều kiện

### 2. Thiết kế luồng hội thoại

1. Kéo thả các node vào canvas
2. Kết nối các node bằng cách kéo từ handle dưới node này đến handle trên node khác
3. Click vào node để chỉnh sửa nội dung trong panel bên phải
4. Lưu workflow khi hoàn thành

### 3. Test workflow

1. Sử dụng panel test bên phải
2. Nhập tin nhắn và click "Gửi"
3. Xem phản hồi và quick replies
4. Click "Reset Conversation" để bắt đầu lại

### 4. Tích hợp với n8n và Facebook Messenger

#### Tạo workflow n8n:

1. Mở n8n tại http://localhost:5678
2. Tạo workflow mới với các node:
   - **Facebook Messenger Trigger**: Nhận tin nhắn
   - **HTTP Request**: Gọi API backend
   - **Facebook Messenger**: Gửi phản hồi

#### Cấu hình Facebook Messenger Trigger:

- App ID và App Secret từ Facebook Developer
- Webhook URL: URL n8n của bạn
- Verify Token: Token xác thực

#### Cấu hình HTTP Request node:

- Method: POST
- URL: `http://localhost:3000/api/message`
- Body:

```json
{
  "userId": "{{ $json.from.id }}",
  "text": "{{ $json.message.text }}",
  "flowId": 1
}
```

#### Cấu hình Facebook Messenger Response:

- Recipient ID: `{{ $node["Facebook Messenger Trigger"].json.from.id }}`
- Message Text: `{{ $node["HTTP Request"].json.replyText }}`
- Quick Replies: `{{ $node["HTTP Request"].json.quickReplies }}`

## 🗂️ Cấu trúc dự án

```
chatbot-workflow/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── entities/       # TypeORM Entities
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── modules/       # NestJS Modules
│   │   │   ├── workflow/  # Workflow management
│   │   │   ├── conversation/ # Conversation state
│   │   │   └── message/   # Message processing
│   │   ├── app.module.ts  # Main app module
│   │   └── main.ts        # Application entry
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   │   ├── nodes/     # React Flow Node Components
│   │   │   └── WorkflowEditor.tsx
│   │   ├── services/      # API Services
│   │   ├── types/         # TypeScript Types
│   │   └── App.tsx        # Main App Component
│   ├── package.json
│   └── tsconfig.json
├── database/              # Database Setup
│   ├── init.sql          # Database initialization
│   └── docker-compose.yml # PostgreSQL + pgAdmin
└── README.md
```

## 🔧 Cấu hình nâng cao

### Environment Variables (Backend)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=chatbot_user
DB_PASSWORD=chatbot_password
DB_DATABASE=chatbot_db

# Application
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-key
API_SECRET=your-api-secret-for-n8n

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### CORS Configuration

Backend đã được cấu hình CORS cho:

- http://localhost:3000 (Frontend dev)
- http://localhost:3001 (Frontend build)

### Database Indexes

Hệ thống sử dụng GIN indexes cho JSONB columns để tối ưu hiệu suất:

- `workflows.data` - Tìm kiếm trong workflow JSON
- `conversations.data` - Tìm kiếm trong conversation data

## 🐛 Troubleshooting

### Backend không kết nối được database

1. Kiểm tra PostgreSQL đã chạy: `docker ps` hoặc `systemctl status postgresql`
2. Kiểm tra thông tin kết nối trong `.env`
3. Kiểm tra firewall và port 5432

### Frontend không gọi được API

1. Kiểm tra backend đã chạy tại port 3000
2. Kiểm tra CORS configuration
3. Mở Developer Tools để xem lỗi network

### n8n không nhận được webhook

1. Kiểm tra URL webhook trong Facebook App settings
2. Kiểm tra n8n workflow đã activate
3. Kiểm tra logs trong n8n

### React Flow không hiển thị nodes

1. Kiểm tra import các node components
2. Kiểm tra CSS của reactflow đã được import
3. Kiểm tra console errors

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem `LICENSE` để biết thêm thông tin.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) - Thư viện tạo node-based editor
- [NestJS](https://nestjs.com/) - Framework Node.js
- [n8n](https://n8n.io/) - Platform automation
- [PostgreSQL](https://postgresql.org/) - Database
- [TypeORM](https://typeorm.io/) - ORM cho TypeScript
