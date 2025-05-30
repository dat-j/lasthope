import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:3000/api";

async function testWorkflowAPI() {
  try {
    console.log("🚀 Testing Workflow API with new format...\n");

    // Test 1: Start workflow
    console.log("1. Testing start workflow...");
    const startResponse = await fetch(`${API_BASE_URL}/workflows/2/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: "test-user-123" }),
    });

    if (!startResponse.ok) {
      throw new Error(`Start workflow failed: ${startResponse.status}`);
    }

    const startData = await startResponse.json();
    console.log("✅ Start workflow response:");
    console.log(JSON.stringify(startData, null, 2));
    console.log("\n");

    // Test 2: Send message (if no buttons)
    if (startData.text && !startData.attachment) {
      console.log("2. Testing send message...");
      const messageResponse = await fetch(
        `${API_BASE_URL}/workflows/2/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "test-user-123",
            message: "Hello",
            currentNodeId: startData.currentNodeId,
          }),
        }
      );

      if (!messageResponse.ok) {
        throw new Error(`Send message failed: ${messageResponse.status}`);
      }

      const messageData = await messageResponse.json();
      console.log("✅ Send message response:");
      console.log(JSON.stringify(messageData, null, 2));
      console.log("\n");
    }

    // Test 3: Button click (if has buttons)
    if (
      startData.attachment &&
      startData.attachment.payload.buttons.length > 0
    ) {
      console.log("3. Testing button click...");
      const firstButton = startData.attachment.payload.buttons[0];

      const buttonResponse = await fetch(`${API_BASE_URL}/workflows/2/button`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-123",
          buttonValue: firstButton.payload,
          currentNodeId: startData.currentNodeId,
        }),
      });

      if (!buttonResponse.ok) {
        throw new Error(`Button click failed: ${buttonResponse.status}`);
      }

      const buttonData = await buttonResponse.json();
      console.log("✅ Button click response:");
      console.log(JSON.stringify(buttonData, null, 2));
      console.log("\n");
    }

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testWorkflowAPI();
