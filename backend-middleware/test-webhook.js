const axios = require('axios');

async function testWebhook() {
  try {
    const res = await axios.post('http://127.0.0.1:3001/webhook/line/2', {
      destination: "U5edd6a4750eafee3f3312621dee29ec8",
      events: [{
        type: "message",
        message: { type: "text", id: "619097851888664651", text: "สวัสดีครับทดสอบ" },
        webhookEventId: "01KVF1A177K5Q0CW7SCYN6G6ZC",
        deliveryContext: { isRedelivery: false },
        timestamp: Date.now(),
        source: { type: "user", userId: "U42f450325b1c69a093d38c6f003b83d9" },
        replyToken: "ca0ebb73a9144ae5908b54705f4c52f7",
        mode: "active"
      }]
    });
    console.log("Status:", res.status);
  } catch (e) {
    console.error(e.message);
  }
}
testWebhook();
