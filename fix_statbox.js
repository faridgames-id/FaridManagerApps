const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'web-app/src/components');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Change stat-box to card and remove inline dark backgrounds
    content = content.replace(/className=['"]stat-box['"][^>]*style=\{\{\s*background:\s*['"][^'"]+['"]\s*\}\}/g, 'className="card" style={{ padding: "20px" }}');
    content = content.replace(/className=['"]stat-box['"]/g, 'className="card"');
    
    fs.writeFileSync(path.join(dir, file), content);
}
console.log('Fixed stat-box everywhere.');
