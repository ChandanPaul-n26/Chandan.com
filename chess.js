const homePage = document.getElementById('home-page');
const gamePage = document.getElementById('game-page');
const board = document.getElementById('chess-board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const backHomeBtn = document.getElementById('back-home');
const twoPlayerBtn = document.getElementById('two-player');
const vsAiBtn = document.getElementById('vs-ai');
const aiOptions = document.getElementById('ai-options');
const timerSetup = document.getElementById('timer-setup');
const timerInput = document.getElementById('timer-input');
const startGameBtn = document.getElementById('start-game');
const whiteTimerEl = document.getElementById('white-timer');
const blackTimerEl = document.getElementById('black-timer');

let gameMode = null; // 'two-player' or 'vs-ai'
let aiLevel = null;
let timerMinutes = 10;
let gameBoard = [];
let currentPlayer = 'white';
let selectedSquare = null;
let possibleMoves = [];
let whiteTime = 0;
let blackTime = 0;
let timerInterval = null;
let gameState = {
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRookKingsideMoved: false,
    blackRookKingsideMoved: false,
    whiteRookQueensideMoved: false,
    blackRookQueensideMoved: false,
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1
};

const pieceValues = {
    '♙': 10, '♟': -10,
    '♘': 30, '♞': -30,
    '♗': 30, '♝': -30,
    '♖': 50, '♜': -50,
    '♕': 90, '♛': -90,
    '♔': 900, '♚': -900
};

function switchToPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
}

twoPlayerBtn.addEventListener('click', () => {
    gameMode = 'two-player';
    timerSetup.classList.remove('hidden');
});

vsAiBtn.addEventListener('click', () => {
    gameMode = 'vs-ai';
    aiOptions.classList.remove('hidden');
});

document.querySelectorAll('.difficulty').forEach(btn => {
    btn.addEventListener('click', (e) => {
        aiLevel = e.target.dataset.level;
        timerSetup.classList.remove('hidden');
    });
});

startGameBtn.addEventListener('click', () => {
    timerMinutes = parseInt(timerInput.value) || 10;
    switchToPage(gamePage);
    initializeGame();
});

backHomeBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    switchToPage(homePage);
    aiOptions.classList.add('hidden');
    timerSetup.classList.add('hidden');
});

resetBtn.addEventListener('click', initializeGame);

function initializeGame() {
    gameBoard = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    currentPlayer = 'white';
    selectedSquare = null;
    possibleMoves = [];
    whiteTime = timerMinutes * 60;
    blackTime = timerMinutes * 60;
    gameState = {
        whiteKingMoved: false,
        blackKingMoved: false,
        whiteRookKingsideMoved: false,
        blackRookKingsideMoved: false,
        whiteRookQueensideMoved: false,
        blackRookQueensideMoved: false,
        enPassantTarget: null,
        halfmoveClock: 0,
        fullmoveNumber: 1
    };
    clearInterval(timerInterval);
    startTimer();
    renderBoard();
    updateStatus();
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (currentPlayer === 'white') {
            whiteTime--;
            if (whiteTime <= 0) {
                endGame('Black wins by timeout!');
                return;
            }
        } else {
            blackTime--;
            if (blackTime <= 0) {
                endGame('White wins by timeout!');
                return;
            }
        }
        updateTimers();
    }, 1000);
}

function updateTimers() {
    whiteTimerEl.textContent = formatTime(whiteTime);
    blackTimerEl.textContent = formatTime(blackTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'white' : 'black');
            const piece = gameBoard[row][col];
            if (piece) {
                const color = '♔♕♖♗♘♙'.includes(piece) ? 'white' : 'black';
                square.innerHTML = `<span class="piece ${color}">${piece}</span>`;
            }
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }
    highlightSelected();
    highlightCheck();
}

function highlightSelected() {
    if (selectedSquare) {
        const [row, col] = selectedSquare;
        const square = board.children[row * 8 + col];
        square.classList.add('selected');
    }
}

function highlightPossibleMoves() {
    possibleMoves.forEach(([row, col]) => {
        const square = board.children[row * 8 + col];
        square.classList.add('possible-move');
    });
}

function highlightCheck() {
    const kingPos = findKing(currentPlayer);
    if (kingPos && isInCheck(currentPlayer)) {
        const [row, col] = kingPos;
        const square = board.children[row * 8 + col];
        square.classList.add('check');
    }
}

