// Checkers mini-game script
// - Access gate: requires login + an order or reservation
// - Implements basic checkers rules (captures, kinging, multi-jumps)
// - Updates UI board + status texts
// Tailwind CSS Configuration
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
            },
            colors: {
                brand: {
                    primary: '#8b6914',
                    secondary: '#c9a961',
                    accent: '#d4af37',
                    gold: '#f4d03f',
                    bronze: '#6b4e0f',
                    ink: '#3d2f0a',
                    muted: '#6b5d3a',
                    paper: '#faf8f3',
                    cream: '#f5f1e8',
                    beige: '#ede8dd',
                    line: '#d4c4a8',
                },
            },
            boxShadow: {
                soft: '0 10px 40px rgba(139, 105, 20, 0.15)',
                lift: '0 20px 60px rgba(139, 105, 20, 0.2)',
            },
        },
    },
};

// Point d’entrée du mini-jeu : encapsule toute la logique pour éviter les conflits de variables.
(function () {
    const SESSION_KEY = 'dt_session';

    // Parse une chaîne JSON en toute sécurité ; retourne null si le JSON est invalide.
    function safeJsonParse(v) { try { return JSON.parse(v); } catch { return null; } }

    // Charge la session utilisateur depuis le localStorage (si elle est présente et valide).
    function loadSession() {
        const raw = localStorage.getItem(SESSION_KEY);
        const session = safeJsonParse(raw);
        if (!session || !session.email) return null;
        return session;
    }

    // Access Check
    (function checkAccess() {
        const session = loadSession();
        if (!session) {
            alert('Accès refusé : Vous devez être connecté pour jouer.');
            window.location.href = 'html.html';
            return;
        }
        
        let hasAccess = false;
        try {
            // Check orders
            const ordersKey = 'dt_orders_' + session.email;
            const rawOrders = localStorage.getItem(ordersKey);
            const orders = rawOrders ? JSON.parse(rawOrders) : [];
            if (Array.isArray(orders) && orders.length > 0) hasAccess = true;
            
            // Check reservations
            if (!hasAccess) {
                const rawRes = localStorage.getItem('dt_reservations');
                const allRes = rawRes ? JSON.parse(rawRes) : [];
                if (Array.isArray(allRes)) {
                    const myRes = allRes.find(r => r && r.byEmail === session.email);
                    if (myRes) hasAccess = true;
                }
            }
        } catch (e) {}
        
        if (!hasAccess) {
            alert('Accès refusé : Vous devez passer une commande ou réserver une table pour débloquer les mini-jeux.');
            window.location.href = 'html.html';
        }
    })();

    const resetFx = document.getElementById('resetFx');

    // Joue un petit effet visuel lors d’une remise à zéro, puis exécute un callback si fourni.
    function playResetFx(done) {
        if (!resetFx) {
            if (typeof done === 'function') done();
            return;
        }
        resetFx.classList.add('is-on');
        window.setTimeout(() => {
            resetFx.classList.remove('is-on');
            if (typeof done === 'function') done();
        }, 1050);
    }

    const boardEl = document.getElementById('ckBoard');
    const turnEl = document.getElementById('ckTurn');
    const selectedEl = document.getElementById('ckSelected');
    const ruleEl = document.getElementById('ckRule');
    const winnerEl = document.getElementById('ckWinner');
    const resetBtn = document.getElementById('ckReset');
    const newBtn = document.getElementById('ckNew');

    const SIZE = 8;
    const EMPTY = null;

    // piece: { c: 'w'|'b', k: boolean }
    let board = [];
    let turn = 'w';
    let selected = null; // { r, c }
    let moves = []; // available moves for selected
    let forcedFrom = null; // {r,c} if must continue multi-jump
    let winner = '';

    // Vérifie qu’une case (ligne/colonne) est bien à l’intérieur du plateau.
    function inBounds(r, c) { return r >= 0 && c >= 0 && r < SIZE && c < SIZE; }
    // Indique si une case est une case sombre (seules ces cases sont jouables aux dames).
    function isDarkSquare(r, c) { return (r + c) % 2 === 1; }
    // Crée une copie profonde du plateau pour éviter de modifier l’original par référence.
    function cloneBoard(b) { return b.map((row) => row.map((x) => (x ? { c: x.c, k: !!x.k } : null))); }

    // Initialise un plateau standard de dames avec les pièces aux positions de départ.
    function initBoard() {
        const b = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => EMPTY));
        // black on top rows 0..2 on dark squares
        for (let r = 0; r < 3; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                if (!isDarkSquare(r, c)) continue;
                b[r][c] = { c: 'b', k: false };
            }
        }
        // white on bottom rows 5..7
        for (let r = 5; r < SIZE; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                if (!isDarkSquare(r, c)) continue;
                b[r][c] = { c: 'w', k: false };
            }
        }
        return b;
    }

    // Transforme des coordonnées internes en un libellé lisible (ex: A8), pour l’affichage.
    function squareLabel(pt) {
        return pt ? `${String.fromCharCode(65 + pt.c)}${SIZE - pt.r}` : '—';
    }

    // Met à jour le texte d’un élément DOM en gérant proprement les valeurs vides.
    function setText(el, v) { if (el) el.textContent = String(v || '—'); }

    // Affiche le joueur dont c’est le tour (blanc ou noir).
    function setTurnText() {
        if (!turnEl) return;
        turnEl.textContent = turn === 'w' ? 'White' : 'Black';
    }

    // Met à jour les informations de statut : case sélectionnée et vainqueur.
    function setStatusText() {
        setText(selectedEl, selected ? squareLabel(selected) : '—');
        setText(winnerEl, winner ? (winner === 'w' ? 'White' : 'Black') : '—');
    }

    // Retourne les directions de déplacement autorisées selon le type de pièce (dame ou pion).
    function dirsFor(piece) {
        if (piece.k) return [-1, 1];
        return piece.c === 'w' ? [-1] : [1];
    }

    // Récupère la pièce à une position donnée (ou null si hors plateau/vide).
    function pieceAt(r, c) {
        if (!inBounds(r, c)) return null;
        return board[r][c];
    }

    // Indique si un joueur a au moins une capture possible (utile pour rendre la capture obligatoire).
    function anyCaptureFor(color) {
        for (let r = 0; r < SIZE; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                const p = pieceAt(r, c);
                if (!p || p.c !== color) continue;
                const caps = captureMovesFrom(r, c);
                if (caps.length) return true;
            }
        }
        return false;
    }

    // Calcule toutes les captures possibles depuis une case donnée.
    function captureMovesFrom(r, c) {
        const p = pieceAt(r, c);
        if (!p) return [];
        const out = [];
        const dirs = dirsFor(p);
        for (const dr of dirs) {
            for (const dc of [-1, 1]) {
                const r1 = r + dr;
                const c1 = c + dc;
                const r2 = r + dr * 2;
                const c2 = c + dc * 2;
                if (!inBounds(r2, c2)) continue;
                const mid = pieceAt(r1, c1);
                const dest = pieceAt(r2, c2);
                if (mid && mid.c !== p.c && !dest) {
                    out.push({
                        from: { r, c },
                        to: { r: r2, c: c2 },
                        capture: { r: r1, c: c1 },
                    });
                }
            }
        }
        return out;
    }

    // Calcule les déplacements simples (sans capture) depuis une case donnée.
    function quietMovesFrom(r, c) {
        const p = pieceAt(r, c);
        if (!p) return [];
        const out = [];
        const dirs = dirsFor(p);
        for (const dr of dirs) {
            for (const dc of [-1, 1]) {
                const r1 = r + dr;
                const c1 = c + dc;
                if (!inBounds(r1, c1)) continue;
                if (!pieceAt(r1, c1)) {
                    out.push({ from: { r, c }, to: { r: r1, c: c1 }, capture: null });
                }
            }
        }
        return out;
    }

    // Retourne les coups légaux depuis une case, en appliquant les règles (tour, capture obligatoire, multi-saut).
    function legalMovesFrom(r, c) {
        const p = pieceAt(r, c);
        if (!p || p.c !== turn) return [];
        if (winner) return [];

        // If continuing multi-jump, only that piece can move and only captures
        if (forcedFrom) {
            if (forcedFrom.r !== r || forcedFrom.c !== c) return [];
            return captureMovesFrom(r, c);
        }

        const mustCapture = anyCaptureFor(turn);
        const caps = captureMovesFrom(r, c);
        if (mustCapture) return caps;
        return caps.concat(quietMovesFrom(r, c));
    }

    function computeRuleText() {
        if (winner) {
            setText(ruleEl, 'Game over');
            return;
        }
        if (forcedFrom) {
            setText(ruleEl, 'Multi-jump: must continue capture');
            return;
        }
        const mustCapture = anyCaptureFor(turn);
        setText(ruleEl, mustCapture ? 'Capture is mandatory' : 'Normal moves');
    }

    function applyMove(m) {
        const next = cloneBoard(board);
        const p = next[m.from.r][m.from.c];
        next[m.from.r][m.from.c] = null;
        next[m.to.r][m.to.c] = p;
        if (m.capture) next[m.capture.r][m.capture.c] = null;

        // kinging
        if (p && !p.k) {
            if (p.c === 'w' && m.to.r === 0) p.k = true;
            if (p.c === 'b' && m.to.r === SIZE - 1) p.k = true;
        }

        board = next;
    }

    function countPieces(color) {
        let n = 0;
        for (let r = 0; r < SIZE; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                const p = pieceAt(r, c);
                if (p && p.c === color) n += 1;
            }
        }
        return n;
    }

    function hasAnyMove(color) {
        const prevTurn = turn;
        turn = color;
        const prevForced = forcedFrom;
        forcedFrom = null;
        try {
            for (let r = 0; r < SIZE; r += 1) {
                for (let c = 0; c < SIZE; c += 1) {
                    const p = pieceAt(r, c);
                    if (!p || p.c !== color) continue;
                    if (legalMovesFrom(r, c).length) return true;
                }
            }
            return false;
        } finally {
            turn = prevTurn;
            forcedFrom = prevForced;
        }
    }

    function checkWinner() {
        const w = countPieces('w');
        const b = countPieces('b');
        if (w === 0) return 'b';
        if (b === 0) return 'w';

        // stalemate (no moves)
        if (!hasAnyMove('w')) return 'b';
        if (!hasAnyMove('b')) return 'w';
        return '';
    }

    function clearHighlights() {
        if (!boardEl) return;
        const cells = boardEl.querySelectorAll('[data-r][data-c]');
        cells.forEach((el) => {
            el.setAttribute('data-selected', 'false');
            el.setAttribute('data-move', 'false');
            el.setAttribute('data-capture', 'false');
        });
    }

    function markHighlights() {
        if (!boardEl) return;
        clearHighlights();
        if (selected) {
            const sel = boardEl.querySelector(`[data-r="${selected.r}"][data-c="${selected.c}"]`);
            if (sel) sel.setAttribute('data-selected', 'true');
        }
        moves.forEach((m) => {
            const el = boardEl.querySelector(`[data-r="${m.to.r}"][data-c="${m.to.c}"]`);
            if (!el) return;
            if (m.capture) el.setAttribute('data-capture', 'true');
            else el.setAttribute('data-move', 'true');
        });
    }

    function pieceHtml(p) {
        if (!p) return '';
        const cls = p.c === 'w' ? 'white' : 'black';
        const k = p.k ? ' king' : '';
        const crown = p.k ? 'K' : '';
        return `<div class="ck-piece ${cls}${k}">${crown}</div>`;
    }

    function render() {
        if (!boardEl) return;
        boardEl.innerHTML = '';

        for (let r = 0; r < SIZE; r += 1) {
            for (let c = 0; c < SIZE; c += 1) {
                const isLight = !isDarkSquare(r, c);
                const bg = isLight ? 'bg-white' : 'bg-brand-beige';
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `ck-square border border-brand-line/80 ${bg} transition-transform duration-150 hover:scale-[1.02]`;
                btn.setAttribute('data-r', String(r));
                btn.setAttribute('data-c', String(c));
                const p = pieceAt(r, c);
                if (p) btn.innerHTML = pieceHtml(p);
                boardEl.appendChild(btn);
            }
        }

        setTurnText();
        setStatusText();
        computeRuleText();
        markHighlights();
    }

    function resetGame() {
        board = initBoard();
        turn = 'w';
        selected = null;
        moves = [];
        forcedFrom = null;
        winner = '';
        render();
    }

    if (boardEl) {
        boardEl.addEventListener('click', (e) => {
            const t = e.target && e.target.closest ? e.target.closest('[data-r][data-c]') : null;
            if (!t) return;

            const r = Number(t.getAttribute('data-r'));
            const c = Number(t.getAttribute('data-c'));
            if (Number.isNaN(r) || Number.isNaN(c)) return;

            if (winner) return;

            const clicked = { r, c };
            const p = pieceAt(r, c);

            // If clicking a destination while selected
            if (selected) {
                const chosen = moves.find((m) => m.to.r === r && m.to.c === c);
                if (chosen) {
                    applyMove(chosen);

                    // If capture, check for multi-jump continuation
                    if (chosen.capture) {
                        forcedFrom = { r: chosen.to.r, c: chosen.to.c };
                        const moreCaps = captureMovesFrom(forcedFrom.r, forcedFrom.c);
                        if (moreCaps.length) {
                            selected = forcedFrom;
                            moves = moreCaps;
                            winner = checkWinner();
                            render();
                            return;
                        }
                        forcedFrom = null;
                    }

                    // turn changes
                    turn = turn === 'w' ? 'b' : 'w';
                    selected = null;
                    moves = [];
                    winner = checkWinner();
                    render();
                    return;
                }
            }

            // Select a piece
            if (p && p.c === turn) {
                if (forcedFrom && (forcedFrom.r !== r || forcedFrom.c !== c)) return;
                selected = clicked;
                moves = legalMovesFrom(r, c);
                render();
                return;
            }

            // otherwise clear
            selected = null;
            moves = [];
            render();
        });
    }

    if (newBtn) {
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetGame();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playResetFx(() => {
                resetGame();
            });
        });
    }

    resetGame();
})();

