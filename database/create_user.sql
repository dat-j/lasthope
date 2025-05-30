-- Tạo user mới cho chatbot
CREATE USER chatbot_user WITH PASSWORD 'chatbot_password';

-- Tạo database cho chatbot
CREATE DATABASE chatbot_db OWNER chatbot_user;

-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;

-- Kết nối vào database chatbot_db và cấp quyền schema
\c chatbot_db;
GRANT ALL ON SCHEMA public TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chatbot_user;

-- Hiển thị thông tin user đã tạo
\du chatbot_user; 