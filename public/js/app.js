
async function loadLibraryProjects() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        const grids = document.querySelectorAll('.main-content .grid');
        const container = document.getElementById('library-grid-container') || grids[0];
        if (container) {
            container.innerHTML = '';
            if (data.projects.length === 0) {
                container.innerHTML = '<div class="col-span-full border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center p-12 text-center group"><span class="material-symbols-outlined text-4xl text-primary/40 mb-4">video_library</span><h3 class="text-xl font-bold text-primary mb-2">Aún no has creado ningún video</h3><p class="text-slate-500">Comienza a generar contenido con la IA.</p></div>';
                return;
            }
            data.projects.forEach(p => {
                const card = document.createElement('div');
                card.className = "bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 group";
                let icon = 'music_note';
                let plat = p.plataforma || 'HeyGen';
                let bgImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnrmNL0UNK0rbf8yuC6DpJclsP0EN7p5V4hN2LW3hOoi9DLPUn1zGsCZqRgj-d82I2FrGv-sUVlCWQl8awoVaXeEkvfg9WZQ0zZsxUK1_5z2WaoKBFxfS6vCvSfoKqQaVrjFoA0FQMCmYrrd7YgBpoUmd4TTextSyN0j-t5fZ3EtS0IcBGGcTgGDN90vtyaAF7uUbJF1Y8gmu__zp6jV_8sExDQIBkSz5Di-rv0IUkv698UJ4dKRwzD-mx8CmMxXCHlnGIb60KECs';
                if(plat.toLowerCase().includes('tiktok')) icon = 'music_note';
                else if(plat.toLowerCase().includes('instagram')) icon = 'camera_alt';
                else icon = 'play_circle';
                let statusBadge = '<span class="text-slate-400 text-xs font-medium px-2 py-1 rounded bg-slate-100">' + (p.status || 'PENDING') + '</span>';
                if (p.status === 'PENDIENTE' || p.status === 'PENDING') {
                    statusBadge = '<span class="text-amber-700 text-xs font-bold px-2 py-1 rounded bg-amber-100">PENDIENTE</span>';
                } else if (p.status === 'IN_PRODUCTION') {
                    statusBadge = '<span class="text-blue-700 text-xs font-bold px-2 py-1 rounded bg-blue-100 flex items-center gap-1 w-fit"><span class="material-symbols-outlined text-[14px] animate-spin">sync</span> PROCESANDO</span>';
                } else if (p.status === 'APROBADO' || p.status === 'READY_TO_RENDER' || p.status === 'APPROVED') {
                    statusBadge = '<span class="text-green-700 text-xs font-bold px-2 py-1 rounded bg-green-100">APROBADO</span>';
                }

                card.innerHTML = `<div class="relative aspect-video overflow-hidden">
<div class="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-110" style="background-image: url('${bgImage}');"></div>
<div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-sm text-pink-600">${icon}</span>
<span class="text-[10px] font-bold uppercase tracking-wider text-slate-700">${plat}</span>
</div>
<div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<button class="h-12 w-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
<span class="material-symbols-outlined">play_arrow</span>
</button>
</div>
</div>
<div class="p-6">
<div class="flex justify-between items-start mb-2">
<div class="flex flex-col">
  <span class="text-xs text-slate-400 mb-1">ID: ${p.id || '0000'}</span>
  <h3 class="text-xl font-bold text-primary tracking-tight truncate pr-2">${p.tema}</h3>
</div>
${statusBadge}
</div>
<p class="text-slate-500 text-sm mb-6 flex items-center gap-1">
<span class="material-symbols-outlined text-xs">calendar_month</span> ${new Date(p.timestamp || Date.now()).toLocaleDateString()}
</p>
<div class="grid grid-cols-2 gap-3">
<button class="flex items-center justify-center gap-2 py-3 bg-primary rounded-xl text-white text-xs font-bold hover:bg-opacity-95 transition-all">
<span class="material-symbols-outlined text-base">download</span> MP4
</button>
<button class="flex items-center justify-center gap-2 py-3 bg-accent-cream rounded-xl text-primary text-xs font-bold hover:bg-primary/10 transition-all">
<span class="material-symbols-outlined text-base">content_copy</span> SEO
</button>
</div>
</div>`;
                container.appendChild(card);
            });
        }
    } catch(e) { console.error("Error cargando biblioteca:", e); }
}

