const boardEl = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const modeSelect = document.getElementById('game-mode');

let board = [];
let turn = 'red'; 
let selectedPiece = null; 
let validMoves = []; 
let gameMode = 'standard'; // 'standard' (Kyarn) or 'suicide' (Kone)

// Track multi-jump state
let continuationPiece = null; // If set, only this piece can move (must jump)

function initGame() {
    gameMode = modeSelect.value;
    board = Array(8).fill(0).map(() => Array(8).fill(0));

    // Setup 12 Pieces (3 Rows)
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) { 
                if (r < 3) board[r][c] = 2; // Black
                if (r > 4) board[r][c] = 1; // Red
            }
        }
    }
    turn = 'red';
    selectedPiece = null;
    validMoves = [];
    continuationPiece = null;
    renderBoard();
}

function renderBoard() {
    boardEl.innerHTML = '';
    
    let redCount = 0, blackCount = 0;
    let redHasMoves = false, blackHasMoves = false; // Check for stalemate

    // First pass to count pieces
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const val = board[r][c];
            if(val === 1 || val === 3) redCount++;
            if(val === 2 || val === 4) blackCount++;
        }
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const val = board[r][c];
            const div = document.createElement('div');
            div.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            
            // Highlight Valid Moves
            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) {
                div.classList.add('valid-move');
                div.onclick = () => makeMove(r, c);
            }

            if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                div.classList.add('selected');
            }

            // Render Piece
            if (val !== 0) {
                const p = document.createElement('div');
                let colorClass = (val === 1 || val === 3) ? 'red' : 'black';
                let kingClass = (val === 3 || val === 4) ? 'king' : '';
                
                // Highlight piece that MUST continue jumping
                if (continuationPiece && continuationPiece.r === r && continuationPiece.c === c) {
                    p.classList.add('must-jump');
                }

                p.className = `piece ${colorClass} ${kingClass} ${p.className}`;
                
                // Click Handler
                const isMyTurn = (turn === 'red' && (val === 1 || val === 3)) || 
                                 (turn === 'black' && (val === 2 || val === 4));
                
                // Interaction Rules:
                // 1. Must be my turn.
                // 2. If continuationPiece exists, ONLY that piece can be clicked.
                if (isMyTurn) {
                    if (!continuationPiece || (continuationPiece.r === r && continuationPiece.c === c)) {
                        p.onclick = (e) => {
                            e.stopPropagation();
                            selectPiece(r, c);
                        };
                    }
                }
                div.appendChild(p);
            }
            boardEl.appendChild(div);
        }
    }
    
    turnDisplay.textContent = turn === 'red' ? "🔴 Red's Turn" : "⚫ Black's Turn";
    checkWinCondition(redCount, blackCount);
}

function checkWinCondition(redCount, blackCount) {
    let winner = null;

    if (gameMode === 'standard') {
        // ကျားကျန် ကျားနိုင် (Normal)
        if (blackCount === 0) winner = 'Red';
        else if (redCount === 0) winner = 'Black';
    } else {
        // ကျားကုန် ကျားနိုင် (Suicide)
        if (redCount === 0) winner = 'Red';
        else if (blackCount === 0) winner = 'Black';
    }

    if (winner) showWin(winner);
}

function selectPiece(r, c) {
    selectedPiece = { r, c };
    // Only calculate moves for the selected piece
    // If in multi-jump mode, strict rules apply (handled in getValidMoves via check)
    validMoves = getValidMoves(r, c, board[r][c], !!continuationPiece);
    renderBoard();
}

