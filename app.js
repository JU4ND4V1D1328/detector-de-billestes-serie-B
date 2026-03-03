const video = document.getElementById('camera');
const btnScan = document.getElementById('btn-scan');
const resultado = document.getElementById('resultado');
const canvas = document.getElementById('snapshot');

// Configuración de la cámara
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => { console.error("Error:", err); });

btnScan.addEventListener('click', async () => {
    resultado.innerText = "Buscando serie...";
    resultado.className = "";
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Filtro para mejorar la lectura de la letra
    context.filter = 'contrast(150%) grayscale(1)';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Ejecutar OCR centrado en encontrar la serie
    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    
    // Limpiamos el texto: quitamos espacios y buscamos el patrón
    const textoLimpio = text.replace(/\s/g, '').toUpperCase();
    
    // BUSCAMOS UNA "A" O UNA "B" SEGUIDA DE NÚMEROS
    const encontrado = textoLimpio.match(/[AB]\d{4,8}/);

    if (encontrado) {
        const serieDetectada = encontrado[0];
        const letraInicial = serieDetectada.charAt(0);

        if (letraInicial === 'A') {
            resultado.className = "valido";
            resultado.innerHTML = `DETECTADO: ${serieDetectada}<br>✅ BILLETE VÁLIDO`;
        } 
        else if (letraInicial === 'B') {
            resultado.className = "invalido";
            resultado.innerHTML = `DETECTADO: ${serieDetectada}<br>❌ FUERA DE CIRCULACIÓN`;
        }
    } else {
        resultado.className = "";
        resultado.innerText = "No se ve la serie. Acerca más la cámara al número.";
    }
});