async function loadQueueProjects() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        const tbody = document.getElementById('queue-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            if (data.projects.length === 0) {
               tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">No hay proyectos en cola</td></tr>';
               return;
            }
            data.projects.forEach(p => {
              let badgeClass = 'bg-slate-100 text-slate-600';
              let dotClass = 'bg-slate-400';
              let statusText = p.status || 'PENDING';
              if (p.status === 'PENDING' || p.status === 'PENDIENTE') { badgeClass = 'bg-amber-100 text-amber-700'; dotClass = 'bg-amber-500'; statusText = 'Pendiente'; }
              else if (p.status === 'IN_PRODUCTION' || p.status === 'PROCESSING') { badgeClass = 'bg-blue-100 text-blue-700'; dotClass = 'bg-blue-500 animate-pulse'; statusText = 'MODO SIMULACIÓN: Esperando API Key'; }
              else if (p.status === 'READY_TO_RENDER' || p.status === 'APROBADO' || p.status === 'APPROVED') { badgeClass = 'bg-green-100 text-green-700'; dotClass = 'bg-green-500'; statusText = 'Aprobado'; }
              const row = document.createElement('tr');
              row.className = 'hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors';
              row.innerHTML = `
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${p.tema}</span>
                    <span class="text-xs text-slate-400">ID: ${p.id || '0000'}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}">
                    <span class="size-1.5 rounded-full ${dotClass} mr-1.5"></span>
                    ${statusText}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span class="material-symbols-outlined text-lg">camera_roll</span>
                    ${p.plataforma}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button onclick="showScriptModal(this)" data-script="${(p.script || 'Sin guion').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&quot;/g, '&quot;').replace(/'/g, '&#039;')}" class="inline-flex items-center px-3 py-1.5 text-xs font-bold text-primary dark:text-slate-300 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                    Ver Guion
                  </button>
                </td>
              `;
              tbody.appendChild(row);
            });
        }
    } catch(e) { console.error("Error al cargar la cola:", e); }
}

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = data.total;
        if(document.getElementById('stat-ready')) document.getElementById('stat-ready').textContent = data.ready;
        if(document.getElementById('stat-process')) document.getElementById('stat-process').textContent = data.process;
        if(document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = data.pending;
        
        const qRes = await fetch('/api/projects');
        const qData = await qRes.json();
        const rq = document.getElementById('review-queue-container');
        if (rq) {
            rq.innerHTML = '';
            const pendingAndReady = qData.projects.filter(p => p.status === 'PENDING' || p.status === 'READY_TO_RENDER');
            if (pendingAndReady.length === 0) {
               rq.innerHTML = '<p class="text-sm text-slate-500">No hay proyectos pendientes de revisión.</p>';
            } else {
               pendingAndReady.slice(0, 3).forEach(p => {
                  rq.innerHTML += `<div class="w-full max-w-md bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                    <div class="flex items-center gap-4">
                      <div class="size-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                        <span class="material-symbols-outlined">movie</span>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-slate-900">${p.tema}</p>
                        <p class="text-xs text-slate-500">Plataforma: ${p.plataforma}</p>
                      </div>
                      <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">${p.status}</span>
                    </div>
                  </div>`;
               });
            }
        }
    } catch(e) { console.error("Error stats: ", e); }
}

