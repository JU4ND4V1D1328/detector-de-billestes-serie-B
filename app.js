const video = document.getElementById('camera');
const btnScan = document.getElementById('btn-scan');
const resultado = document.getElementById('resultado');
const canvas = document.getElementById('snapshot');

// 1. Acceder a la cámara trasera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { console.error("Error de cámara: ", err); });

// 2. Base de datos de rangos inválidos (Serie B fuera de circulación)
// Basado en los datos que me proporcionaste
const rangosInvalidos = [
    { inicio: 77100001, fin: 77550000 },
    { inicio: 78000001, fin: 78450000 },
    { inicio: 96350001, fin: 96800000 },
    { inicio: 104900001, fin: 105350000 } // Ejemplo de rango extendido
    // Agrega aquí todos los rangos adicionales...
];

btnScan.addEventListener('click', async () => {
    resultado.innerText = "Analizando... por favor no muevas el billete";
    
    // Capturar frame del video
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Procesar con Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    
    // Limpiar el texto (quitar espacios y caracteres extraños)
    const serieLimpia = text.replace(/\s/g, '').toUpperCase();
    validarSerie(serieLimpia);
});

function validarSerie(serie) {
    // Expresión regular para buscar una Letra seguida de números
    const match = serie.match(/([AB])(\d{8,9})/);

    if (!match) {
        resultado.className = "invalido";
        resultado.innerText = `No se detectó serie clara. Detectado: ${serie}`;
        return;
    }

    const letra = match[1];
    const numero = parseInt(match[2]);

    if (letra === 'A') {
        resultado.className = "valido";
        resultado.innerText = `SERIE A DETECTADA (${numero}): Billete Válido`;
    } else if (letra === 'B') {
        // Verificar si el número cae en un rango inválido
        const esInvalido = rangosInvalidos.some(r => numero >= r.inicio && numero <= r.fin);

        if (esInvalido) {
            resultado.className = "invalido";
            resultado.innerText = `¡ALERTA! SERIE B (${numero}): FUERA DE CIRCULACIÓN / INVÁLIDO`;
        } else {
            resultado.className = "valido";
            resultado.innerText = `SERIE B DETECTADA (${numero}): Billete en Circulación`;
        }
    }
}