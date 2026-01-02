(function() {
  // Admin sales dashboard script (sells.html)
  // - Admin-only access
  // - Scans all dt_orders_* keys to aggregate revenue
  // - Filters by period (day/week/month/year)
  // - Builds a donut chart (revenue by category)
  const SESSION_KEY = 'dt_session';
  const ADMIN_SESSION_KEY = 'dt_admin_session';
  const USERS_KEY = 'dt_users';
  const THEME_KEY = 'dt_theme';

  const ORDER_SIMPLE_KEYS = ['orders', 'dt_orders'];
  const ORDER_PREFIX_KEYS = ['dt_orders_'];

  // DOM nodes
  const periodEl = document.getElementById('salesPeriod');
  const lastUpdateEl = document.getElementById('salesLastUpdate');
  const emptyEl = document.getElementById('salesEmpty');

  const kpiRevenueEl = document.getElementById('kpiRevenue');
  const kpiOrdersEl = document.getElementById('kpiOrders');
  const kpiAvgEl = document.getElementById('kpiAvg');

  const userNameEl = document.getElementById('salesUserName');
  const logoutBtn = document.getElementById('salesLogoutBtn');
  const themeToggleBtn = document.getElementById('themeToggle');

  const chartEl = document.getElementById('salesDonut');
  // Chart.js instance (created lazily)
  let donutChart = null;

  // Parse JSON safely (returns null on invalid JSON)
  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch { return null; }
  }

  function loadSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    const s = safeJsonParse(raw);
    if (!s || !s.email) return null;
    return s;
  }

  // Admin check (session role or dt_admin_session fallback)
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

  function getDisplayName() {
    const s = loadSession();
    if (!s) return '';
    const email = String(s.email || '').trim();
    if (!email) return '';
    const users = loadUsers();
    const u = users.find((x) => x && (x.email || '').toLowerCase() === email.toLowerCase());
    return String((u && u.name) || email);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.href = 'html.html';
  }

  // Format numbers as currency.
  function formatMoney(value) {
    const v = Number(value) || 0;
    return `${v.toFixed(2)}€`;
  }

  function nowLabel() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  // Apply dark-mode class and update theme button label.
  function applyTheme(theme) {
    const t = String(theme || '').toLowerCase();
    const dark = t === 'dark';
    document.body.classList.toggle('dark-mode', dark);
    if (themeToggleBtn) themeToggleBtn.textContent = dark ? 'Light' : 'Dark';
  }

  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function toggleTheme() {
    const cur = loadTheme();
    const next = String(cur).toLowerCase() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  window.dtToggleTheme = toggleTheme;

  if (!isAdmin()) {
    document.body.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;background:#0b1220;color:#e8eefc;">'
      + '<div style="max-width:560px;border:1px solid rgba(232,238,252,0.12);background:rgba(255,255,255,0.06);border-radius:16px;padding:18px 16px;">'
      + '<div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Access denied</div>'
      + '<div style="margin-top:10px;font-size:18px;font-weight:700;">This page is admin-only.</div>'
      + '<div style="margin-top:8px;font-size:13px;opacity:.8;line-height:1.5;">Redirecting…</div>'
      + '</div></div>';
    window.setTimeout(() => {
      window.location.href = 'html.html';
    }, 900);
    return;
  }

  applyTheme(loadTheme());
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });
  if (userNameEl) userNameEl.textContent = getDisplayName() || 'Admin';

  // Normalize strings for stable comparisons (lowercase + remove accents).
  function normalizeToken(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Convert raw category strings into a small set for charting.
  function normalizeCategory(raw) {
    const c = normalizeToken(raw);
    if (c === 'entrees' || c === 'entree' || c === 'aperitifs' || c === 'aperitif') return 'entrees';
    if (c === 'mains' || c === 'main' || c === 'plat' || c === 'plats') return 'mains';
    if (c === 'desserts' || c === 'dessert') return 'desserts';
    return 'other';
  }

  // Find all localStorage keys that may contain orders.
  function findOrderKeys() {
    const keys = [];

    for (const k of ORDER_SIMPLE_KEYS) {
      if (localStorage.getItem(k)) keys.push(k);
    }

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (ORDER_PREFIX_KEYS.some((p) => k.startsWith(p))) keys.push(k);
    }

    return [...new Set(keys)];
  }

  function readOrdersFromKey(key) {
    const data = safeJsonParse(localStorage.getItem(key));
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.orders)) return data.orders;
    return [];
  }

  // Load orders (raw objects) from all users/keys.
  function loadAllOrdersRaw() {
    const keys = findOrderKeys();
    let out = [];
    for (const k of keys) {
      out = out.concat(readOrdersFromKey(k));
    }
    return out;
  }

  // Resolve order timestamp for filtering (createdAtMs preferred; fallbacks supported).
  function getOrderTimestampMs(order) {
    if (!order || typeof order !== 'object') return 0;
    const ms = Number(order.createdAtMs);
    if (Number.isFinite(ms) && ms > 0) return ms;

    const createdAt = order.createdAt;
    if (typeof createdAt === 'string' && createdAt.trim()) {
      const parsed = Date.parse(createdAt);
      if (Number.isFinite(parsed)) return parsed;
    }

    const idMs = Number(order.id);
    if (Number.isFinite(idMs) && idMs > 0) return idMs;

    return 0;
  }

  // Compute the period start (ms) for day/week/month/year.
  function startOfPeriodMs(now, period) {
    const d = new Date(now);

    if (period === 'day') {
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }

    if (period === 'week') {
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }

    if (period === 'month') {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }

    if (period === 'year') {
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }

    return 0;
  }

  // Keep only orders that happened after the start of the selected period.
  function filterOrdersByPeriod(orders, period) {
    const start = startOfPeriodMs(Date.now(), period);
    if (!start) return orders;
    return (orders || []).filter((o) => getOrderTimestampMs(o) >= start);
  }

  // Compute revenue totals grouped by normalized category.
  function extractRevenueByCategory(orders) {
    const totals = { entrees: 0, mains: 0, desserts: 0, other: 0 };

    for (const o of (orders || [])) {
      const items = o && Array.isArray(o.items) ? o.items : [];
      if (!items.length) {
        totals.other += Number((o && o.total) || 0) || 0;
        continue;
      }

      for (const it of items) {
        const qty = Number((it && it.qty) || 1) || 1;
        const price = Number((it && it.price) || 0) || 0;
        const cat = normalizeCategory(it && it.category);
        totals[cat] = (totals[cat] || 0) + (qty * price);
      }
    }

    return totals;
  }

  // Sum order totals (fallback if items are missing).
  function sumOrdersTotal(orders) {
    return (orders || []).reduce((sum, o) => sum + (Number((o && o.total) || 0) || 0), 0);
  }

  // Create donut chart once, then update it on refresh.
  function ensureChart() {
    if (!chartEl || !window.Chart) return null;
    if (donutChart) return donutChart;

    donutChart = new Chart(chartEl, {
      type: 'doughnut',
      data: {
        labels: ['Entrees', 'Mains', 'Desserts', 'Other'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgba(245,158,11,0.55)',
            'rgba(59,130,246,0.55)',
            'rgba(236,72,153,0.55)',
            'rgba(148,163,184,0.45)'
          ],
          borderColor: [
            'rgba(245,158,11,1)',
            'rgba(59,130,246,1)',
            'rgba(236,72,153,1)',
            'rgba(148,163,184,0.9)'
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, boxHeight: 10 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const v = Number((context && context.raw) || 0) || 0;
                return `${context.label}: ${formatMoney(v)}`;
              }
            }
          }
        }
      }
    });

    return donutChart;
  }

  function setEmptyVisible(show) {
    if (!emptyEl) return;
    emptyEl.classList.toggle('auth-hidden', !show);
  }

  // Main refresh: recompute KPIs + chart from localStorage orders.
  function render() {
    const period = String((periodEl && periodEl.value) || 'month');
    const allOrders = loadAllOrdersRaw();
    const orders = filterOrdersByPeriod(allOrders, period);

    const revenue = sumOrdersTotal(orders);
    const ordersCount = orders.length;
    const avg = ordersCount ? revenue / ordersCount : 0;

    if (kpiRevenueEl) kpiRevenueEl.textContent = formatMoney(revenue);
    if (kpiOrdersEl) kpiOrdersEl.textContent = String(ordersCount);
    if (kpiAvgEl) kpiAvgEl.textContent = formatMoney(avg);
    if (lastUpdateEl) lastUpdateEl.textContent = nowLabel();

    setEmptyVisible(!ordersCount);

    const byCat = extractRevenueByCategory(orders);
    const chart = ensureChart();
    if (chart) {
      chart.data.datasets[0].data = [
        Number(byCat.entrees) || 0,
        Number(byCat.mains) || 0,
        Number(byCat.desserts) || 0,
        Number(byCat.other) || 0,
      ];

      if (window.dtT) {
        chart.data.labels = [
          window.dtT('menu.entrees') || 'Entrees',
          window.dtT('menu.mains') || 'Mains',
          window.dtT('menu.desserts') || 'Desserts',
          window.dtT('sells.other') || 'Other',
        ];
      }

      chart.update();
    }
  }

  if (periodEl) periodEl.addEventListener('change', render);

  render();
  window.setTimeout(render, 200);
  window.setTimeout(render, 800);
  window.setInterval(render, 4000);
})();