function handleSquareClick(event) {
    const row = parseInt(event.currentTarget.dataset.row);
    const col = parseInt(event.currentTarget.dataset.col);

    if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare;
        if (selectedRow === row && selectedCol === col) {
            // Deselect
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
            return;
        }
        // Try to move
        if (possibleMoves.some(([r, c]) => r === row && c === col)) {
            makeMove(selectedRow, selectedCol, row, col);
            currentPlayer = opponent(currentPlayer);
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
            updateStatus();
            if (isCheckmate(currentPlayer)) {
                endGame(`${opponent(currentPlayer).charAt(0).toUpperCase() + opponent(currentPlayer).slice(1)} wins by checkmate!`);
                return;
            } else if (isStalemate(currentPlayer)) {
                endGame('Stalemate!');
                return;
            } else {
                if (currentPlayer === 'black' && gameMode === 'vs-ai') {
                    setTimeout(makeAIMove, 500);
                }
            }
        } else {
            // Invalid, deselect
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
        }
    } else {
        // Select piece
        const piece = gameBoard[row][col];
        if (piece && isPieceOfCurrentPlayer(piece)) {
            selectedSquare = [row, col];
            possibleMoves = getPossibleMoves(row, col);
            renderBoard();
        }
    }
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameBoard[fromRow][fromCol];
    gameBoard[toRow][toCol] = piece;
    gameBoard[fromRow][fromCol] = '';

    // Handle special moves
    if (piece === '♔' && fromCol === 4 && toCol === 6) { // Kingside castling
        gameBoard[7][5] = '♖';
        gameBoard[7][7] = '';
    } else if (piece === '♔' && fromCol === 4 && toCol === 2) { // Queenside castling
        gameBoard[7][3] = '♖';
        gameBoard[7][0] = '';
    } else if (piece === '♚' && fromCol === 4 && toCol === 6) {
        gameBoard[0][5] = '♜';
        gameBoard[0][7] = '';
    } else if (piece === '♚' && fromCol === 4 && toCol === 2) {
        gameBoard[0][3] = '♜';
        gameBoard[0][0] = '';
    } else if ((piece === '♙' || piece === '♟') && Math.abs(fromRow - toRow) === 2) {
        gameState.enPassantTarget = [toRow, toCol];
    } else if ((piece === '♙' || piece === '♟') && gameState.enPassantTarget && toCol === gameState.enPassantTarget[1]) {
        gameBoard[fromRow][toCol] = '';
    }

    // Promotion
    if (piece === '♙' && toRow === 0) {
        gameBoard[toRow][toCol] = '♕';
    } else if (piece === '♟' && toRow === 7) {
        gameBoard[toRow][toCol] = '♛';
    }

    // Update game state
    if (piece === '♔') gameState.whiteKingMoved = true;
    if (piece === '♚') gameState.blackKingMoved = true;
    if (fromRow === 7 && fromCol === 7) gameState.whiteRookKingsideMoved = true;
    if (fromRow === 7 && fromCol === 0) gameState.whiteRookQueensideMoved = true;
    if (fromRow === 0 && fromCol === 7) gameState.blackRookKingsideMoved = true;
    if (fromRow === 0 && fromCol === 0) gameState.blackRookQueensideMoved = true;

    gameState.enPassantTarget = null;
    gameState.halfmoveClock++;
    if (currentPlayer === 'black') gameState.fullmoveNumber++;
}

