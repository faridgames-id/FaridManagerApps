const fs = require('fs');
let c = fs.readFileSync('src/app/page.js', 'utf8');
c = c.replace(/rgba\(0,0,0,0\.3\)/g, 'var(--bg-surface)');
c = c.replace(/rgba\(0,5,15,0\.85\)/g, 'rgba(255,255,255,0.85)');
c = c.replace(/rgba\(10,18,34,0\.98\)/g, 'rgba(255,255,255,0.98)');
c = c.replace(/rgba\(6,12,24,0\.98\)/g, 'rgba(240,245,255,0.98)');
fs.writeFileSync('src/app/page.js', c);
