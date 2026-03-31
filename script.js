const BOARD_SIZE = 4;
const EMPTY_TILE = 0;
const SOLVED_STATE = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, EMPTY_TILE
];

const boardElement = document.getElementById("board");
const moveCountElement = document.getElementById("moveCount");
const timeElapsedElement = document.getElementById("timeElapsed");
const messageElement = document.getElementById("message");
const newGameButton = document.getElementById("newGameBtn");
const simpleGameButton = document.getElementById("simpleGameBtn");

let boardState = [...SOLVED_STATE];
let moveCount = 0;
let timeElapsed = 0;
let timerId = null;
let gameWon = false;

function buildBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const tableRow = document.createElement("tr");

    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const index = row * BOARD_SIZE + column;
      const cell = document.createElement("td");

      cell.id = `cell${row + 1}${column + 1}`;
      cell.addEventListener("click", () => handleTileClick(index));

      tableRow.appendChild(cell);
    }

    boardElement.appendChild(tableRow);
  }
}

function renderBoard() {
  boardState.forEach((tileNumber, index) => {
    const row = Math.floor(index / BOARD_SIZE) + 1;
    const column = (index % BOARD_SIZE) + 1;
    const cell = document.getElementById(`cell${row}${column}`);

    cell.className = tileNumber === EMPTY_TILE ? "empty" : "tile";
    cell.textContent = "";
    cell.setAttribute("aria-label", tileNumber === EMPTY_TILE ? "Empty tile" : `Tile ${tileNumber}`);

    if (tileNumber !== EMPTY_TILE) {
      const tileIndex = tileNumber - 1;
      const imageRow = Math.floor(tileIndex / BOARD_SIZE);
      const imageColumn = tileIndex % BOARD_SIZE;
      const tileSize = cell.offsetWidth || 90;

      cell.style.backgroundPosition = `${-imageColumn * tileSize}px ${-imageRow * tileSize}px`;
    } else {
      cell.style.backgroundPosition = "0 0";
    }
  });
}

function updateStats() {
  moveCountElement.textContent = String(moveCount);
  timeElapsedElement.textContent = `${timeElapsed}s`;
}

function setMessage(text) {
  messageElement.textContent = text;
}

function startTimer() {
  stopTimer();

  timerId = window.setInterval(() => {
    timeElapsed += 1;
    updateStats();
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function resetGameState() {
  moveCount = 0;
  timeElapsed = 0;
  gameWon = false;
  updateStats();
  startTimer();
}

function getNeighbors(emptyIndex) {
  const neighbors = [];
  const row = Math.floor(emptyIndex / BOARD_SIZE);
  const column = emptyIndex % BOARD_SIZE;

  if (row > 0) {
    neighbors.push(emptyIndex - BOARD_SIZE);
  }

  if (row < BOARD_SIZE - 1) {
    neighbors.push(emptyIndex + BOARD_SIZE);
  }

  if (column > 0) {
    neighbors.push(emptyIndex - 1);
  }

  if (column < BOARD_SIZE - 1) {
    neighbors.push(emptyIndex + 1);
  }

  return neighbors;
}

function swapTiles(firstIndex, secondIndex) {
  [boardState[firstIndex], boardState[secondIndex]] = [boardState[secondIndex], boardState[firstIndex]];
}

function shuffleBoard(stepCount = 200) {
  boardState = [...SOLVED_STATE];
  let emptyIndex = boardState.indexOf(EMPTY_TILE);
  let previousIndex = -1;

  for (let step = 0; step < stepCount; step += 1) {
    const options = getNeighbors(emptyIndex).filter((index) => index !== previousIndex);
    const moveIndex = options[Math.floor(Math.random() * options.length)];

    swapTiles(emptyIndex, moveIndex);
    previousIndex = emptyIndex;
    emptyIndex = moveIndex;
  }

  if (isSolved()) {
    shuffleBoard(stepCount);
  }
}

function createSimpleGame() {
  boardState = [...SOLVED_STATE];
  swapTiles(14, 15);
}

function isSolved() {
  return boardState.every((value, index) => value === SOLVED_STATE[index]);
}

function checkForWin() {
  if (!isSolved()) {
    return;
  }

  gameWon = true;
  stopTimer();
  setMessage(`Solved in ${moveCount} moves and ${timeElapsed} seconds.`);

  window.setTimeout(() => {
    const playAgain = window.confirm(
      `Congratulations! You solved the puzzle.\n\nTime: ${timeElapsed} seconds\nMoves: ${moveCount}\n\nWould you like to play again?`
    );

    if (playAgain) {
      startNewGame();
    }
  }, 250);
}

function handleTileClick(index) {
  if (gameWon) {
    return;
  }

  const emptyIndex = boardState.indexOf(EMPTY_TILE);
  const canMove = getNeighbors(emptyIndex).includes(index);

  if (!canMove) {
    setMessage("Only a tile next to the empty space can move.");
    return;
  }

  swapTiles(index, emptyIndex);
  moveCount += 1;
  updateStats();
  renderBoard();
  setMessage("Keep going. Arrange the tiles in order from 1 to 15.");
  checkForWin();
}

function startNewGame() {
  resetGameState();
  shuffleBoard();
  renderBoard();
  setMessage("New game started. Click a tile beside the empty space.");
}

function startSimpleGame() {
  resetGameState();
  createSimpleGame();
  renderBoard();
  setMessage("Simple game ready. Solve it in one move.");
}

buildBoard();
window.addEventListener("resize", renderBoard);
newGameButton.addEventListener("click", startNewGame);
simpleGameButton.addEventListener("click", startSimpleGame);

startNewGame();
