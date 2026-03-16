const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const scriptEngine = require('./script_engine');


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuración del bot de Telegram
const bot = new Telegraf(process.env.TELEGRAM_TOKEN || "NO_TOKEN_PROVIDED");
const chatId = process.env.TELEGRAM_CHAT_ID;

const path = require('path');

// Servir la carpeta estática del dashboard
const dashboardPath = path.join(__dirname, 'public');
app.use(express.static(dashboardPath));

// Rutas de Vistas Originales para SPA fetch
app.get('/views/index', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));
app.get('/views/library', (req, res) => res.sendFile(path.join(dashboardPath, 'library.html')));
app.get('/views/queue', (req, res) => res.sendFile(path.join(dashboardPath, 'queue.html')));
app.get('/views/settings', (req, res) => res.sendFile(path.join(dashboardPath, 'settings.html')));
app.get('/views/success', (req, res) => res.sendFile(path.join(dashboardPath, 'success.html')));

// API: Listar Proyectos Recientes
app.get('/api/projects', (req, res) => {
  const jsonFilePath = 'projects.json';
  if (fs.existsSync(jsonFilePath)) {
    try {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      res.json({ projects: JSON.parse(data).reverse() });
    } catch (err) { res.json({ projects: [] }); }
  } else {
    res.json({ projects: [] });
  }
});

// Rutas Catch-All SPA (todas devuelven index.html para recarga directa)
app.get('/', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));
app.get('/library', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));
app.get('/queue', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));
app.get('/success', (req, res) => res.sendFile(path.join(dashboardPath, 'index.html')));

// Ruta para recibir proyectos y notificar
app.post('/api/generate-video', (req, res) => {
  const { tema, audience, villain, solution, unique_message, influencer_id, plataforma = 'HeyGen' } = req.body;
  
  if (!tema) {
    return res.status(400).json({ error: "Falta el campo 'tema'." });
  }

  // Enviar mensaje por Telegram de aviso inicial
  const messageInitial = `🚀 Nuevo proyecto recibido: ${tema}.\nAudiencia: ${audience || 'N/A'}\nPlataforma: ${plataforma}\nGenerando guion...`;
  if (chatId && process.env.TELEGRAM_TOKEN) {
    bot.telegram.sendMessage(chatId, messageInitial).catch(console.error);
  } else {
    console.log("Notificación Inicial (Simulada):", messageInitial);
  }

  // Generar el guion cinematográfico (se podría adaptar el motor para usar los nuevos campos)
  const final_script = scriptEngine.generateScript(tema, plataforma);

  // Guardar en JSON (projects.json)
  const projectId = Date.now().toString();
  const projectData = { 
    id: projectId,
    tema,
    audience,
    villain,
    solution,
    unique_message,
    influencer_id,
    plataforma,
    final_script,
    status: 'PENDING',
    timestamp: new Date().toISOString() 
  };
  const jsonFilePath = 'projects.json';
  let projects = [];
  
  if (fs.existsSync(jsonFilePath)) {
    try {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      projects = JSON.parse(data);
    } catch (err) {
      console.error("Error reading JSON:", err);
    }
  }
  
  projects.push(projectData);
  fs.writeFileSync(jsonFilePath, JSON.stringify(projects, null, 2));

  // Enviar mensaje final por Telegram con la vista previa del guion
  const preview = final_script.split(' ').slice(0, 20).join(' ');
  const messageFinal = `📝 ¡Guion Redactado!\nTema: ${tema}\nVista previa: ${preview}...\n¿Procedemos con la generación de voz?`;
  
  if (chatId && process.env.TELEGRAM_TOKEN) {
    bot.telegram.sendMessage(chatId, messageFinal, {
      ...Markup.inlineKeyboard([
        Markup.button.callback('✅ APROBAR', `approve_${projectId}`),
        Markup.button.callback('🔄 REGENERAR', `regenerate_${projectId}`)
      ])
    }).catch(console.error);
  } else {
    console.log("Notificación Final (Simulada):", messageFinal);
  }

  res.json({ success: true, message: "Proyecto recibido, guion generado y notificado.", project: projectData });
});

// Manejo de acciones en Telegram (Human-in-the-loop)
if (process.env.TELEGRAM_TOKEN) {
  bot.action(/approve_(.+)/, (ctx) => {
    const projectId = ctx.match[1];
    
    const jsonFilePath = 'projects.json';
    if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      let projects = JSON.parse(data);
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex].status = 'READY_TO_RENDER';
        fs.writeFileSync(jsonFilePath, JSON.stringify(projects, null, 2));
        ctx.reply(`Entendido, jefe. El proyecto ${projectId} ha sido aprobado.`).catch(console.error);
      } else {
        ctx.reply(`No encontré el proyecto con ID ${projectId}.`).catch(console.error);
      }
    }
    ctx.answerCbQuery();
  });

  bot.action(/regenerate_(.+)/, (ctx) => {
    const projectId = ctx.match[1];
    ctx.reply("Re-escribiendo guion... dame 5 segundos.").catch(console.error);
    
    const jsonFilePath = 'projects.json';
    if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf8');
      let projects = JSON.parse(data);
      const projectIndex = projects.findIndex(p => p.id === projectId);
        
      if (projectIndex !== -1) {
        const project = projects[projectIndex];
        // General nuevo script
        const final_script = scriptEngine.generateScript(project.tema, project.plataforma);
        projects[projectIndex].final_script = final_script;
        projects[projectIndex].status = 'PENDING';
        fs.writeFileSync(jsonFilePath, JSON.stringify(projects, null, 2));
        
        const preview = final_script.split(' ').slice(0, 20).join(' ');
        const messageFinal = `📝 ¡Nuevo Guion Redactado!\nTema: ${project.tema}\nVista previa: ${preview}...\n¿Procedemos?`;
        
        ctx.reply(messageFinal, {
          ...Markup.inlineKeyboard([
            Markup.button.callback('✅ APROBAR', `approve_${projectId}`),
            Markup.button.callback('🔄 REGENERAR', `regenerate_${projectId}`)
          ])
        }).catch(console.error);
      }
    }
    ctx.answerCbQuery();
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Enviar mensaje automático al arrancar
  if (chatId && process.env.TELEGRAM_TOKEN) {
    bot.launch(); // Iniciar polling para recibir interacciones
    bot.telegram.sendMessage(chatId, '🌿 Conexión Exitosa: La Fábrica Aethel Well está en línea y lista para procesar bienestar.')
      .catch(console.error);
  } else {
    console.log("No hay TELEGRAM_TOKEN o TELEGRAM_CHAT_ID configurado para enviar el mensaje de inicio.");
  }
});
