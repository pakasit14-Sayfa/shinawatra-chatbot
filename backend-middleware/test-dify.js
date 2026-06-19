const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.DIFY_API_KEY_BRAIN_2;
const promptText = "[System: ตอบคำถามทางการ]\n\nคำถาม: สวัสดี";

async function testDify() {
    try {
        const response = await axios.post(
            'https://api.dify.ai/v1/chat-messages',
            {
                inputs: {},
                query: promptText,
                response_mode: 'blocking',
                conversation_id: '',
                user: 'U42f450325b1c69a093d38c6f003b83d9'
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Dify Response:", response.data.answer);
    } catch (error) {
        console.error("Dify Error:", error.response ? error.response.data : error.message);
    }
}

testDify();