function getPossibleMoves(row, col) {
    const piece = gameBoard[row][col];
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isValidMove(row, col, r, c)) {
                moves.push([r, c]);
            }
        }
    }
    return moves;
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameBoard[fromRow][fromCol];
    const target = gameBoard[toRow][toCol];
    if (target && isPieceOfCurrentPlayer(target)) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    let valid = false;
    switch (piece) {
        case '♙':
            if (colDiff === 0 && rowDiff === -1 && !target) valid = true;
            if (colDiff === 0 && rowDiff === -2 && fromRow === 6 && !target && !gameBoard[5][fromCol]) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === -1 && target) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === -1 && gameState.enPassantTarget && toRow === gameState.enPassantTarget[0] && toCol === gameState.enPassantTarget[1]) valid = true;
            break;
        case '♟':
            if (colDiff === 0 && rowDiff === 1 && !target) valid = true;
            if (colDiff === 0 && rowDiff === 2 && fromRow === 1 && !target && !gameBoard[2][fromCol]) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === 1 && target) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === 1 && gameState.enPassantTarget && toRow === gameState.enPassantTarget[0] && toCol === gameState.enPassantTarget[1]) valid = true;
            break;
        case '♖': case '♜':
            if ((rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♗': case '♝':
            if (Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♕': case '♛':
            if ((rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClear(fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♘': case '♞':
            if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) valid = true;
            break;
        case '♔': case '♚':
            if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) valid = true;
            // Castling
            if (rowDiff === 0 && Math.abs(colDiff) === 2 && !isInCheck(currentPlayer)) {
                if (colDiff === 2 && canCastleKingside()) valid = true;
                if (colDiff === -2 && canCastleQueenside()) valid = true;
            }
            break;
    }

    if (valid) {
        // Check if move puts own king in check
        const tempBoard = gameBoard.map(row => [...row]);
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = '';
        if (isInCheckAfterMove(tempBoard, currentPlayer)) valid = false;
    }

    return valid;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    while (row !== toRow || col !== toCol) {
        if (gameBoard[row][col]) return false;
        row += rowStep;
        col += colStep;
    }
    return true;
}

function canCastleKingside() {
    const row = currentPlayer === 'white' ? 7 : 0;
    if ((currentPlayer === 'white' && (gameState.whiteKingMoved || gameState.whiteRookKingsideMoved)) ||
        (currentPlayer === 'black' && (gameState.blackKingMoved || gameState.blackRookKingsideMoved))) return false;
    for (let c = 5; c < 7; c++) {
        if (gameBoard[row][c]) return false;
    }
    return true;
}

function canCastleQueenside() {
    const row = currentPlayer === 'white' ? 7 : 0;
    if ((currentPlayer === 'white' && (gameState.whiteKingMoved || gameState.whiteRookQueensideMoved)) ||
        (currentPlayer === 'black' && (gameState.blackKingMoved || gameState.blackRookQueensideMoved))) return false;
    for (let c = 1; c < 4; c++) {
        if (gameBoard[row][c]) return false;
    }
    return true;
}

function isInCheck(player) {
    const kingPos = findKing(player);
    if (!kingPos) return false;
    const [kingRow, kingCol] = kingPos;
    const opponent = player === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameBoard[r][c];
            if (piece && isPieceOfPlayer(piece, opponent)) {
                if (isValidMoveForPiece(r, c, kingRow, kingCol, piece)) return true;
            }
        }
    }
    return false;
}

function isInCheckAfterMove(tempBoard, player) {
    const kingPos = findKingInBoard(tempBoard, player);
    if (!kingPos) return false;
    const [kingRow, kingCol] = kingPos;
    const opponent = player === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = tempBoard[r][c];
            if (piece && isPieceOfPlayer(piece, opponent)) {
                if (isValidMoveForPieceInBoard(tempBoard, r, c, kingRow, kingCol, piece)) return true;
            }
        }
    }
    return false;
}

function isValidMoveForPiece(fromRow, fromCol, toRow, toCol, piece) {
    // Simplified, assume no own pieces blocking for check detection
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    switch (piece) {
        case '♙':
            return Math.abs(colDiff) === 1 && rowDiff === -1;
        case '♟':
            return Math.abs(colDiff) === 1 && rowDiff === 1;
        case '♖': case '♜':
            return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);
        case '♗': case '♝':
            return Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(fromRow, fromCol, toRow, toCol);
        case '♕': case '♛':
            return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClear(fromRow, fromCol, toRow, toCol);
        case '♘': case '♞':
            return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        case '♔': case '♚':
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    }
    return false;
}

function isValidMoveForPieceInBoard(board, fromRow, fromCol, toRow, toCol, piece) {
    // Similar to above but with board parameter
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    switch (piece) {
        case '♙':
            return Math.abs(colDiff) === 1 && rowDiff === -1;
        case '♟':
            return Math.abs(colDiff) === 1 && rowDiff === 1;
        case '♖': case '♜':
            return (rowDiff === 0 || colDiff === 0) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol);
        case '♗': case '♝':
            return Math.abs(rowDiff) === Math.abs(colDiff) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol);
        case '♕': case '♛':
            return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol);
        case '♘': case '♞':
            return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        case '♔': case '♚':
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    }
    return false;
}

function isPathClearInBoard(board, fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    let row = fromRow + rowStep;
    let col = fromCol + colStep;
    while (row !== toRow || col !== toCol) {
        if (board[row][col]) return false;
        row += rowStep;
        col += colStep;
    }
    return true;
}

