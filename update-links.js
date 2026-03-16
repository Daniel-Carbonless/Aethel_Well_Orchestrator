const fs = require('fs');
const files = ['public/index.html', 'public/library.html', 'public/queue.html', 'public/settings.html', 'public/success.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Pattern 1: Sidebar with Dashboard, folder_open, auto_awesome, settings
    // Dashboard -> /
    content = content.replace(/(<a[^>]*?)href="[^"]*"([^>]*?>\s*<span[^>]*dashboard<\/span>\s*<span[^>]*>Panel de Control<\/span>\s*<\/a>)/g, '$1href="/"$2');
    // Library -> /library
    content = content.replace(/(<a[^>]*?)href="[^"]*"([^>]*?>\s*<span[^>]*folder_open<\/span>\s*<span[^>]*>Biblioteca<\/span>\s*<\/a>)/g, '$1href="/library"$2');
    // Queue -> /queue
    content = content.replace(/(<a[^>]*?)href="[^"]*"([^>]*?>\s*<span[^>]*auto_awesome<\/span>\s*<span[^>]*>Cola de Creación<\/span>\s*<\/a>)/g, '$1href="/queue"$2');
    // Queue alternate class icon
    content = content.replace(/(<a[^>]*?)href="[^"]*"([^>]*?>\s*<span[^>]*movie_filter<\/span>\s*<span[^>]*>Cola de Creación<\/span>\s*<\/a>)/g, '$1href="/queue"$2');
    // Settings -> /settings
    content = content.replace(/(<a[^>]*?)href="[^"]*"([^>]*?>\s*<span[^>]*settings<\/span>\s*<span[^>]*>Configuración<\/span>\s*<\/a>)/g, '$1href="/settings"$2');

    // Pattern 2: success.html uses nav block. Let's make it clickable if it's not.
    content = content.replace(/<div class="flex items-center gap-3 px-3 py-2[^>]*text-slate-600">\s*<span class="material-symbols-outlined">home<\/span>\s*<p class="text-sm font-medium">Inicio<\/p>\s*<\/div>/g, 
        '<a href="/" class="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"><span class="material-symbols-outlined">home</span><p class="text-sm font-medium">Inicio</p></a>');
        
    content = content.replace(/<div class="flex items-center gap-3 px-3 py-2[^>]*text-slate-600">\s*<span class="material-symbols-outlined">library_books<\/span>\s*<p class="text-sm font-medium">Biblioteca<\/p>\s*<\/div>/g, 
        '<a href="/library" class="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"><span class="material-symbols-outlined">library_books</span><p class="text-sm font-medium">Biblioteca</p></a>');
        
    content = content.replace(/<div class="flex items-center gap-3 px-3 py-2[^>]*text-white">\s*<span class="material-symbols-outlined">factory<\/span>\s*<p class="text-sm font-medium">Fábrica<\/p>\s*<\/div>/g, 
        '<a href="/queue" class="flex items-center gap-3 px-3 py-2 bg-primary text-white rounded-lg"><span class="material-symbols-outlined">factory</span><p class="text-sm font-medium">Fábrica</p></a>');

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Links successfully updated!');
