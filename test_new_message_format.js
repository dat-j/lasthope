import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

async function testMessageAPI() {
  console.log("🧪 Testing Message API với định dạng mới...\n");

  try {
    // Test 1: Gửi tin nhắn đầu tiên (có thể có button)
    console.log("📤 Test 1: Gửi tin nhắn đầu tiên...");
    const response1 = await axios.post(`${API_BASE_URL}/api/message`, {
      userId: "test-user-123",
      text: "Xin chào",
      flowId: 2,
    });

    console.log("📥 Response 1:");
    console.log(JSON.stringify(response1.data, null, 2));
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Gửi tin nhắn chọn option (nếu có button)
    if (
      response1.data.attachment &&
      response1.data.attachment.payload.buttons
    ) {
      console.log("📤 Test 2: Chọn button đầu tiên...");
      const firstButton = response1.data.attachment.payload.buttons[0];

      const response2 = await axios.post(`${API_BASE_URL}/api/message`, {
        userId: "test-user-123",
        text: firstButton.payload,
        flowId: 2,
      });

      console.log("📥 Response 2:");
      console.log(JSON.stringify(response2.data, null, 2));
      console.log("\n" + "=".repeat(50) + "\n");
    }

    // Test 3: Reset conversation
    console.log("📤 Test 3: Reset conversation...");
    await axios.post(
      `${API_BASE_URL}/api/conversations/test-user-123/reset?flowId=2`
    );
    console.log("✅ Conversation reset thành công\n");

    console.log("🎉 Tất cả test đã hoàn thành!");
  } catch (error) {
    console.error(
      "❌ Lỗi khi test API:",
      error.response?.data || error.message
    );
  }
}

// Chạy test
testMessageAPI();
