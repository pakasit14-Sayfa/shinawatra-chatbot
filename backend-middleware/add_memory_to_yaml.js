const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const dirPath = "C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\DiFy_แก้ไข";
const files = [
    "Dilion Education - เรียนที่จีน (FIXED).yml",
    "Phitsanulok University (FIXED).yml",
    "shinawatra university (FIXED).yml"
];

const memoryInstruction = `

### การจดจำบริบทการสนทนา (Context Memory)
- คุณต้องจดจำข้อมูลประวัติ สาขาที่สนใจ และชื่อที่ลูกค้าเคยพิมพ์บอกไว้ในข้อความก่อนหน้าเสมอ
- หากลูกค้าสอบถามถึงข้อมูลส่วนตัวที่เคยบอกไปแล้ว (เช่น "ผมชื่ออะไร", "เมื่อกี้บอกว่าจบอะไร") ให้คุณดึงข้อมูลจากประวัติแชทมาตอบอย่างเป็นธรรมชาติ ห้ามตอบว่าไม่ทราบหรือขอข้อมูลใหม่เด็ดขาด
- ให้ถือว่าประวัติการคุยเป็นข้อมูลสำคัญเทียบเท่ากับ Knowledge Base
`;

async function fixFiles() {
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            continue;
        }

        const fileStr = fs.readFileSync(filePath, 'utf8');
        const data = YAML.parse(fileStr);
        let modified = false;

        if (data.workflow && data.workflow.graph && data.workflow.graph.nodes) {
            for (const node of data.workflow.graph.nodes) {
                if (node.data && node.data.prompt_template) {
                    for (const pt of node.data.prompt_template) {
                        if (pt.text && !pt.text.includes('การจดจำบริบทการสนทนา')) {
                            pt.text += memoryInstruction;
                            modified = true;
                        }
                        if (pt.jinja2_text && !pt.jinja2_text.includes('การจดจำบริบทการสนทนา')) {
                            pt.jinja2_text += memoryInstruction;
                            modified = true;
                        }
                    }
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, YAML.stringify(data));
            console.log(`✅ Fixed: ${file}`);
        } else {
            console.log(`⏩ Skipped (already has memory instruction or no LLM nodes): ${file}`);
        }
    }
}

fixFiles().catch(console.error);
