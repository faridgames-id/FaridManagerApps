const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'web-app/src/components');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Fix syntax error caused by previous script
    content = content.replace(/<button type="submit" \}\}>/g, '<button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>');

    fs.writeFileSync(path.join(dir, file), content);
}
console.log('Fixed syntax errors.');
