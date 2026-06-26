const fs = require('fs');
const wf = JSON.parse(fs.readFileSync('brain1_current.json', 'utf8'));

const extractCode = [
  "let state;",
  "try { state = JSON.parse($input.first().json.stateRaw || '{}'); } catch (e) { state = {}; }",
  "state.history = state.history || [];",
  "state.major = state.major || null;",
  "state.degree = state.degree || null;",
  "state.job = state.job || null;",
  "state.experience = state.experience || null;",
  "state.hasTeachingLicense = state.hasTeachingLicense ?? null;",
  "state.conversationEnded = state.conversationEnded || false;",
  "state.detailGiven = state.detailGiven || false;",
  "state.wantsAdmin = false;",
  "",
  "const userMessage = $('Webhook').first().json.body.message || '';",
  "state.history.push({ role: 'user', content: userMessage });",
  "const text = userMessage.toLowerCase();",
  "",
  "const confirmWords = ['สนใจ', 'ใสใจ', 'สนจ', 'ใช่', 'ตกลง', 'โอเค', 'เอาเลย', 'อยากสมัคร', 'สมัคร', 'ขอฟอร์ม', 'ขอแบบฟอร์ม'];",
  "if (state.detailGiven && !state.conversationEnded && confirmWords.some(w => text.includes(w))) {",
  "  state.wantsAdmin = true;",
  "}",
  "",
  "state.multiProgramOptions = null;",
  "if (!state.major) {",
  "  const majorMatches = [];",
  "  const hasDoctorateWord = text.includes('ป.เอก') || text.includes('ปริญญาเอก');",
  "  if (text.includes('ป.โท') || text.includes('ปริญญาโท') || text.includes('บริหารการศึกษา')) majorMatches.push('ป.โท');",
  "  if (hasDoctorateWord) majorMatches.push('ป.เอก');",
  "  if (text.includes('ป.บัณฑิต') || text.includes('บัณฑิตวิชาชีพครู')) majorMatches.push('ป.บัณฑิต');",
  "  if (text.includes('นิติ')) majorMatches.push('นิติศาสตร์');",
  "  if (text.includes('บัญชี')) majorMatches.push('บัญชี');",
  "  // 'รัฐประศาสนศาสตร์' มีทั้งระดับ ป.ตรี และ ป.เอก ถ้าพูดถึง ป.เอก ไปแล้วในข้อความเดียวกัน ไม่ต้องนับซ้ำเป็นอีกหลักสูตร (ไม่ใช่ 2 สาขาที่ลูกค้าสนใจพร้อมกันจริงๆ)",
  "  if (text.includes('รัฐประศาสน') && !hasDoctorateWord) majorMatches.push('รัฐประศาสนศาสตร์');",
  "  if (majorMatches.length > 1) {",
  "    // ลูกค้าพิมพ์มากกว่า 1 สาขาในข้อความเดียว ห้ามเดาเลือกให้เอง ต้องถามยืนยันก่อน",
  "    state.multiProgramOptions = majorMatches;",
  "  } else if (majorMatches.length === 1) {",
  "    state.major = majorMatches[0];",
  "  } else if (text.includes('รัฐ')) {",
  "    // เผื่อพิมพ์ \"รัฐ\" ลอยๆ สั้นๆ (ไม่นับเป็น multi-match เพราะคำนี้ false-positive ง่าย เช่น \"รัฐวิสาหกิจ\" ที่เป็นคำอาชีพ)",
  "    state.major = 'รัฐประศาสนศาสตร์';",
  "  }",
  "}",
  "",
  "if (!state.degree) {",
  "  if (/ม\\.?6|มัธยมศึกษาปีที่\\s*6|มัธยมปลาย|กศน/.test(text)) state.degree = 'ม.6';",
  "  else if (/ปวช/.test(text)) state.degree = 'ปวช.';",
  "  else if (/ปวส/.test(text)) state.degree = 'ปวส.';",
  "  else if (/ป\\.?ตรี|ปริญญาตรี|bachelor/.test(text)) state.degree = 'ปริญญาตรี';",
  "}",
  "if (!state.job && /ทำงาน|รับราชการ|พนักงาน|ธุรกิจส่วนตัว|อาชีพ|ครู/.test(text)) state.job = userMessage;",
  "if (!state.experience && /ปี|ปีแล้ว|ประสบการณ์/.test(text)) state.experience = userMessage;",
  "",
  "if (state.major === 'ป.โท' && state.hasTeachingLicense === null) {",
  "  if (/ไม่มี|ไม่ได้มี/.test(text)) state.hasTeachingLicense = false;",
  "  else if (/มี/.test(text)) state.hasTeachingLicense = true;",
  "}",
  "if (state.major === 'ป.โท' && state.hasTeachingLicense === false) state.conversationEnded = true;",
  "",
  "function infoCompleteFor(major) {",
  "  if (['นิติศาสตร์', 'บัญชี', 'รัฐประศาสนศาสตร์'].includes(major)) return !!(state.degree && state.job && state.experience);",
  "  if (major === 'ป.โท') return state.hasTeachingLicense !== null;",
  "  if (major === 'ป.เอก') return !!(state.degree && state.job);",
  "  if (major === 'ป.บัณฑิต') return true;",
  "  return false;",
  "}",
  "const infoComplete = state.major ? infoCompleteFor(state.major) : false;",
  "const wasDetailGiven = state.detailGiven;",
  "if (infoComplete) state.detailGiven = true;",
  "const justCompletedInfo = infoComplete && !wasDetailGiven;",
  "",
  "// มีข้อมูลวุฒิ/อาชีพ/ประสบการณ์ครบหรือยัง (ไม่ขึ้นกับว่ารู้สาขาหรือยัง)",
  "const hasAllBasicInfo = !!(state.degree && state.job && state.experience);",
  "",
  "// ถ้าข้อมูลยังไม่ครบ แต่ลูกค้าถามเรื่องค่าเทอม/ค่าใช้จ่าย ให้ deflect ก่อน ห้ามบอกตัวเลขจริงจนกว่าจะรู้ข้อมูลครบ",
  "const isTuitionQuestion = /ค่าเทอม|ค่าใช้จ่าย|ค่าเรียน|ราคา/.test(text);",
  "const tuitionDeflect = !infoComplete && isTuitionQuestion;",
  "",
  "return [{ json: { ...state, userId: $('Webhook').first().json.body.userId, infoComplete, tuitionDeflect, hasAllBasicInfo, justCompletedInfo } }];"
].join('\n');

