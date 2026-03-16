const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Telegraf } = require('telegraf');
require('dotenv').config();
const scriptEngine = require('./script_engine');


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuración del bot de Telegram
const bot = new Telegraf(process.env.TELEGRAM_TOKEN || "NO_TOKEN_PROVIDED");
const chatId = process.env.TELEGRAM_CHAT_ID;

app.get('/', (req, res) => {
  res.json({ status: "Aethel Well Factory Online" });
});

// Ruta para recibir proyectos y notificar
app.post('/api/generate-video', (req, res) => {
  const { tema, plataforma = 'HeyGen' } = req.body;
  
  if (!tema) {
    return res.status(400).json({ error: "Falta el campo 'tema'." });
  }

  // Enviar mensaje por Telegram de aviso inicial
  const messageInitial = `🚀 Nuevo proyecto recibido: ${tema}. Generando guion...`;
  if (chatId && process.env.TELEGRAM_TOKEN) {
    bot.telegram.sendMessage(chatId, messageInitial).catch(console.error);
  } else {
    console.log("Notificación Inicial (Simulada):", messageInitial);
  }

  // Generar el guion cinematográfico
  const final_script = scriptEngine.generateScript(tema, plataforma);

  // Guardar en JSON (projects.json)
  const projectData = { 
    tema, 
    plataforma,
    final_script,
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
    bot.telegram.sendMessage(chatId, messageFinal).catch(console.error);
  } else {
    console.log("Notificación Final (Simulada):", messageFinal);
  }

  res.json({ success: true, message: "Proyecto recibido, guion generado y notificado.", project: projectData });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Enviar mensaje automático al arrancar
  if (chatId && process.env.TELEGRAM_TOKEN) {
    bot.telegram.sendMessage(chatId, '🌿 Conexión Exitosa: La Fábrica Aethel Well está en línea y lista para procesar bienestar.')
      .catch(console.error);
  } else {
    console.log("No hay TELEGRAM_TOKEN o TELEGRAM_CHAT_ID configurado para enviar el mensaje de inicio.");
  }
});
