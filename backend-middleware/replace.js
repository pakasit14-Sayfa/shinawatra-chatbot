const fs = require('fs');
const file = 'C:\\\\Dilion\\\\Theme_UI_extracted\\\\Guidance teacher system\\\\office of corporate communications - shinawatra university. (1).yml';
let yml = fs.readFileSync(file, 'utf8');

// Replace LLM 7 rules for menu
const target1 = '- ถ้าลูกค้าสนใจสมัครเรียน: ให้ตรวจสอบข้อมูล "วุฒิการศึกษาที่จบมา"\n            \\ ทันที';
const rep1 = '- ถ้าลูกค้าเริ่มทักทาย (เช่น สวัสดี) หรือพิมพ์แค่ สนใจ: ให้ส่ง Tag เป็น [เมนูหลักสูตร] ทันที\n            \\ - ถ้าลูกค้าระบุหลักสูตรมาแล้ว: ให้ตรวจสอบข้อมูล "วุฒิการศึกษาที่จบมา" ทันที';
yml = yml.replace(target1, rep1);

const target2 = '[สถานะ:ผู้ช่วยพยาบาล], [ติดต่อแอดมิน], [คำถามทั่วไป]';
const rep2 = '[สถานะ:ผู้ช่วยพยาบาล], [ติดต่อแอดมิน], [คำถามทั่วไป], [เมนูหลักสูตร]';
yml = yml.replace(target2, rep2);

const target3 = '[สถานะ:ผู้ช่วยพยาบาล], [ติดต่อแอดมิน]\n';
const rep3 = '[สถานะ:ผู้ช่วยพยาบาล], [ติดต่อแอดมิน], [คำถามทั่วไป], [เมนูหลักสูตร]\n';
yml = yml.replace(target3, rep3);

// Replace LLM - อื่นๆ (1781583348593) prompt to output menu
const target4 = `1. ถ้าลูกค้าแค่ "ทักทาย" (เช่น สวัสดี) -> 
              ให้ตอบแค่สวัสดี 
              และถามว่าสนใจสอบถามหลักสูตรไหนคะ
              **(ห้ามพิมพ์เบอร์โทรติดต่อเด็ดขาด)**`;
const rep4 = `1. ถ้าลูกค้าทักทาย หรือถูกส่งมาจากเมนูหลักสูตร -> 
              ให้ตอบสวัสดีและกางเมนูหลักสูตรให้ลูกค้าเลือกดังนี้:
              "สวัสดีค่ะ สนใจสอบถามหลักสูตรไหนคะ?
              - พยาบาล หรือ ผู้ช่วยพยาบาล
              - ปริญญาตรี
              - ปริญญาโท
              - ป.บัณฑิต"
              **(ห้ามพิมพ์เบอร์โทรติดต่อเด็ดขาด)**`;
yml = yml.replace(target4, rep4);

fs.writeFileSync(file, yml, 'utf8');
console.log('Replacement done!');