const extractNode = wf.nodes.find(n => n.name === 'Extract Info (Deterministic)');
extractNode.parameters.jsCode = extractCode;

// ===== ฐานความรู้อ้างอิงทั่วไป (FAQ + รายละเอียดเต็มของแต่ละหลักสูตร) =====
// ใช้ตอบได้ทุกคำถามแทรก ไม่จำกัดแค่ flow หลัก
const KB_GENERAL = [
  "ฐานความรู้อ้างอิง (ใช้ตอบคำถามแทรกได้ทุกข้อ ห้ามมั่วนอกเหนือจากนี้):",
  "Q: วุฒิ ม.6 หรือ กศน. สมัครได้ไหม A: สมัครได้ค่ะ เปิดรับผู้จบ ม.6 หรือ กศน. (เทียบเท่า ม.6)",
  "Q: ป.ตรี เปิดสาขาอะไรบ้าง A: นิติศาสตร์, รัฐประศาสนศาสตร์, บัญชี (เรียนออนไลน์ เสาร์-อาทิตย์)",
  "Q: ป.ตรี เทียบโอนได้ไหม ใช้เวลาเรียนกี่ปี A: เทียบโอนจากประสบการณ์ทำงาน/วุฒิเดิมได้ ใช้เวลาเรียนประมาณ 2 ปี (4 เทอม)",
  "Q: ป.ตรี ค่าเทอมเท่าไหร่ A: ค่าสมัคร 1,500 บาท ค่าเทอมตลอดหลักสูตร 130,000 บาท ผ่อนชำระรายเดือนได้",
  "Q: ข้าราชการ/รัฐวิสาหกิจ มีส่วนลดไหม A: มีค่ะ ลดจาก 130,000 เหลือ 90,000 บาทตลอดหลักสูตร",
  "Q: ป.ตรี รูปแบบเรียน A: ออนไลน์และสอบออนไลน์ 100% เข้ามหาวิทยาลัยน้อยมาก ถ้ามีจะแจ้งล่วงหน้าตรงกับเสาร์-อาทิตย์",
  "Q: ป.ตรี เรียนแบบไหนในแต่ละเทอม A: Block Course เดือนละประมาณ 2 วิชา",
  "Q: รัฐประศาสนศาสตร์จบมาทำงานอะไร สอบราชการได้ไหม A: สอบราชการได้ทุกหน่วยงาน รับรองจาก ก.พ. และ ก.ค.ศ.",
  "Q: นิติศาสตร์รับรองจากที่ไหน A: รับรองจาก ก.พ. และ อว. รวมถึงเนติบัณฑิตยสภาและสภาทนายความ",
  "Q: รับจำกัดไหม A: รุ่นละไม่เกิน 50 ที่นั่งตามที่ อว. กำหนด เต็มแล้วปิดรับทันที",
  "Q: ป.ตรี เอกสารสมัคร A: รูปหน้าตรง, สำเนาบัตรประชาชน, สำเนาทะเบียนบ้าน, วุฒิการศึกษา, ใบผลการเรียน, ใบเปลี่ยนชื่อ(ถ้ามี), เอกสารสัญญาจ้าง/บัตรพนักงาน(กรณีรับราชการ/รัฐวิสาหกิจ)",
  "Q: ยังไม่ได้รับวุฒิฉบับจริง สมัครได้ไหม A: สมัครและยื่นย้อนหลังได้ แต่ต้องแจ้งอาจารย์ฝ่ายรับสมัครก่อน",
  "Q: กู้ กยศ ได้ไหม A: ขณะนี้ กยศ ปิดรับยื่นกู้แล้ว",
  "Q: ชำระเงินช่องทางไหน A: โอนเข้าธนาคารกรุงไทย ชื่อบัญชี มหาวิทยาลัยพิษณุโลก เลขบัญชี 678-9-63851-2",
  "Q: ติดต่อเพิ่มเติมช่องทางไหน A: ทักแชทนี้ได้เลย หรือ Line Official: @plu.admission",
  "Q: ขั้นตอนสมัครเป็นอย่างไร A: กรอกฟอร์มสมัครผ่านลิงก์ที่ให้ไว้ หรือชำระค่าสมัคร 1,500 บาทก่อนเพื่อเข้าระบบ แล้วส่งเอกสารตามหลังทางแชทได้",
  "Q: ในฟอร์มช่องประเภทการศึกษาเลือกอะไร A: เลือกติ๊กช่อง 'ภาคพิเศษ (เทียบโอน)'",
  "Q: ต้องเข้าร่วมปฐมนิเทศไหม A: ภาคพิเศษ(เสาร์-อาทิตย์) ไม่ต้องเข้าร่วม ปฐมนิเทศเป็นของภาคปกติเท่านั้น",
  "Q: นิติศาสตร์ภาคพิเศษเริ่มเรียนวันไหน A: เบื้องต้นแจ้งว่าจะเริ่มเรียนช่วงวันที่ 4 กรกฎาคม",
  "Q: เรียนออนไลน์ผ่านโปรแกรมอะไร ต้องเตรียมอุปกรณ์ไหม A: เรียนผ่าน Google Classroom หรือ Zoom อาจารย์ผู้สอนจะแจ้งอีกครั้ง",
  "Q: หนังสือเรียน/เอกสารประกอบต้องซื้อที่ไหน A: ฝ่ายหลักสูตรและอาจารย์จะแจ้งในกลุ่มเรียนก่อนเริ่มเรียน เบื้องต้นยังไม่มีค่าใช้จ่ายเพิ่ม",
  "Q: ป.เอก เข้ามหาวิทยาลัยกี่ครั้ง A: น้อยมาก เข้าตามกิจกรรมปฐมนิเทศ สอบป้องกันวิทยานิพนธ์ และพิธีรับปริญญา จะแจ้งล่วงหน้าตรงเสาร์-อาทิตย์",
  "Q: ป.เอก จบยากไหม A: ไม่ยาก ทำตามเกณฑ์ อว. กำหนด มีอาจารย์สนับสนุนตลอดหลักสูตร",
  "Q: ป.เอก รูปแบบเรียน A: Hybrid ออนไลน์หรือออนไซต์ได้ เสาร์-อาทิตย์เป็นหลัก ตารางขึ้นกับอาจารย์ผู้สอนนัด",
  "Q: ป.เอก เอกสารสมัคร A: รูปหน้าตรง, สำเนาบัตรประชาชน, สำเนาทะเบียนบ้าน, วุฒิการศึกษา(ทั้ง ป.ตรีและป.โท), ใบผลการเรียน(ทั้ง ป.ตรีและป.โท), ใบเปลี่ยนชื่อ(ถ้ามี), ประกาศนียบัตรอบรม(ถ้ามี)",
  "Q: ป.เอก ต้องมีพื้นฐานภาษาอังกฤษไหม A: ไม่จำเป็น มีเรียนปรับพื้นฐานภาษาอังกฤษให้",
  "Q: ป.บัณฑิต เอกสารสมัคร A: รูปหน้าตรง, สำเนาบัตรประชาชน, สำเนาทะเบียนบ้าน, วุฒิการศึกษา, ใบผลการเรียน, ใบเปลี่ยนชื่อ(ถ้ามี), เอกสารรับรองการอนุญาตสอน/ตำแหน่งครู(ออกโดยสถานศึกษา)"
].join(' | ').replace(/'/g, '’'); // เปลี่ยน ' เป็น ' (typographic) กัน string หลุดออกจาก quote ตอนฝังในโค้ด JS

const promptParts = [
  "'คุณคือ \"อาจารย์\" เจ้าหน้าที่รับสมัครนักศึกษา มหาวิทยาลัยพิษณุโลก เลียนแบบสไตล์การพูดของแอดมินจริงให้เหมือนที่สุด: เรียกลูกค้าว่า \"นักศึกษา\" เสมอ (ห้ามใช้คำว่า ท่าน หรือ คุณ) แทนตัวเองว่า \"อาจารย์\" ลงท้ายด้วยค่ะ/นะคะเสมอ ห้ามใช้ครับ. ตอบสั้น กระชับ ตรงประเด็น แบบเจ้าหน้าที่จริงที่ตอบแชทเร็วๆ ห้ามพูดเวิ่นเว้อหรือตื่นเต้นเกินจริง (ห้ามใช้คำว่า \"ดีใจที่...\" หรือ \"ยอดเยี่ยมค่ะ\" บ่อยเกินไป) ใช้สำนวนแบบนี้: ตอนถามข้อมูลให้ใช้ \"ไม่ทราบว่านักศึกษา...คะ\" ตอนตอบให้ข้อมูลให้ใช้ \"นักศึกษาสามารถ...ได้นะคะ\" ตอนรับทราบให้ใช้ \"ขอบคุณค่ะ\" ตอนจะส่งอะไรให้ใช้ \"อาจารย์ส่ง...ให้นะคะ\" หรือ \"อาจารย์ดำเนินการให้นะคะ\" ห้ามมั่วราคา/เงื่อนไขที่ไม่ได้ให้มา ห้ามใส่ลิงก์อื่นนอกจากที่ให้มาเป๊ะๆ. ถ้าลูกค้าถามเรื่องที่ไม่มีข้อมูลให้ตอบในนี้เลย ห้ามเดา/มั่วคำตอบเองเด็ดขาด ให้ตอบด้วยข้อความนี้เป๊ะๆคำต่อคำเท่านั้น ห้ามแต่งเพิ่ม: \"เดี๋ยวอาจารย์ติดต่อไปให้ข้อมูลเพิ่มเติมนะคะ\" " + JSON.stringify(KB_GENERAL).slice(1, -1) + " . ข้อมูลเฉพาะสถานการณ์นี้: ' + (function(){ ",
  "const j = $json; let facts = ''; const completeIntro = j.justCompletedInfo ? 'ต้องขึ้นต้นข้อความตอบกลับด้วยคำนี้เป๊ะๆ คำต่อคำก่อนเสมอ ห้ามแก้ไขหรือสลับคำ: \"ขอบคุณสำหรับข้อมูลครบถ้วนค่ะ\" จากนั้นเว้นบรรทัดเปล่า แล้วค่อยต่อด้วยเนื้อหาด้านล่างนี้: ' : ''; ",
  "const FORM_BACHELOR = 'https://forms.gle/Aj55YB5TNsKVsu8V7'; ",
  "const FORM_GRAD = 'https://forms.gle/fUSfriZf9rWeavv6A'; ",
  "if (j.multiProgramOptions) { facts = 'ลูกค้าพิมพ์ถึงหลายหลักสูตรพร้อมกันในข้อความเดียว (' + j.multiProgramOptions.join(', ') + ') ห้ามเดาหรือเลือกหลักสูตรใดหลักสูตรหนึ่งให้เองเด็ดขาด ให้ตอบด้วยข้อความนี้เป๊ะๆ ห้ามแก้ไข: \"นักศึกษาสนใจสอบถามหลายหลักสูตรเลยนะคะ เพื่อให้อาจารย์ให้ข้อมูลได้ตรงที่สุด รบกวนเลือกก่อนนะคะว่าสนใจระดับใดเป็นพิเศษ: - ปริญญาตรี (นิติศาสตร์ / รัฐประศาสนศาสตร์ / บัญชี) - ปริญญาโท (บริหารการศึกษา) - ปริญญาเอก (รัฐประศาสนศาสตร์) - ประกาศนียบัตรบัณฑิต (วิชาชีพครู) อาจารย์จะได้แนะนำให้ละเอียดทีละหลักสูตรนะคะ\"'; } ",
  "else if (j.tuitionDeflect) { facts = 'ลูกค้าถามเรื่องค่าเทอม/ค่าใช้จ่ายแต่ยังให้ข้อมูลไม่ครบ ห้ามบอกตัวเลขค่าเทอมจริงเด็ดขาด ให้ตอบด้วยข้อความนี้เป๊ะๆ: \"เรื่องค่าใช้จ่ายขึ้นอยู่กับสิทธิ์เทียบโอนของแต่ละท่านค่ะ อาจารย์ขอทราบข้อมูลเบื้องต้นก่อน เพื่อแจ้งตัวเลขที่แม่นยำนะคะ\" แล้วถามข้อมูลที่ยังขาด (วุฒิการศึกษา/อาชีพ/ประสบการณ์ทำงาน เฉพาะข้อที่ยังไม่มี)'; } ",
  "else if (j.conversationEnded) { facts = 'นักศึกษาไม่มีใบประกอบวิชาชีพครู ซึ่งจำเป็นสำหรับ ป.โท บริหารการศึกษา ให้แจ้งสุภาพว่าขออภัย หลักสูตรนี้จำเป็นต้องมีใบประกอบวิชาชีพครู ถ้าคุณสมบัติไม่ตรงจะไม่สามารถเรียนได้ค่ะ ขออภัยในความไม่สะดวก'; } ",
  "else if (j.wantsAdmin) { const isGrad = ['ป.โท','ป.เอก','ป.บัณฑิต'].includes(j.major); const link = isGrad ? FORM_GRAD : FORM_BACHELOR; const formName = isGrad ? 'แบบฟอร์มสมัครเรียนปริญญาโท/เอก/ป.บัณฑิต มหาวิทยาลัยพิษณุโลก' : 'แบบฟอร์มสมัครเรียนปริญญาตรี มหาวิทยาลัยพิษณุโลก'; facts = 'นักศึกษายืนยันความประสงค์สมัครเรียนแล้ว ให้ตอบด้วยข้อความนี้เป๊ะๆ ห้ามแก้ข้อความ (รวมเครื่องหมาย === ด้วยเพื่อแยกเป็น 2 ข้อความ): ขอบคุณที่ยืนยันความประสงค์สมัครเรียนค่ะ อาจารย์จะดำเนินการส่งแบบฟอร์มสมัครและรายละเอียดขั้นตอนการชำระเงินให้นะคะ ' + formName + ' คลิกที่นี่: ' + link + ' เพิ่มเติม นักศึกษาสามารถกรอกฟอร์มสมัครได้เลยนะคะ หากนักศึกษายังไม่สะดวกกรอกฟอร์มหรือแนบเอกสาร สามารถชำระค่าสมัครเข้ามาก่อนได้ เพื่อให้อาจารย์นำรายชื่อเข้าระบบให้ แล้วค่อยแนบเอกสารภายหลังได้ค่ะ หากดำเนินการเรียบร้อยแล้ว รบกวนแจ้งชื่อ-นามสกุล และแนบสลิปทางแชทนี้นะคะ === 💳 ช่องทางการชำระเงินค่าสมัคร:\\nธนาคารกรุงไทย\\nชื่อบัญชี: มหาวิทยาลัยพิษณุโลก\\nเลขที่บัญชี: 678-9-63851-2'; } ",
  "else if (!j.major && !j.degree && !j.job && !j.experience) { facts = 'ยังไม่ทราบว่านักศึกษาสนใจสาขาไหน และยังไม่มีข้อมูลใดๆ ให้ตอบด้วยข้อความนี้เป๊ะๆ คำต่อคำ ห้ามแก้ไขหรือแต่งเพิ่มเด็ดขาด (รวมเครื่องหมาย === ตรงกลางด้วย เพื่อแยกเป็น 2 ข้อความ): สวัสดีค่ะ ปัจจุบันหลักสูตรปริญญาตรี (เรียนออนไลน์ เสาร์-อาทิตย์) เปิดรับสมัคร 3 สาขา ได้แก่: - สาขานิติศาสตร์ - สาขารัฐประศาสนศาสตร์ - สาขาบัญชี === เพื่อความสะดวกในการตรวจสอบสิทธิประโยชน์ อาจารย์ขออนุญาตสอบถามข้อมูลเบื้องต้นนะคะ: - ไม่ทราบว่านักศึกษาจบวุฒิใดมาคะ? - ปัจจุบันประกอบอาชีพใดคะ? - มีประสบการณ์ทำงานประมาณกี่ปีคะ'; } ",
  "else if (!j.major && j.hasAllBasicInfo) { facts = 'นักศึกษาให้ข้อมูลวุฒิ/อาชีพ/ประสบการณ์ครบแล้ว แต่ยังไม่บอกว่าสนใจสาขาไหน ห้ามทักทายซ้ำหรือถามข้อมูลซ้ำ ให้ตอบด้วยข้อความนี้เป๊ะๆ: \"ขอบคุณสำหรับข้อมูลค่ะ เพื่อให้สามารถแจ้งรายละเอียดหลักสูตรและสิทธิ์เทียบโอนหน่วยกิตได้อย่างเหมาะสม ไม่ทราบว่าสนใจเรียนสาขานิติศาสตร์ รัฐประศาสนศาสตร์ หรือบัญชี ดีคะ?\"'; } ",
  "else if (!j.major) { facts = 'นักศึกษาให้ข้อมูลบางส่วนมาแล้ว (วุฒิ=' + (j.degree||'-') + ' อาชีพ=' + (j.job||'-') + ' ประสบการณ์=' + (j.experience||'-') + ') แต่ยังไม่บอกสาขาที่สนใจ ห้ามทักทายซ้ำ ให้ถามเฉพาะข้อมูลที่ยังขาด (วุฒิการศึกษา/อาชีพ/ประสบการณ์ทำงาน เฉพาะข้อที่ยังไม่มี) สั้นๆ'; } ",
  "else if (!j.infoComplete) { ",
  "  if (j.major === 'ป.โท') facts = 'นักศึกษาสนใจ ป.โท บริหารการศึกษา ให้ถามว่ามีใบประกอบวิชาชีพครูแล้วหรือยังคะ'; ",
  "  else if (j.major === 'ป.เอก') facts = 'นักศึกษาสนใจ ป.เอก รัฐประศาสนศาสตร์ ข้อมูลที่มีแล้ว (ห้ามถามซ้ำ): วุฒิ=' + (j.degree||'-') + ' อาชีพ=' + (j.job||'-') + '. ให้ถามเฉพาะข้อที่ยังขาด (วุฒิการศึกษา, ปัจจุบันประกอบอาชีพใด)'; ",
  "  else facts = 'นักศึกษาสนใจสาขา: ' + j.major + '. ข้อมูลที่มีแล้ว (ห้ามถามซ้ำ): วุฒิ=' + (j.degree||'-') + ' อาชีพ=' + (j.job||'-') + ' ประสบการณ์=' + (j.experience||'-') + '. ให้ถามเฉพาะข้อมูลที่ยังขาด (วุฒิการศึกษา, อาชีพ, ประสบการณ์ทำงาน)'; ",
  "} ",
  "else if (['นิติศาสตร์','บัญชี','รัฐประศาสนศาสตร์'].includes(j.major)) { ",
  "  const isGovJob = /ราชการ|รัฐวิสาหกิจ/.test(j.job || ''); ",
  "  const priceLine = isGovJob ? 'เนื่องจากตอนนี้ทางมหาวิทยาลัยมีทุนส่วนลดค่าเทอมให้กับข้าราชการและพนักงานรัฐวิสาหกิจอยู่นะคะ จากปกติค่าเทอมตลอดหลักสูตร 130,000 บาท เหลือเพียง 90,000 บาทตลอดหลักสูตร สามารถผ่อนชำระได้นะคะ' : 'ค่าเทอมตลอดหลักสูตรอยู่ที่ 130,000 บาทค่ะ สามารถผ่อนชำระได้นะคะ'; ",
  "  const imgMap = { 'นิติศาสตร์': ['ตารางค่าเทอมนิติศาสตร์','law-curriculum.jpg'], 'บัญชี': ['ตารางค่าเทอมบัญชี','accounting-curriculum.jpg'], 'รัฐประศาสนศาสตร์': ['ตารางค่าเทอมรัฐประศาสนศาสตร์','public-administration.jpg'] }; ",
  "  const [imgAlt, imgFile] = imgMap[j.major]; ",
  "  const imgMd = '![' + imgAlt + '](https://raw.githubusercontent.com/pakasit14-Sayfa/shinawatra-chatbot/main/backend-middleware/public/images/' + imgFile + ')'; ",
  "  if (j.justCompletedInfo) { ",
  "    facts = 'ให้ตอบด้วยข้อความนี้เป๊ะๆ คำต่อคำ ห้ามแก้ไข ห้ามแต่งเพิ่ม ห้ามตัดคำ ห้ามสรุปสั้นเด็ดขาด คัดลอกไปทั้งหมดตามนี้ (รวมเครื่องหมาย === ทั้ง 2 จุดด้วย เพื่อแยกเป็น 3 ข้อความ): ขอบคุณสำหรับข้อมูลครบถ้วนค่ะ นักศึกษาสามารถนำวุฒิและประสบการณ์ทำงานมาลดระยะเวลาในการเรียนได้นะคะ ซึ่งจะเรียนประมาณ 2 ปีค่ะ ' + priceLine + ' นี่คือรายละเอียดและตารางค่าเทอมของสาขา' + j.major + 'ค่ะ === ' + imgMd + ' === อาจารย์ขออนุญาตสอบถามค่ะ ไม่ทราบว่านักศึกษาสนใจสมัครหรือไม่คะ เดี๋ยวอาจารย์จะทำการส่งฟอร์มการสมัครเรียนให้ค่ะ เนื่องจากมีนักศึกษาทำการสมัครเข้ามาเป็นจำนวนมากจึงทำให้โควต้าที่นั่งใกล้เต็มมากๆ แล้วค่ะ รุ่นนึงรับไม่เกิน 50 ที่นั่งตามที่ อว. กำหนดค่ะ หากโควต้าเต็มตามที่ อว. กำหนดจะทำการปิดรับสมัครทันทีนะคะ'; ",
  "  } else { ",
  "    facts = 'นักศึกษาสนใจสาขา ' + j.major + ' (เคยส่งรายละเอียดและรูปตารางค่าเทอมไปแล้ว ห้ามส่งรูปซ้ำหรือพูดซ้ำเรื่องโควต้าอีก) ให้ตอบคำถามที่ถามมาสั้นๆ ตรงประเด็น จาก KB ด้านบน'; ",
  "  } ",
  "} ",
  "else if (j.major === 'ป.โท') { facts = completeIntro + 'ป.โท ศึกษาศาสตรมหาบัณฑิต สาขาบริหารการศึกษา เรียนออนไลน์เป็นหลัก เสาร์-อาทิตย์ ระยะเวลา 2 ปี คุณสมบัติ: เป็นครู/บุคลากรการศึกษา จบ ป.ตรีทุกสาขา มีใบประกอบวิชาชีพครู ค่าใช้จ่ายตลอดหลักสูตร 150,000 บาท แบ่งชำระ 9 งวด (งวด1: 7,500 บาท ภายใน1สัปดาห์หลังค่าสมัคร, งวด2: 13,000 บาท, งวด3: 17,000 บาท, งวด4-9: งวดละ 18,750 บาท) ค่าสมัคร 1,500 บาท รับรองจากคุรุสภา. แนบรูปด้วย Markdown แบบนี้เป๊ะๆ: ![ตารางการผ่อนชำระ](https://raw.githubusercontent.com/pakasit14-Sayfa/shinawatra-chatbot/main/backend-middleware/public/images/edu-admin-master.jpg)'; } ",
  "else if (j.major === 'ป.เอก') { facts = completeIntro + 'ป.เอก รัฐประศาสนศาสตรดุษฎีบัณฑิต เรียน Hybrid ออนไลน์เป็นหลักหรือออนไซต์ได้ เสาร์-อาทิตย์เป็นหลัก ระยะเวลา 3 ปี (6 เทอม) ค่าสมัคร 1,500 บาท ค่าเทอมตลอดหลักสูตร 390,000 บาท ผ่อนชำระรายเดือนได้ มี 2 แผน (แผน 1.1 เน้นวิจัย ตีพิมพ์วารสารนานาชาติ 2 ฉบับ / แผน 2.1 เรียนรายวิชาพื้นฐาน ตีพิมพ์ TCI 1 ฉบับ เกณฑ์จบง่ายกว่า) รับรองจาก ก.พ. และ ก.ค.ศ. ไม่ต้องมีพื้นฐานภาษาอังกฤษมาก่อน. แนบรูปด้วย Markdown แบบนี้เป๊ะๆ: ![รายละเอียดหลักสูตร](https://raw.githubusercontent.com/pakasit14-Sayfa/shinawatra-chatbot/main/backend-middleware/public/images/phd-no-funding.png)'; } ",
  "else if (j.major === 'ป.บัณฑิต') { facts = completeIntro + 'ป.บัณฑิตวิชาชีพครู เรียนออนไลน์เป็นหลัก เสาร์-อาทิตย์ ระยะเวลา 1.5 ปี (3 เทอม) ออนไซต์เฉลี่ยเทอมละ 2 ครั้ง/4 วัน รับรองจากคุรุสภา ค่าสมัคร 1,500 บาท ค่าเทอมตลอดหลักสูตร 55,000 บาท ผ่อนชำระได้. แนบรูปด้วย Markdown แบบนี้เป๊ะๆ: ![ตารางค่าเทอม](https://raw.githubusercontent.com/pakasit14-Sayfa/shinawatra-chatbot/main/backend-middleware/public/images/grad-dip-teacher.png)'; } ",
  "return facts; })()"
];
const promptExpr = promptParts.join('');

const jsonBodyValue = "={{ JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.5, messages: [ { role: 'system', content: " + promptExpr + " }, ...$json.history ] }) }}";

const aiNode = {
  parameters: {
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: jsonBodyValue,
    options: {}
  },
  id: 'openaiReplyB1',
  name: 'AI - Generate Reply',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [-480, 300],
  credentials: { httpHeaderAuth: { id: 'eoikRoa7Qb4pyyxv', name: 'OpenAI Header Auth - Chatbot Brain' } }
};

const mergeNode = {
  parameters: {
    jsCode: "const incoming = $input.first().json;\nconst answer = incoming.choices[0].message.content;\nconst state = $('Extract Info (Deterministic)').first().json;\nstate.history.push({ role: 'assistant', content: answer });\nreturn [{ json: { ...state, answer } }];"
  },
  id: 'mergeAnswerB1',
  name: 'Merge Answer',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [-240, 300]
};

let existingAi = wf.nodes.find(n => n.name === 'AI - Generate Reply');
let existingMerge = wf.nodes.find(n => n.name === 'Merge Answer');
const removeNames = ['IF ข้อมูลครบ + รู้สาขา', 'AI - ขอข้อมูลที่ขาด', 'AI - แจ้งรายละเอียดสาขา', 'Merge Answer (ask path)', 'Merge Answer (detail path)', 'AI - Generate Reply', 'Merge Answer'];
wf.nodes = wf.nodes.filter(n => !removeNames.includes(n.name));
wf.nodes.push(aiNode, mergeNode);

const saveNode = wf.nodes.find(n => n.name === 'Redis Save State');
saveNode.parameters.value = "={{ JSON.stringify({history: $json.history, major: $json.major, degree: $json.degree, job: $json.job, experience: $json.experience, hasTeachingLicense: $json.hasTeachingLicense, conversationEnded: $json.conversationEnded, detailGiven: $json.detailGiven}) }}";

wf.connections = {
  'Webhook': { main: [[{ node: 'Redis Get State', type: 'main', index: 0 }]] },
  'Redis Get State': { main: [[{ node: 'Extract Info (Deterministic)', type: 'main', index: 0 }]] },
  'Extract Info (Deterministic)': { main: [[{ node: 'AI - Generate Reply', type: 'main', index: 0 }]] },
  'AI - Generate Reply': { main: [[{ node: 'Merge Answer', type: 'main', index: 0 }]] },
  'Merge Answer': { main: [[{ node: 'Redis Save State', type: 'main', index: 0 }]] },
  'Redis Save State': { main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]] }
};

const payload = { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings: {} };
fs.writeFileSync('brain1_updated.json', JSON.stringify(payload));
console.log('hasNewlineInJsonBody:', /[\r\n]/.test(jsonBodyValue));
console.log('done, nodes count:', wf.nodes.length, 'jsonBody length:', jsonBodyValue.length);
