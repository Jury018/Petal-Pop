const candies = ["Green", "Violet", "Pink", "Red", "Yellow"];
const rows = 9;
const columns = 9;
let board = [];
let score = 0;
let comboMultiplier = 1;
let streakCount = 0;
let playerInteracted = false;

let currTile = null;
let otherTile = null;

let backgroundMusic;
let allowChainReaction = false;

window.onload = () => {
    score = 0;
    comboMultiplier = 1;
    streakCount = 0;
    playerInteracted = false;
    document.getElementById("score").innerText = score;

    // Initialize background music
    backgroundMusic = document.getElementById("background-music");

    // Ensure music starts on player interaction
    const startMusic = async () => {
        try {
            await backgroundMusic.play();
            console.log("Background music is playing.");
        } catch (err) {
            console.error("Error playing music:", err);
        }
    };

    document.body.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            startMusic();
        }
    }, { once: true });

    initializeGame();

    setInterval(() => {
        crushCandy();
        slideCandy();
        generateCandy();
        if (!hasValidMoves()) {
            shuffleBoard();
        }
    }, 100);
};

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function initializeGame() {
    const boardElement = document.getElementById("board");
    board = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < columns; c++) {
            const tile = createTile(r, c);
            boardElement.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    ensureNoPreMatches();
}

function createTile(r, c) {
    const tile = document.createElement("img");
    tile.id = `${r}-${c}`;
    tile.src = `./images/${randomCandy()}.png`;
    tile.draggable = true;

    tile.addEventListener("dragstart", dragStart);
    tile.addEventListener("dragover", dragOver);
    tile.addEventListener("drop", dragDrop);
    tile.addEventListener("dragend", dragEnd);

    return tile;
}

function dragStart(e) {
    currTile = e.target;
    playerInteracted = true;
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    otherTile = e.target;

    if (otherTile && isAdjacent(currTile, otherTile)) {
        swapTiles();
    }
}

function dragEnd() {
    currTile = null;
    otherTile = null;
}

function isAdjacent(tile1, tile2) {
    const [r1, c1] = tile1.id.split("-").map(Number);
    const [r2, c2] = tile2.id.split("-").map(Number);

    return (
        (Math.abs(r1 - r2) === 1 && c1 === c2) ||
        (Math.abs(c1 - c2) === 1 && r1 === r2)
    );
}

function swapTiles() {
    if (!currTile || !otherTile) return;

    const currSrc = currTile.src;
    const otherSrc = otherTile.src;

    currTile.src = otherSrc;
    otherTile.src = currSrc;

    if (!isValidMove()) {
        currTile.src = currSrc;
        otherTile.src = otherSrc;
    }
}

function isValidMove() {
    return crushMatches();
}

function crushCandy() {
    const crushed = crushMatches();
    if (crushed && playerInteracted) {
        document.getElementById("score").innerText = score;
    }
}

function crushMatches() {
    let crushed = false;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            if (isMatch(r, c, 0, 1)) {
                crushRow(r, c);
                crushed = true;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (isMatch(r, c, 1, 0)) {
                crushColumn(r, c);
                crushed = true;
            }
        }
    }

    return crushed;
}

function isMatch(r, c, rowOffset, colOffset) {
    const candy1 = board[r][c];
    const candy2 = board[r + rowOffset]?.[c + colOffset];
    const candy3 = board[r + 2 * rowOffset]?.[c + colOffset];

    return (
        candy1 &&
        candy2 &&
        candy3 &&
        candy1.src === candy2.src &&
        candy2.src === candy3.src &&
        !candy1.src.includes("blank")
    );
}

function crushRow(r, c) {
    for (let i = 0; i < 3; i++) {
        const tile = board[r][c + i];
        tile.src = "./images/blank.png";
    }
    if (playerInteracted) {
        score += Math.floor(3 * comboMultiplier);
    }
}

function crushColumn(r, c) {
    for (let i = 0; i < 3; i++) {
        const tile = board[r + i][c];
        tile.src = "./images/blank.png";
    }
    if (playerInteracted) {
        score += Math.floor(3 * comboMultiplier);
    }
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let emptyRow = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[emptyRow][c].src = board[r][c].src;
                emptyRow--;
            }
        }
        for (let r = emptyRow; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = `./images/${randomCandy()}.png`;
        }
    }
}

function hasValidMoves() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (isMatch(r, c, 0, 1) || isMatch(r, c, 1, 0)) {
                return true;
            }
        }
    }
    return false;
}

function shuffleBoard() {
    do {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                board[r][c].src = `./images/${randomCandy()}.png`;
            }
        }
    } while (!hasValidMoves());
    console.log("Board shuffled due to no valid moves.");
}

function ensureNoPreMatches() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            while (isPreMatch(r, c, board[r][c].src.split("/").pop().split(".")[0])) {
                board[r][c].src = `./images/${randomCandy()}.png`;
            }
        }
    }
}

function isPreMatch(r, c, candy) {
    return (
        (board[r][c - 1]?.src.includes(candy) && board[r][c - 2]?.src.includes(candy)) ||
        (board[r - 1]?.[c]?.src.includes(candy) && board[r - 2]?.[c]?.src.includes(candy))
    );
}