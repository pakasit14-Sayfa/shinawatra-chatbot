/**
 * regression_test_brain2.js
 *
 * ทดสอบ Brain 2 (ชินวัตร) อัตโนมัติ ครอบคลุมทุกสาขา x 2 สไตล์ (พิมพ์ละเอียด / พิมพ์สั้นทีละคำ)
 * ยิงเข้า n8n webhook ตรงด้วย userId ปลอม (diag_regtest_*) เท่านั้น — ไม่แตะลูกค้าจริงเด็ดขาด
 * ไม่แก้โค้ด ไม่ deploy เอง แค่ทดสอบ + รายงานผล
 *
 * ใช้งาน: node scripts/regression_test_brain2.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const WEBHOOK_URL = `${N8N_BASE_URL}/webhook/shinawatra-brain`;
const REDIS_PREFIX = 'n8n:shinawatra:';

// ทุก userId ที่ใช้ทดสอบต้องขึ้นต้นด้วย prefix นี้เท่านั้น กันพลาดไปยุ่งกับลูกค้าจริง
const TEST_USER_PREFIX = 'diag_regtest_';

/**
 * แต่ละ scenario คือบทสนทนาที่ควรจะจบแบบใด (ตรวจด้วย substring match กับคำตอบข้อความสุดท้าย)
 * turns: ข้อความที่ลูกค้า "พิมพ์" ทีละข้อความตามลำดับ
 * expectFinalIncludes: คำที่ต้องเจอในคำตอบข้อความสุดท้าย ถ้าไม่เจอ = ถือว่า fail
 * expectNotIncludes: (optional) คำที่ห้ามเจอในคำตอบข้อความสุดท้าย
 */
const SCENARIOS = [
  // ---------- RN ----------
  {
    name: 'RN - พิมพ์ละเอียด ผ่านเกณฑ์',
    channel: 'nursing',
    turns: ['สนใจพยาบาลศาสตร์ค่ะ จบม.6 สายวิทย์ เกรด 3.2 อายุ 22 หนัก 55 สูง 165'],
    expectFinalIncludes: 'เกณฑ์คุณสมบัติเบื้องต้นผ่าน',
  },
  {
    name: 'RN - พิมพ์สั้นทีละคำ (รวมเกรดเต็มจำนวนไม่มีจุด) ผ่านเกณฑ์',
    channel: 'nursing',
    turns: ['พยาบาล', 'ม.6', '3', 'วิทย์', '20', '50', '160'],
    expectFinalIncludes: 'เกณฑ์คุณสมบัติเบื้องต้นผ่าน',
  },
  {
    name: 'RN - วุฒิต่ำกว่าเกณฑ์ ต้องปฏิเสธ',
    channel: 'nursing',
    turns: ['สนใจพยาบาลศาสตร์ค่ะ จบม.3 ค่ะ'],
    expectFinalIncludes: 'ขออภัย',
  },

  // ---------- HR ----------
  {
    name: 'HR - ปวส.บัญชี + เอกชน -> เหลือเรียน 1.5 ปี (สายบริหารธุรกิจ)',
    channel: 'general',
    turns: ['สนใจ HR ค่ะ', 'จบปวส.บัญชีค่ะ', 'ทำงานเอกชนค่ะ'],
    expectFinalIncludes: '1.5 ปี',
  },
  {
    name: 'HR - ม.6 + ประสบการณ์ 15 ปี + รัฐวิสาหกิจ -> เหลือเรียน 2.5 ปี, ค่าเทอม 18,750',
    channel: 'general',
    turns: ['สนใจการจัดการค่ะ', 'จบม.6ค่ะ', 'มีประสบการณ์ทำงาน 15 ปีค่ะ', 'ทำงานรัฐวิสาหกิจค่ะ'],
    expectFinalIncludes: '18,750',
  },

  // ---------- Engineering ----------
  {
    name: 'Engineering - เครื่องกล ปวส. -> แนบรูป mechanical-transfer',
    channel: 'general',
    turns: ['สนใจหลักสูตรเครื่องกลค่ะ', 'จบปวส.มาค่ะ'],
    expectFinalIncludes: 'mechanical-transfer.jpg',
  },
  {
    name: 'Engineering - คำถามเปรียบเทียบ ต้องไม่ auto-pick เป็น 2ปริญญา',
    channel: 'general',
    turns: ['สนใจวิศวกรรมศาสตร์ค่ะ', 'เครื่องกลกับความปลอดภัยต่างกันยังไงคะ'],
    expectFinalIncludes: 'เดี๋ยวอาจารย์ติดต่อไปให้ข้อมูลเพิ่มเติม',
  },

  // ---------- EdAdminMaster (ป.โท) ----------
  {
    name: 'ป.โท - มีใบประกอบวิชาชีพครู -> ได้รายละเอียดคอร์ส (ไม่ถามวุฒิ)',
    channel: 'general',
    turns: ['สนใจป.โทบริหารการศึกษาค่ะ', 'มีแล้วครับ'],
    expectFinalIncludes: '150,000 บาท',
  },
  {
    name: 'ป.โท - ตอบ "ยังครับ" เปล่าๆ ต้องตีความเป็นไม่มี แล้วปฏิเสธ',
    channel: 'general',
    turns: ['สนใจป.โทบริหารการศึกษาค่ะ', 'ยังครับ'],
    expectFinalIncludes: 'จำเป็นจะต้องมีใบประกอบวิชาชีพครู',
  },

  // ---------- GradDip (ป.บัณฑิต) ----------
  {
    name: 'ป.บัณฑิต - ครูโรงเรียนเอกชน (ไม่ใช่แค่ สพฐ.) ต้องผ่าน',
    channel: 'general',
    turns: ['สนใจป.บัณฑิตวิชาชีพครูค่ะ', 'เป็นครูที่โรงเรียนเอกชนค่ะ'],
    expectFinalIncludes: '54,000 บาท',
  },
  {
    name: 'ป.บัณฑิต - พี่เลี้ยง (ไม่ใช่ครูผู้สอน) ต้องปฏิเสธ',
    channel: 'general',
    turns: ['สนใจป.บัณฑิตวิชาชีพครูค่ะ', 'ไม่ได้เป็นครูผู้สอน เป็นพี่เลี้ยงในสถานศึกษาค่ะ'],
    expectFinalIncludes: 'ขออภัย',
  },
];

