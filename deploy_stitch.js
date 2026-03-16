const fs = require('fs');
const path = require('path');

// 1. Mapeo y copia de archivos extraídos a /public
const sourceDir = path.join(__dirname, 'stitch_video_creator', 'stitch_video_creator');
const publicDir = path.join(__dirname, 'public');

const map = {
    'aethel_well_biblioteca_de_videos': 'library.html',
    'aethel_well_cola_de_creaci_n_detail': 'queue.html',
    'aethel_well_configuraci_n_del_sistema': 'settings.html',
    'modal_generar_video_estado_de_xito': 'success.html'
    // Intencionalmente omitimos el Dashboard interactivo puro para no machacar el index.html con SPA y form local actual
};

if (fs.existsSync(sourceDir)) {
    const dirs = fs.readdirSync(sourceDir);
    dirs.forEach(d => {
        if (map[d]) {
            const srcFile = path.join(sourceDir, d, 'code.html');
            const destFile = path.join(publicDir, map[d]);
            if (fs.existsSync(srcFile)) {
                fs.copyFileSync(srcFile, destFile);
                console.log(`Copied ${srcFile} to ${destFile}`);
            }
        }
    });
}

// 2. Modificar loadLibraryProjects en index.html para usar la UI original de Stitch
const indexHtmlPath = path.join(publicDir, 'index.html');
let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const newLibraryJS = `
  async function loadLibraryProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      
      const grids = document.querySelectorAll('.main-content .grid');
      const container = grids[0];
      if (container) {
        container.innerHTML = '';
        if (data.projects.length === 0) {
           container.innerHTML = '<div class="col-span-full border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center p-12 text-center group"><span class="material-symbols-outlined text-4xl text-primary/40 mb-4">video_library</span><h3 class="text-xl font-bold text-primary mb-2">Aún no hay videos</em><p class="text-slate-500">Comienza a generar contenido con la IA.</p></div>';
           return;
        }

        data.projects.forEach(p => {
          const card = document.createElement('div');
          card.className = "bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 group";
          
          let icon = 'music_note';
          let plat = p.plataforma || 'HeyGen';
          let bgImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnrmNL0UNK0rbf8yuC6DpJclsP0EN7p5V4hN2LW3hOoi9DLPUn1zGsCZqRgj-d82I2FrGv-sUVlCWQl8awoVaXeEkvfg9WZQ0zZsxUK1_5z2WaoKBFxfS6vCvSfoKqQaVrjFoA0FQMCmYrrd7YgBpoUmd4TTextSyN0j-t5fZ3EtS0IcBGGcTgGDN90vtyaAF7uUbJF1Y8gmu__zp6jV_8sExDQIBkSz5Di-rv0IUkv698UJ4dKRwzD-mx8CmMxXCHlnGIb60KECs'; // Default placeholder
          
          if(plat.toLowerCase().includes('tiktok')) icon = 'music_note';
          else if(plat.toLowerCase().includes('instagram')) icon = 'camera_alt';
          else icon = 'play_circle';

          card.innerHTML = \`<div class="relative aspect-video overflow-hidden">
<div class="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110" style="background-image: url('\${bgImage}');"></div>
<div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-sm text-pink-600">\${icon}</span>
<span class="text-[10px] font-bold uppercase tracking-wider text-slate-700">\${plat}</span>
</div>
<div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<button class="h-12 w-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
<span class="material-symbols-outlined">play_arrow</span>
</button>
</div>
</div>
<div class="p-6">
<div class="flex justify-between items-start mb-2">
<h3 class="text-xl font-bold text-primary tracking-tight truncate pr-2">\${p.tema}</h3>
<span class="text-slate-400 text-xs font-medium px-2 py-1 rounded bg-slate-100">\${p.status || 'PENDING'}</span>
</div>
<p class="text-slate-500 text-sm mb-6 flex items-center gap-1">
<span class="material-symbols-outlined text-xs">calendar_month</span> \${new Date(p.timestamp).toLocaleDateString()}
</p>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-primary rounded-xl text-white text-xs font-bold hover:bg-opacity-95 transition-all">
<span class="material-symbols-outlined text-base">download</span> MP4
</button>
<button class="flex items-center justify-center gap-2 py-3 bg-accent-cream rounded-xl text-primary text-xs font-bold hover:bg-primary/10 transition-all">
<span class="material-symbols-outlined text-base">content_copy</span> SEO
</button>
</div>
</div>\`;
          container.appendChild(card);
        });
      }
    } catch(e) { console.error("Error cargando proyectos en la biblioteca:", e); }
  }
`;

// Replace the existing loadLibraryProjects function using a regex that captures it
const funcRegex = /async function loadLibraryProjects\(\) \{[\s\S]*?(?=async function loadQueueProjects)/;
htmlContent = htmlContent.replace(funcRegex, newLibraryJS.trim() + '\n\n  ');
fs.writeFileSync(indexHtmlPath, htmlContent);
console.log('Updated index.html Library injection logic');
