const fs = require('fs');
const path = require('path');

const dir = 'c:\\\\WEB DAN APLIKASI\\\\MANAGEMENT AKUN V2 - Copy\\\\web-app\\\\src\\\\components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Find lucide-react imports
    const lucideImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
    let importedIcons = [];
    if (lucideImportMatch) {
        importedIcons = lucideImportMatch[1].split(',').map(i => i.trim());
    }

    // Find all JSX tags starting with Capital letter
    const tagMatches = content.matchAll(/<([A-Z][a-zA-Z0-9]*)/g);
    const tags = new Set();
    for (const match of tagMatches) {
        // Exclude standard React components and custom components we know are local/internal
        if (!['Sidebar', 'LoginOverlay', 'IntroOverlay', 'DashboardTab', 'StockTab', 'DailyInflowTab', 'SearchTab', 'JournalTab', 'WishlistTab', 'CalendarTab', 'StatsTab', 'SalesTab', 'AnimatedBackground', 'ErrorBoundary', 'Line', 'Doughnut', 'Bar', 'Fragment', 'Provider', 'IconMark'].includes(match[1])) {
            tags.add(match[1]);
        }
    }

    // Check which ones are not imported
    const missing = Array.from(tags).filter(tag => !importedIcons.includes(tag));
    
    if (missing.length > 0) {
        console.log(`\nFile: ${file}`);
        console.log(`Imported: ${importedIcons.join(', ')}`);
        console.log(`Used but possibly not imported: ${missing.join(', ')}`);
    }
});
