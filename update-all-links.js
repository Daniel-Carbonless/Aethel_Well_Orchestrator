const fs = require('fs');
const files = ['public/index.html', 'public/library.html', 'public/queue.html', 'public/settings.html'];
const routeNames = [
  { text: 'Panel de Control', href: '/' },
  { text: 'Biblioteca', href: '/library' },
  { text: 'Cola de Creación', href: '/queue' },
  { text: 'Calendario de Contenido', href: '/calendar' },
  { text: 'Rendimiento', href: '/performance' },
  { text: 'Equipo', href: '/team' },
  { text: 'Analíticas', href: '/analytics' },
  { text: 'Configuración', href: '/settings' },
  { text: 'Ayuda', href: '/help' },
  { text: 'Cerrar Sesión', href: '/logout' },
  
  // Settings.html has some variations
  { text: 'Inicio', href: '/' },
  { text: 'Contenido', href: '/library' },
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    routeNames.forEach(({text, href}) => {
       // A regex to match `<a ... href="...">...<span>text</span>...</a>`
       // This is complex for standard regex. Since these are mostly identical line structures,
       // a more specific approach: find the exact text, and trace back to the closest `<a href="#"` or similar.
       
       // Just using simple replace for the generic wrapper if it exists:
       const searchStr = `<span class="text-sm font-medium">${text}</span>`;
       if (content.includes(searchStr)) {
         // It's a bit hard to regex backwards over newlines. We can split by <a and re-assemble.
         // Let's replace the whole tag.
       }
    });

    // An easier regex: match entire <a...> blocks containing the specific text
    routeNames.forEach(({text, href}) => {
      const regex = new RegExp(`<a([^>]+)href=["'][^"']*["']([^>]*)>([\\s\\S]*?)<span([^>]*)>${text}<\\/span>([\\s\\S]*?)<\\/a>`, 'gi');
      content = content.replace(regex, `<a$1href="${href}"$2>$3<span$4>${text}</span>$5</a>`);
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Links updated in ${file}`);
  }
});
