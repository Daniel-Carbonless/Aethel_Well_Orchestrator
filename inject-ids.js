const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');

// 1. Añadir IDs a index.html (Stats + Queue container en Dashboard)
let indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// Replace standard stats by finding the <h3> right after the labels
indexHtml = indexHtml.replace(/<p class="[^"]*">Total de videos<\/p>\s*<h3 class="([^"]*)">([^<]*)<\/h3>/g, '<p class="$1">Total de videos</p>\n<h3 id="stat-total" class="$2">-</h3>');
indexHtml = indexHtml.replace(/<p class="[^"]*">Listos para revisión<\/p>\s*<h3 class="([^"]*)">([^<]*)<\/h3>/g, '<p class="$1">Listos para revisión</p>\n<h3 id="stat-ready" class="$2">-</h3>');
indexHtml = indexHtml.replace(/<p class="[^"]*">En Proceso<\/p>\s*<h3 class="([^"]*)">([^<]*)<\/h3>/g, '<p class="$1">En Proceso</p>\n<h3 id="stat-process" class="$2">-</h3>');
indexHtml = indexHtml.replace(/<p class="[^"]*">En Cola<\/p>\s*<h3 class="([^"]*)">([^<]*)<\/h3>/g, '<p class="$1">En Cola</p>\n<h3 id="stat-pending" class="$2">-</h3>');

// Add id for the review queue container in dashboard
indexHtml = indexHtml.replace(/(<div class="flex-1 flex flex-col[^>]*>)/, '$1<div id="review-queue-container" class="w-full"></div>');

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

// 2. Añadir ID a queue.html
if(fs.existsSync(path.join(publicDir, 'queue.html'))) {
    let queueHtml = fs.readFileSync(path.join(publicDir, 'queue.html'), 'utf8');
    queueHtml = queueHtml.replace(/<tbody class="divide-y divide-slate-100 dark:divide-slate-800">/g, '<tbody id="queue-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">');
    queueHtml = queueHtml.replace(/<tbody>/g, '<tbody id="queue-table-body">');
    fs.writeFileSync(path.join(publicDir, 'queue.html'), queueHtml);
}

// 3. Añadir IDs a settings.html
if(fs.existsSync(path.join(publicDir, 'settings.html'))) {
    let settingsHtml = fs.readFileSync(path.join(publicDir, 'settings.html'), 'utf8');
    
    // Función helper para inyectar IDs en los inputs después de un texto label o span
    const injectInputId = (html, labelText, id) => {
        const regex = new RegExp(`(${labelText}[\\s\\S]*?<input[^>]*)(>)`, 'i');
        return html.replace(regex, `$1 id="${id}"$2`);
    };

    settingsHtml = injectInputId(settingsHtml, 'ElevenLabs', 'key_elevenlabs');
    settingsHtml = injectInputId(settingsHtml, 'Higgsfield', 'key_higgsfield');
    settingsHtml = injectInputId(settingsHtml, 'HeyGen', 'key_heygen');
    settingsHtml = injectInputId(settingsHtml, 'Telegram Bot Token', 'key_telegram_token');
    settingsHtml = injectInputId(settingsHtml, 'Telegram Chat ID', 'key_telegram_chat');

    // Botón de guardar
    settingsHtml = settingsHtml.replace(/(<button class="[^"]*">)(\s*<span class="material-symbols-outlined">save)/, '<button id="saveSettingsBtn" class="$2"');
    
    // Opcionalmente podemos limpiar las comillas malas del script anterior o asegurarnos de no duplicar
    fs.writeFileSync(path.join(publicDir, 'settings.html'), settingsHtml);
}
console.log("IDs inyectados en templates");
