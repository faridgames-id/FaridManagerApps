const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'web-app/src/components');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Remove color: 'white' and '#fff' from non-button inline styles (like cards)
    content = content.replace(/color:\s*['"]white['"]/gi, "color: 'var(--text-primary)'");
    content = content.replace(/color:\s*['"]#fff['"]/gi, "color: 'var(--text-primary)'");
    
    // Some h3 elements had color: 'white' which might have become text-primary, let's fix
    content = content.replace(/<h3([^>]*)(color:\s*['"]var\(--text-primary\)['"])/gi, "<h3$1color: 'var(--text-secondary)'");

    // Also remove any stray width: '100%' from buttons just in case
    content = content.replace(/(<button[^>]*className=['"][^'"]*btn[^'"]*['"][^>]*style=\{\{[^\}]*)width:\s*['"]100%['"],?\s*/g, "$1");
    content = content.replace(/,\s*\}\}/g, "}}"); // clean up trailing commas

    // Clean up Calendar grid day headers that had dark gradients
    content = content.replace(/background:\s*['"]linear-gradient[^'"]+['"]/gi, "background: 'var(--bg-surface)'");
    
    // In CalendarTab there was a dark cell background: 'rgba(15, 23, 42, 0.4)'
    content = content.replace(/background:\s*['"]rgba\(15,\s*23,\s*42,\s*0\.4\)['"]/g, "background: 'var(--bg-surface)'");
    content = content.replace(/background:\s*['"]rgba\(15,\s*23,\s*42,\s*0\.2\)['"]/g, "background: 'var(--c-50)'");

    fs.writeFileSync(path.join(dir, file), content);
}
console.log('Cleaned up white text inline styles.');
