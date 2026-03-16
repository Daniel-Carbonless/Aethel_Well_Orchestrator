// test-production.js
const axios = require('axios');

async function runTest() {
  try {
    console.log("Enviando petición de prueba a http://localhost:3000/api/generate-video...");
    
    const response = await axios.post('http://localhost:3000/api/generate-video', {
      tema: 'El poder de la respiración 4-7-8',
      villain: 'El estrés acumulado del trabajo',
      plataforma: 'HeyGen'
    });

    console.log("Respuesta del servidor:");
    console.log(response.data);
    
    if (response.data.project && response.data.project.final_script) {
        console.log("\nGuion final generado:");
        console.log(response.data.project.final_script);
    }
  } catch (error) {
    if (error.response) {
      console.error("Error del servidor:", error.response.data);
    } else {
      console.error("Error de conexión:", error.message);
    }
  }
}

runTest();
