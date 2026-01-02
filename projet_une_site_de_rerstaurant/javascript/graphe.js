(function() {
  // Admin graphs script (graphe.html)
  // - Admin-only page
  // - Aggregates best-selling products from orders stored in localStorage
  // - Aggregates product ratings across users
  // - Renders Chart.js bar charts + KPI cards
  const CHART_ID = 'salesChart';
  const RATINGS_CHART_ID = 'ratingsAdminChart';

  const SESSION_KEY = 'dt_session';
  const ADMIN_SESSION_KEY = 'dt_admin_session';
  const USERS_KEY = 'dt_users';
  const PRODUCTS_KEY = 'dt_products';
  const RATINGS_PREFIX = 'dt_product_ratings_';

  // Produits visibles par défaut sur la page menu (codés en dur dans html.html).
  // On les garde ici pour que le graphe affiche aussi le menu existant, même si dt_products est vide.
  const DEFAULT_MENU_PRODUCTS = [
    'Bœuf teriyaki en feuille de laitue',
    'Canapé de salade fraîche',
    'Viande frite au fromage fumé',
    'BBQ Marinated Ribs Pork (2 RACK)',
    'Salade de viande colorée',
    "Canard à l'Orange",
    'Soufflé au Chocolat',
    'Tarte Tatin',
    'Millefeuille',
  ];

  // localStorage keys where orders can be stored
  const SIMPLE_KEYS = ['orders', 'dt_orders'];
  const PREFIX_KEYS = ['dt_orders_'];

  // DOM nodes used to display KPIs and titles
  const bestNameEl = document.getElementById('bestName');
  const bestStatsEl = document.getElementById('bestStats');
  const bestBadgeEl = document.getElementById('bestBadge');
  const kpiProductsEl = document.getElementById('kpiProducts');
  const kpiOrdersEl = document.getElementById('kpiOrders');
  const lastUpdateEl = document.getElementById('lastUpdate');

  const bestRatedNameEl = document.getElementById('bestRatedName');
  const bestRatedStatsEl = document.getElementById('bestRatedStats');
  const bestRatedBadgeEl = document.getElementById('bestRatedBadge');
  const kpiRatedProductsEl = document.getElementById('kpiRatedProducts');
  const kpiTotalVotesEl = document.getElementById('kpiTotalVotes');

  const graphUserNameEl = document.getElementById('graphUserName');
  const graphLogoutBtn = document.getElementById('graphLogoutBtn');

  // Parse JSON safely (returns null on invalid JSON)
  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function ratingsColor(avg) {
    const a = Number(avg) || 0;
    if (a >= 4) return 'rgba(34,197,94,0.65)';
    if (a >= 3) return 'rgba(245,158,11,0.55)';
    return 'rgba(239,68,68,0.55)';
  }

  function ratingsBorder(avg) {
    const a = Number(avg) || 0;
    if (a >= 4) return 'rgba(34,197,94,1)';
    if (a >= 3) return 'rgba(245,158,11,1)';
    return 'rgba(239,68,68,1)';
  }

  // Read current session from dt_session.
  function loadSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    const s = safeJsonParse(raw);
    if (!s || !s.email) return null;
    return s;
  }

  // Admin check (session role or dt_admin_session fallback).
  function isAdmin() {
    const s = loadSession();
    if (s && s.role) return String(s.role) === 'admin';
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }

  function loadUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    const users = safeJsonParse(raw);
    return Array.isArray(users) ? users : [];
  }

  function loadProducts() {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const products = safeJsonParse(raw);
    return Array.isArray(products) ? products : [];
  }

  // Build a de-duplicated list of product names from default menu + dt_products.
  function getExistingProductNames() {
    const fromStorage = loadProducts()
      .map((p) => String((p && p.name) || '').trim())
      .filter(Boolean);

    const all = DEFAULT_MENU_PRODUCTS.concat(fromStorage);
    const out = [];
    const seen = new Set();
    for (const n of all) {
      const name = String(n || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
    return out;
  }

  function normalizeNameKey(name) {
    return String(name || '').trim().toLowerCase();
  }

  function existingProductMap() {
    const names = getExistingProductNames();
    const map = new Map();
    for (const n of names) {
      const key = normalizeNameKey(n);
      if (!key) continue;
      if (!map.has(key)) map.set(key, n);
    }
    return map;
  }

  // Display name for the header (from dt_users; fallback to email).
  function getDisplayName() {
    const s = loadSession();
    if (!s) return '';
    const email = String(s.email || '').trim();
    if (!email) return '';
    const users = loadUsers();
    const u = users.find((x) => x && (x.email || '').toLowerCase() === email.toLowerCase());
    return String((u && u.name) || email);
  }

  function renderHeaderUser() {
    if (!graphUserNameEl) return;
    const name = getDisplayName();
    graphUserNameEl.textContent = name || 'Admin';
  }

  // Logout and redirect to main page.
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = 'html.html';
  }

  // Sécurité : page réservée à l’admin.
  if (!isAdmin()) {
    document.body.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;background:#0b1220;color:#e8eefc;">'
      + '<div style="max-width:560px;border:1px solid rgba(232,238,252,0.12);background:rgba(255,255,255,0.06);border-radius:16px;padding:18px 16px;">'
      + '<div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Accès refusé</div>'
      + '<div style="margin-top:10px;font-size:18px;font-weight:700;">Cette page est réservée à l\'administrateur.</div>'
      + '<div style="margin-top:8px;font-size:13px;opacity:.8;line-height:1.5;">Redirection vers la page principale…</div>'
      + '</div></div>';
    window.setTimeout(() => {
      window.location.href = 'html.html';
    }, 900);
    return;
  }

  renderHeaderUser();
  if (graphLogoutBtn) {
    graphLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Get current time as HH:MM:SS
  function nowLabel() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  // Check if object is an order
  function isOrderItem(item) {
    return !!item && typeof item === 'object' && typeof item.product === 'string' && item.product.trim() !== '';
  }

  // Convertit une commande (format du site) en une liste d’éléments { product, quantity }.
  // Le site enregistre généralement les commandes ainsi :
  // [{ id, createdAt, total, items: [{ name, qty, price, ... }, ...] }, ...]
  function extractOrderItems(order) {
    if (!order || typeof order !== 'object') return [];

    // Support direct : [{ product, quantity }]
    if (isOrderItem(order)) {
      return [{ product: String(order.product || '').trim(), quantity: Number(order.quantity || 1) }];
    }

    const items = Array.isArray(order.items) ? order.items : [];
    return items
      .map((it) => {
        const name = String((it && it.name) || '').trim();
        if (!name) return null;
        const qty = Number((it && it.qty) || (it && it.quantity) || 1);
        return { product: name, quantity: Number.isFinite(qty) && qty > 0 ? qty : 1 };
      })
      .filter(Boolean);
  }

  // Find all localStorage keys that may contain orders.
  function findOrderKeys() {
    let keys = [];

    SIMPLE_KEYS.forEach(k => {
      if (localStorage.getItem(k)) keys.push(k);
    });

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      PREFIX_KEYS.forEach(p => {
        if (k.startsWith(p)) keys.push(k);
      });
    }

    return [...new Set(keys)]; // remove duplicates
  }

  // Read orders from a single key and normalize into { product, quantity } rows.
  function readOrdersFromKey(key) {
    const data = safeJsonParse(localStorage.getItem(key));

    // Format 1 : tableau de commandes (le plus courant dans ce projet)
    if (Array.isArray(data)) {
      return data.flatMap((o) => extractOrderItems(o));
    }

    // Format 2 : objet { orders: [...] }
    if (data && Array.isArray(data.orders)) {
      return data.orders.flatMap((o) => extractOrderItems(o));
    }

    return [];
  }

  // Load all orders from all matching keys.
  function loadAllOrders() {
    const keys = findOrderKeys();
    let allOrders = [];
    keys.forEach(k => {
      allOrders = allOrders.concat(readOrdersFromKey(k));
    });
    return allOrders;
  }

  // Aggregate quantities per product.
  function aggregate(orders) {
    const map = new Map();
    (orders || []).forEach(o => {
      const name = String(o.product || '').trim();
      if (!name) return;

      const rawQty = Number(o.quantity || 0);
      const qty = Number.isFinite(rawQty) && rawQty > 0 ? rawQty : 1;
      map.set(name, (map.get(name) || 0) + qty);
    });
    return map;
  }

  // Sort products by count (best first)
  function sortTop(map) {
    const rows = Array.from(map.entries()).map(([product, count]) => ({ product, count }));
    rows.sort((a, b) => b.count - a.count || a.product.localeCompare(b.product));
    return rows;
  }

  function findRatingsKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(RATINGS_PREFIX)) keys.push(k);
    }
    return keys;
  }

  function loadAllRatings() {
    const keys = findRatingsKeys();
    const out = [];
    for (const k of keys) {
      const data = safeJsonParse(localStorage.getItem(k));
      if (!data || typeof data !== 'object') continue;
      out.push({ key: k, ratings: data });
    }
    return out;
  }

  function aggregateRatings() {
    const exist = existingProductMap();
    const sum = new Map();
    const cnt = new Map();
    let totalVotes = 0;

    const blocks = loadAllRatings();
    for (const b of blocks) {
      const r = b && b.ratings;
      if (!r || typeof r !== 'object') continue;
      for (const rawName of Object.keys(r)) {
        const key = normalizeNameKey(rawName);
        if (!exist.has(key)) continue;
        const v = Number(r[rawName]);
        if (!Number.isFinite(v) || v < 1 || v > 5) continue;
        sum.set(key, (sum.get(key) || 0) + v);
        cnt.set(key, (cnt.get(key) || 0) + 1);
        totalVotes += 1;
      }
    }

    const rows = [];
    for (const [key, label] of exist.entries()) {
      const c = cnt.get(key) || 0;
      const s = sum.get(key) || 0;
      const avg = c ? (s / c) : 0;
      rows.push({ product: label, avg, votes: c });
    }

    rows.sort((a, b) => b.avg - a.avg || b.votes - a.votes || a.product.localeCompare(b.product));
    return { rows, totalVotes };
  }

  function buildRowsForExistingProducts(countsMap) {
    const names = getExistingProductNames();
    const normalized = names.map((n) => ({ key: n.toLowerCase(), label: n }));
    const byKey = new Map();
    for (const { key, label } of normalized) {
      if (!byKey.has(key)) byKey.set(key, label);
    }

    const safeCounts = new Map();
    for (const [name, count] of (countsMap || new Map()).entries()) {
      const key = String(name || '').toLowerCase();
      if (!byKey.has(key)) continue;
      safeCounts.set(key, (safeCounts.get(key) || 0) + (Number(count) || 0));
    }

    const rows = Array.from(byKey.entries()).map(([key, label]) => {
      return { product: label, count: safeCounts.get(key) || 0 };
    });

    rows.sort((a, b) => b.count - a.count || a.product.localeCompare(b.product));
    return rows;
  }

  // Compute total products, total orders, best seller
  function computeStats(rows) {
    const totalProducts = rows.length;
    const totalOrders = rows.reduce((sum, r) => sum + r.count, 0);
    const best = rows[0] || null;
    return { totalProducts, totalOrders, best };
  }

  // Bar colors
  function colorForBar(isBest) {
    return isBest ? 'rgba(110,231,255,0.92)' : 'rgba(167,139,250,0.78)';
  }
  function borderForBar(isBest) {
    return isBest ? 'rgba(110,231,255,1)' : 'rgba(167,139,250,1)';
  }

  let chart = null;
  let ratingsChart = null;
  let adminRatingsChart = null;

  // Create Chart.js chart if not exist
  function ensureChart() {
    const canvas = document.getElementById(CHART_ID);
    if (!canvas) return null;
    if (chart) return chart;

    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Nombre de commandes', data: [], backgroundColor: [], borderColor: [], borderWidth: 2, borderRadius: 10 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
    return chart;
  }

  function ensureRatingsChart() {
    if (ratingsChart) return ratingsChart;
    const canvas = document.getElementById(RATINGS_CHART_ID);
    if (!canvas) return null;

    ratingsChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Note moyenne (1-5)',
            data: [],
            backgroundColor: [],
            borderColor: [],
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
          legend: { labels: { color: 'rgba(61,47,10,0.85)' } },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: 'rgba(212,196,168,0.8)',
            borderWidth: 1,
            titleColor: 'rgba(61,47,10,0.95)',
            bodyColor: 'rgba(61,47,10,0.85)',
            callbacks: {
              label: function(ctx){
                const v = Number(ctx.raw || 0);
                return `Moyenne: ${v.toFixed(2)}`;
              }
            }
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

  // Update the best seller info in HTML
  function setBestSellerUI(best, totalProducts, totalOrders) {
    if (kpiProductsEl) kpiProductsEl.textContent = totalProducts || 0;
    if (kpiOrdersEl) kpiOrdersEl.textContent = totalOrders || 0;

    if (!best) {
      if (bestNameEl) bestNameEl.textContent = '—';
      if (bestStatsEl) bestStatsEl.textContent = 'Aucune commande trouvée.';
      if (bestBadgeEl) bestBadgeEl.style.display = 'none';
      return;
    }

    if (bestNameEl) bestNameEl.textContent = best.product;
    if (bestStatsEl) bestStatsEl.textContent = `Total: ${best.count} commande(s).`;
    if (bestBadgeEl) bestBadgeEl.style.display = '';
  }

  // Update chart with new data
  function updateChart(rows) {
    const ch = ensureChart();
    if (!ch) return;

    const bestName = rows[0] ? rows[0].product : '';

    ch.data.labels = rows.map(r => r.product);
    ch.data.datasets[0].data = rows.map(r => r.count);
    ch.data.datasets[0].backgroundColor = rows.map(r => colorForBar(r.product === bestName));
    ch.data.datasets[0].borderColor = rows.map(r => borderForBar(r.product === bestName));

    ch.update();
  }

  function setBestRatedUI(best, ratedProducts, totalVotes) {
    if (kpiRatedProductsEl) kpiRatedProductsEl.textContent = String(ratedProducts || 0);
    if (kpiTotalVotesEl) kpiTotalVotesEl.textContent = String(totalVotes || 0);

    if (!bestRatedNameEl || !bestRatedStatsEl || !bestRatedBadgeEl) return;
    if (!best || !best.product) {
      bestRatedNameEl.textContent = '—';
      bestRatedStatsEl.textContent = 'Aucune note trouvée.';
      bestRatedBadgeEl.classList.add('hidden');
      return;
    }

    bestRatedNameEl.textContent = best.product;
    bestRatedStatsEl.textContent = `Moyenne: ${(Number(best.avg) || 0).toFixed(2)} · Votes: ${Number(best.votes) || 0}`;
    bestRatedBadgeEl.classList.remove('hidden');
  }

  function updateRatingsChart(rows) {
    const ch = ensureRatingsChart();
    if (!ch) return;

    const labels = rows.map(r => r.product);
    const data = rows.map(r => Number(r.avg || 0));
    ch.data.labels = labels;
    ch.data.datasets[0].data = data;
    ch.data.datasets[0].backgroundColor = rows.map(r => ratingsColor(r.avg));
    ch.data.datasets[0].borderColor = rows.map(r => ratingsBorder(r.avg));
    ch.update();
  }

  // Main refresh: load, aggregate, then update KPIs + charts.
  function refresh() {
    const orders = loadAllOrders();
    const map = aggregate(orders);
    const rows = buildRowsForExistingProducts(map);
    const stats = computeStats(rows);

    setBestSellerUI(stats.best, stats.totalProducts, stats.totalOrders);
    updateChart(rows);

    const ratingsAgg = aggregateRatings();
    const ratedRows = ratingsAgg.rows.filter(r => (Number(r.votes) || 0) > 0);
    const ratedProducts = ratedRows.length;
    const bestRated = ratedRows[0] || null;
    setBestRatedUI(bestRated, ratedProducts, ratingsAgg.totalVotes);
    updateRatingsChart(ratedRows);

    if (lastUpdateEl) lastUpdateEl.textContent = `Maj: ${nowLabel()}`;
  }

  // Simple fingerprint to detect storage change
  function storageFingerprint() {
    const keys = findOrderKeys().sort();
    let s = '';
    keys.forEach(k => { s += k + '=' + (localStorage.getItem(k)?.length || 0) + ';'; });
    s += PRODUCTS_KEY + '=' + (localStorage.getItem(PRODUCTS_KEY)?.length || 0) + ';';
    const rKeys = findRatingsKeys().sort();
    rKeys.forEach(k => { s += k + '=' + (localStorage.getItem(k)?.length || 0) + ';'; });
    return s;
  }

  let lastFp = '';
  // Auto refresh when localStorage changes
  function startAutoRefresh() {
    window.addEventListener('storage', e => {
      const key = e.key || '';
      if (key === PRODUCTS_KEY || key.startsWith(RATINGS_PREFIX) || SIMPLE_KEYS.includes(key) || PREFIX_KEYS.some(p => key.startsWith(p))) {
        refresh();
        lastFp = storageFingerprint();
      }
    });

    lastFp = storageFingerprint();
    setInterval(() => {
      const fp = storageFingerprint();
      if (fp !== lastFp) { lastFp = fp; refresh(); }
    }, 900);
  }

  // Start
  refresh();
  startAutoRefresh();
})();
