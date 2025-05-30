-- Tạo database cho chatbot
CREATE DATABASE chatbot_db;

-- Kết nối đến database
\c chatbot_db;

-- Tạo extension cho UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo bảng workflows để lưu trữ workflow JSON
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    owner_id UUID DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo bảng conversations để theo dõi trạng thái hội thoại
CREATE TABLE conversations (
    user_id VARCHAR(255) NOT NULL,
    flow_id INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    current_node_id VARCHAR(255),
    data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, flow_id)
);

-- Tạo index cho hiệu suất
CREATE INDEX idx_workflows_owner_id ON workflows(owner_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_workflows_data ON workflows USING GIN(data);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_flow_id ON conversations(flow_id);
CREATE INDEX idx_conversations_is_active ON conversations(is_active);
CREATE INDEX idx_conversations_data ON conversations USING GIN(data);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho bảng workflows
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tạo trigger cho bảng conversations
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Thêm dữ liệu mẫu
INSERT INTO workflows (name, description, data) VALUES 
('Workflow Chào Hỏi', 'Workflow mẫu để chào hỏi khách hàng', '{
  "nodes": [
    {
      "id": "start-1",
      "type": "bot",
      "text": "Xin chào! Tôi là chatbot hỗ trợ. Bạn cần giúp gì?",
      "position": {"x": 100, "y": 100},
      "options": [
        {"label": "Tư vấn sản phẩm", "next": "product-2"},
        {"label": "Hỗ trợ kỹ thuật", "next": "support-3"},
        {"label": "Thông tin liên hệ", "next": "contact-4"}
      ]
    },
    {
      "id": "product-2",
      "type": "bot",
      "text": "Chúng tôi có nhiều sản phẩm tuyệt vời. Bạn quan tâm loại nào?",
      "position": {"x": 100, "y": 250},
      "options": [
        {"label": "Điện thoại", "next": "phone-5"},
        {"label": "Laptop", "next": "laptop-6"}
      ]
    },
    {
      "id": "support-3",
      "type": "bot",
      "text": "Tôi sẽ kết nối bạn với đội ngũ kỹ thuật. Vui lòng mô tả vấn đề của bạn.",
      "position": {"x": 300, "y": 250}
    },
    {
      "id": "contact-4",
      "type": "bot",
      "text": "Thông tin liên hệ:\nEmail: support@company.com\nPhone: 1900-xxxx\nĐịa chỉ: 123 ABC Street",
      "position": {"x": 500, "y": 250}
    },
    {
      "id": "phone-5",
      "type": "bot",
      "text": "Chúng tôi có iPhone, Samsung Galaxy, và nhiều dòng khác. Bạn có ngân sách bao nhiêu?",
      "position": {"x": 100, "y": 400}
    },
    {
      "id": "laptop-6",
      "type": "bot",
      "text": "Chúng tôi có MacBook, Dell, HP, Asus. Bạn dùng để làm gì chủ yếu?",
      "position": {"x": 300, "y": 400}
    }
  ],
  "edges": [
    {"id": "e1", "source": "start-1", "target": "product-2", "label": "Tư vấn sản phẩm"},
    {"id": "e2", "source": "start-1", "target": "support-3", "label": "Hỗ trợ kỹ thuật"},
    {"id": "e3", "source": "start-1", "target": "contact-4", "label": "Thông tin liên hệ"},
    {"id": "e4", "source": "product-2", "target": "phone-5", "label": "Điện thoại"},
    {"id": "e5", "source": "product-2", "target": "laptop-6", "label": "Laptop"}
  ],
  "startNodeId": "start-1"
}');

-- Tạo user và phân quyền
CREATE USER chatbot_user WITH PASSWORD 'chatbot_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chatbot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chatbot_user; 