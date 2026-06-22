const fs = require('fs');
const YAML = require('yaml');

async function fixDifyYAML() {
    const yamlPath = "C:\\Users\\user\\Downloads\\Dilion Education - เรียนที่จีน.yml";
    const promptPath = "C:\\Dilion\\Theme_UI_extracted\\Guidance teacher system\\backend-middleware\\dify_knowledge_base\\dify_system_prompt_v2.txt";
    const outputPath = "C:\\Users\\user\\Downloads\\Dilion Education - V2 Clean.yml";

    const fileStr = fs.readFileSync(yamlPath, 'utf8');
    const promptStr = fs.readFileSync(promptPath, 'utf8');

    const data = YAML.parse(fileStr);

    const keepNodeIds = [
        '1780974928576', // Start
        '1780987487599', // Knowledge
        '1781587853209', // LLM
        '1781800000001'  // Answer
    ];

    // Filter nodes
    data.workflow.graph.nodes = data.workflow.graph.nodes.filter(n => keepNodeIds.includes(n.id));

    // Update LLM Node
    const llmNode = data.workflow.graph.nodes.find(n => n.id === '1781587853209');
    llmNode.data.title = 'AI Agent V2';
    llmNode.data.prompt_template[0].text = promptStr;

    // The Answer node needs to reference the LLM output
    const answerNode = data.workflow.graph.nodes.find(n => n.id === '1781800000001');
    answerNode.data.answer = '{{#1781587853209.text#}}';

    // Build new edges
    data.workflow.graph.edges = [
        {
            "id": "start-to-knowledge",
            "source": "1780974928576",
            "sourceHandle": "source",
            "target": "1780987487599",
            "targetHandle": "target",
            "type": "custom",
            "data": { "isInLoop": false, "sourceType": "start", "targetType": "knowledge-retrieval" }
        },
        {
            "id": "knowledge-to-llm",
            "source": "1780987487599",
            "sourceHandle": "source",
            "target": "1781587853209",
            "targetHandle": "target",
            "type": "custom",
            "data": { "isInLoop": false, "sourceType": "knowledge-retrieval", "targetType": "llm" }
        },
        {
            "id": "llm-to-answer",
            "source": "1781587853209",
            "sourceHandle": "source",
            "target": "1781800000001",
            "targetHandle": "target",
            "type": "custom",
            "data": { "isInLoop": false, "sourceType": "llm", "targetType": "answer" }
        }
    ];

    fs.writeFileSync(outputPath, YAML.stringify(data));
    console.log("Successfully created Dilion Education - V2 Clean.yml");
}

fixDifyYAML().catch(console.error);
