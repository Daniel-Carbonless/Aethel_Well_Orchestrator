const fs = require('fs');
const path = require('path');
const indexFile = path.join(__dirname, 'public', 'index.html');

let content = fs.readFileSync(indexFile, 'utf8');

// 1. Hide the tracking toast and give it an ID
content = content.replace(
    '<div class="fixed top-20 right-8 z-50 bg-[#1B3A2B] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">',
    '<div id="success-toast" class="hidden fixed top-20 right-8 z-50 bg-[#1B3A2B] text-white px-4 py-3 rounded-xl shadow-2xl items-center gap-3 animate-bounce">'
);

// 2. Add onclick to Generar Video button
content = content.replace(
    '<button class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 rounded-full shadow-md px-6 bg-[#1B3A2B]"><span class="material-symbols-outlined text-[18px]">add</span> Generar Video</button>',
    '<button id="openModalBtn" onclick="document.getElementById(\\'videoModal\\').classList.remove(\\'hidden\\'); document.getElementById(\\'videoModal\\').classList.add(\\'flex\\');" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 rounded-full shadow-md px-6 bg-[#1B3A2B] whitespace-nowrap"><span class="material-symbols-outlined text-[18px]">add</span> Generar Video</button>'
);

// 3. Inject the modal before <script> or at the end of body
const modalHTML = `
<div id="videoModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-primary/10">
    <div class="p-6">
      <h2 class="text-2xl font-bold text-primary mb-4">Nueva Orquestación de Video</h2>
      <form id="videoForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Tema (Topic)</label>
          <input type="text" id="topic" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ej: Respiración 4-7-8">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Audiencia (Audience)</label>
          <input type="text" id="audience" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ej: Empleados con burnout">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">El Dolor (Villain)</label>
          <input type="text" id="villain" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ej: Insomnio crónico">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">La Solución (Solution)</label>
          <input type="text" id="solution" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ej: Protocolo de sueño Aethel">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje Único (Unique Message)</label>
          <input type="text" id="unique_message" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ej: La ciencia detrás de la paz">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Influencer ID</label>
            <input type="text" id="influencer_id" value="default" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Plataforma</label>
            <select id="platform" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
              <option value="HeyGen">HeyGen</option>
              <option value="Kling">Kling</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" id="closeModal" onclick="document.getElementById('videoModal').classList.add('hidden'); document.getElementById('videoModal').classList.remove('flex');" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancelar</button>
          <button type="submit" id="submitBtn" class="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2B] hover:bg-[#152e22] rounded-lg shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">send</span> Enviar a Fábrica
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

if (!content.includes('id="videoModal"')) {
    content = content.replace('</body>', `${modalHTML}\n</body>`);
}

// 4. Update the toast display logic in the script block
content = content.replace(
    "modal.classList.add('hidden');",
    "modal.classList.add('hidden');\n        document.getElementById('success-toast').classList.remove('hidden');\n        document.getElementById('success-toast').classList.add('flex');\n        setTimeout(() => { document.getElementById('success-toast').classList.add('hidden'); document.getElementById('success-toast').classList.remove('flex'); }, 5000);"
);

fs.writeFileSync(indexFile, content, 'utf8');
console.log("Patched index.html with JS fixes and Modal.");