// *** CORE LOGIC ***
function getValidMoves(r, c, type, mustJumpOnly = false) {
    let moves = [];
    const isKing = (type === 3 || type === 4);
    const isRed = (type === 1 || type === 3);
    
    let dirs = [];
    // Kings can move all diagonals
    if (isKing) dirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    else dirs = isRed ? [[-1,-1], [-1,1]] : [[1,-1], [1,1]];

    const captureDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];

    if (!isKing) {
        // --- NORMAL PIECE ---
        // 1. Capture (Forward & Backward allowed)
        captureDirs.forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc; // Enemy pos
            const lr = r + dr*2, lc = c + dc*2; // Landing pos
            if (onBoard(lr, lc) && board[lr][lc] === 0) {
                const mid = board[nr][nc];
                if (mid !== 0 && isEnemy(isRed, mid)) {
                    moves.push({ r: lr, c: lc, isJump: true, jumpR: nr, jumpC: nc });
                }
            }
        });

        // 2. Walk (Forward Only) - ONLY if not forced to jump
        if (!mustJumpOnly) {
            dirs.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (onBoard(nr, nc) && board[nr][nc] === 0) {
                    moves.push({ r: nr, c: nc, isJump: false });
                }
            });
        }

    } else {
        // --- FLYING KING ---
        dirs.forEach(([dr, dc]) => {
            let captured = false;
            let enemyPos = null;

            for (let dist = 1; dist < 8; dist++) {
                const nr = r + dr * dist;
                const nc = c + dc * dist;

                if (!onBoard(nr, nc)) break;

                const cell = board[nr][nc];

                if (cell === 0) {
                    if (!captured) {
                        // Regular move (only if not forced jump mode)
                        if(!mustJumpOnly) moves.push({ r: nr, c: nc, isJump: false });
                    } else {
                        // Landing after capture
                        moves.push({ r: nr, c: nc, isJump: true, jumpR: enemyPos.r, jumpC: enemyPos.c });
                    }
                } else {
                    if (captured) break; // Cannot jump two pieces in a row directly
                    if (isEnemy(isRed, cell)) {
                        captured = true;
                        enemyPos = { r: nr, c: nc };
                    } else {
                        break; // Blocked by own
                    }
                }
            }
        });
    }

    return moves;
}

function makeMove(toR, toC) {
    const move = validMoves.find(m => m.r === toR && m.c === toC);
    if (!move) return;

    let pieceVal = board[selectedPiece.r][selectedPiece.c];
    const isRed = (pieceVal === 1 || pieceVal === 3);

    // 1. Move piece
    board[toR][toC] = pieceVal;
    board[selectedPiece.r][selectedPiece.c] = 0;

    let justPromoted = false;
    // 2. Promotion (Red -> Top (0), Black -> Bottom (7))
    if (pieceVal === 1 && toR === 0) { board[toR][toC] = 3; pieceVal = 3; justPromoted = true; }
    if (pieceVal === 2 && toR === 7) { board[toR][toC] = 4; pieceVal = 4; justPromoted = true; }

    // 3. Handle Capture logic
    if (move.isJump) {
        board[move.jumpR][move.jumpC] = 0; // Remove eaten piece
        
        // --- MULTI JUMP CHECK ---
        // Calculate if this specific piece can jump again from the new position
        // Pass 'true' to getValidMoves to ONLY look for jumps
        const nextMoves = getValidMoves(toR, toC, pieceVal, true);
        const canJumpAgain = nextMoves.some(m => m.isJump);

        if (canJumpAgain) {
            // Force player to continue
            continuationPiece = { r: toR, c: toC };
            selectedPiece = { r: toR, c: toC };
            validMoves = nextMoves.filter(m => m.isJump); // Strict enforcement
            renderBoard();
            return; // EXIT FUNCTION HERE (Turn does not change)
        }
    }

    // End Turn (if no multi-jump occurred or chain finished)
    continuationPiece = null;
    selectedPiece = null;
    validMoves = [];
    turn = turn === 'red' ? 'black' : 'red';
    renderBoard();
}

function onBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function isEnemy(amRed, pieceVal) {
    if (amRed) return pieceVal === 2 || pieceVal === 4;
    return pieceVal === 1 || pieceVal === 3;
}

function showWin(who) {
    // Customize message based on mode
    let msg = `${who} Wins!`;
    if (gameMode === 'suicide') msg += " (All pieces gone)";
    winnerText.textContent = msg;
    winnerModal.style.display = 'flex';
}

function resetGame() {
    initGame();
    winnerModal.style.display = 'none';
}

// Start
initGame();