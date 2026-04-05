const GAME_CONFIG = {
    startTimeMs: 45000,
    bonusTimeMs: 2500,
    penaltyTimeMs: 2000,
    timerIntervalMs: 100
};

const MESSAGES = {
    loading: "Carregant paraules...",
    started: "Partida iniciada. Escriu la paraula actual.",
    noWords: "No s'ha pogut carregar el fitxer de paraules.",
    noErase: "No pots esborrar. Si t'equivoques, assumeix la penalitzacio."
};

const state = {
    mode: "loading",
    timeLeftMs: GAME_CONFIG.startTimeMs,
    score: 0,
    mistakes: 0,
    currentWord: "",
    status: MESSAGES.loading,
    words: []
};

const elements = {
    playCard: document.querySelector(".joc1-card--play"),
    timeLeft: document.getElementById("time-left"),
    score: document.getElementById("score"),
    mistakes: document.getElementById("mistakes"),
    currentWord: document.getElementById("current-word"),
    status: document.getElementById("status-text"),
    input: document.getElementById("word-input"),
    endActions: document.getElementById("end-actions"),
    restart: document.getElementById("restart-button")
};

let timerId = 0;
let lastTickMs = 0;

function normalizeWord(word) {
    return word.trim().toLowerCase();
}

function setStatus(message) {
    state.status = message;
}

function render() {
    const playing = state.mode === "playing";

    elements.timeLeft.textContent = (state.timeLeftMs / 1000).toFixed(1);
    elements.score.textContent = String(state.score);
    elements.mistakes.textContent = String(state.mistakes);
    elements.currentWord.textContent = state.currentWord || "...";
    elements.status.textContent = state.status;
    elements.status.className = "joc1-status";
    elements.playCard.classList.toggle("joc1-card--locked", !playing);
    elements.input.disabled = !playing;
    elements.input.placeholder = playing ? "Escriu aqui" : "Partida acabada";
    elements.endActions.hidden = state.mode !== "lost";
}

function stopTimer() {
    if (!timerId) {
        return;
    }

    window.clearInterval(timerId);
    timerId = 0;
}

function showLoadError() {
    stopTimer();
    state.mode = "error";
    state.timeLeftMs = 0;
    state.currentWord = "---";
    elements.input.value = "";
    setStatus(MESSAGES.noWords);
    render();
}

function loseGame() {
    stopTimer();
    state.mode = "lost";
    state.timeLeftMs = 0;
    setStatus(
        `Temps esgotat. Has acabat amb ${state.score} punts i ${state.mistakes} errors.`
    );
    render();
}

function changeTime(deltaMs) {
    if (state.mode !== "playing") {
        return;
    }

    state.timeLeftMs = Math.max(0, state.timeLeftMs + deltaMs);

    if (state.timeLeftMs === 0) {
        loseGame();
    }
}

function startTimer() {
    stopTimer();
    lastTickMs = performance.now();

    timerId = window.setInterval(() => {
        const now = performance.now();
        changeTime(-(now - lastTickMs));
        lastTickMs = now;
        render();
    }, GAME_CONFIG.timerIntervalMs);
}

function pickNextWord() {
    if (!state.words.length) {
        state.currentWord = "";
        return;
    }

    if (state.words.length === 1) {
        state.currentWord = state.words[0];
        return;
    }

    let nextWord = state.currentWord;

    while (nextWord === state.currentWord) {
        nextWord = state.words[Math.floor(Math.random() * state.words.length)];
    }

    state.currentWord = nextWord;
}

function resetGame() {
    if (!state.words.length) {
        showLoadError();
        return;
    }

    state.mode = "playing";
    state.timeLeftMs = GAME_CONFIG.startTimeMs;
    state.score = 0;
    state.mistakes = 0;
    state.currentWord = "";
    elements.input.value = "";
    setStatus(MESSAGES.started);
    pickNextWord();
    render();
    elements.input.focus();
    startTimer();
}

function handleSuccess() {
    const solvedWord = state.currentWord;

    state.score += 1;
    elements.input.value = "";
    setStatus(`Correcte: "${solvedWord}". Sumes 2.5 segons.`);
    changeTime(GAME_CONFIG.bonusTimeMs);

    if (state.mode === "playing") {
        pickNextWord();
        render();
        elements.input.focus();
    }
}

function handleMistake(typedWord) {
    state.mistakes += 1;
    elements.input.value = "";
    setStatus(`Error: "${typedWord}". Perds 2 segons i canvia la paraula.`);
    changeTime(-GAME_CONFIG.penaltyTimeMs);

    if (state.mode === "playing") {
        pickNextWord();
        render();
        elements.input.focus();
    }
}

function handleInput() {
    if (state.mode !== "playing") {
        return;
    }

    const typedWord = normalizeWord(elements.input.value);

    if (!typedWord) {
        return;
    }

    if (!state.currentWord.startsWith(typedWord)) {
        handleMistake(typedWord);
        return;
    }

    if (typedWord === state.currentWord) {
        handleSuccess();
    }
}

function handleKeyDown(event) {
    if (state.mode !== "playing") {
        return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        setStatus(MESSAGES.noErase);
        render();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
    }
}

async function loadWords() {
    try {
        const response = await fetch(document.body.dataset.wordsUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        state.words = (await response.text())
            .split(/\r?\n/)
            .map(normalizeWord)
            .filter(Boolean);

        if (!state.words.length) {
            throw new Error("No hi ha paraules");
        }

        resetGame();
    } catch (error) {
        state.words = [];
        showLoadError();
    }
}

elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", handleKeyDown);
elements.restart.addEventListener("click", resetGame);

render();
loadWords();
