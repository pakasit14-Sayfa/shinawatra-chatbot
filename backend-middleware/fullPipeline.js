const fs = require('fs');
const { fullHistoryExtraction } = require('./extractChatHistory');

// ============ แปลงเป็น JSONL Format ============
async function convertChatToTrainingData(chatData) {
  const trainingData = [];
  for (const chat of chatData) {
    if (!chat.user_message || !chat.assistant_message) continue;

    // Clean data slightly
    const userMsg = chat.user_message.replace(/[\r\n]+/g, ' ');
    const asstMsg = chat.assistant_message.replace(/[\r\n]+/g, ' ');
    if (userMsg.length < 2 || asstMsg.length < 2) continue;

    trainingData.push({
      messages: [
        { role: "user", content: userMsg },
        { role: "assistant", content: asstMsg }
      ]
    });
  }
  return trainingData;
}

// ============ บันทึกเป็น JSONL ============
async function saveAsJsonl(trainingData, filename) {
  const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(filename, jsonlContent, 'utf8');
  console.log(`\n💾 บันทึกไฟล์เรียบร้อย: ${filename}`);
  console.log(`📊 จำนวนตัวอย่างสำหรับเทรน: ${trainingData.length}`);
}

async function runFullPipeline() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   Chat History Extraction & Training Data Pipeline  ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  if (!process.env.FB_PAGE_TOKEN_1) {
    console.log("❌ ข้อผิดพลาด: ไม่พบ FB_PAGE_TOKEN_1 ในไฟล์ .env");
    return;
  }

  if (process.env.FB_PAGE_ID_1 === 'ใส่_ID_เพจที่_1' || !process.env.FB_PAGE_ID_1) {
    console.log("❌ ข้อผิดพลาด: คุณยังไม่ได้ใส่ FB_PAGE_ID_1 ที่ถูกต้องในไฟล์ .env");
    return;
  }

  try {
    const chatData = await fullHistoryExtraction(180); // ดึงย้อนหลัง 180 วัน (6 เดือน)

    if (chatData.length === 0) {
      console.log("❌ ไม่มีข้อมูลแชท หรือ Token หมดอายุ/ตั้งค่าสิทธิ์ไม่ครบ");
      return;
    }

    const trainingData = await convertChatToTrainingData(chatData);

    if (trainingData.length > 0) {
      await saveAsJsonl(trainingData, `training_data.jsonl`);
      console.log("\n🚀 พร้อมนำไฟล์ training_data.jsonl ไปเทรน Fine-tune บน OpenAI แล้วครับ!");
    } else {
      console.log("\n⚠️ ข้อมูลแชทมีแต่มันสั้นเกินไปจนถูกคัดออกหมดครับ");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// เรียกใช้
runFullPipeline();
