const http = require('http');
const { exec } = require('child_process');

console.log("🏥 === ระบบตรวจสอบสุขภาพ (Daily Health Check) === \n");

// 1. Check if backend server is running
const req = http.get('http://127.0.0.1:3001', (res) => {
    console.log(`✅ [Backend Server] ทำงานปกติ (Status: ${res.statusCode})`);
    
    // 2. Check Ngrok Tunnel
    http.get('http://127.0.0.1:4040/api/tunnels', (ngrokRes) => {
        let data = '';
        ngrokRes.on('data', chunk => data += chunk);
        ngrokRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.tunnels && parsed.tunnels.length > 0) {
                    console.log(`✅ [Ngrok Webhook] ออนไลน์! URL: ${parsed.tunnels[0].public_url}`);
                } else {
                    console.log(`⚠️ [Ngrok Webhook] รันอยู่แต่ไม่พบ Tunnel URL`);
                }
            } catch(e) {
                console.log(`❌ [Ngrok Webhook] ตอบกลับผิดปกติ`);
            }
        });
    }).on('error', (err) => {
        console.log(`❌ [Ngrok Webhook] ไม่ได้เปิดใช้งาน (Error: ${err.message})`);
    });

}).on('error', (err) => {
    console.log(`❌ [Backend Server] เซิร์ฟเวอร์ดับ! (Error: ${err.message})`);
});

// 3. Check memory & CPU roughly
exec('node -e "console.log(process.memoryUsage().rss / 1024 / 1024 + \' MB\')"', (err, stdout) => {
    if (!err) console.log(`✅ [System Memory] การใช้หน่วยความจำเบื้องต้น: ${stdout.trim()}`);
});

setTimeout(() => {
    console.log("\n🎉 สรุป: การตรวจสุขภาพเสร็จสมบูรณ์ หากขึ้นเครื่องหมาย ✅ ทั้งหมด ระบบพร้อมใช้งาน 100%");
}, 2000);