function findKing(player) {
    const king = player === 'white' ? '♔' : '♚';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (gameBoard[r][c] === king) return [r, c];
        }
    }
    return null;
}

function findKingInBoard(board, player) {
    const king = player === 'white' ? '♔' : '♚';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === king) return [r, c];
        }
    }
    return null;
}

function isPieceOfCurrentPlayer(piece) {
    return isPieceOfPlayer(piece, currentPlayer);
}

function isPieceOfPlayer(piece, player) {
    if (player === 'white') {
        return '♔♕♖♗♘♙'.includes(piece);
    } else {
        return '♚♛♜♝♞♟'.includes(piece);
    }
}

function opponent(player) {
    return player === 'white' ? 'black' : 'white';
}

function isCheckmate(player) {
    if (!isInCheck(player)) return false;
    return !hasLegalMoves(player);
}

function isStalemate(player) {
    if (isInCheck(player)) return false;
    return !hasLegalMoves(player);
}

function hasLegalMoves(player) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameBoard[r][c];
            if (piece && isPieceOfPlayer(piece, player)) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (isValidMove(r, c, tr, tc)) return true;
                    }
                }
            }
        }
    }
    return false;
}

function endGame(message) {
    status.textContent = message;
    clearInterval(timerInterval);
}

function updateStatus() {
    status.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + "'s turn";
    if (isInCheck(currentPlayer)) {
        status.textContent += ' (Check!)';
    }
}

function makeAIMove() {
    const depthMap = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
    };
    const depth = depthMap[aiLevel] || 4;
    const [_, bestMove] = minimax(depth, -Infinity, Infinity, true, gameBoard, gameState, 'black');
    if (bestMove) {
        const [fromRow, fromCol, toRow, toCol] = bestMove;
        makeMove(fromRow, fromCol, toRow, toCol);
        currentPlayer = 'white';
        renderBoard();
        updateStatus();
        if (isCheckmate('white')) {
            endGame('Black wins by checkmate!');
        } else if (isStalemate('white')) {
            endGame('Stalemate!');
        }
    }
}

function minimax(depth, alpha, beta, maximizing, board, state, player) {
    if (depth === 0) {
        return [evaluateBoardFrom(board), null];
    }

    let bestMove = null;
    let bestValue = maximizing ? -Infinity : Infinity;

    const moves = getAllLegalMovesFor(board, state, player);
    for (const move of moves) {
        const [fromRow, fromCol, toRow, toCol] = move;
        const { board: newBoard, state: newState } = makeTempMove(board, state, fromRow, fromCol, toRow, toCol, player);
        const opp = player === 'white' ? 'black' : 'white';
        const value = minimax(depth - 1, alpha, beta, !maximizing, newBoard, newState, opp)[0];

        if (maximizing) {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
            alpha = Math.max(alpha, value);
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
            beta = Math.min(beta, value);
        }

        if (beta <= alpha) break;
    }

    return [bestValue, bestMove];
}

function getAllLegalMovesFor(board, state, player) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && isPieceOfPlayer(piece, player)) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (isValidMoveIn(board, state, r, c, tr, tc, player)) {
                            moves.push([r, c, tr, tc]);
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function evaluateBoardFrom(board) {
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                score += pieceValues[piece];
            }
        }
    }
    return score;
}