async function sendTurn(userId, channel, message) {
  const res = await axios.post(WEBHOOK_URL, { userId, channel, message }, { timeout: 30000 });
  return res.data && res.data.answer ? res.data.answer : '';
}

async function runScenario(scenario, index) {
  const userId = `${TEST_USER_PREFIX}${index}`;
  let lastAnswer = '';
  try {
    for (const turn of scenario.turns) {
      lastAnswer = await sendTurn(userId, scenario.channel, turn);
    }
  } catch (err) {
    return { ...scenario, userId, pass: false, lastAnswer: '', error: err.message };
  }

  const includesOk = !scenario.expectFinalIncludes || lastAnswer.includes(scenario.expectFinalIncludes);
  const excludesOk = !scenario.expectNotIncludes || !lastAnswer.includes(scenario.expectNotIncludes);
  const pass = includesOk && excludesOk;

  return { ...scenario, userId, pass, lastAnswer, error: null };
}

async function cleanupRedis(userIds) {
  // ใช้ redis-cli ผ่าน child_process เพื่อลบ key ทดสอบทิ้งหลังรันจบ (กัน state ทดสอบตกค้าง)
  const { execFile } = require('child_process');
  const keys = userIds.map((id) => `${REDIS_PREFIX}${id}`);
  if (keys.length === 0) return;
  await new Promise((resolve) => {
    execFile('redis-cli', ['-p', '6380', 'DEL', ...keys], (err) => resolve());
  }).catch(() => {});
}

async function main() {
  console.log(`[regression_test] เริ่มทดสอบ ${SCENARIOS.length} เคส...`);
  const results = [];
  for (let i = 0; i < SCENARIOS.length; i++) {
    const result = await runScenario(SCENARIOS[i], i);
    results.push(result);
    console.log(`${result.pass ? '✅' : '❌'} ${result.name}`);
    if (!result.pass) {
      console.log(`   คำตอบที่ได้: ${result.error || result.lastAnswer}`);
    }
  }

  await cleanupRedis(results.map((r) => r.userId));

  const failed = results.filter((r) => !r.pass);
  const summary = {
    ranAt: new Date().toISOString(),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    failures: failed.map((f) => ({ name: f.name, lastAnswer: f.lastAnswer, error: f.error })),
  };

  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, 'regression_test_results.json');
  fs.writeFileSync(logPath, JSON.stringify(summary, null, 2));
  console.log(`\n[regression_test] ผลลัพธ์: ผ่าน ${summary.passed}/${summary.total} — บันทึกไว้ที่ ${logPath}`);

  if (failed.length > 0) {
    try {
      const { alertAdmin } = require('../alert.js');
      const lines = failed.map((f) => `- ${f.name}\n  คำตอบ: ${(f.lastAnswer || f.error || '').slice(0, 200)}`);
      await alertAdmin(
        `🧪 Brain 2 Regression Test: ผ่าน ${summary.passed}/${summary.total}\n\n` + lines.join('\n\n'),
        `regression-test-${Date.now()}` // unique key กันโดน throttle ทับ
      );
    } catch (e) {
      console.log('[regression_test] ส่ง Telegram ไม่ได้ (ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN/CHAT_ID):', e.message);
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[regression_test] เกิดข้อผิดพลาด:', err.message);
  process.exit(1);
});
