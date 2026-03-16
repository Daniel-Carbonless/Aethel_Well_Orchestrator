const fs = require('fs');

const files = ['public/index.html', 'public/library.html', 'public/queue.html', 'public/settings.html'];
const routeNames = {
  'Panel de Control': '/',
  'Biblioteca': '/library',
  'Cola de Creación': '/queue',
  'Calendario de Contenido': '/calendar',
  'Rendimiento': '/performance',
  'Equipo': '/team',
  'Analíticas': '/analytics',
  'Configuración': '/settings',
  'Ayuda': '/help',
  'Cerrar Sesión': '/logout',
  'Inicio': '/',
  'Contenido': '/library'
};

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Split the content by `<a ` to isolate anchor tags
    const parts = content.split('<a ');
    
    for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        
        // Find where the </a> ends
        const endIndex = part.indexOf('</a>');
        if (endIndex === -1) continue;
        
        const aContent = part.substring(0, endIndex + 4); // Include </a>
        
        // Check if aContent contains one of our routeNames
        let foundText = null;
        for (const text of Object.keys(routeNames)) {
            if (aContent.includes('>' + text + '<')) {
                foundText = text;
                break;
            }
        }
        
        if (foundText) {
            // Replace the href
            // match href="..." or href='...'
            const replaced = aContent.replace(/href=["'][^"']*["']/, 'href="' + routeNames[foundText] + '"');
            parts[i] = replaced + part.substring(endIndex + 4);
        }
    }
    
    content = parts.join('<a ');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