function makeTempMove(board, state, fromRow, fromCol, toRow, toCol, player) {
    const newBoard = board.map(row => [...row]);
    const newState = { ...state };
    const piece = newBoard[fromRow][fromCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = '';

    // Handle special moves
    if (piece === '♔' && fromCol === 4 && toCol === 6) { // Kingside castling
        newBoard[7][5] = '♖';
        newBoard[7][7] = '';
    } else if (piece === '♔' && fromCol === 4 && toCol === 2) { // Queenside castling
        newBoard[7][3] = '♖';
        newBoard[7][0] = '';
    } else if (piece === '♚' && fromCol === 4 && toCol === 6) {
        newBoard[0][5] = '♜';
        newBoard[0][7] = '';
    } else if (piece === '♚' && fromCol === 4 && toCol === 2) {
        newBoard[0][3] = '♜';
        newBoard[0][0] = '';
    } else if ((piece === '♙' || piece === '♟') && Math.abs(fromRow - toRow) === 2) {
        newState.enPassantTarget = [toRow, toCol];
    } else if ((piece === '♙' || piece === '♟') && newState.enPassantTarget && toCol === newState.enPassantTarget[1]) {
        newBoard[fromRow][toCol] = '';
    }

    // Promotion
    if (piece === '♙' && toRow === 0) {
        newBoard[toRow][toCol] = '♕';
    } else if (piece === '♟' && toRow === 7) {
        newBoard[toRow][toCol] = '♛';
    }

    // Update state
    if (piece === '♔') newState.whiteKingMoved = true;
    if (piece === '♚') newState.blackKingMoved = true;
    if (fromRow === 7 && fromCol === 7) newState.whiteRookKingsideMoved = true;
    if (fromRow === 7 && fromCol === 0) newState.whiteRookQueensideMoved = true;
    if (fromRow === 0 && fromCol === 7) newState.blackRookKingsideMoved = true;
    if (fromRow === 0 && fromCol === 0) newState.blackRookQueensideMoved = true;

    newState.enPassantTarget = null;
    newState.halfmoveClock++;
    if (player === 'black') newState.fullmoveNumber++;

    return { board: newBoard, state: newState };
}

function getAllLegalMovesFor(board, state, player) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && isPieceOfPlayer(piece, player)) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (isValidMoveIn(board, state, r, c, tr, tc, player)) {
                            moves.push([r, c, tr, tc]);
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function isValidMoveIn(board, state, fromRow, fromCol, toRow, toCol, player) {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    if (target && isPieceOfPlayer(target, player)) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    let valid = false;
    switch (piece) {
        case '♙':
            if (colDiff === 0 && rowDiff === -1 && !target) valid = true;
            if (colDiff === 0 && rowDiff === -2 && fromRow === 6 && !target && !board[5][fromCol]) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === -1 && target) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === -1 && state.enPassantTarget && toRow === state.enPassantTarget[0] && toCol === state.enPassantTarget[1]) valid = true;
            break;
        case '♟':
            if (colDiff === 0 && rowDiff === 1 && !target) valid = true;
            if (colDiff === 0 && rowDiff === 2 && fromRow === 1 && !target && !board[2][fromCol]) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === 1 && target) valid = true;
            if (Math.abs(colDiff) === 1 && rowDiff === 1 && state.enPassantTarget && toRow === state.enPassantTarget[0] && toCol === state.enPassantTarget[1]) valid = true;
            break;
        case '♖': case '♜':
            if ((rowDiff === 0 || colDiff === 0) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♗': case '♝':
            if (Math.abs(rowDiff) === Math.abs(colDiff) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♕': case '♛':
            if ((rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) && isPathClearInBoard(board, fromRow, fromCol, toRow, toCol)) valid = true;
            break;
        case '♘': case '♞':
            if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) valid = true;
            break;
        case '♔': case '♚':
            if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) valid = true;
            // Castling
            if (rowDiff === 0 && Math.abs(colDiff) === 2 && !isInCheckIn(board, state, player)) {
                if (colDiff === 2 && canCastleKingsideIn(state, player)) valid = true;
                if (colDiff === -2 && canCastleQueensideIn(state, player)) valid = true;
            }
            break;
    }

    if (valid) {
        const { board: tempBoard } = makeTempMove(board, state, fromRow, fromCol, toRow, toCol, player);
        if (isInCheckAfterMoveIn(tempBoard, player)) valid = false;
    }

    return valid;
}

function canCastleKingsideIn(state, player) {
    if (player === 'white') {
        return !state.whiteKingMoved && !state.whiteRookKingsideMoved;
    } else {
        return !state.blackKingMoved && !state.blackRookKingsideMoved;
    }
}

function canCastleQueensideIn(state, player) {
    if (player === 'white') {
        return !state.whiteKingMoved && !state.whiteRookQueensideMoved;
    } else {
        return !state.blackKingMoved && !state.blackRookQueensideMoved;
    }
}

function isInCheckIn(board, state, player) {
    const kingPos = findKingInBoard(board, player);
    if (!kingPos) return false;
    const [kingRow, kingCol] = kingPos;
    const opponent = player === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && isPieceOfPlayer(piece, opponent)) {
                if (isValidMoveForPieceInBoard(board, r, c, kingRow, kingCol, piece)) return true;
            }
        }
    }
    return false;
}

function isInCheckAfterMoveIn(board, player) {
    return isInCheckIn(board, {}, player); // Simplified
}