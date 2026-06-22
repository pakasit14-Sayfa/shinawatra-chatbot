const redis = require('redis');
const client = redis.createClient({
    socket: { host: '127.0.0.1', port: 6379 },
    legacyMode: true
});
client.on('error', err => console.log('error:', err.message));
client.connect().then(() => {
    console.log('connected');
    client.quit();
}).catch(err => console.log('catch:', err.message));
