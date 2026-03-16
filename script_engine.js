// script_engine.js
// Motor de Generación de Guiones para Aethel Well

/**
 * Genera un guion basado en el tema y la plataforma (HeyGen o Kling).
 * 
 * Lógica de Redacción:
 * 0-5s (El Gancho): Frase disruptiva.
 * 5-20s (El Villano): Describe el dolor empáticamente.
 * 20-35s (La Solución): Beneficio de Aethel Well.
 * 35-40s (CTA): Llamado a la acción.
 * 
 * @param {string} tema El tema del video.
 * @param {string} plataforma "HeyGen" o "Kling"
 * @returns {string} El guion formateado.
 */
function generateScript(tema, plataforma) {
    let script = "";

    const hooks = [
        "¿Sientes que el mundo gira demasiado rápido y tú no puedes seguir el ritmo?",
        "Esa sensación en el pecho no es normal, y no tienes que vivir con ella.",
        "Despertar cansado se ha vuelto tu rutina, ¿verdad?"
    ];

    const villains = [
        "El peso de la ansiedad constante. Esas noches mirando al techo mientras tu mente corre a mil por hora, repasando conversaciones que nunca sucedieron. El agotamiento mental que drena tu energía antes de que empiece el día.",
        "El insomnio te roba la vida. Horas dando vueltas en la cama, viendo cómo el reloj avanza implacable, sabiendo que mañana será otra batalla agotadora para mantenerte despierto.",
        "El estrés crónico nubla tu juicio. Una tensión constante en los hombros, el estómago apretado, una vida en modo supervivencia donde disfrutar del presente parece imposible."
    ];

    const solutions = [
        "En Aethel Well, combinamos ciencia y naturaleza. Nuestra fórmula exclusiva, clínicamente probada, regula tu sistema nervioso desde la raíz. No es un parche temporal, es verdadera homeostasis celular.",
        "Aethel Well ha desarrollado un protocolo de modulación de cortisol. Con precisión clínica, nuestros componentes bioactivos restauran tu equilibrio hormonal, devolviéndote el control natural de tu cuerpo.",
        "Respaldado por años de investigación, el sistema Aethel Well actúa directamente en tus receptores neuronales. Calma la tormenta interna sin efectos secundarios, ofreciendo una paz mental genuina e integrativa."
    ];

    const ctas = [
        "Recupera tu paz hoy. Visita nuestro enlace para comenzar.",
        "No esperes a estar al límite. Da el primer paso hacia tu equilibrio celular.",
        "Tu bienestar no es negociable. Únete a la revolución Aethel Well."
    ];

    // Selección semi-aleatoria basada en la longitud del tema para que no sea siempre igual
    const len = tema.length;
    const hook = hooks[len % hooks.length];
    const villain = villains[(len + 1) % villains.length];
    const solution = solutions[(len + 2) % solutions.length];
    const cta = ctas[(len + 3) % ctas.length];

    if (plataforma.toLowerCase() === 'heygen') {
        script = `${hook} [breath] ${villain} [breath] ${solution} [breath] ${cta}`;
    } else if (plataforma.toLowerCase() === 'kling') {
        script = `[VISUAL: Plano detalle lento y cinematográfico que ilustre el tema '${tema}'. Tonos fríos y oscuros que transicionan a luces cálidas y doradas]\n`;
        script += `VOZ EN OFF: ${hook} ... ${villain} ... ${solution} ... ${cta}`;
    } else {
        script = `${hook} ${villain} ${solution} ${cta}`;
    }

    return script;
}

module.exports = { generateScript };
