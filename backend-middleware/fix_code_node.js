const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'คำสั่ง', 'dify_study_in_china.yml');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const startMarker = '        code: "import re';
    const endMarker = '        code_language: python3';
    
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker, startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        // Build the new python code string properly escaped for YAML
        const newCode = `import re\\n\\ndef main(text: str) -> dict:\\n    try:\\n        pattern = r\\"\\\\[.*?\\\\]\\"\\n        match = re.search(pattern, text)\\n        if match:\\n            tag = match.group(0)\\n            clean_text = re.sub(pattern, \\"\\", text).strip()\\n            print(f\\"[LOG] Found tag: {tag}\\")\\n        else:\\n            tag = \\"\\"\\n            clean_text = text.strip()\\n            print(\\"[LOG] No tag found, fallback to empty\\")\\n        return {\\n            \\"tag\\": tag,\\n            \\"clean_text\\": clean_text\\n        }\\n    except Exception as e:\\n        print(f\\"[ERROR] Exception in Code Node: {str(e)}\\")\\n        return {\\n            \\"tag\\": \\"\\",\\n            \\"clean_text\\": text.strip()\\n        }`;
        
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        
        content = before + `        code: "${newCode}"\n` + after;
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Updated Python Code Node with logging & error handling');
    } else {
        console.log('❌ Could not find the code block boundaries.');
    }
} catch (error) {
    console.error('❌ Error updating file:', error);
}
