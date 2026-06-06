const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'web-app/src/components');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Remove specific light colors on text (which were for dark mode)
    content = content.replace(/color:\s*['"]#8AB4F8['"]/g, "color: 'var(--text-secondary)'");
    content = content.replace(/color:\s*['"]#B5D4F4['"]/g, "color: 'var(--text-primary)'");
    content = content.replace(/color:\s*['"]#85B7EB['"]/g, "color: 'var(--text-secondary)'");
    content = content.replace(/color:\s*['"]#5B9ED8['"]/g, "color: 'var(--text-tertiary)'");
    
    // Remove linear gradients from cards and replace with standard bg
    content = content.replace(/background:\s*['"]linear-gradient[^'"]+['"]/g, "background: 'var(--bg-surface)'");
    
    // Remove width 100% from buttons to stop them from stretching
    content = content.replace(/width:\s*['"]100%['"]([^}]*\}?.*\s*className=['"]btn[^'"]*['"])/g, "");
    content = content.replace(/(className=['"]btn[^'"]*['"][^>]*style=\{\{.*?)width:\s*['"]100%['"],?\s*/g, "");
    
    fs.writeFileSync(path.join(dir, file), content);
}
console.log('Cleaned up inline styles for light mode compatibility.');