async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        const elEleven = document.getElementById('key_elevenlabs');
        const elHiggs = document.getElementById('key_higgsfield');
        const elHeygen = document.getElementById('key_heygen');
        const elTgToken = document.getElementById('key_telegram_token');
        const elTgChat = document.getElementById('key_telegram_chat');
        if (elEleven) elEleven.value = data.elevenlabs;
        if (elHiggs) elHiggs.value = data.higgsfield;
        if (elHeygen) elHeygen.value = data.heygen;
        if (elTgToken) elTgToken.value = data.telegram_token;
        if (elTgChat) elTgChat.value = data.telegram_chat;
    } catch(e) { console.error("Error al cargar configuración:", e); }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Highlight sidebar
    document.querySelectorAll('aside a').forEach(a => {
        const href = a.getAttribute('href');
        // Clean up classes
        a.classList.remove('active-link');
        
        if (href === path || (path === '' && href === '/')) {
            a.classList.add('active-link');
        } else {
            a.classList.remove('active-link');
            if(!a.className.includes('text-slate-600') && !a.className.includes('text-red-600')) {
                a.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-primary');
            }
        }
    });

    if (path === '/' || path === '/index.html') {
        loadDashboardStats();
    } else if (path === '/library') {
        loadLibraryProjects();
    } else if (path === '/queue') {
        loadQueueProjects();
    } else if (path === '/settings') {
        loadSettings();
    }
});

// Settings Save
document.addEventListener('click', async (e) => {
    const saveBtn = e.target.closest('#saveSettingsBtn');
    if (saveBtn) {
        e.preventDefault();
        const payload = {
            elevenlabs: document.getElementById('key_elevenlabs')?.value,
            higgsfield: document.getElementById('key_higgsfield')?.value,
            heygen: document.getElementById('key_heygen')?.value,
            telegram_token: document.getElementById('key_telegram_token')?.value,
            telegram_chat: document.getElementById('key_telegram_chat')?.value,
        };
        try {
            const originalHtml = saveBtn.innerHTML;
            saveBtn.innerHTML = 'Guardando...';
            saveBtn.disabled = true;
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            saveBtn.innerHTML = '<span class="material-symbols-outlined">check</span> ¡Guardado!';
            setTimeout(() => {
                saveBtn.innerHTML = originalHtml;
                saveBtn.disabled = false;
            }, 2000);
        } catch(err) {
            console.error(err);
            alert('Error al guardar configuración');
            saveBtn.disabled = false;
        }
    }
});

// Modal Logic
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'videoForm') {
        e.preventDefault();
        const form = e.target;
        const submitBtn = document.getElementById('submitBtn');
        const modal = document.getElementById('videoModal');
        
        const payload = {
            tema: document.getElementById('topic')?.value,
            audience: document.getElementById('audience')?.value,
            villain: document.getElementById('villain')?.value,
            solution: document.getElementById('solution')?.value,
            unique_message: document.getElementById('unique_message')?.value,
            influencer_id: document.getElementById('influencer_id')?.value,
            plataforma: document.getElementById('platform')?.value,
        };

        try {
            const originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Procesando...';
            submitBtn.disabled = true;

            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled = false;
            
            if(data.success) {
                if(modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                form.reset();
                
                const toast = document.getElementById('success-toast');
                if (toast) {
                    toast.classList.remove('hidden');
                    toast.classList.add('flex');
                    setTimeout(() => {
                        toast.classList.add('hidden');
                        toast.classList.remove('flex');
                    }, 5000);
                }

                if (window.location.pathname === '/library') {
                    loadLibraryProjects();
                } else if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                    loadDashboardStats();
                } else if (window.location.pathname === '/queue') {
                    loadQueueProjects();
                }
            }
        } catch(err) {
            console.error(err);
            alert('Error de conexión con la fábrica');
            if(submitBtn) submitBtn.disabled = false;
        }
    }
});

window.showScriptModal = function(btn) {
    const scriptText = btn.getAttribute('data-script');
    const modal = document.getElementById('scriptModal');
    if (modal) {
        const contentEl = document.getElementById('scriptModalContent');
        if(contentEl) contentEl.innerText = scriptText;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        alert("Guion:\n\n" + scriptText);
    }
}
window.closeScriptModal = function() {
    const modal = document.getElementById('scriptModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
