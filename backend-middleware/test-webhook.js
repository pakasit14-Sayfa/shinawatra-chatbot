const axios = require('axios');
const crypto = require('crypto');

const secret = 'your_line_secret_1_here';
const body = JSON.stringify({
    events: [
        {
            type: 'message',
            source: { userId: 'U123456789' },
            message: { type: 'text', text: 'สวัสดีครับ', id: 'msg124' },
            replyToken: 'token123'
        }
    ]
});

const signature = crypto.createHmac('SHA256', secret).update(body).digest('base64');

axios.post('http://localhost:3005/webhook/line/1', body, {
    headers: {
        'Content-Type': 'application/json',
        'x-line-signature': signature
    }
}).then(res => console.log('Webhook Response:', res.status))
  .catch(err => console.error('Webhook Error:', err.response ? err.response.data : err.message));
