// Valors de temps inicials utilitzats per defecte en mil·lisegons
const GAME_CONFIG = {
	startTimeMs: 45000,
	bonusTimeMs: 2500,
	penaltyTimeMs: 2000,
	timerIntervalMs: 100,
};

// Guarda l'estat en curs del joc
const state = {
	mode: "playing",
	timeLeftMs: GAME_CONFIG.startTimeMs,
	score: 0,
	mistakes: 0,
	currentWord: "",
	words: [],
};

// Referències als elements HTML per poder actualitzar-los
const elements = {
	playCard: document.querySelector(".joc1-card--play"),
	timeLeft: document.getElementById("time-left"),
	score: document.getElementById("score"),
	mistakes: document.getElementById("mistakes"),
	currentWord: document.getElementById("current-word"),
	input: document.getElementById("word-input"),
	endActions: document.getElementById("end-actions"),
	restart: document.getElementById("restart-button"),
};

// Variables per al control del temps intern
let timerId = 0;
let lastTickMs = 0;

// Actualitza els elements visuals a la pàgina basant-se en l'estat
function render() {
	const playing = state.mode === "playing";
	elements.timeLeft.textContent = (state.timeLeftMs / 1000).toFixed(1);
	elements.score.textContent = String(state.score);
	elements.mistakes.textContent = String(state.mistakes);
	elements.currentWord.textContent = state.currentWord || "...";

	// Bloqueja o desbloqueja la interfície
	elements.playCard.classList.toggle("joc1-card--locked", !playing);
	elements.input.disabled = !playing;

	// Modifica el text del camp d'entrada principal segons la situació
	elements.input.placeholder = playing
		? "Escriu aqui"
		: state.mode === "paused"
			? "Error..."
			: "Partida acabada";
	elements.endActions.hidden = state.mode !== "lost";
}

// Funció cridada quan finalitza el temps de la partida
function loseGame() {
	clearInterval(timerId); // Aturem l'interval de temps
	state.mode = "lost";
	state.timeLeftMs = 0;
	render();

	// S'enregistra la puntuació efectuant una petició al servidor web
	fetch("/finalitzar_joc", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			username: typeof usuariActual !== "undefined" ? usuariActual : "",
			joc: "Flux de Paraules",
			puntuacio: state.score,
			data: new Date().toISOString(),
			errors: state.mistakes,
		}),
	});
}

// Modifica els mil·lisegons restants i comprova condicions de final
function changeTime(deltaMs) {
	if (state.mode !== "playing") return;
	state.timeLeftMs = Math.max(0, state.timeLeftMs + deltaMs);
	if (state.timeLeftMs === 0) loseGame();
}

// Inicialitza l'interval continu del temps (cronòmetre descendent)
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

// Tria una paraula del llistat de forma aleatòria, evitant que es repeteixi si es pot
function pickNextWord() {
	let nextWord = state.currentWord;
	while (nextWord === state.currentWord && state.words.length > 1) {
		nextWord = state.words[Math.floor(Math.random() * state.words.length)];
	}
	state.currentWord = nextWord || state.words[0] || "";
}

// Restableix els valors de la partida a zero i comença el rellotge de nou
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

// Verifica si la paraula escrita coincideix o inclou errors de lletreig
function handleInput() {
	if (state.mode !== "playing") return;

	// Extreu l'entrada de l'usuari en minúscules per validar-la
	const typedWord = elements.input.value.trim().toLowerCase();
	if (!typedWord) return;

	// Condició: detecta espifiades o errors
	if (!state.currentWord.startsWith(typedWord)) {
		state.mistakes += 1;
		changeTime(-GAME_CONFIG.penaltyTimeMs);
		if (state.mode === "lost") return;

		// S'activa temporalment l'estat de pausa mostrant la penalització visual
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

	// Condició: s'ha encertat completament la paraula
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

// Registre d'esdeveniments als elements del HTML necessaris per rebre les entrades de l'usuari
elements.input.addEventListener("input", handleInput);
elements.input.addEventListener("keydown", (e) => {
	// S'evita el comportament dels botons d'esborrar i salt de línia
	if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter")
		e.preventDefault();
});
elements.restart.addEventListener("click", resetGame);

// Recupera i formatitza la llista de paraules que resideixen en el servidor
async function loadWords() {
	const response = await fetch(window.JOC1_WORDS_URL);
	state.words = (await response.text())
		.split(/\r?\n/)
		.map((w) => w.trim().toLowerCase())
		.filter(Boolean);
	resetGame();
}

// Inicia la seqüència
loadWords();
