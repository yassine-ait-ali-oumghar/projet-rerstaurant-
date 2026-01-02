// Mini-games page script (mini-games.html)
// - Access gate: requires login + an order or reservation
// - Tracks game stats (wins/losses) in localStorage
// - Implements multiple games (RPS, TicTacToe, Snake, etc.)
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
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-40%)' },
                    '100%': { transform: 'translateX(140%)' },
                },
            },
            animation: {
                shimmer: 'shimmer 1.6s ease-in-out infinite',
            },
        },
    },
};
(function () {
            const USERS_KEY = 'dt_users';
            const SESSION_KEY = 'dt_session';
            const STATS_PREFIX = 'dt_game_stats_';

            function byId(id) {
                return document.getElementById(id);
            }

            function safeJsonParse(v) {
                try { return JSON.parse(v); } catch { return null; }
            }

            function loadSession() {
                const raw = localStorage.getItem(SESSION_KEY);
                const session = safeJsonParse(raw);
                if (!session || !session.email) return null;
                return session;
            }

            function statsKey() {
                const s = loadSession();
                const email = s ? String(s.email || '').toLowerCase() : '';
                return STATS_PREFIX + email;
            }

            function defaultStats() {
                return {
                    rps: { win: 0, loss: 0 },
                    ttt: { win: 0, loss: 0 },
                    snake: { win: 0, loss: 0 },
                    checkers: { win: 0, loss: 0 },
                    chess: { win: 0, loss: 0 },
                };
            }

            function loadStats() {
                const s = loadSession();
                if (!s) return null;
                const raw = localStorage.getItem(statsKey());
                const st = safeJsonParse(raw);
                const base = defaultStats();
                if (!st || typeof st !== 'object') return base;
                for (const k of Object.keys(base)) {
                    const v = st[k];
                    if (v && typeof v === 'object') {
                        base[k].win = Number(v.win || 0) || 0;
                        base[k].loss = Number(v.loss || 0) || 0;
                    }
                }
                return base;
            }

            function saveStats(st) {
                const s = loadSession();
                if (!s) return;
                localStorage.setItem(statsKey(), JSON.stringify(st || defaultStats()));
            }

            function incStat(game, field) {
                const st = loadStats();
                if (!st) return;
                const g = String(game || '');
                const f = String(field || '');
                if (!st[g]) st[g] = { win: 0, loss: 0 };
                if (f !== 'win' && f !== 'loss') return;
                st[g][f] = (Number(st[g][f]) || 0) + 1;
                saveStats(st);
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

            function loadUsers() {
                const raw = localStorage.getItem(USERS_KEY);
                const users = safeJsonParse(raw);
                return Array.isArray(users) ? users : [];
            }

            function renderAuthStub() {
                const session = loadSession();
                const txt = byId('authStubText');
                const av = byId('authStubAvatar');
                if (!txt || !av) return;
                if (!session) {
                    txt.textContent = 'Guest';
                    av.textContent = '?';
                    av.style.backgroundImage = '';
                    return;
                }
                const email = String(session.email || '');
                const users = loadUsers();
                const u = users.find((x) => (x.email || '').toLowerCase() === email.toLowerCase()) || { email };
                const name = String(u.name || email);
                txt.textContent = name;
                const initials = name.trim().slice(0, 2).toUpperCase() || 'DT';
                av.textContent = initials;
                const avatar = String(u.avatar || '').trim();
                if (avatar) {
                    av.textContent = '';
                    av.style.backgroundImage = `url(${avatar})`;
                    av.style.backgroundSize = 'cover';
                    av.style.backgroundPosition = 'center';
                } else {
                    av.style.backgroundImage = '';
                }
            }

            renderAuthStub();
            window.addEventListener('storage', () => {
                renderAuthStub();
            });

            const rpsYou = byId('rpsYou');
            const rpsBot = byId('rpsBot');
            const rpsResult = byId('rpsResult');
            const rpsScoreYou = byId('rpsScoreYou');
            const rpsScoreBot = byId('rpsScoreBot');
            const rpsScoreDraw = byId('rpsScoreDraw');
            const rpsReset = byId('rpsReset');

            const resetFx = byId('resetFx');
            let resetBusy = false;

            function playResetFx(done) {
                if (resetBusy) return;
                resetBusy = true;

                if (resetFx) {
                    resetFx.classList.remove('is-on');
                    void resetFx.offsetWidth;
                    resetFx.classList.add('is-on');
                }

                window.setTimeout(() => {
                    try { if (typeof done === 'function') done(); } finally {
                        window.setTimeout(() => {
                            if (resetFx) resetFx.classList.remove('is-on');
                            resetBusy = false;
                        }, 80);
                    }
                }, 760);
            }

            const rpsState = { you: 0, bot: 0, draw: 0 };
            const rpsChoices = ['rock', 'paper', 'scissors'];

            function rpsLabel(v) {
                if (v === 'rock') return 'Pierre';
                if (v === 'paper') return 'Feuille';
                if (v === 'scissors') return 'Ciseaux';
                return '—';
            }

            function rpsCompare(a, b) {
                if (a === b) return 'draw';
                if (a === 'rock' && b === 'scissors') return 'win';
                if (a === 'paper' && b === 'rock') return 'win';
                if (a === 'scissors' && b === 'paper') return 'win';
                return 'lose';
            }

            function renderRpsScore() {
                if (rpsScoreYou) rpsScoreYou.textContent = String(rpsState.you);
                if (rpsScoreBot) rpsScoreBot.textContent = String(rpsState.bot);
                if (rpsScoreDraw) rpsScoreDraw.textContent = String(rpsState.draw);
            }

            function playRps(pick) {
                const bot = rpsChoices[Math.floor(Math.random() * rpsChoices.length)];
                if (rpsYou) rpsYou.textContent = rpsLabel(pick);
                if (rpsBot) rpsBot.textContent = rpsLabel(bot);
                const res = rpsCompare(pick, bot);
                if (res === 'win') {
                    rpsState.you += 1;
                    if (rpsResult) rpsResult.textContent = 'You win';
                    incStat('rps', 'win');
                } else if (res === 'lose') {
                    rpsState.bot += 1;
                    if (rpsResult) rpsResult.textContent = 'Robot wins';
                    incStat('rps', 'loss');
                } else {
                    rpsState.draw += 1;
                    if (rpsResult) rpsResult.textContent = 'Draw';
                }
                renderRpsScore();
            }

            function onRpsClick(e) {
                const t = e && e.target;
                if (!t || !t.closest) return;
                const btn = t.closest('[data-rps]');
                if (!btn) return;
                e.preventDefault();
                playRps(String(btn.getAttribute('data-rps') || ''));
            }
            document.addEventListener('click', onRpsClick);

            if (rpsReset) {
                rpsReset.addEventListener('click', (e) => {
                    e.preventDefault();
                    playResetFx(() => {
                        rpsState.you = 0;
                        rpsState.bot = 0;
                        rpsState.draw = 0;
                        if (rpsYou) rpsYou.textContent = 'â€”';
                        if (rpsBot) rpsBot.textContent = 'â€”';
                        if (rpsResult) rpsResult.textContent = 'â€”';
                        renderRpsScore();
                    });
                });
            }

            renderRpsScore();

            const tttModeSolo = byId('tttModeSolo');
            const tttModeTwo = byId('tttModeTwo');
            const tttTwoPlayerPanel = byId('tttTwoPlayerPanel');
            const tttOpponent = byId('tttOpponent');
            const tttStartMatch = byId('tttStartMatch');
            const tttMatchId = byId('tttMatchId');
            const tttYouSymbol = byId('tttYouSymbol');
            const tttTurn = byId('tttTurn');
            const tttStatus = byId('tttStatus');
            const tttReset = byId('tttReset');

            const TTT_SOLO_KEY = 'dt_ttt_solo';

            let tttMode = 'solo';
            let tttMatchKey = null;
            let tttPoll = null;
            let tttLastRecordedWinner = null;

            function tttDefaultState() {
                return { board: Array(9).fill(''), turn: 'X', winner: '', updatedAt: Date.now() };
            }

            function tttTwoState(players) {
                return { board: Array(9).fill(''), turn: 'X', winner: '', players, updatedAt: Date.now() };
            }

            function tttWinner(board) {
                const lines = [
                    [0,1,2],[3,4,5],[6,7,8],
                    [0,3,6],[1,4,7],[2,5,8],
                    [0,4,8],[2,4,6],
                ];
                for (const [a,b,c] of lines) {
                    const v = board[a];
                    if (v && v === board[b] && v === board[c]) return v;
                }
                if (board.every((x) => x)) return 'draw';
                return '';
            }

            function tttLoad(key) {
                const raw = localStorage.getItem(key);
                const st = safeJsonParse(raw);
                return st && Array.isArray(st.board) && st.board.length === 9 ? st : tttDefaultState();
            }

            function tttSave(key, st) {
                localStorage.setItem(key, JSON.stringify({ ...st, updatedAt: Date.now() }));
            }

            function tttRender(st) {
                const cells = Array.from(document.querySelectorAll('.tttCell'));
                for (const c of cells) {
                    const i = Number(c.getAttribute('data-ttt'));
                    c.textContent = st.board[i] || '';
                    c.disabled = !!st.winner || !!st.board[i];
                    c.classList.toggle('opacity-60', !!st.winner);
                }
                if (tttTurn) tttTurn.textContent = st.winner ? 'â€”' : st.turn;

                if (tttStatus) {
                    if (st.winner === 'X') tttStatus.textContent = 'X wins';
                    else if (st.winner === 'O') tttStatus.textContent = 'O wins';
                    else if (st.winner === 'draw') tttStatus.textContent = 'Draw';
                    else tttStatus.textContent = 'Playing';
                }
            }

            function setMode(next) {
                tttMode = next;
                tttLastRecordedWinner = null;
                if (tttPoll) {
                    clearInterval(tttPoll);
                    tttPoll = null;
                }
                if (tttMode === 'solo') {
                    tttMatchKey = TTT_SOLO_KEY;
                    if (tttTwoPlayerPanel) tttTwoPlayerPanel.classList.add('auth-hidden');
                    if (tttMatchId) tttMatchId.textContent = 'â€”';
                    if (tttYouSymbol) tttYouSymbol.textContent = 'X';
                    const st = tttLoad(tttMatchKey);
                    tttRender(st);
                    return;
                }

                if (tttTwoPlayerPanel) tttTwoPlayerPanel.classList.remove('auth-hidden');
                if (tttYouSymbol) tttYouSymbol.textContent = 'â€”';
                if (tttMatchId) tttMatchId.textContent = 'â€”';
                tttMatchKey = null;
            }

            function populateOpponents() {
                if (!tttOpponent) return;
                const session = loadSession();
                const users = loadUsers();
                const me = session ? String(session.email || '').toLowerCase() : '';
                const options = users
                    .filter((u) => u && u.email)
                    .map((u) => ({ email: String(u.email || '').toLowerCase(), label: String(u.name || u.email || '').trim() || String(u.email || '') }))
                    .filter((u) => u.email && u.email !== me);

                tttOpponent.innerHTML = options.length
                    ? options.map((u) => `<option value="${u.email}">${u.label}</option>`).join('')
                    : '<option value="">No users available</option>';
            }

            function tttSharedKey(a, b) {
                const p1 = String(a || '').toLowerCase();
                const p2 = String(b || '').toLowerCase();
                const pair = [p1, p2].sort();
                return `dt_ttt_match_${pair[0]}__${pair[1]}`;
            }

            function tttDetermineSymbol(sessionEmail, state) {
                if (!state || !Array.isArray(state.players)) return '';
                const me = String(sessionEmail || '').toLowerCase();
                const xEmail = String(state.players[0] || '').toLowerCase();
                const oEmail = String(state.players[1] || '').toLowerCase();
                if (me === xEmail) return 'X';
                if (me === oEmail) return 'O';
                return '';
            }

            function openTwoPlayerMatch() {
                const session = loadSession();
                if (!session) {
                    alert('Please login on the main page first to use 2-player mode.');
                    return;
                }
                if (!tttOpponent) return;
                const opp = String(tttOpponent.value || '').toLowerCase();
                if (!opp) return;

                const me = String(session.email || '').toLowerCase();
                const key = tttSharedKey(me, opp);
                const existing = safeJsonParse(localStorage.getItem(key));

                let state = null;
                if (existing && Array.isArray(existing.board) && existing.board.length === 9 && Array.isArray(existing.players) && existing.players.length === 2) {
                    state = existing;
                } else {
                    const players = [me, opp];
                    state = tttTwoState(players);
                    localStorage.setItem(key, JSON.stringify(state));
                }

                tttMatchKey = key;
                if (tttMatchId) tttMatchId.textContent = key;
                const symbol = tttDetermineSymbol(me, state);
                if (tttYouSymbol) tttYouSymbol.textContent = symbol || 'â€”';
                tttRender(state);

                tttPoll = setInterval(() => {
                    if (!tttMatchKey) return;
                    const st = tttLoad(tttMatchKey);
                    tttRender(st);
                }, 500);
            }

            function soloBotMove(state) {
                const empties = state.board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
                if (!empties.length) return state;
                const pick = empties[Math.floor(Math.random() * empties.length)];
                state.board[pick] = 'O';
                const w = tttWinner(state.board);
                if (w) state.winner = w;
                state.turn = 'X';
                return state;
            }

            function onTttCellClick(e) {
                const t = e && e.target;
                if (!t || !t.closest) return;
                const cell = t.closest('[data-ttt]');
                if (!cell) return;
                e.preventDefault();

                const i = Number(cell.getAttribute('data-ttt'));
                if (Number.isNaN(i) || i < 0 || i > 8) return;

                if (!tttMatchKey) {
                    if (tttMode === 'two') return;
                    tttMatchKey = TTT_SOLO_KEY;
                }

                const st = tttLoad(tttMatchKey);
                if (st.winner) return;
                if (st.board[i]) return;

                if (tttMode === 'solo') {
                    if (st.turn !== 'X') return;
                    st.board[i] = 'X';

                    let w = tttWinner(st.board);
                    if (w) {
                        st.winner = w;
                        tttSave(tttMatchKey, st);
                        tttRender(st);
                        if (tttLastRecordedWinner !== w) {
                            if (w === 'X') incStat('ttt', 'win');
                            else if (w === 'O') incStat('ttt', 'loss');
                            tttLastRecordedWinner = w;
                        }
                        return;
                    }

                    st.turn = 'O';
                    soloBotMove(st);
                    w = tttWinner(st.board);
                    if (w) st.winner = w;
                    tttSave(tttMatchKey, st);
                    tttRender(st);
                    if (w && tttLastRecordedWinner !== w) {
                        if (w === 'X') incStat('ttt', 'win');
                        else if (w === 'O') incStat('ttt', 'loss');
                        tttLastRecordedWinner = w;
                    }
                    return;
                }

                if (tttMode === 'two') {
                    const session = loadSession();
                    if (!session) return;
                    const me = String(session.email || '').toLowerCase();
                    const symbol = tttDetermineSymbol(me, st);
                    if (!symbol) return;
                    if (st.turn !== symbol) return;

                    st.board[i] = symbol;
                    const w = tttWinner(st.board);
                    if (w) st.winner = w;
                    else st.turn = symbol === 'X' ? 'O' : 'X';

                    tttSave(tttMatchKey, st);
                    tttRender(st);
                    return;
                }
            }
            document.addEventListener('click', onTttCellClick);

            if (tttModeSolo) {
                tttModeSolo.addEventListener('click', (e) => {
                    e.preventDefault();
                    setMode('solo');
                    populateOpponents();
                });
            }

            if (tttModeTwo) {
                tttModeTwo.addEventListener('click', (e) => {
                    e.preventDefault();
                    setMode('two');
                    populateOpponents();
                });
            }

            if (tttStartMatch) {
                tttStartMatch.addEventListener('click', (e) => {
                    e.preventDefault();
                    openTwoPlayerMatch();
                });
            }

            if (tttReset) {
                tttReset.addEventListener('click', (e) => {
                    e.preventDefault();
                    playResetFx(() => {
                        if (tttMode === 'two') {
                            if (!tttMatchKey) return;
                            const st = tttLoad(tttMatchKey);
                            const players = Array.isArray(st.players) ? st.players : null;
                            const next = players ? tttTwoState(players) : tttDefaultState();
                            tttSave(tttMatchKey, next);
                            tttRender(next);
                            return;
                        }
                        const next = tttDefaultState();
                        tttSave(TTT_SOLO_KEY, next);
                        tttRender(next);
                    });
                });
            }

            const snakeCanvas = byId('snakeCanvas');
            const snakeLevel = byId('snakeLevel');
            const snakeStart = byId('snakeStart');
            const snakeReset = byId('snakeReset');
            const snakeScore = byId('snakeScore');
            const snakeStatus = byId('snakeStatus');
            const snakeCubes = byId('snakeCubes');

            const SNAKE_GRID = 18;
            const SNAKE_CELL = 20;
            const SNAKE_CUBES_MAX = 30;
            const snakeSpeeds = { easy: 180, medium: 120, hard: 85, extreme: 55 };

            let snakeInterval = null;
            let snakeRunning = false;
            let snakeKeyboardActive = false;
            let snakeResultRecorded = false;
            let snakeDir = 'right';
            let snakeNextDir = 'right';
            let snakeBody = [];
            let snakeApple = { x: 8, y: 8 };
            let snakeEaten = 0;

            function snakeSetStatus(text) {
                if (snakeStatus) snakeStatus.textContent = text;
            }

            function snakeSetScore(n) {
                if (snakeScore) snakeScore.textContent = String(n);
            }

            function snakeFillCubes(count) {
                if (!snakeCubes) return;
                const n = Math.max(0, Math.min(SNAKE_CUBES_MAX, Number(count) || 0));
                snakeCubes.innerHTML = Array.from({ length: SNAKE_CUBES_MAX }).map((_, i) => {
                    const filled = i < n;
                    return `<div class="h-6 w-6 border border-brand-line/80 ${filled ? 'bg-brand-accent' : 'bg-white'}"></div>`;
                }).join('');
            }

            function snakeRandomCell() {
                return {
                    x: Math.floor(Math.random() * SNAKE_GRID),
                    y: Math.floor(Math.random() * SNAKE_GRID),
                };
            }

            function snakeIsOnBody(pt, body) {
                return (body || []).some((b) => b.x === pt.x && b.y === pt.y);
            }

            function snakeSpawnApple() {
                let pt = snakeRandomCell();
                let guard = 0;
                while (snakeIsOnBody(pt, snakeBody) && guard < 200) {
                    pt = snakeRandomCell();
                    guard += 1;
                }
                snakeApple = pt;
            }

            function snakeResetState() {
                snakeRunning = false;
                snakeKeyboardActive = false;
                snakeResultRecorded = false;
                snakeDir = 'right';
                snakeNextDir = 'right';
                snakeBody = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }];
                snakeEaten = 0;
                snakeSpawnApple();
                snakeSetScore(0);
                snakeFillCubes(0);
                snakeSetStatus('Ready');
            }

            function snakeStop() {
                if (snakeInterval) {
                    clearInterval(snakeInterval);
                    snakeInterval = null;
                }
                snakeRunning = false;
                snakeKeyboardActive = false;
            }

            function snakeStartLoop() {
                snakeStop();
                const lvl = snakeLevel ? String(snakeLevel.value || 'easy') : 'easy';
                const ms = snakeSpeeds[lvl] || snakeSpeeds.easy;
                snakeRunning = true;
                snakeKeyboardActive = true;
                snakeResultRecorded = false;
                snakeSetStatus('Playing');
                snakeInterval = setInterval(() => {
                    snakeTick();
                }, ms);
            }

            function snakeSetDir(next) {
                const n = String(next || '');
                const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
                if (!['up', 'down', 'left', 'right'].includes(n)) return;
                if (opposites[n] === snakeDir) return;
                snakeNextDir = n;
            }

            function snakeDraw() {
                if (!snakeCanvas) return;
                const ctx = snakeCanvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

                ctx.fillStyle = 'rgba(250,248,243,1)';
                ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

                ctx.strokeStyle = 'rgba(212,196,168,0.65)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= SNAKE_GRID; i += 1) {
                    const p = i * SNAKE_CELL;
                    ctx.beginPath();
                    ctx.moveTo(p, 0);
                    ctx.lineTo(p, SNAKE_GRID * SNAKE_CELL);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, p);
                    ctx.lineTo(SNAKE_GRID * SNAKE_CELL, p);
                    ctx.stroke();
                }

                ctx.fillStyle = 'rgba(212,175,55,0.95)';
                ctx.fillRect(snakeApple.x * SNAKE_CELL + 2, snakeApple.y * SNAKE_CELL + 2, SNAKE_CELL - 4, SNAKE_CELL - 4);

                for (let i = 0; i < snakeBody.length; i += 1) {
                    const seg = snakeBody[i];
                    const isHead = i === 0;
                    ctx.fillStyle = isHead ? 'rgba(107,78,15,0.96)' : 'rgba(139,105,20,0.86)';
                    ctx.fillRect(seg.x * SNAKE_CELL + 2, seg.y * SNAKE_CELL + 2, SNAKE_CELL - 4, SNAKE_CELL - 4);
                }
            }

            function snakeTick() {
                if (!snakeRunning) return;
                snakeDir = snakeNextDir;
                const head = snakeBody[0];
                const next = { x: head.x, y: head.y };
                if (snakeDir === 'up') next.y -= 1;
                if (snakeDir === 'down') next.y += 1;
                if (snakeDir === 'left') next.x -= 1;
                if (snakeDir === 'right') next.x += 1;

                if (next.x < 0 || next.y < 0 || next.x >= SNAKE_GRID || next.y >= SNAKE_GRID) {
                    if (!snakeResultRecorded) {
                        incStat('snake', 'loss');
                        snakeResultRecorded = true;
                    }
                    snakeStop();
                    snakeSetStatus('Game over');
                    snakeDraw();
                    return;
                }

                const tail = snakeBody[snakeBody.length - 1];
                const willEat = next.x === snakeApple.x && next.y === snakeApple.y;
                const hitBody = snakeBody.some((b) => {
                    const isCollision = b.x === next.x && b.y === next.y;
                    if (!isCollision) return false;
                    const isTailCell = tail.x === next.x && tail.y === next.y;
                    return willEat ? true : !isTailCell;
                });

                if (hitBody) {
                    if (!snakeResultRecorded) {
                        incStat('snake', 'loss');
                        snakeResultRecorded = true;
                    }
                    snakeStop();
                    snakeSetStatus('Game over');
                    snakeDraw();
                    return;
                }

                snakeBody.unshift(next);

                if (next.x === snakeApple.x && next.y === snakeApple.y) {
                    snakeEaten += 1;
                    snakeSetScore(snakeEaten);
                    snakeFillCubes(snakeEaten);
                    snakeSpawnApple();
                } else {
                    snakeBody.pop();
                }

                snakeDraw();
            }

            if (snakeLevel) {
                snakeLevel.addEventListener('change', () => {
                    if (!snakeRunning) return;
                    snakeStartLoop();
                });
            }

            if (snakeStart) {
                snakeStart.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (snakeRunning) return;
                    snakeStartLoop();
                });
            }

            if (snakeReset) {
                snakeReset.addEventListener('click', (e) => {
                    e.preventDefault();
                    playResetFx(() => {
                        snakeStop();
                        snakeResetState();
                        snakeDraw();
                    });
                });
            }

            function onSnakeDirClick(e) {
                const t = e && e.target;
                if (!t || !t.closest) return;
                const btn = t.closest('[data-snake-dir]');
                if (!btn) return;
                e.preventDefault();
                snakeSetDir(String(btn.getAttribute('data-snake-dir') || ''));
            }
            document.addEventListener('click', onSnakeDirClick);

            window.addEventListener('keydown', (e) => {
                if (!e) return;
                const k = String(e.key || '');
                const code = typeof e.keyCode === 'number' ? e.keyCode : -1;

                const isArrow = k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight'
                    || code === 38 || code === 40 || code === 37 || code === 39;
                if (!isArrow) return;

                if (snakeKeyboardActive) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if (!snakeKeyboardActive) return;
                if (k === 'ArrowUp' || code === 38) snakeSetDir('up');
                if (k === 'ArrowDown' || code === 40) snakeSetDir('down');
                if (k === 'ArrowLeft' || code === 37) snakeSetDir('left');
                if (k === 'ArrowRight' || code === 39) snakeSetDir('right');
            }, true);

            snakeResetState();
            snakeDraw();

            setMode('solo');
            populateOpponents();
        })();