const fs = require('fs');

try {
  const csvData = fs.readFileSync('training_data.csv', 'utf8');
  // Split by newline
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  const header = lines[0]; // \uFEFFQuestion,Answer
  const dataLines = lines.slice(1);
  
  const seenPairs = new Set();
  const cleanedLines = [];
  
  let duplicateCount = 0;
  
  for (const line of dataLines) {
    if (!seenPairs.has(line)) {
      seenPairs.add(line);
      cleanedLines.push(line);
    } else {
      duplicateCount++;
    }
  }
  
  const finalCsvContent = [header, ...cleanedLines].join('\n') + '\n';
  
  fs.writeFileSync('training_data_cleaned.csv', finalCsvContent, 'utf8');
  
  console.log('🧹 === ผลการทำความสะอาดข้อมูล ===');
  console.log(`✅ ข้อมูลทั้งหมดก่อนล้าง: ${dataLines.length} รายการ`);
  console.log(`🗑️ พบข้อมูลซ้ำและลบทิ้ง: ${duplicateCount} รายการ`);
  console.log(`✨ ข้อมูลที่พร้อมใช้งาน: ${cleanedLines.length} รายการ`);
  console.log('💾 บันทึกเป็นไฟล์: training_data_cleaned.csv เรียบร้อยครับ!');

} catch (error) {
  console.error('❌ เกิดข้อผิดพลาด:', error.message);
}
