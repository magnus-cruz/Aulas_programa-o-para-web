const SIZE = 4;
const GAP = 10;
const PAD = 10;
const BEST_KEY = "2048bestScore";

const gridBg = document.getElementById("gridBg");
const tilesLayer = document.getElementById("tilesLayer");
const gameBoard = document.getElementById("gameBoard");
const scoreValue = document.getElementById("scoreValue");
const bestValue = document.getElementById("bestValue");
const newGameBtn = document.getElementById("newGameBtn");
const overlay = document.getElementById("stateOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayActions = document.getElementById("overlayActions");

let nextId = 0;
let tiles = [];
let score = 0;
let bestScore = Number(localStorage.getItem(BEST_KEY) || 0);
let reached2048 = false;
let keepPlaying = false;
let isAnimating = false;
const tileEls = new Map();

function buildGrid() {
	gridBg.innerHTML = "";
	for (let i = 0; i < SIZE * SIZE; i += 1) {
		const cell = document.createElement("div");
		cell.className = "grid-cell";
		gridBg.appendChild(cell);
	}
}

function keyOf(row, col) {
	return `${row}-${col}`;
}

function getCellSize() {
	const width = gameBoard.clientWidth;
	return (width - (PAD * 2) - (GAP * (SIZE - 1))) / SIZE;
}

function getPosition(row, col) {
	const cellSize = getCellSize();
	return {
		x: PAD + col * (cellSize + GAP),
		y: PAD + row * (cellSize + GAP),
		cellSize
	};
}

function placeTile(el, row, col) {
	const pos = getPosition(row, col);
	el.style.width = `${pos.cellSize}px`;
	el.style.height = `${pos.cellSize}px`;
	el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}

function updateDigitsClass(el, value) {
	el.classList.remove("digits-4", "digits-5");
	const len = String(value).length;
	if (len === 4) el.classList.add("digits-4");
	if (len >= 5) el.classList.add("digits-5");
}

function setTileValue(el, value) {
	el.dataset.value = String(value);
	el.querySelector(".tile-inner").textContent = String(value);
	updateDigitsClass(el, value);
}

function createTileElement(tile) {
	const el = document.createElement("div");
	el.className = "tile";
	el.dataset.id = String(tile.id);
	const inner = document.createElement("div");
	inner.className = "tile-inner";
	el.appendChild(inner);
	setTileValue(el, tile.value);
	placeTile(el, tile.row, tile.col);
	tilesLayer.appendChild(el);
	tileEls.set(tile.id, el);
	return el;
}

function updateScore() {
	scoreValue.textContent = String(score);
	if (score > bestScore) {
		bestScore = score;
		localStorage.setItem(BEST_KEY, String(bestScore));
	}
	bestValue.textContent = String(bestScore);
}

function randomValue() {
	return Math.random() < 0.9 ? 2 : 4;
}

function occupiedMap(sourceTiles = tiles) {
	const map = new Map();
	for (const tile of sourceTiles) map.set(keyOf(tile.row, tile.col), tile);
	return map;
}

function emptyCells(sourceTiles = tiles) {
	const occupied = occupiedMap(sourceTiles);
	const cells = [];
	for (let row = 0; row < SIZE; row += 1) {
		for (let col = 0; col < SIZE; col += 1) {
			if (!occupied.has(keyOf(row, col))) cells.push({ row, col });
		}
	}
	return cells;
}

function spawnTile(sourceTiles = tiles) {
	const empties = emptyCells(sourceTiles);
	if (!empties.length) return null;
	const pick = empties[Math.floor(Math.random() * empties.length)];
	return {
		id: nextId += 1,
		value: randomValue(),
		row: pick.row,
		col: pick.col
	};
}

function createInitialTiles() {
	tiles = [];
	const first = spawnTile(tiles);
	if (first) tiles.push(first);
	const second = spawnTile(tiles);
	if (second) tiles.push(second);
}

function getLines(direction) {
	const lines = [];
	for (let i = 0; i < SIZE; i += 1) {
		if (direction === "left") lines.push(Array.from({ length: SIZE }, (_, c) => ({ row: i, col: c })));
		if (direction === "right") lines.push(Array.from({ length: SIZE }, (_, c) => ({ row: i, col: SIZE - 1 - c })));
		if (direction === "up") lines.push(Array.from({ length: SIZE }, (_, r) => ({ row: r, col: i })));
		if (direction === "down") lines.push(Array.from({ length: SIZE }, (_, r) => ({ row: SIZE - 1 - r, col: i })));
	}
	return lines;
}

function runMove(direction) {
	const map = occupiedMap(tiles);
	const finalTiles = [];
	const movements = [];
	const merges = [];
	let gained = 0;
	let changed = false;

	for (const line of getLines(direction)) {
		const entries = line
			.map((coord) => map.get(keyOf(coord.row, coord.col)))
			.filter(Boolean);

		const slots = [];
		for (const tile of entries) {
			const last = slots[slots.length - 1];
			if (last && last.type === "single" && last.tile.value === tile.value) {
				slots[slots.length - 1] = {
					type: "merge",
					tiles: [last.tile, tile],
					value: tile.value * 2,
					newId: nextId += 1
				};
			} else {
				slots.push({ type: "single", tile });
			}
		}

		for (let index = 0; index < slots.length; index += 1) {
			const target = line[index];
			const slot = slots[index];

			if (slot.type === "single") {
				const from = slot.tile;
				if (from.row !== target.row || from.col !== target.col) changed = true;
				movements.push({
					id: from.id,
					toRow: target.row,
					toCol: target.col
				});
				finalTiles.push({ ...from, row: target.row, col: target.col });
			} else {
				changed = true;
				const [a, b] = slot.tiles;
				movements.push({ id: a.id, toRow: target.row, toCol: target.col });
				movements.push({ id: b.id, toRow: target.row, toCol: target.col });
				merges.push({
					newId: slot.newId,
					value: slot.value,
					row: target.row,
					col: target.col,
					fromIds: [a.id, b.id]
				});
				gained += slot.value;
				finalTiles.push({ id: slot.newId, value: slot.value, row: target.row, col: target.col });
			}
		}
	}

	if (!changed) return null;

	score += gained;
	tiles = finalTiles;
	const spawn = spawnTile(tiles);
	if (spawn) tiles.push(spawn);
	const wonNow = tiles.some((tile) => tile.value >= 2048);

	return { movements, merges, spawn, wonNow };
}

function canMove() {
	if (emptyCells().length) return true;
	const map = occupiedMap();
	for (let row = 0; row < SIZE; row += 1) {
		for (let col = 0; col < SIZE; col += 1) {
			const value = map.get(keyOf(row, col))?.value;
			if (row + 1 < SIZE && map.get(keyOf(row + 1, col))?.value === value) return true;
			if (col + 1 < SIZE && map.get(keyOf(row, col + 1))?.value === value) return true;
		}
	}
	return false;
}

function hideOverlay() {
	overlay.classList.remove("show");
	overlayActions.innerHTML = "";
}

function showOverlay(type) {
	overlayActions.innerHTML = "";
	overlayText.textContent = `Pontuação: ${score}`;

	if (type === "win") {
		overlayTitle.textContent = "Você venceu! 🎉";
		const continueBtn = document.createElement("button");
		continueBtn.className = "btn secondary";
		continueBtn.type = "button";
		continueBtn.textContent = "Continuar";
		continueBtn.addEventListener("click", () => {
			keepPlaying = true;
			hideOverlay();
		});

		const restartBtn = document.createElement("button");
		restartBtn.className = "btn";
		restartBtn.type = "button";
		restartBtn.textContent = "Nova Partida";
		restartBtn.addEventListener("click", initGame);
		overlayActions.append(continueBtn, restartBtn);
	} else {
		overlayTitle.textContent = "Game Over";
		const retryBtn = document.createElement("button");
		retryBtn.className = "btn";
		retryBtn.type = "button";
		retryBtn.textContent = "Tentar Novamente";
		retryBtn.addEventListener("click", initGame);
		overlayActions.append(retryBtn);
	}

	overlay.classList.add("show");
}

function cleanupAnimationClasses() {
	for (const el of tileEls.values()) el.classList.remove("new", "merge");
}

function syncDom(result = null) {
	const finalIds = new Set(tiles.map((tile) => tile.id));
	for (const [id, el] of tileEls.entries()) {
		if (!finalIds.has(id)) {
			el.remove();
			tileEls.delete(id);
		}
	}

	const mergeIds = new Set(result?.merges?.map((m) => m.newId) || []);
	const spawnId = result?.spawn?.id;

	for (const tile of tiles) {
		let el = tileEls.get(tile.id);
		if (!el) {
			el = createTileElement(tile);
			el.style.transition = "none";
			placeTile(el, tile.row, tile.col);
			if (tile.id === spawnId) el.classList.add("new");
			if (mergeIds.has(tile.id)) el.classList.add("merge");
		} else {
			setTileValue(el, tile.value);
			el.style.transition = "none";
			placeTile(el, tile.row, tile.col);
		}
	}

	requestAnimationFrame(() => {
		for (const el of tileEls.values()) el.style.transition = "transform 115ms ease-out";
	});

	setTimeout(cleanupAnimationClasses, 390);
}

function afterMoveChecks(result) {
	updateScore();
	if (result.wonNow && !reached2048 && !keepPlaying) {
		reached2048 = true;
		showOverlay("win");
		return;
	}
	if (!canMove()) showOverlay("over");
}

function move(direction) {
	if (isAnimating || overlay.classList.contains("show")) return;
	const result = runMove(direction);
	if (!result) return;

	isAnimating = true;
	const mergedSourceIds = new Set(result.merges.flatMap((m) => m.fromIds));
	for (const movement of result.movements) {
		const el = tileEls.get(movement.id);
		if (!el) continue;
		el.classList.remove("new", "merge");
		el.style.transition = "transform 115ms ease-out";
		placeTile(el, movement.toRow, movement.toCol);
	}

	setTimeout(() => {
		for (const id of mergedSourceIds) {
			const el = tileEls.get(id);
			if (el) {
				el.remove();
				tileEls.delete(id);
			}
		}
		syncDom(result);
		isAnimating = false;
		afterMoveChecks(result);
	}, 145);
}

function initGame() {
	nextId = 0;
	tiles = [];
	tilesLayer.innerHTML = "";
	tileEls.clear();
	score = 0;
	reached2048 = false;
	keepPlaying = false;
	isAnimating = false;
	hideOverlay();
	createInitialTiles();
	updateScore();
	syncDom({ spawn: null, merges: [] });
}

function directionFromSwipe(dx, dy) {
	const absX = Math.abs(dx);
	const absY = Math.abs(dy);
	if (absX < 30 && absY < 30) return null;
	if (absX > absY) return dx > 0 ? "right" : "left";
	return dy > 0 ? "down" : "up";
}

function setupKeyboard() {
	window.addEventListener("keydown", (event) => {
		const map = {
			ArrowUp: "up",
			ArrowDown: "down",
			ArrowLeft: "left",
			ArrowRight: "right",
			w: "up",
			W: "up",
			a: "left",
			A: "left",
			s: "down",
			S: "down",
			d: "right",
			D: "right"
		};
		const dir = map[event.key];
		if (!dir) return;
		event.preventDefault();
		move(dir);
	});
}

function setupMouseDrag() {
	let startX = 0;
	let startY = 0;
	let dragging = false;

	function stopDrag() {
		dragging = false;
		gameBoard.classList.remove("dragging");
		document.body.style.userSelect = "";
	}

	gameBoard.addEventListener("mousedown", (event) => {
		dragging = true;
		startX = event.clientX;
		startY = event.clientY;
		gameBoard.classList.add("dragging");
		document.body.style.userSelect = "none";
		event.preventDefault();
	});

	window.addEventListener("mouseup", (event) => {
		if (!dragging) return;
		stopDrag();
		const dir = directionFromSwipe(event.clientX - startX, event.clientY - startY);
		if (dir) move(dir);
	});

	window.addEventListener("blur", () => {
		if (!dragging) return;
		stopDrag();
	});

	window.addEventListener("mouseleave", () => {
		if (!dragging) return;
		stopDrag();
	});
}

function setupTouch() {
	let startX = 0;
	let startY = 0;
	let active = false;

	gameBoard.addEventListener("touchstart", (event) => {
		const touch = event.changedTouches[0];
		if (!touch) return;
		active = true;
		startX = touch.clientX;
		startY = touch.clientY;
	}, { passive: true });

	gameBoard.addEventListener("touchmove", (event) => {
		if (!active) return;
		event.preventDefault();
	}, { passive: false });

	gameBoard.addEventListener("touchend", (event) => {
		if (!active) return;
		active = false;
		const touch = event.changedTouches[0];
		if (!touch) return;
		const dir = directionFromSwipe(touch.clientX - startX, touch.clientY - startY);
		if (dir) move(dir);
	}, { passive: true });

	gameBoard.addEventListener("touchcancel", () => {
		active = false;
	}, { passive: true });
}

let resizeRaf = 0;
window.addEventListener("resize", () => {
	if (resizeRaf) cancelAnimationFrame(resizeRaf);
	resizeRaf = requestAnimationFrame(() => syncDom({ spawn: null, merges: [] }));
});

newGameBtn.addEventListener("click", initGame);

buildGrid();
setupKeyboard();
setupMouseDrag();
setupTouch();
initGame();
