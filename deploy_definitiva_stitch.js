const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const sourceDir = path.join(__dirname, 'stitch_definitiva_ext', 'stitch_video_creator');

// Extraer JS y Modal del actual index.html
const oldIndexContent = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// 1. Extraer modal (desde <div id="videoModal" hasta el último </div> antes de <script>)
let modalContent = '';
const modalStart = oldIndexContent.indexOf('<div id="videoModal"');
if (modalStart !== -1) {
    const modalEnd = oldIndexContent.indexOf('<script>', modalStart);
    if (modalEnd !== -1) {
        modalContent = oldIndexContent.slice(modalStart, modalEnd);
    }
}

// 2. Extraer JS
let scriptContent = '';
const scriptStart = oldIndexContent.indexOf('<script>');
if (scriptStart !== -1) {
    const scriptEnd = oldIndexContent.lastIndexOf('</script>');
    if (scriptEnd !== -1) {
        scriptContent = oldIndexContent.slice(scriptStart, scriptEnd + 9);
    }
}

// 3. Mapeo de archivos
const map = {
    'aethel_well_dashboard_interactiva': 'index.html',
    'aethel_well_biblioteca_de_videos': 'library.html',
    'aethel_well_cola_de_creaci_n_detail': 'queue.html',
    'aethel_well_configuraci_n_del_sistema': 'settings.html',
    'modal_generar_video_estado_de_xito': 'success.html'
};

if (fs.existsSync(sourceDir)) {
    const dirs = fs.readdirSync(sourceDir);
    dirs.forEach(d => {
        if (map[d]) {
            const srcFile = path.join(sourceDir, d, 'code.html');
            const destFile = path.join(publicDir, map[d]);
            
            if (fs.existsSync(srcFile)) {
                let content = fs.readFileSync(srcFile, 'utf8');
                
                // Si es index.html, le inyectamos el modal y el JS al final del body
                if (map[d] === 'index.html') {
                    content = content.replace('</body>', `\n${modalContent}\n${scriptContent}\n</body>`);
                }
                
                fs.writeFileSync(destFile, content, 'utf8');
                console.log(`Deployed ${map[d]}`);
            }
        }
    });
} else {
    console.error("No source directory found.");
}
