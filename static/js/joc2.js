const zonaJoc = document.getElementById('zona-joc');
const jugador = document.getElementById('jugador');
const linies = document.getElementById('linies-carretera');
const contenidorEnemics = document.getElementById('contenidor-enemics');
const textPuntuacio = document.getElementById('puntuacio');
const pantallaFinal = document.getElementById('pantalla-final');
const pantallaInici = document.getElementById('pantalla-inici');
const textPuntuacioFinal = document.getElementById('puntuacio-final');

const AMPLADA_JOC = 400;
const ALCADA_JOC = 600;
const AMPLADA_COTXE = 40;
const ALCADA_COTXE = 70;

let jocActiu = false;
let puntuacio = 0;
let llistaEnemics = [];
let animacioID; 

let velocitatBase = 4; 
let velocitatActual = velocitatBase;
let tempsUltimEnemic = 0;
let intervalAparicio = 1500; 
let tempsInici;

function buclePrincipal(timestamp) {
    if (!jocActiu) return;

    const tempsTranscorregut = (timestamp - tempsInici) / 1000; 
    incrementarDificultat(tempsTranscorregut);

    moureEnemics();

    if (timestamp - tempsUltimEnemic > intervalAparicio) {
        crearEnemic();
        tempsUltimEnemic = timestamp;
    }

    puntuacio++;
    textPuntuacio.innerText = puntuacio;

    animacioID = requestAnimationFrame(buclePrincipal);
}

zonaJoc.addEventListener('mousemove', (e) => {
    if (!jocActiu) return;

    let rectzona = zonaJoc.getBoundingClientRect();
    let mouseX = e.clientX - rectzona.left;
    let posicioX = mouseX - (AMPLADA_COTXE / 2);

    if (posicioX < 0) posicioX = 0;
    if (posicioX > AMPLADA_JOC - AMPLADA_COTXE) posicioX = AMPLADA_JOC - AMPLADA_COTXE;

    jugador.style.left = posicioX + 'px';
});

function crearEnemic() {
    const enemic = document.createElement('div');
    enemic.classList.add('cotxe', 'enemic');
    
    const maxLeft = AMPLADA_JOC - AMPLADA_COTXE;
    const randomLeft = Math.floor(Math.random() * maxLeft);
    
    enemic.style.left = randomLeft + 'px';
    enemic.style.top = '-' + ALCADA_COTXE + 'px'; 
    
    contenidorEnemics.appendChild(enemic);
    llistaEnemics.push({ element: enemic, y: -ALCADA_COTXE });
}

function moureEnemics() {
    for (let i = llistaEnemics.length - 1; i >= 0; i--) {
        let enemic = llistaEnemics[i];
        
        enemic.y += velocitatActual;
        enemic.element.style.top = enemic.y + 'px';

        if (detectarColisio(jugador, enemic.element)) {
            finalitzarJoc();
            return; 
        }

        if (enemic.y > ALCADA_JOC) {
            enemic.element.remove(); 
            llistaEnemics.splice(i, 1); 
        }
    }
}

function detectarColisio(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom || 
        rect1.bottom < rect2.top || 
        rect1.left > rect2.right || 
        rect1.right < rect2.left    
    );
}

function incrementarDificultat(segons) {
    velocitatActual = velocitatBase + (segons / 10); 
    
    let duradaAnimacio = 1 / (velocitatActual / 4); 
    if(duradaAnimacio > 2) duradaAnimacio = 2; 
    if(duradaAnimacio < 0.1) duradaAnimacio = 0.1; 
    linies.style.animationDuration = duradaAnimacio + 's';

    intervalAparicio = 1500 - (segons * 20);
    if (intervalAparicio < 400) intervalAparicio = 400; 
}

function iniciarJoc() {
    jocActiu = true;
    puntuacio = 0;
    llistaEnemics = [];
    velocitatActual = velocitatBase;
    intervalAparicio = 1500;
    contenidorEnemics.innerHTML = ''; 
    pantallaFinal.style.display = 'none';
    pantallaInici.style.display = 'none'; 
    textPuntuacio.innerText = '0';
    
    jugador.style.left = (AMPLADA_JOC / 2 - AMPLADA_COTXE / 2) + 'px';
    linies.style.animationPlayState = 'running';

    tempsUltimEnemic = performance.now();
    tempsInici = performance.now();
    
    animacioID = requestAnimationFrame(buclePrincipal);
}

function finalitzarJoc() {
    jocActiu = false;
    cancelAnimationFrame(animacioID); 
    linies.style.animationPlayState = 'paused';
    
    textPuntuacioFinal.innerText = puntuacio;
    pantallaFinal.style.display = 'flex'; 
}

function reiniciarJoc() {
    iniciarJoc();
}