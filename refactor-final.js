const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');

// Ensure js directory exists
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

// Move main_logic.js to js/app.js
const oldJsPath = path.join(publicDir, 'main_logic.js');
const newJsPath = path.join(jsDir, 'app.js');

if (fs.existsSync(oldJsPath)) {
    fs.renameSync(oldJsPath, newJsPath);
}

// Ensure the endpoints return full list, we just need to verify index.js handles /api/projects properly.
// Wait, the instruction says "Asegúrate de que este archivo se incluya en TODOS los HTML"

const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(publicDir, file), 'utf8');

    // 1. Substitute <script src="/main_logic.js"></script> with <script src="/js/app.js"></script>
    content = content.replace(/<script src="\/main_logic\.js"><\/script>/g, '<script src="/js/app.js"></script>');
    
    // Also inject if not present (just in case)
    if (!content.includes('/js/app.js')) {
        content = content.replace('</body>', '<script src="/js/app.js"></script>\n</body>');
    }

    // 2. Fix sidebar navigation links pointing to literal html files instead of routes
    content = content.replace(/href="(\/|)library\.html"/g, 'href="/library"');
    content = content.replace(/href="(\/|)queue\.html"/g, 'href="/queue"');
    content = content.replace(/href="(\/|)settings\.html"/g, 'href="/settings"');
    content = content.replace(/href="(\/|)index\.html"/g, 'href="/"');

    // Make absolutely sure every known sidebar link goes to the right clean path
    content = content.replace(/href="[^"]*"(>\s*<span[^>]*>dashboard<\/span>\s*<span[^>]*>Panel de Control)/g, 'href="/"$1');
    content = content.replace(/href="[^"]*"(>\s*<span[^>]*>folder_open<\/span>\s*<span[^>]*>Biblioteca)/g, 'href="/library"$1');
    content = content.replace(/href="[^"]*"(>\s*<span[^>]*>auto_awesome<\/span>\s*<span[^>]*>Cola de Creación)/g, 'href="/queue"$1');
    content = content.replace(/href="[^"]*"(>\s*<span[^>]*>settings<\/span>\s*<span[^>]*>Configuración)/g, 'href="/settings"$1');


    // 3. Clear Mock Content inside library.html to allow dynamic rendering
    if (file === 'library.html') {
        // Find the main grid and empty it
        const containerStart = content.indexOf('<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
        if (containerStart !== -1) {
             const preContent = content.substring(0, containerStart + 66);
             // find the end of this div (tricky, but we know it usually ends before a </section> or </main>)
             const gridEnd = content.indexOf('</main>', containerStart);
             if (gridEnd !== -1) {
                 // The grid ends a few </div> before </main>
                 // Let's just find the closing </div> of this grid structure (usually right before </main> minus some wrappers)
                 // A safer way is regex to match the mock cards if possible or just wipe everything inside the grid
                 
                 // Simpler approach: replace everything between `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">` and the next closing section 
                 // Actually, let's just wipe the children of this grid
                 content = content.replace(/(<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">)[\s\S]*?(<\/section>)/, '$1\n$2');
             }
        }
    }

    // 4. Clear Mock Content inside queue.html
    if (file === 'queue.html') {
        const tbodyStart = content.indexOf('<tbody id="queue-table-body"');
        if (tbodyStart !== -1) {
            const tbodyEnd = content.indexOf('</tbody>', tbodyStart);
            if (tbodyEnd !== -1) {
                // Wipe inside tbody
                const pre = content.substring(0, tbodyStart);
                const post = content.substring(tbodyEnd);
                content = pre + '<tbody id="queue-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">' + post;
            }
        }
    }

    fs.writeFileSync(path.join(publicDir, file), content, 'utf8');
    console.log(`Processed ${file}`);
});
