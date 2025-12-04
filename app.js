const boardEl = document.getElementById('board');
const turnDisplay = document.getElementById('turn-display');
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const modeSelect = document.getElementById('game-mode');

let board = [];
let turn = 'red'; 
let selectedPiece = null; 
let validMoves = []; 
let gameMode = 'standard'; 
let continuationPiece = null; 
let isFlipped = false;
let forcedPieces = []; // စားကွက်ရှိနေသော အကောင်များစာရင်း

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
    checkForcedJumps(); // Game စတာနဲ့ စားကွက်စစ်မယ်
    renderBoard();
}

// --- MANDATORY JUMP CHECKER ---
function checkForcedJumps() {
    forcedPieces = [];
    
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            let p = board[r][c];
            if (p === 0) continue;

            const isRedPiece = (p === 1 || p === 3);
            const isBlackPiece = (p === 2 || p === 4);

            // Check only current turn's pieces
            if ((turn === 'red' && isRedPiece) || (turn === 'black' && isBlackPiece)) {
                // Pass 'true' to only check capture moves logic
                // But getValidMoves logic below handles logic separately, so we get all moves and filter
                let moves = getValidMoves(r, c, p);
                if (moves.some(m => m.isJump)) {
                    forcedPieces.push({r, c});
                }
            }
        }
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    
    let redCount = 0, blackCount = 0;

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
            
            // Render Valid Moves (Green Dots)
            const move = validMoves.find(m => m.r === r && m.c === c);
            if (move) {
                div.classList.add('valid-move');
                div.onclick = () => makeMove(r, c);
            }

            // Highlight Selected Source
            if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                div.classList.add('selected');
            }

            // Render Piece
            if (val !== 0) {
                const p = document.createElement('div');
                let colorClass = (val === 1 || val === 3) ? 'red' : 'black';
                let kingClass = (val === 3 || val === 4) ? 'king' : '';
                
                // Logic to identify if this piece MUST jump
                let isForcedPiece = false;
                
                // 1. Chain Jump Mode
                if (continuationPiece) {
                    if (continuationPiece.r === r && continuationPiece.c === c) {
                        p.classList.add('must-jump');
                        isForcedPiece = true;
                    }
                } 
                // 2. Global Mandatory Jump
                else if (forcedPieces.length > 0) {
                    if (forcedPieces.some(fp => fp.r === r && fp.c === c)) {
                        p.classList.add('must-jump');
                        isForcedPiece = true;
                    }
                }

                p.className = `piece ${colorClass} ${kingClass} ${p.className}`;
                
                const isMyTurn = (turn === 'red' && (val === 1 || val === 3)) || 
                                 (turn === 'black' && (val === 2 || val === 4));
                
                // CLICK RESTRICTION LOGIC (Strict)
                if (isMyTurn) {
                    let canInteract = true;

                    if (continuationPiece) {
                        // In chain jump, ONLY the chain piece can be clicked
                        if (!isForcedPiece) canInteract = false;
                    } 
                    else if (forcedPieces.length > 0) {
                        // If any capture exists, ONLY capturing pieces can be clicked
                        if (!isForcedPiece) canInteract = false;
                    }

                    if (canInteract) {
                        p.onclick = (e) => {
                            e.stopPropagation();
                            selectPiece(r, c);
                        };
                        p.style.cursor = 'pointer';
                    } else {
                        // Visual feedback for disabled pieces
                        p.style.opacity = '0.5'; 
                        p.style.cursor = 'not-allowed';
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
        if (blackCount === 0) winner = 'Red';
        else if (redCount === 0) winner = 'Black';
    } else {
        if (redCount === 0) winner = 'Red';
        else if (blackCount === 0) winner = 'Black';
    }
    if (winner) showWin(winner);
}

function selectPiece(r, c) {
    selectedPiece = { r, c };
    
    // Get all possible moves for this piece
    let moves = getValidMoves(r, c, board[r][c]);

    // STRICT FILTER: If forced jumps exist, remove any non-jump moves
    if (continuationPiece || forcedPieces.length > 0) {
        moves = moves.filter(m => m.isJump);
    }

    validMoves = moves;
    renderBoard();
}

// *** VALID MOVES LOGIC ***
function getValidMoves(r, c, type) {
    let moves = [];
    const isKing = (type === 3 || type === 4);
    const isRed = (type === 1 || type === 3);
    
    let dirs = [];
    if (isKing) {
        // Kings: All 4 directions
        dirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
    } else {
        // Normal: Forward Only
        dirs = isRed ? [[-1,-1], [-1,1]] : [[1,-1], [1,1]];
    }

    if (!isKing) {
        // --- NORMAL PIECE ---
        // 1. Capture (Forward Only)
        dirs.forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc; 
            const lr = r + dr*2, lc = c + dc*2; 
            
            if (onBoard(lr, lc) && board[lr][lc] === 0) {
                const mid = board[nr][nc];
                if (mid !== 0 && isEnemy(isRed, mid)) {
                    moves.push({ r: lr, c: lc, isJump: true, jumpR: nr, jumpC: nc });
                }
            }
        });

        // 2. Walk (Forward Only)
        // Note: Filtering happens in selectPiece based on forced state
        dirs.forEach(([dr, dc]) => {
            const nr = r + dr, nc = c + dc;
            if (onBoard(nr, nc) && board[nr][nc] === 0) {
                moves.push({ r: nr, c: nc, isJump: false });
            }
        });

    } else {
        // --- FLYING KING ---
        // All Directions
        const allDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
        
        allDirs.forEach(([dr, dc]) => {
            let captured = false;
            let enemyPos = null;

            for (let dist = 1; dist < 8; dist++) {
                const nr = r + dr * dist;
                const nc = c + dc * dist;

                if (!onBoard(nr, nc)) break;

                const cell = board[nr][nc];

                if (cell === 0) {
                    if (!captured) {
                        moves.push({ r: nr, c: nc, isJump: false });
                    } else {
                        // Landing after capture
                        moves.push({ r: nr, c: nc, isJump: true, jumpR: enemyPos.r, jumpC: enemyPos.c });
                    }
                } else {
                    if (captured) break; // Can't jump 2 pieces inline
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
    
    // Execute Move
    board[toR][toC] = pieceVal;
    board[selectedPiece.r][selectedPiece.c] = 0;

    let justPromoted = false;
    // Check Promotion
    if (pieceVal === 1 && toR === 0) { board[toR][toC] = 3; pieceVal = 3; justPromoted = true; }
    if (pieceVal === 2 && toR === 7) { board[toR][toC] = 4; pieceVal = 4; justPromoted = true; }

    // If Jumped
    if (move.isJump) {
        board[move.jumpR][move.jumpC] = 0; // Remove captured
        
        // Check for Multi-Jump
        // Get moves for the piece at NEW position
        let nextMoves = getValidMoves(toR, toC, pieceVal);
        // Only keep jumps
        const jumpMoves = nextMoves.filter(m => m.isJump);

        if (jumpMoves.length > 0) {
            // Must continue
            continuationPiece = { r: toR, c: toC };
            selectedPiece = { r: toR, c: toC };
            validMoves = jumpMoves;
            // IMPORTANT: Do NOT switch turn
            renderBoard();
            return; 
        }
    }

    // Turn End
    continuationPiece = null;
    selectedPiece = null;
    validMoves = [];
    turn = turn === 'red' ? 'black' : 'red';
    
    // Check global forced jumps for NEXT player
    checkForcedJumps();
    
    renderBoard();
}

function onBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function isEnemy(amRed, pieceVal) {
    if (amRed) return pieceVal === 2 || pieceVal === 4;
    return pieceVal === 1 || pieceVal === 3;
}

function showWin(who) {
    let msg = `${who} Wins!`;
    if (gameMode === 'suicide') msg += " (All pieces gone)";
    winnerText.textContent = msg;
    winnerModal.style.display = 'flex';
}

function resetGame() {
    initGame();
    winnerModal.style.display = 'none';
}

document.getElementById('btn-flip').onclick = () => { 
    isFlipped = !isFlipped;
    const board = document.getElementById('board');
    if (isFlipped) board.classList.add('flipped');
    else board.classList.remove('flipped');
};

initGame();