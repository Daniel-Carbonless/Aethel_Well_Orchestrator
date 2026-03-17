const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');

// 1. Rename app.js to core.js
const oldJsPath = path.join(jsDir, 'app.js');
const newJsPath = path.join(jsDir, 'core.js');

if (fs.existsSync(oldJsPath)) {
    fs.renameSync(oldJsPath, newJsPath);
    console.log("Renamed app.js to core.js");
}

// 2. Read the unified sidebar from index.html
let indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const asideStart = indexHtml.indexOf('<aside');
const asideEnd = indexHtml.indexOf('</aside>') + 8;
const sidebarTemplate = indexHtml.substring(asideStart, asideEnd);

// Fix the empty active class in the style block of index.html
if (indexHtml.includes('. {')) {
    indexHtml = indexHtml.replace('. {', '.active-link {');
    // Save back to index.html
    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
}

// We also need the definition of .active-link
const activeLinkStyle = `
        .active-link {
            background-color: rgba(28, 59, 44, 0.1);
            color: #1c3b2c !important;
            border-right: 3px solid #1c3b2c;
            font-weight: 700 !important;
        }
`;

const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(publicDir, file), 'utf8');

    // Rename app.js to core.js in script tags
    content = content.replace(/\/js\/app\.js/g, '/js/core.js');
    if (!content.includes('/js/core.js')) {
        content = content.replace('</body>', '<script src="/js/core.js"></script>\n</body>');
    }

    // Replace the sidebar
    const fileAsideStart = content.indexOf('<aside');
    const fileAsideEnd = content.indexOf('</aside>') + 8;
    
    if (fileAsideStart !== -1 && fileAsideEnd !== -1) {
        // Prepare the sidebar for this specific file
        let currentPath = '/';
        if (file !== 'index.html') {
            currentPath = '/' + file.replace('.html', '');
        }

        let customizedSidebar = sidebarTemplate;
        
        // Remove old weird active classes if they were hardcoded
        customizedSidebar = customizedSidebar.replace(/class="([^"]*)\s+text-slate-600([^"]*)"/g, 'class="$1 text-slate-600$2"'); // Normalize
        
        // First make all links inactive
        customizedSidebar = customizedSidebar.replace(/<a class="([^"]*)" href="([^"]*)">/g, (match, classes, href) => {
            // Strip any existing active stuff
            let newClasses = classes.replace('active-link', '').replace('text-primary', 'text-slate-600').trim();
            // add text-slate-600 hover stuff if missing
            if(!newClasses.includes('text-slate-600') && !newClasses.includes('text-red-600')) {
                newClasses += ' text-slate-600 hover:bg-slate-50 hover:text-primary';
            }
            return `<a class="${newClasses}" href="${href}">`;
        });

        // Now find the link that matches currentPath and make it active
        // e.g. `<a class="..." href="/library">`
        const hrefMatch = new RegExp(`href="${currentPath === '/' ? '\\/' : currentPath}"`);
        customizedSidebar = customizedSidebar.replace(hrefMatch, `class="flex items-center gap-3 px-3 py-2.5 rounded-lg active-link transition-colors" href="${currentPath}"`);

        // Replace in file
        content = content.substring(0, fileAsideStart) + customizedSidebar + content.substring(fileAsideEnd);
    }

    // Inject the active-link style if not present
    if (!content.includes('.active-link {') && content.includes('<style>')) {
        content = content.replace('</style>', activeLinkStyle + '</style>');
    } else if (!content.includes('.active-link {')) {
        // If no style tag exists, add it to head
        content = content.replace('</head>', '<style>' + activeLinkStyle + '</style></head>');
    }

    // Clean hrefs to make sure they are correct
    content = content.replace(/href="library\.html"/g, 'href="/library"');
    content = content.replace(/href="queue\.html"/g, 'href="/queue"');
    content = content.replace(/href="settings\.html"/g, 'href="/settings"');
    content = content.replace(/href="index\.html"/g, 'href="/"');

    fs.writeFileSync(path.join(publicDir, file), content, 'utf8');
    console.log(`Updated ${file}`);
});
