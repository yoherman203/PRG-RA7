const START_TIME_MS = 45000;
const BONUS_TIME_MS = 2500;
const PENALTY_TIME_MS = 2000;
const LOW_TIME_MS = 5000;
const FALLBACK_WORDS = [
    "xarxa",
    "modul",
    "plasma",
    "teclat",
    "sintaxi",
    "vector"
];

const state = {
    mode: "loading",
    timeLeftMs: START_TIME_MS,
    score: 0,
    mistakes: 0,
    status: "Carregant paraules...",
    currentWord: "",
    words: [],
    wordIndex: 0
};

const elements = {
    playCard: document.querySelector(".joc1-card--play"),
    timeLeft: document.getElementById("time-left"),
    score: document.getElementById("score"),
    mistakes: document.getElementById("mistakes"),
    currentWord: document.getElementById("current-word"),
    status: document.getElementById("status-text"),
    form: document.getElementById("word-form"),
    input: document.getElementById("word-input"),
    endActions: document.getElementById("end-actions"),
    restart: document.getElementById("restart-button")
};

let lastFrameTime = null;

function normalizeWord(word) {
    return word.trim().toLowerCase();
}

function shuffleWords(words) {
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function setNextWord() {
    if (state.words.length === 0) {
        state.currentWord = "error";
        return;
    }

    if (state.wordIndex >= state.words.length) {
        state.words = shuffleWords(state.words);
        state.wordIndex = 0;
    }

    state.currentWord = state.words[state.wordIndex];
    state.wordIndex += 1;
}

function loseGame() {
    state.mode = "lost";
    state.timeLeftMs = 0;
    state.status = `Temps esgotat. Has acabat amb ${state.score} punts i ${state.mistakes} errors.`;
}

function applyMistake(typedWord) {
    state.mistakes += 1;
    state.timeLeftMs = Math.max(0, state.timeLeftMs - PENALTY_TIME_MS);
    state.status = `Error: "${typedWord}". Perds 2 segons i canvia la paraula.`;

    if (state.timeLeftMs === 0) {
        loseGame();
        return;
    }

    setNextWord();
    elements.input.value = "";
}

function resetGame() {
    state.mode = "playing";
    state.timeLeftMs = START_TIME_MS;
    state.score = 0;
    state.mistakes = 0;
    state.status = "Partida iniciada. Escriu la paraula actual.";
    state.wordIndex = 0;
    state.words = shuffleWords(state.words.length ? state.words : FALLBACK_WORDS);
    setNextWord();
    elements.input.value = "";
    render();
    elements.input.focus();
}

function tick(deltaMs) {
    if (state.mode !== "playing") {
        return;
    }

    state.timeLeftMs = Math.max(0, state.timeLeftMs - deltaMs);
    if (state.timeLeftMs === 0) {
        loseGame();
    }
}

function handleSubmit(event) {
    event.preventDefault();

    if (state.mode !== "playing") {
        return;
    }

    const typedWord = normalizeWord(elements.input.value);
    if (!typedWord) {
        state.status = "Has d'escriure una paraula abans de validar.";
        render();
        return;
    }

    if (typedWord === state.currentWord) {
        state.score += 1;
        state.timeLeftMs += BONUS_TIME_MS;
        state.status = `Correcte: "${state.currentWord}". Sumes 2.5 segons.`;
    } else {
        applyMistake(typedWord);
    }

    if (state.mode === "playing" && typedWord === state.currentWord) {
        setNextWord();
    }

    elements.input.value = "";
    render();
    if (state.mode === "playing") {
        elements.input.focus();
    }
}

async function loadWords() {
    const url = typeof window.JOC1_WORDS_URL !== 'undefined'
        ? window.JOC1_WORDS_URL
        : document.body.dataset.wordsUrl;

    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const parsedWords = text
            .split(/\r?\n/)
            .map(normalizeWord)
            .filter(Boolean);

        state.words = parsedWords.length ? parsedWords : FALLBACK_WORDS;
        resetGame();
    } catch (error) {
        state.words = FALLBACK_WORDS;
        state.status = "No s'ha pogut llegir el fitxer de paraules. S'usa una llista de reserva.";
        resetGame();
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

    const expectedPrefix = state.currentWord.slice(0, typedWord.length);
    if (typedWord !== expectedPrefix) {
        applyMistake(typedWord);
        render();
        if (state.mode === "playing") {
            elements.input.focus();
        }
        return;
    }

    if (typedWord === state.currentWord) {
        state.score += 1;
        state.timeLeftMs += BONUS_TIME_MS;
        state.status = `Correcte: "${state.currentWord}". Sumes 2.5 segons.`;
        setNextWord();
        elements.input.value = "";
        render();
        elements.input.focus();
    }
}

function handleKeyDown(event) {
    if (state.mode !== "playing") {
        return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        state.status = "No pots esborrar. Si t'equivoques, assumeix la penalitzacio.";
        render();
        return;
    }

    if (event.key === "Enter") {
        event.preventDefault();
    }
}

function render() {
    elements.timeLeft.textContent = (state.timeLeftMs / 1000).toFixed(1);
    elements.score.textContent = String(state.score);
    elements.mistakes.textContent = String(state.mistakes);
    elements.currentWord.textContent = state.currentWord || "...";
    elements.status.textContent = state.status;
    elements.status.className = "joc1-status";

    if (state.status.startsWith("Correcte")) {
        elements.status.classList.add("joc1-status--success");
    } else if (state.status.startsWith("Error") || state.mode === "lost") {
        elements.status.classList.add("joc1-status--error");
    }

    elements.playCard.classList.toggle("joc1-card--locked", state.mode !== "playing");
    elements.timeLeft.parentElement.classList.toggle("joc1-stat--danger", state.timeLeftMs <= LOW_TIME_MS && state.mode === "playing");
    elements.input.disabled = state.mode !== "playing";
    elements.input.placeholder = state.mode === "playing" ? "Escriu aqui" : "Partida acabada";
    elements.endActions.hidden = state.mode !== "lost";
}

function frame(now) {
    if (lastFrameTime === null) {
        lastFrameTime = now;
    }

    const deltaMs = now - lastFrameTime;
    lastFrameTime = now;
    tick(deltaMs);
    render();
    window.requestAnimationFrame(frame);
}

window.advanceTime = (ms) => {
    tick(ms);
    render();
    return state.timeLeftMs;
};

window.render_game_to_text = () => JSON.stringify({
    mode: state.mode,
    timeLeftSeconds: Number((state.timeLeftMs / 1000).toFixed(1)),
    score: state.score,
    mistakes: state.mistakes,
    currentWord: state.currentWord,
    status: state.status,
    coordinateSystem: "DOM word game without spatial coordinates"
});

elements.form.addEventListener("submit", handleSubmit);
elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", handleKeyDown);
elements.restart.addEventListener("click", resetGame);

render();
window.requestAnimationFrame(frame);
loadWords();
