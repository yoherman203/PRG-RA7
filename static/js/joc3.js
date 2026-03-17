// Username injectat des del template (joc3.html)
const joc3Username = typeof window.joc3Username !== 'undefined' ? window.joc3Username : '';

let currentLevel = 3;
let nextNumber = 1;
let score = 0;
const container = document.getElementById('game-container');

function startLevel() {
    container.innerHTML = '';
    nextNumber = 1;
    document.getElementById('level').innerText = currentLevel - 2;

    for (let i = 1; i <= currentLevel; i++) {
        const box = document.createElement('div');
        box.classList.add('num-box');
        box.innerText = i;

        box.style.left = Math.random() * (container.clientWidth - 70) + 'px';
        box.style.top = Math.random() * (container.clientHeight - 70) + 'px';

        box.onclick = () => checkNumber(i, box);
        container.appendChild(box);
    }
}

function checkNumber(num, element) {
    if (num === nextNumber) {
        if (num === 1) {
            document.querySelectorAll('.num-box').forEach(b => b.classList.add('hidden'));
        }

        element.style.visibility = 'hidden';
        nextNumber++;
        score += 10;
        document.getElementById('score').innerText = score;

        if (nextNumber > currentLevel) {
            currentLevel++;
            setTimeout(startLevel, 500);
        }
    } else {
        alert("ERROR! Tornant a començar...");
        finalitzarPartida();
    }
}

function finalitzarPartida() {
    fetch('/finalitzar_joc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: joc3Username,
            joc: "Selecció en orde",
            puntuacio: score
        })
    }).then(() => {
        window.location.href = "/home";
    });
}

startLevel();
