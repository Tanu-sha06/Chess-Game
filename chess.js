// Chess piece symbols
const pieceSymbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
};

// Game state
let board = [];
let selectedSquare = null;
let currentPlayer = 'white';
let validMoves = [];
let capturedPieces = { white: [], black: [] };
let gameStatus = 'playing';

// Initialize the chess board
function initializeBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Black pieces (top)
    board[0] = [
        { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' },
        { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
        { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' },
        { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
    ];
    board[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }));
    
    // White pieces (bottom)
    board[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }));
    board[7] = [
        { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' },
        { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
        { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' },
        { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
    ];
}

// Get valid moves for a piece - FIXED VERSION
function getValidMoves(row, col, piece, currentBoard) {
    const moves = [];
    const { type, color } = piece;

    switch (type) {
        case 'pawn':
            const direction = color === 'white' ? -1 : 1;
            const startRow = color === 'white' ? 6 : 1;
            
            // Forward move
            if (currentBoard[row + direction] && currentBoard[row + direction][col] === null) {
                moves.push([row + direction, col]);
                // Double move from start
                if (row === startRow && currentBoard[row + 2 * direction][col] === null) {
                    moves.push([row + 2 * direction, col]);
                }
            }
            
            // Capture diagonally
            [-1, 1].forEach(offset => {
                const newCol = col + offset;
                const targetPiece = currentBoard[row + direction] && currentBoard[row + direction][newCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push([row + direction, newCol]);
                }
            });
            break;

        case 'rook':
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + dr * i;
                    const newCol = col + dc * i;
                    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                    if (currentBoard[newRow][newCol]) {
                        if (currentBoard[newRow][newCol].color !== color) moves.push([newRow, newCol]);
                        break;
                    }
                    moves.push([newRow, newCol]);
                }
            });
            break;

        case 'knight':
            [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    if (!currentBoard[newRow][newCol] || currentBoard[newRow][newCol].color !== color) {
                        moves.push([newRow, newCol]);
                    }
                }
            });
            break;

        case 'bishop':
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + dr * i;
                    const newCol = col + dc * i;
                    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                    if (currentBoard[newRow][newCol]) {
                        if (currentBoard[newRow][newCol].color !== color) moves.push([newRow, newCol]);
                        break;
                    }
                    moves.push([newRow, newCol]);
                }
            });
            break;

        case 'queen':
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const newRow = row + dr * i;
                    const newCol = col + dc * i;
                    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
                    if (currentBoard[newRow][newCol]) {
                        if (currentBoard[newRow][newCol].color !== color) moves.push([newRow, newCol]);
                        break;
                    }
                    moves.push([newRow, newCol]);
                }
            });
            break;

        case 'king':
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
                    if (!currentBoard[newRow][newCol] || currentBoard[newRow][newCol].color !== color) {
                        moves.push([newRow, newCol]);
                    }
                }
            });
            break;
    }

    return moves;
}

// Render the chess board
function renderBoard() {
    const boardEl = document.getElementById('chessBoard');
    boardEl.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.className = 'piece';
                pieceEl.textContent = pieceSymbols[piece.color][piece.type];
                square.appendChild(pieceEl);
            }

            if (selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col) {
                square.classList.add('selected');
            }

            const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
            if (isValidMove) {
                square.classList.add('valid-move');
                const indicator = document.createElement('div');
                indicator.className = 'valid-move-indicator';
                const dot = document.createElement('div');
                dot.className = `valid-move-dot ${piece ? 'capture' : 'empty'}`;
                indicator.appendChild(dot);
                square.appendChild(indicator);
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardEl.appendChild(square);
        }
    }
}

// Handle square click - FIXED VERSION
function handleSquareClick(row, col) {
    if (gameStatus !== 'playing') return;

    const piece = board[row][col];

    if (selectedSquare) {
        const [selectedRow, selectedCol] = selectedSquare;
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

        if (isValidMove) {
            const movingPiece = board[selectedRow][selectedCol];
            const capturedPiece = board[row][col];

            // Capture piece
            if (capturedPiece) {
                capturedPieces[currentPlayer].push(capturedPiece);
                updateCapturedPieces();

                // Check for king capture
                if (capturedPiece.type === 'king') {
                    gameStatus = `${currentPlayer} wins`;
                    showGameOver();
                }
            }

            board[row][col] = movingPiece;
            board[selectedRow][selectedCol] = null;

            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            updateCurrentPlayer();
            selectedSquare = null;
            validMoves = [];
            renderBoard();
        } else if (piece && piece.color === currentPlayer) {
            selectedSquare = [row, col];
            validMoves = getValidMoves(row, col, piece, board);
            renderBoard();
        } else {
            selectedSquare = null;
            validMoves = [];
            renderBoard();
        }
    } else if (piece && piece.color === currentPlayer) {
        selectedSquare = [row, col];
        validMoves = getValidMoves(row, col, piece, board);
        renderBoard();
    }
}

// Update current player display
function updateCurrentPlayer() {
    const playerEl = document.getElementById('currentPlayer');
    playerEl.textContent = currentPlayer.toUpperCase();
    playerEl.className = `player-indicator ${currentPlayer === 'white' ? 'white-turn' : 'black-turn'}`;
}

// Update captured pieces display
function updateCapturedPieces() {
    const whiteEl = document.getElementById('capturedWhite');
    const blackEl = document.getElementById('capturedBlack');
    
    whiteEl.innerHTML = capturedPieces.white.map((p, i) => 
        `<span>${pieceSymbols.white[p.type]}</span>`
    ).join('');
    
    blackEl.innerHTML = capturedPieces.black.map((p, i) => 
        `<span>${pieceSymbols.black[p.type]}</span>`
    ).join('');
}

// Show game over
function showGameOver() {
    const gameOverCard = document.getElementById('gameOverCard');
    const winnerText = document.getElementById('winnerText');
    gameOverCard.classList.remove('hidden');
    winnerText.textContent = `${gameStatus}!`;
}

// Reset game
function resetGame() {
    initializeBoard();
    selectedSquare = null;
    currentPlayer = 'white';
    validMoves = [];
    capturedPieces = { white: [], black: [] };
    gameStatus = 'playing';
    
    document.getElementById('gameOverCard').classList.add('hidden');
    updateCurrentPlayer();
    updateCapturedPieces();
    renderBoard();
}

// Create animated particles
function createParticles() {
    const particlesDiv = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = (Math.random() * 100 + 50) + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = (Math.random() * 100) + '%';
        particle.style.top = (Math.random() * 100) + '%';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particlesDiv.appendChild(particle);
    }
}

// Event listeners
document.getElementById('resetButton').addEventListener('click', resetGame);

// Initialize game
createParticles();
initializeBoard();
renderBoard();
updateCurrentPlayer();