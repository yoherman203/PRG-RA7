const target = document.getElementById('target');
const puntuacioElement = document.getElementById('puntuacio');
const tempsElement = document.getElementById('temps');

let puntuacio = 0;
let temps = 0;

// Función para mover el objetivo a una posición aleatoria
function moureObjectiu() {
    const container = document.getElementById('game-container');

    // Calculamos límites para que no se salga de la pantalla
    const maxX = container.clientWidth - target.clientWidth;
    const maxY = container.clientHeight - target.clientHeight;

    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);

    target.style.left = `${newX}px`;
    target.style.top = `${newY}px`;
}

// Evento principal: "Atrapar" el objetivo
target.addEventListener('mouseenter', () => {
    puntuacio += 10;
    puntuacioElement.innerText = puntuacio;

    // Efecto visual rápido y mover
    target.style.transform = 'scale(1.2)';
    setTimeout(() => {
        target.style.transform = 'scale(1)';
        moureObjectiu();
    }, 100);
});

// Contador de tiempo (Backend lo validará después)
setInterval(() => {
    temps++;
    tempsElement.innerText = temps;
}, 1000);

// Posición inicial
moureObjectiu();

function finalitzarPartida() {
    const dadesPartida = {
        username: "Amin", // Aquí podrías usar una variable global con el usuario logueado
        joc: "Joc 2 (Ratolí)",
        puntuacio: puntuacio
    };

    // Enviamos los datos al servidor Flask
    fetch('/finalitzar_joc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadesPartida),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Partida finalitzada! Puntuació: ${puntuacio}. Dada guardada en el sistema.`);
        window.location.href = "/home"; // Redirigimos al menú principal
    })
    .catch((error) => console.error('Error:', error));
}

// Ejemplo: Finalizar automáticamente a los 30 segundos
setInterval(() => {
    temps++;
    tempsElement.innerText = temps;
    if (temps >= 30) {
        finalitzarPartida();
    }
}, 1000);
