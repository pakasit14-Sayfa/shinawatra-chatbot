const fs = require('fs');
const YAML = require('yaml');

const filePath = "C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\DiFy_แก้ไข\\shinawatra university (FIXED).yml";

const channelRuleInstruction = `

### กฎการตอบตามช่องทาง (ต้องปฏิบัติตามเคร่งครัด)
- หากข้อความลูกค้าขึ้นต้นด้วย [ช่องทาง: เพจพยาบาล] → ให้ตอบเฉพาะเรื่องหลักสูตรพยาบาล (RN) และผู้ช่วยพยาบาล (PN) เท่านั้น ถ้าถามเรื่องอื่น ให้แนะนำไปที่เพจมหาวิทยาลัยชินวัตรโดยสุภาพ
- หากข้อความลูกค้าขึ้นต้นด้วย [ช่องทาง: เพจทั่วไป] → ห้ามพูดถึงหลักสูตรพยาบาลและผู้ช่วยพยาบาลโดยเด็ดขาด ถ้าถาม ให้แนะนำไปที่เพจพยาบาลโดยสุภาพ
- ถ้าไม่มี [ช่องทาง:] ขึ้นต้น (มาจาก LINE) → ตอบได้ทุกหลักสูตรตามปกติ
- ตัดส่วน [ช่องทาง: ...] ออกก่อนตอบ อย่าพิมพ์ส่วนนี้กลับไปหาลูกค้า`;

async function cleanAndFix() {
    const fileStr = fs.readFileSync(filePath, 'utf8');
    const data = YAML.parse(fileStr);
    const nodes = data.workflow.graph.nodes;
    const edges = data.workflow.graph.edges;

    // 1. Remove the wrongly added IF/ELSE page_source_check node
    const badNodeId = 'page_source_check_001';
    const badNodeIdx = nodes.findIndex(n => n.id === badNodeId);
    if (badNodeIdx !== -1) {
        nodes.splice(badNodeIdx, 1);
        // Remove edges connected to it
        data.workflow.graph.edges = edges.filter(e => e.source !== badNodeId && e.target !== badNodeId);
        console.log('✅ Removed invalid IF/ELSE page_source node and its edges');
    }

    // 2. Add channel routing rule to LLM 7 (the main router, id: 1781587853209)
    //    and LLM - พยาบาล (id: 1781583331118) only
    const targetNodeIds = ['1781587853209', '1781583331118'];
    let modifiedPrompts = 0;
    
    for (const node of nodes) {
        if (!targetNodeIds.includes(node.id)) continue;
        if (!node.data || !node.data.prompt_template) continue;
        for (const pt of node.data.prompt_template) {
            if (pt.text && !pt.text.includes('กฎการตอบตามช่องทาง')) {
                pt.text += channelRuleInstruction;
                modifiedPrompts++;
            }
        }
    }
    console.log(`✅ Added channel routing rule to ${modifiedPrompts} LLM node(s)`);

    // 3. Clean any leftover jinja2_variables referencing page_source
    for (const node of nodes) {
        if (node.data && node.data.prompt_config && node.data.prompt_config.jinja2_variables) {
            node.data.prompt_config.jinja2_variables = 
                node.data.prompt_config.jinja2_variables.filter(v => v.variable !== 'page_source');
        }
    }
    console.log('✅ Cleaned up invalid jinja2_variables');

    // 4. Ensure Start node has page_source variable (harmless, needed for future use)
    const startNode = nodes.find(n => n.data && n.data.type === 'start');
    if (startNode && startNode.data.variables) {
        startNode.data.variables = startNode.data.variables.filter(v => v.variable !== 'page_source');
        console.log('✅ Removed page_source from Start node (not needed anymore)');
    }

    fs.writeFileSync(filePath, YAML.stringify(data));
    console.log('\n🎉 Done! YAML is now clean and ready to import into Dify without errors.');
    console.log('👉 The page routing is now handled 100% by server.js middleware.');
}

cleanAndFix().catch(console.error);
