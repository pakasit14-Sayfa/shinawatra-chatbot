const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'คำสั่ง', 'dify_study_in_china.yml');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix Model Name
    const oldModel = /name: gpt-4\.1-mini/g;
    content = content.replace(oldModel, 'name: gpt-4o-mini');

    // 2. Add Logging to Code Node
    // Finding the python code block for Code 2
    const codeBlockStart = content.indexOf('code: "import re');
    if (codeBlockStart !== -1) {
        const codeBlockEnd = content.indexOf('"\n        code_language: python3', codeBlockStart);
        
        if (codeBlockEnd !== -1) {
            const newPythonCode = `import re\\n\\ndef main(text: str) -> dict:\\n    try:\\n        # ค้นหาข้อความในวงเล็บก้ามปู เช่น [สถานะ:ป.โทบริหาร]\\n        pattern = r\\"\\\\[.*?\\\\]\\"\\n        match = re.search(pattern, text)\\n        \\n        if match:\\n            tag = match.group(0)\\n            clean_text = re.sub(pattern, \\"\\", text).strip()\\n            print(f\\"[LOG] Found tag: {tag}\\")\\n        else:\\n            tag = \\"\\"\\n            clean_text = text.strip()\\n            print(\\"[LOG] No tag found, fallback to empty\\")\\n            \\n        return {\\n            \\"tag\\": tag,\\n            \\"clean_text\\": clean_text\\n        }\\n    except Exception as e:\\n        print(f\\"[ERROR] Exception in Code Node: {str(e)}\\")\\n        return {\\n            \\"tag\\": \\"\\",\\n            \\"clean_text\\": text.strip()\\n        }`;
            
            // Replace the old code block with the new one
            const oldCodeBlock = content.substring(codeBlockStart, codeBlockEnd);
            content = content.replace(oldCodeBlock, `code: "${newPythonCode}`);
            console.log('✅ Updated Python Code Node with logging & error handling');
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Model name updated to gpt-4o-mini successfully');
    console.log('🎉 dify_study_in_china.yml has been fully updated!');

} catch (error) {
    console.error('❌ Error updating file:', error);
}
