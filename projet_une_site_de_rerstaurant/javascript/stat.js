(function(){
  // Stats page script (stat.html)
  // - Reads per-user game stats (wins/losses)
  // - Shows Chart.js graphs + table
  // - Lets the user rate products they ordered
  // - Auto-refreshes when localStorage changes
  const SESSION_KEY = 'dt_session';
  const ADMIN_SESSION_KEY = 'dt_admin_session';
  const USERS_KEY = 'dt_users';
  const THEME_KEY = 'dt_theme';

  // DOM nodes (charts + KPIs)
  const chartEl = document.getElementById('statsChart');
  const ratingsChartEl = document.getElementById('ratingsChart');
  const tableEl = document.getElementById('statsTable');
  const userNameEl = document.getElementById('statUserName');
  const logoutBtn = document.getElementById('statLogoutBtn');
  const lastUpdateEl = document.getElementById('statLastUpdate');
  const kpiWinsEl = document.getElementById('kpiWins');
  const kpiLossesEl = document.getElementById('kpiLosses');
  const themeToggleBtn = document.getElementById('themeToggle');

  const ratingProductEl = document.getElementById('ratingProduct');
  const ratingValueEl = document.getElementById('ratingValue');

  // Theme helpers (dark/light)
  function applyTheme(theme){
    const t = String(theme || '').toLowerCase();
    const dark = t === 'dark';
    document.body.classList.toggle('dark-mode', dark);
    if (themeToggleBtn) themeToggleBtn.textContent = dark ? 'Light' : 'Dark';
  }

  function loadTheme(){
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function toggleTheme(){
    const cur = loadTheme();
    const next = String(cur).toLowerCase() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  window.dtToggleTheme = toggleTheme;

  // Safe JSON parse (returns null on invalid JSON)
  function safeJsonParse(v){
    try { return JSON.parse(v); } catch { return null; }
  }

  function loadSession(){
    const raw = localStorage.getItem(SESSION_KEY);
    const s = safeJsonParse(raw);
    if(!s || !s.email) return null;
    return s;
  }

  // Guard: redirect to home if user is not logged in.
  function requireLogin(){
    const s = loadSession();
    if(s) return s;
    window.location.href = 'html.html';
    return null;
  }

  function loadUsers(){
    const raw = localStorage.getItem(USERS_KEY);
    const users = safeJsonParse(raw);
    return Array.isArray(users) ? users : [];
  }

  // Resolve displayed name from dt_users; fallback to email.
  function getDisplayName(session){
    const email = String(session && session.email || '').trim();
    if(!email) return 'Utilisateur';
    const users = loadUsers();
    const u = users.find(x => x && String(x.email||'').toLowerCase() === email.toLowerCase());
    return String((u && u.name) || email);
  }

  function statsKey(email){
    return 'dt_game_stats_' + String(email||'').toLowerCase();
  }

  function ordersKey(email){
    return 'dt_orders_' + String(email||'').toLowerCase();
  }

  function ratingsKey(email){
    return 'dt_product_ratings_' + String(email||'').toLowerCase();
  }

  // Base structure for game stats (used to sanitize stored data)
  function defaultStats(){
    return {
      rps: { win: 0, loss: 0 },
      ttt: { win: 0, loss: 0 },
      snake: { win: 0, loss: 0 },
      checkers: { win: 0, loss: 0 },
      chess: { win: 0, loss: 0 },
    };
  }

  function loadStats(email){
    const raw = localStorage.getItem(statsKey(email));
    const st = safeJsonParse(raw);
    const base = defaultStats();
    if(!st || typeof st !== 'object') return base;
    for(const k of Object.keys(base)){
      const v = st[k];
      if(v && typeof v === 'object'){
        base[k].win = Number(v.win||0) || 0;
        base[k].loss = Number(v.loss||0) || 0;
      }
    }
    return base;
  }

  function nowLabel(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return hh + ':' + mm + ':' + ss;
  }

  function gameLabel(k){
    if(k==='rps') return 'Rock Paper Scissors';
    if(k==='ttt') return 'Tic Tac Toe';
    if(k==='snake') return 'Snake';
    if(k==='checkers') return 'Checkers';
    if(k==='chess') return 'Chess';
    return k;
  }

  let chart = null;
  let ratingsChart = null;

  // Lazily create the main wins/losses bar chart.
  function ensureChart(){
    if(!chartEl) return null;
    if(chart) return chart;

    const ctx = chartEl.getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          { label: 'Wins', data: [], backgroundColor: 'rgba(34,197,94,0.70)', borderColor: 'rgba(34,197,94,1)', borderWidth: 2, borderRadius: 10 },
          { label: 'Losses', data: [], backgroundColor: 'rgba(239,68,68,0.60)', borderColor: 'rgba(239,68,68,1)', borderWidth: 2, borderRadius: 10 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 650, easing: 'easeOutQuart' },
        plugins: {
          legend: { labels: { color: 'rgba(61,47,10,0.85)' } },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: 'rgba(212,196,168,0.8)',
            borderWidth: 1,
            titleColor: 'rgba(61,47,10,0.95)',
            bodyColor: 'rgba(61,47,10,0.85)'
          }
        },
        scales: {
          x: { ticks: { color: 'rgba(61,47,10,0.75)' }, grid: { color: 'rgba(212,196,168,0.45)' } },
          y: { beginAtZero: true, ticks: { color: 'rgba(61,47,10,0.75)', precision: 0 }, grid: { color: 'rgba(212,196,168,0.45)' } }
        }
      }
    });

    return chart;
  }

  // Lazily create the product ratings bar chart.
  function ensureRatingsChart(){
    if(!ratingsChartEl) return null;
    if(ratingsChart) return ratingsChart;

    const ctx = ratingsChartEl.getContext('2d');
    ratingsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Rating (1-5)',
            data: [],
            backgroundColor: 'rgba(245,158,11,0.55)',
            borderColor: 'rgba(245,158,11,1)',
            borderWidth: 2,
            borderRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 850, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: 'rgba(212,196,168,0.8)',
            borderWidth: 1,
            titleColor: 'rgba(61,47,10,0.95)',
            bodyColor: 'rgba(61,47,10,0.85)'
          }
        },
        scales: {
          x: { ticks: { color: 'rgba(61,47,10,0.75)' }, grid: { color: 'rgba(212,196,168,0.45)' } },
          y: {
            beginAtZero: true,
            suggestedMax: 5,
            ticks: { color: 'rgba(61,47,10,0.75)', precision: 0, stepSize: 1 },
            grid: { color: 'rgba(212,196,168,0.45)' }
          }
        }
      }
    });

    return ratingsChart;
  }

  function loadOrders(email){
    const raw = localStorage.getItem(ordersKey(email));
    const orders = safeJsonParse(raw);
    return Array.isArray(orders) ? orders : [];
  }

  // Extract unique product names from user's order history.
  function loadMyProductNames(email){
    const orders = loadOrders(email);
    const names = [];
    const seen = new Set();

    for(const o of orders){
      const items = o && Array.isArray(o.items) ? o.items : [];
      for(const it of items){
        const name = String((it && it.name) || '').trim();
        if(!name) continue;
        const key = name.toLowerCase();
        if(seen.has(key)) continue;
        seen.add(key);
        names.push(name);
      }
    }

    names.sort((a,b)=>a.localeCompare(b));
    return names;
  }

  function loadRatings(email){
    const raw = localStorage.getItem(ratingsKey(email));
    const data = safeJsonParse(raw);
    if(!data || typeof data !== 'object') return {};
    return data;
  }

  function saveRatings(email, ratings){
    localStorage.setItem(ratingsKey(email), JSON.stringify(ratings || {}));
  }

  function getRatingFor(ratings, productName){
    const key = String(productName || '').toLowerCase();
    const v = ratings && Object.prototype.hasOwnProperty.call(ratings, key) ? ratings[key] : null;
    const n = Number(v);
    if(!Number.isFinite(n)) return 0;
    if(n < 0) return 0;
    if(n > 5) return 5;
    return n;
  }

  // Save a (1..5) rating for one product.
  function setRating(email, productName, rating){
    const ratings = loadRatings(email);
    const key = String(productName || '').toLowerCase();
    const n = Number(rating);
    if(!key) return;
    if(!Number.isFinite(n) || n < 1 || n > 5) return;
    ratings[key] = n;
    saveRatings(email, ratings);
  }

  function renderRatingsUI(email){
    if(!ratingProductEl) return;
    const products = loadMyProductNames(email);

    ratingProductEl.innerHTML = products.length
      ? products.map(p => `<option value="${p.replace(/"/g,'&quot;')}">${p}</option>`).join('')
      : '<option value="">Aucun produit (fait une commande)</option>';

    if(!products.length){
      if(ratingValueEl) ratingValueEl.textContent = '—';
    }
  }

  function renderRatingsChart(email){
    const products = loadMyProductNames(email);
    const ratings = loadRatings(email);
    const rows = products.map(p => ({ name: p, rating: getRatingFor(ratings, p) }));

    const ch = ensureRatingsChart();
    if(ch){
      ch.data.labels = rows.map(r => r.name);
      ch.data.datasets[0].data = rows.map(r => r.rating);
      ch.update();
    }

    if(ratingProductEl && ratingValueEl){
      const selected = String(ratingProductEl.value || '').trim();
      if(!selected){
        ratingValueEl.textContent = '—';
      } else {
        ratingValueEl.textContent = String(getRatingFor(ratings, selected) || '—');
      }
    }
  }

  function bindRatingsEvents(email){
    if(ratingProductEl){
      ratingProductEl.addEventListener('change', () => {
        renderRatingsChart(email);
      });
    }

    document.addEventListener('click', (e) => {
      const t = e && e.target;
      if(!t || !t.getAttribute) return;
      const v = t.getAttribute('data-rate');
      if(!v) return;
      if(!ratingProductEl) return;

      const product = String(ratingProductEl.value || '').trim();
      if(!product) return;
      setRating(email, product, Number(v));
      renderRatingsChart(email);
    });
  }

  function renderTable(rows){
    if(!tableEl) return;
    tableEl.innerHTML = rows.map(r => {
      const win = Number(r.win||0);
      const loss = Number(r.loss||0);
      return `
<tr class="border-t border-brand-line/70">
  <td class="px-4 py-3 font-semibold text-brand-ink">${r.label}</td>
  <td class="px-4 py-3 text-green-700 font-semibold">${win}</td>
  <td class="px-4 py-3 text-red-700 font-semibold">${loss}</td>
</tr>`;
    }).join('');
  }

  // Main render pass: table + KPIs + charts.
  function refresh(){
    const session = requireLogin();
    if(!session) return;

    if(userNameEl) userNameEl.textContent = getDisplayName(session);

    const st = loadStats(session.email);
    const keys = Object.keys(st);

    const rows = keys.map(k => ({ key: k, label: gameLabel(k), win: st[k].win, loss: st[k].loss }));
    renderTable(rows);

    const winsTotal = rows.reduce((s,r)=>s+Number(r.win||0),0);
    const lossesTotal = rows.reduce((s,r)=>s+Number(r.loss||0),0);
    if(kpiWinsEl) kpiWinsEl.textContent = String(winsTotal);
    if(kpiLossesEl) kpiLossesEl.textContent = String(lossesTotal);

    const ch = ensureChart();
    if(ch){
      ch.data.labels = rows.map(r => r.label);
      ch.data.datasets[0].data = rows.map(r => Number(r.win||0));
      ch.data.datasets[1].data = rows.map(r => Number(r.loss||0));
      ch.update();
    }

    if(lastUpdateEl) lastUpdateEl.textContent = 'Maj: ' + nowLabel();

    renderRatingsUI(session.email);
    renderRatingsChart(session.email);
  }

  // Logout: clear session and return to home page.
  function logout(){
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = 'html.html';
  }

  function fingerprint(email){
    const k = statsKey(email);
    const v = localStorage.getItem(k) || '';
    const o = localStorage.getItem(ordersKey(email)) || '';
    const r = localStorage.getItem(ratingsKey(email)) || '';
    return k + '=' + v.length + ';' + ordersKey(email) + '=' + o.length + ';' + ratingsKey(email) + '=' + r.length;
  }

  // Refresh charts when storage changes (multi-tab) or when content length changes.
  function startAutoRefresh(){
    const session = loadSession();
    if(!session) return;

    let last = fingerprint(session.email);

    window.addEventListener('storage', (e) => {
      if(!e) return;
      const key = String(e.key || '');
      if(key === statsKey(session.email) || key === ordersKey(session.email) || key === ratingsKey(session.email)){
        refresh();
        last = fingerprint(session.email);
      }
    });

    setInterval(() => {
      const cur = fingerprint(session.email);
      if(cur !== last){
        last = cur;
        refresh();
      }
    }, 900);
  }

  if(logoutBtn){
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  applyTheme(loadTheme());

  (function initRatings(){
    const s = loadSession();
    if(!s) return;
    bindRatingsEvents(s.email);
  })();

  refresh();
  startAutoRefresh();
})();
