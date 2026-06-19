const fs = require('fs');

try {
  const jsonlData = fs.readFileSync('training_data.jsonl', 'utf8');
  const lines = jsonlData.split('\n').filter(line => line.trim() !== '');
  
  // Create CSV Header with UTF-8 BOM so Excel opens it correctly with Thai characters
  let csvContent = '\uFEFFQuestion,Answer\n';
  
  for (const line of lines) {
    const data = JSON.parse(line);
    let question = data.messages[0].content.replace(/"/g, '""'); // Escape double quotes
    let answer = data.messages[1].content.replace(/"/g, '""');
    
    // Wrap in quotes if there are commas or newlines
    question = `"${question}"`;
    answer = `"${answer}"`;
    
    csvContent += `${question},${answer}\n`;
  }
  
  fs.writeFileSync('training_data.csv', csvContent, 'utf8');
  console.log('✅ แปลงไฟล์เป็น CSV เสร็จเรียบร้อย! ได้ไฟล์ชื่อ training_data.csv ครับ');
} catch (error) {
  console.error('❌ เกิดข้อผิดพลาด:', error.message);
}
