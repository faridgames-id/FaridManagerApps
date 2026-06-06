const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'web-app/src/components/DailyInflowTab.js');

let content = fs.readFileSync(file, 'utf8');

// Fix Month Selector
content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,0\.08\)['"]/g, "border: '1px solid var(--border-light)'");
content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,0\.1\)['"]/g, "border: '1px solid var(--border-medium)'");
content = content.replace(/background:\s*['"]rgba\(15,23,42,0\.8\)['"]/g, "background: 'var(--bg-body)'");
content = content.replace(/color:\s*['"]#f8fafc['"]/g, "color: 'var(--text-primary)'");

// Fix stat-box to use card and remove dark inline background
content = content.replace(/className=['"]stat-box['"]\s*style=\{\{\s*background:\s*['"]rgba\([^)]+\)['"]\s*\}\}/g, 'className="card" style={{ padding: "20px" }}');
// If stat-box was not matched by the above regex, let's do a more robust one
content = content.replace(/className="stat-box" style=\{\{ background: 'rgba\(20, 30, 50, 0\.45\)' \}\}/g, 'className="card" style={{ padding: "20px" }}');

fs.writeFileSync(file, content);
console.log('Fixed DailyInflowTab inline styles.');
