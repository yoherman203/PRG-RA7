const GAME_CONFIG = {
    startTimeMs: 45000,
    bonusTimeMs: 2500,
    penaltyTimeMs: 2000,
    timerIntervalMs: 100
};

const state = {
    mode: "playing",
    timeLeftMs: GAME_CONFIG.startTimeMs,
    score: 0,
    mistakes: 0,
    currentWord: "",
    words: []
};

const elements = {
    playCard: document.querySelector(".joc1-card--play"),
    timeLeft: document.getElementById("time-left"),
    score: document.getElementById("score"),
    mistakes: document.getElementById("mistakes"),
    currentWord: document.getElementById("current-word"),
    input: document.getElementById("word-input"),
    endActions: document.getElementById("end-actions"),
    restart: document.getElementById("restart-button")
};

let timerId = 0;
let lastTickMs = 0;

function render() {
    const playing = state.mode === "playing";
    elements.timeLeft.textContent = (state.timeLeftMs / 1000).toFixed(1);
    elements.score.textContent = String(state.score);
    elements.mistakes.textContent = String(state.mistakes);
    elements.currentWord.textContent = state.currentWord || "...";
    elements.playCard.classList.toggle("joc1-card--locked", !playing);
    elements.input.disabled = !playing;
    elements.input.placeholder = playing ? "Escriu aqui" : (state.mode === "paused" ? "Error..." : "Partida acabada");
    elements.endActions.hidden = state.mode !== "lost";
}

function loseGame() {
    clearInterval(timerId);
    state.mode = "lost";
    state.timeLeftMs = 0;
    render();

    fetch('/finalitzar_joc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: typeof usuariActual !== 'undefined' ? usuariActual : "", 
            joc: "Flux de Paraules",
            puntuacio: state.score
        })
    });
}

function changeTime(deltaMs) {
    if (state.mode !== "playing") return;
    state.timeLeftMs = Math.max(0, state.timeLeftMs + deltaMs);
    if (state.timeLeftMs === 0) loseGame();
}

function startTimer() {
    clearInterval(timerId);
    lastTickMs = performance.now();
    timerId = setInterval(() => {
        const now = performance.now();
        changeTime(-(now - lastTickMs));
        lastTickMs = now;
        render();
    }, GAME_CONFIG.timerIntervalMs);
}

function pickNextWord() {
    let nextWord = state.currentWord;
    while (nextWord === state.currentWord && state.words.length > 1) {
        nextWord = state.words[Math.floor(Math.random() * state.words.length)];
    }
    state.currentWord = nextWord || state.words[0] || "";
}

function resetGame() {
    state.mode = "playing";
    state.timeLeftMs = GAME_CONFIG.startTimeMs;
    state.score = 0;
    state.mistakes = 0;
    elements.input.value = "";
    pickNextWord();
    render();
    elements.input.focus();
    startTimer();
}

function handleInput() {
    if (state.mode !== "playing") return;
    const typedWord = elements.input.value.trim().toLowerCase();
    if (!typedWord) return;

    if (!state.currentWord.startsWith(typedWord)) {
        state.mistakes += 1;
        changeTime(-GAME_CONFIG.penaltyTimeMs);
        if (state.mode === "lost") return;

        state.mode = "paused";
        clearInterval(timerId);
        
        const originalColor = elements.currentWord.style.color;
        elements.currentWord.style.color = "#ff0000";
        render();

        setTimeout(() => {
            elements.currentWord.style.color = originalColor;
            if (state.mode === "paused") {
                state.mode = "playing";
                pickNextWord();
                elements.input.value = "";
                render();
                elements.input.focus();
                startTimer();
            }
        }, 1000);
        return;
    }

    if (typedWord === state.currentWord) {
        state.score += 1;
        elements.input.value = "";
        changeTime(GAME_CONFIG.bonusTimeMs);
        if (state.mode === "playing") {
            pickNextWord();
            render();
            elements.input.focus();
        }
    }
}

elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", e => {
    if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter") e.preventDefault();
});
elements.restart.addEventListener("click", resetGame);

async function loadWords() {
    const response = await fetch(window.JOC1_WORDS_URL);
    state.words = (await response.text()).split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean);
    resetGame();
}

loadWords();
