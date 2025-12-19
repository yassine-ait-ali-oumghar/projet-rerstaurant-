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
                heroIn: {
                    '0%': { opacity: '0', transform: 'translateY(18px) scale(0.985)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                floaty: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-40%)' },
                    '100%': { transform: 'translateX(140%)' },
                },
            },
            animation: {
                heroIn: 'heroIn 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
                floaty: 'floaty 5s ease-in-out infinite',
                shimmer: 'shimmer 1.6s ease-in-out infinite',
            },
        },
    },
};

(function () {
            const els = Array.from(document.querySelectorAll('[data-reveal]'));
            if (!els.length) return;

            const io = new IntersectionObserver(
                (entries) => {
                    for (const e of entries) {
                        if (!e.isIntersecting) continue;
                        e.target.classList.add('is-visible');
                        io.unobserve(e.target);
                    }
                },
                { threshold: 0.15 }
            );

            for (const el of els) {
                el.style.willChange = 'opacity, transform';
                io.observe(el);
            }
        })();

(function () {
            const USERS_KEY = 'dt_users';
            const SESSION_KEY = 'dt_session';
            const authModal = document.getElementById('authModal');
            const authPanel = document.getElementById('authPanel');

            const authOpenBtn = document.getElementById('authOpenBtn');
            const authCloseBtn = document.getElementById('authCloseBtn');

            const authMsg = document.getElementById('authMsg');

            const authUserBadge = document.getElementById('authUserBadge');
            const authUserName = document.getElementById('authUserName');
            const authLogoutBtn = document.getElementById('authLogoutBtn');
            const userProfileBtn = document.getElementById('userProfileBtn');
            const authAvatar = document.getElementById('authAvatar');
            const adminMenuBtn = document.getElementById('adminMenuBtn');

            const mobileLoginBtn = document.getElementById('mobileLoginBtn');
            const mobileCartBtn = document.getElementById('mobileCartBtn');
            const mobileOrdersBtn = document.getElementById('mobileOrdersBtn');
            const mobileProfileBtn = document.getElementById('mobileProfileBtn');
            const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

            const profileModal = document.getElementById('profileModal');
            const profileOverlay = document.getElementById('profileOverlay');
            const profilePanel = document.getElementById('profilePanel');
            const profileClose = document.getElementById('profileClose');
            const profileMsg = document.getElementById('profileMsg');
            const profileForm = document.getElementById('profileForm');
            const profileNameInput = document.getElementById('profileName');
            const profileEmailInput = document.getElementById('profileEmailInput');
            const profileAvatarFile = document.getElementById('profileAvatarFile');
            const profileAvatarPreview = document.getElementById('profileAvatarPreview');
            const profileAvatarClear = document.getElementById('profileAvatarClear');
            const profilePwCurrent = document.getElementById('profilePwCurrent');
            const profilePwNew = document.getElementById('profilePwNew');
            const deleteAccountBtn = document.getElementById('deleteAccountBtn');

            const tabLogin = document.getElementById('authTabLogin');
            const tabRegister = document.getElementById('authTabRegister');

            const loginForm = document.getElementById('authLoginForm');
            const registerForm = document.getElementById('authRegisterForm');

            const loginEmail = document.getElementById('authLoginEmail');
            const loginPassword = document.getElementById('authLoginPassword');
            const registerName = document.getElementById('authRegisterName');
            const registerEmail = document.getElementById('authRegisterEmail');
            const registerPassword = document.getElementById('authRegisterPassword');
            const registerRole = document.getElementById('authRegisterRole');

            function safeJsonParse(value) {
                try { return JSON.parse(value); } catch { return null; }
            }

            function showMsg(text) {
                if (!authMsg) return;
                if (!text) {
                    authMsg.classList.add('auth-hidden');
                    authMsg.textContent = '';
                    return;
                }
                authMsg.textContent = text;
                authMsg.classList.remove('auth-hidden');
            }

            function showProfileMsg(text) {
                if (!profileMsg) return;
                if (!text) {
                    profileMsg.classList.add('auth-hidden');
                    profileMsg.textContent = '';
                    return;
                }
                profileMsg.textContent = text;
                profileMsg.classList.remove('auth-hidden');
            }

            function loadUsers() {
                const raw = localStorage.getItem(USERS_KEY);
                const users = safeJsonParse(raw);
                return Array.isArray(users) ? users : [];
            }

            function saveUsers(users) {
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }

            function ensureDefaultAdminUser() {
                const users = loadUsers();
                const idx = users.findIndex((u) => (u.email || '').toLowerCase() === 'admin@gmail.com');
                if (idx === -1) {
                    users.push({ email: 'admin@gmail.com', password: 'admin', role: 'admin', name: 'Admin' });
                    saveUsers(users);
                } else {
                    const u = users[idx] || {};
                    const next = {
                        ...u,
                        email: 'admin@gmail.com',
                        role: 'admin',
                        password: u.password ? u.password : 'admin',
                        name: u.name ? u.name : 'Admin',
                    };
                    users[idx] = next;
                    saveUsers(users);
                }

                const sessionRaw = localStorage.getItem('dt_session');
                const session = safeJsonParse(sessionRaw);
                if (session && (session.email || '').toLowerCase() === 'admin@gmail.com' && session.role !== 'admin') {
                    localStorage.setItem('dt_session', JSON.stringify({ ...session, role: 'admin' }));
                }
            }

            function findUserByEmail(email) {
                const users = loadUsers();
                const normalized = (email || '').trim().toLowerCase();
                return users.find((u) => (u.email || '').toLowerCase() === normalized) || null;
            }

            function updateUserByEmail(email, patch) {
                const users = loadUsers();
                const normalized = (email || '').trim().toLowerCase();
                const idx = users.findIndex((u) => (u.email || '').toLowerCase() === normalized);
                if (idx === -1) return null;
                users[idx] = { ...(users[idx] || {}), ...(patch || {}) };
                saveUsers(users);
                return users[idx];
            }

            function loadSession() {
                const raw = localStorage.getItem(SESSION_KEY);
                const session = safeJsonParse(raw);
                if (!session || !session.email) return null;
                return session;
            }

            function saveSession(session) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            }

            function clearSession() {
                localStorage.removeItem(SESSION_KEY);
            }

            function isAuthed() {
                return !!loadSession();
            }

            function setTab(mode) {
                const isLogin = mode === 'login';
                loginForm.classList.toggle('auth-hidden', !isLogin);
                registerForm.classList.toggle('auth-hidden', isLogin);

                tabLogin.className = isLogin
                    ? 'border border-brand-line/80 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink transition-all duration-300'
                    : 'border border-brand-line/80 bg-brand-cream px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted transition-all duration-300';
                tabRegister.className = !isLogin
                    ? 'border border-brand-line/80 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink transition-all duration-300'
                    : 'border border-brand-line/80 bg-brand-cream px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted transition-all duration-300';
            }

            function openAuthModal(preferTab) {
                if (!authModal) return;
                showMsg('');
                authModal.classList.remove('auth-hidden');
                authModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';

                if (preferTab) setTab(preferTab);

                authPanel.classList.remove('auth-panel-in');
                void authPanel.offsetWidth;
                authPanel.classList.add('auth-panel-in');

                window.setTimeout(() => {
                    const el = preferTab === 'register' ? registerName : loginEmail;
                    if (el && typeof el.focus === 'function') el.focus();
                }, 50);
            }

            function closeAuthModal() {
                if (!authModal) return;
                authModal.classList.add('auth-hidden');
                authModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }

            function renderAuthState() {
                const session = loadSession();
                const loggedIn = !!session;

                if (authOpenBtn) {
                    authOpenBtn.classList.toggle('auth-hidden', loggedIn);
                    if (loggedIn) authOpenBtn.setAttribute('hidden', '');
                    else authOpenBtn.removeAttribute('hidden');
                    authOpenBtn.style.display = loggedIn ? 'none' : '';
                }

                if (authUserBadge) {
                    authUserBadge.classList.toggle('auth-hidden', !loggedIn);
                    if (!loggedIn) {
                        authUserBadge.classList.remove('actions-open');
                        authUserBadge.setAttribute('hidden', '');
                    } else {
                        authUserBadge.removeAttribute('hidden');
                    }
                    authUserBadge.style.display = loggedIn ? '' : 'none';
                }

                const cartBtn = document.getElementById('cartBtn');
                if (cartBtn) {
                    cartBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) cartBtn.removeAttribute('hidden');
                    else cartBtn.setAttribute('hidden', '');
                    cartBtn.style.display = loggedIn ? '' : 'none';
                }

                const ordersBtn = document.getElementById('ordersBtn');
                if (ordersBtn) {
                    ordersBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) ordersBtn.removeAttribute('hidden');
                    else ordersBtn.setAttribute('hidden', '');
                    ordersBtn.style.display = loggedIn ? '' : 'none';
                }

                if (loggedIn) {
                    const u = findUserByEmail(session.email) || { email: session.email };
                    const displayName = String(u.name || session.email);
                    authUserName.textContent = displayName;
                    const role = String(session.role || u.role || 'user');
                    if (userProfileBtn) {
                        userProfileBtn.textContent = role === 'admin' ? 'Admin tools' : 'Profile';
                    }
                    if (mobileProfileBtn) {
                        mobileProfileBtn.textContent = role === 'admin' ? 'Admin tools' : 'Profile';
                    }
                    if (authAvatar) {
                        const avatar = String(u.avatar || '').trim();
                        if (avatar) {
                            authAvatar.textContent = '';
                            authAvatar.style.backgroundImage = `url(${avatar})`;
                            authAvatar.style.backgroundSize = 'cover';
                            authAvatar.style.backgroundPosition = 'center';
                        } else {
                            authAvatar.style.backgroundImage = '';
                            const initials = displayName.trim().slice(0, 2).toUpperCase() || 'DT';
                            authAvatar.textContent = initials;
                        }
                    }
                }

                if (mobileLoginBtn) {
                    mobileLoginBtn.classList.toggle('auth-hidden', loggedIn);
                    if (loggedIn) mobileLoginBtn.setAttribute('hidden', '');
                    else mobileLoginBtn.removeAttribute('hidden');
                }
                if (mobileCartBtn) {
                    mobileCartBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) mobileCartBtn.removeAttribute('hidden');
                    else mobileCartBtn.setAttribute('hidden', '');
                    mobileCartBtn.style.display = loggedIn ? '' : 'none';
                }
                if (mobileOrdersBtn) {
                    mobileOrdersBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) mobileOrdersBtn.removeAttribute('hidden');
                    else mobileOrdersBtn.setAttribute('hidden', '');
                    mobileOrdersBtn.style.display = loggedIn ? '' : 'none';
                }
                if (mobileProfileBtn) {
                    mobileProfileBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) mobileProfileBtn.removeAttribute('hidden');
                    else mobileProfileBtn.setAttribute('hidden', '');
                }
                if (mobileLogoutBtn) {
                    mobileLogoutBtn.classList.toggle('auth-hidden', !loggedIn);
                    if (loggedIn) mobileLogoutBtn.removeAttribute('hidden');
                    else mobileLogoutBtn.setAttribute('hidden', '');
                }

                if (authUserBadge) {
                    authUserBadge.classList.remove('actions-open');
                }
            }

            function setProfileModalOpen(open) {
                if (!profileModal) return;
                showProfileMsg('');
                profileModal.classList.toggle('auth-hidden', !open);
                profileModal.setAttribute('aria-hidden', open ? 'false' : 'true');
                document.body.style.overflow = open ? 'hidden' : '';
                if (open && profilePanel) {
                    profilePanel.classList.remove('auth-panel-in');
                    void profilePanel.offsetWidth;
                    profilePanel.classList.add('auth-panel-in');
                }
            }

            function setProfileAvatarPreview(dataUrl) {
                if (!profileAvatarPreview) return;
                const url = String(dataUrl || '').trim();
                if (!url) {
                    profileAvatarPreview.style.backgroundImage = '';
                    profileAvatarPreview.textContent = '';
                    return;
                }
                profileAvatarPreview.textContent = '';
                profileAvatarPreview.style.backgroundImage = `url(${url})`;
                profileAvatarPreview.style.backgroundSize = 'cover';
                profileAvatarPreview.style.backgroundPosition = 'center';
            }

            function fillProfileForm() {
                const session = loadSession();
                if (!session) return;
                const u = findUserByEmail(session.email) || { email: session.email, name: '' };
                if (profileNameInput) profileNameInput.value = u.name || '';
                if (profileEmailInput) profileEmailInput.value = u.email || session.email;
                if (profilePwCurrent) profilePwCurrent.value = '';
                if (profilePwNew) profilePwNew.value = '';
                setProfileAvatarPreview(u.avatar || '');
            }

            function isAllowedWhenLoggedOut(target) {
                if (!target) return false;
                if (target.closest && target.closest('#authModal')) return true;
                if (target.closest && target.closest('[data-auth-allow]')) return true;
                return false;
            }

            function isProtectedAction(target) {
                if (!target || !target.closest) return false;
                return !!target.closest(
                    '#cartBtn, #ordersBtn, #userProfileBtn, #adminDeliveriesBtn,'
                    + ' #mobileCartBtn, #mobileOrdersBtn, #mobileProfileBtn'
                );
            }

            function shouldGateEvent(target) {
                if (isAuthed()) return false;
                if (isProtectedAction(target)) return true;
                if (isAllowedWhenLoggedOut(target)) return false;
                return true;
            }

            ensureDefaultAdminUser();
            document.addEventListener('click', (e) => {
                const target = e.target;

                if (shouldGateEvent(target)) {
                    e.preventDefault();
                    e.stopPropagation();
                    openAuthModal('login');
                    return;
                }

                if (target === authOpenBtn) {
                    e.preventDefault();
                    openAuthModal('login');
                    return;
                }

                if (mobileLoginBtn && target === mobileLoginBtn) {
                    e.preventDefault();
                    if (window.dtSetMobileMenuOpen) window.dtSetMobileMenuOpen(false);
                    openAuthModal('login');
                    return;
                }

                if (mobileCartBtn && target === mobileCartBtn) {
                    e.preventDefault();
                    if (window.dtSetMobileMenuOpen) window.dtSetMobileMenuOpen(false);
                    const btn = document.getElementById('cartBtn');
                    if (btn) btn.click();
                    return;
                }

                if (mobileOrdersBtn && target === mobileOrdersBtn) {
                    e.preventDefault();
                    if (window.dtSetMobileMenuOpen) window.dtSetMobileMenuOpen(false);
                    const btn = document.getElementById('ordersBtn');
                    if (btn) btn.click();
                    return;
                }

                if (mobileProfileBtn && target === mobileProfileBtn) {
                    e.preventDefault();
                    if (window.dtSetMobileMenuOpen) window.dtSetMobileMenuOpen(false);
                    if (userProfileBtn) userProfileBtn.click();
                    return;
                }

                if (mobileLogoutBtn && target === mobileLogoutBtn) {
                    e.preventDefault();
                    if (window.dtSetMobileMenuOpen) window.dtSetMobileMenuOpen(false);
                    if (authLogoutBtn) authLogoutBtn.click();
                    return;
                }

                if (userProfileBtn && target === userProfileBtn) {
                    e.preventDefault();
                    const session = loadSession();
                    const u = session ? (findUserByEmail(session.email) || { email: session.email }) : null;
                    const role = String((session && session.role) || (u && u.role) || 'user');
                    if (role === 'admin') {
                        if (window.dtRenderAdminUI) window.dtRenderAdminUI();
                        if (window.dtOpenAdminModal) window.dtOpenAdminModal();
                        return;
                    }
                    fillProfileForm();
                    setProfileModalOpen(true);
                    return;
                }

                const adminMenuClick = target && target.closest ? target.closest('#adminMenuBtn') : null;
                if (adminMenuBtn && adminMenuClick) {
                    const session = loadSession();
                    if (!session) return;
                    e.preventDefault();
                    if (authUserBadge) authUserBadge.classList.toggle('actions-open');
                    return;
                }

                if (target === authCloseBtn) {
                    e.preventDefault();
                    closeAuthModal();
                    return;
                }

                if (target === tabLogin) {
                    e.preventDefault();
                    setTab('login');
                    return;
                }

                if (target === tabRegister) {
                    e.preventDefault();
                    setTab('register');
                    return;
                }

                if (target === authLogoutBtn) {
                    e.preventDefault();
                    clearSession();
                    localStorage.removeItem('dt_admin_session');
                    if (authUserBadge) authUserBadge.classList.remove('actions-open');
                    renderAuthState();
                    return;
                }

                if (profileModal && !profileModal.classList.contains('auth-hidden')) {
                    if (target === profileOverlay || target === profileClose) {
                        e.preventDefault();
                        setProfileModalOpen(false);
                        return;
                    }
                }

                if (authModal && !authModal.classList.contains('auth-hidden')) {
                    const overlay = authModal.firstElementChild;
                    if (overlay && target === overlay) {
                        e.preventDefault();
                        closeAuthModal();
                    }
                }

                if (authUserBadge && authUserBadge.classList.contains('actions-open')) {
                    const inside = target && target.closest ? target.closest('#authUserBadge') : null;
                    if (!inside) authUserBadge.classList.remove('actions-open');
                }
            }, true);

            document.addEventListener('submit', (e) => {
                const target = e.target;

                if (shouldGateEvent(target)) {
                    e.preventDefault();
                    e.stopPropagation();
                    openAuthModal('login');
                    return;
                }

                if (target === loginForm) {
                    e.preventDefault();
                    const email = (loginEmail.value || '').trim().toLowerCase();
                    const password = (loginPassword.value || '').trim();
                    if (!email || !password) return;

                    const existing = findUserByEmail(email);
                    if (!existing) {
                        showMsg('No account found. Please register first.');
                        setTab('register');
                        registerEmail.value = email;
                        return;
                    }

                    if (existing.password !== password) {
                        showMsg('Wrong password. Try again.');
                        return;
                    }

                    saveSession({ email: existing.email, role: existing.role });
                    if ((existing.role || '') !== 'admin') {
                        localStorage.removeItem('dt_admin_session');
                    }
                    renderAuthState();
                    closeAuthModal();
                    return;
                }

                if (target === registerForm) {
                    e.preventDefault();
                    const name = (registerName.value || '').trim();
                    const email = (registerEmail.value || '').trim().toLowerCase();
                    const password = (registerPassword.value || '').trim();
                    const role = 'user';
                    if (!name || !email || !password || !role) return;

                    const users = loadUsers();
                    const exists = users.some((u) => (u.email || '').toLowerCase() === email);
                    if (exists) {
                        showMsg('Email already exists. Please login instead.');
                        setTab('login');
                        loginEmail.value = email;
                        return;
                    }

                    users.push({ email, password, role, name });
                    saveUsers(users);
                    saveSession({ email, role });
                    if (role !== 'admin') {
                        localStorage.removeItem('dt_admin_session');
                    }
                    renderAuthState();
                    closeAuthModal();
                    return;
                }

                const deliveryForm = document.getElementById('deliveryForm');
                if (deliveryForm && target === deliveryForm) {
                    e.preventDefault();

                    const trackingPanel = document.getElementById('trackingPanel');
                    if (trackingPanel) {
                        trackingPanel.style.display = 'block';
                        trackingPanel.classList.add('is-open', 'is-loading');
                        window.setTimeout(() => trackingPanel.classList.remove('is-loading'), 900);
                    }

                    const orderIdEl = document.getElementById('trackingOrderId');
                    const statusPill = document.getElementById('trackingStatusPill');
                    const statusText = document.getElementById('trackingStatus');
                    const progressBar = document.getElementById('trackingProgressBar');
                    const etaEl = document.getElementById('etaDisplay');
                    const distanceEl = document.getElementById('distanceDisplay');

                    const orderId = `DT-${Math.floor(1000 + Math.random() * 9000)}`;
                    if (orderIdEl) orderIdEl.textContent = `Commande #${orderId}`;

                    let map = window.__dtDeliveryMap;
                    let driverMarker = window.__dtDriverMarker;
                    let routeLine = window.__dtRouteLine;
                    let intervalId = window.__dtDeliveryInterval;

                    if (intervalId) {
                        window.clearInterval(intervalId);
                        window.__dtDeliveryInterval = null;
                    }

                    const restaurant = [33.5731, -7.5898];
                    const destination = [
                        restaurant[0] + 0.008 + (Math.random() * 0.010),
                        restaurant[1] + 0.015 + (Math.random() * 0.012)
                    ];
                    function makeRoute(from, to, steps) {
                        const out = [from];
                        const n = Math.max(3, steps || 6);
                        for (let i = 1; i < n; i++) {
                            const t = i / n;
                            out.push([
                                from[0] + (to[0] - from[0]) * t + (Math.random() - 0.5) * 0.0015,
                                from[1] + (to[1] - from[1]) * t + (Math.random() - 0.5) * 0.0015,
                            ]);
                        }
                        out.push(to);
                        return out;
                    }
                    const route = makeRoute(restaurant, destination, 7);

                    if (!map) {
                        map = L.map('map', { zoomControl: true }).setView(restaurant, 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            maxZoom: 19,
                            attribution: '&copy; OpenStreetMap',
                        }).addTo(map);
                        window.__dtDeliveryMap = map;
                    } else {
                        map.setView(restaurant, 13);
                        window.setTimeout(() => map.invalidateSize(), 50);
                    }

                    if (routeLine) {
                        routeLine.remove();
                    }
                    routeLine = L.polyline(route, { color: '#C0392B', weight: 5, opacity: 0.85, className: 'delivery-route' }).addTo(map);
                    window.__dtRouteLine = routeLine;
                    map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

                    const driverIcon = L.divIcon({
                        className: '',
                        html: `<div class="driver-icon"><span class="driver-bike" aria-hidden="true">🏍️</span></div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                    });

                    if (!driverMarker) {
                        driverMarker = L.marker(restaurant, { icon: driverIcon }).addTo(map);
                        window.__dtDriverMarker = driverMarker;
                    } else {
                        driverMarker.setLatLng(restaurant);
                    }

                    const statusSteps = [
                        { pill: 'Commande reçue', text: 'Votre commande est en cours de préparation…', pct: 15 },
                        { pill: 'En préparation', text: 'Le chef prépare vos plats avec soin…', pct: 35 },
                        { pill: 'En route (moto)', text: 'Le livreur à moto est en route vers votre adresse.', pct: 60 },
                        { pill: 'Livré', text: 'Votre commande est arrivée. Bon appétit !', pct: 100 },
                    ];

                    let stepIndex = 0;
                    let routeIndex = 0;

                    function setStep(i) {
                        const s = statusSteps[Math.max(0, Math.min(statusSteps.length - 1, i))];
                        if (statusPill) {
                            statusPill.textContent = s.pill;
                            statusPill.classList.remove('is-prep', 'is-route', 'is-done', 'is-pop');
                            if (i <= 1) statusPill.classList.add('is-prep');
                            if (i === 2) statusPill.classList.add('is-route');
                            if (i >= 3) statusPill.classList.add('is-done');
                            statusPill.classList.add('is-pop');
                            window.setTimeout(() => statusPill.classList.remove('is-pop'), 260);
                        }
                        if (statusText) {
                            statusText.classList.add('is-anim');
                            window.setTimeout(() => {
                                statusText.textContent = s.text;
                                statusText.classList.remove('is-anim');
                            }, 180);
                        }
                        if (progressBar) progressBar.style.width = `${s.pct}%`;
                    }

                    function approxDistanceKm(a, b) {
                        const R = 6371;
                        const dLat = (b[0] - a[0]) * Math.PI / 180;
                        const dLon = (b[1] - a[1]) * Math.PI / 180;
                        const lat1 = a[0] * Math.PI / 180;
                        const lat2 = b[0] * Math.PI / 180;
                        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
                        return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
                    }

                    setStep(0);
                    if (etaEl) etaEl.textContent = 'ETA: ~30 min';
                    if (distanceEl) distanceEl.textContent = `Distance: ~${approxDistanceKm(restaurant, destination).toFixed(1)} km`;

                    window.__dtDeliveryInterval = window.setInterval(() => {
                        if (stepIndex === 0 && routeIndex >= 1) { stepIndex = 1; setStep(stepIndex); }
                        if (stepIndex === 1 && routeIndex >= 2) { stepIndex = 2; setStep(stepIndex); }

                        routeIndex += 1;
                        if (routeIndex >= route.length) {
                            stepIndex = 3;
                            setStep(stepIndex);
                            if (etaEl) etaEl.textContent = 'ETA: 0 min';
                            if (distanceEl) distanceEl.textContent = 'Distance: 0.0 km';
                            (function finalizeOrderOnDelivery(){
                                const cart = loadCart();
                                if (cart && cart.length) {
                                    const total = cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
                                    const orders = loadOrders();
                                    const id = String(Date.now());
                                    const createdAt = new Date().toLocaleString();
                                    orders.push({ id, createdAt, total, items: cart, status: 'delivered' });
                                    saveOrders(orders);
                                    saveCart([]);
                                    renderCart();
                                    renderOrders();
                                    alert('Commande livrée au client. Merci pour votre commande !');
                                    setOrdersOpen(true);
                                }
                            })();
                            window.clearInterval(window.__dtDeliveryInterval);
                            window.__dtDeliveryInterval = null;
                            return;
                        }

                        const pos = route[routeIndex];
                        driverMarker.setLatLng(pos);
                        const remaining = approxDistanceKm(pos, destination);
                        const eta = Math.max(1, Math.round(remaining * 5));
                        if (etaEl) etaEl.textContent = `ETA: ~${eta} min`;
                        if (distanceEl) distanceEl.textContent = `Distance: ~${remaining.toFixed(1)} km`;
                    }, 1000);
                    return;
                }
            }, true);

            function digitsOnly(v){return String(v||'').replace(/\D+/g,'')}
            function buildWaUrl(numberDigits, text){
                const n = digitsOnly(numberDigits);
                const msg = encodeURIComponent(String(text||''));
                return `https://wa.me/${n}?text=${msg}`;
            }

            const restaurantPhoneText = '+212612910010';
            const restaurantWaDigits = digitsOnly(restaurantPhoneText) || '212000000000';

            function openWhatsApp(message){
                const url = buildWaUrl(restaurantWaDigits, message);
                window.open(url,'_blank','noopener');
            }

            const deliveryWaBtn = document.getElementById('deliveryWhatsAppBtn');
            if (deliveryWaBtn) {
                deliveryWaBtn.addEventListener('click', () => {
                    const name = (document.getElementById('deliveryName')?.value || '').trim();
                    const phone = (document.getElementById('deliveryPhone')?.value || '').trim();
                    const address = (document.getElementById('deliveryAddress')?.value || '').trim();
                    const zip = (document.getElementById('deliveryZip')?.value || '').trim();
                    const city = (document.getElementById('deliveryCity')?.value || '').trim();
                    const dt = (document.getElementById('deliveryDatetime')?.value || '').trim();
                    const order = (document.getElementById('deliveryOrder')?.value || '').trim();
                    const notes = (document.getElementById('deliveryNotes')?.value || '').trim();
                    const lines = [
                        'Bonjour, je souhaite passer une commande en livraison.',
                        name ? `Nom: ${name}` : null,
                        phone ? `Téléphone: ${phone}` : null,
                        (address || zip || city) ? `Adresse: ${[address, zip, city].filter(Boolean).join(', ')}` : null,
                        dt ? `Date/Heure souhaitée: ${dt}` : null,
                        order ? `Commande: ${order}` : null,
                        notes ? `Instructions: ${notes}` : null,
                    ].filter(Boolean);
                    openWhatsApp(lines.join('\n'));
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                if (!authModal || authModal.classList.contains('auth-hidden')) return;
                closeAuthModal();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                if (profileModal && !profileModal.classList.contains('auth-hidden')) {
                    setProfileModalOpen(false);
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                if (authUserBadge && authUserBadge.classList.contains('actions-open')) {
                    authUserBadge.classList.remove('actions-open');
                }
            });

            if (profileAvatarFile) {
                profileAvatarFile.addEventListener('change', () => {
                    const file = profileAvatarFile.files ? profileAvatarFile.files[0] : null;
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        const dataUrl = String(reader.result || '');
                        setProfileAvatarPreview(dataUrl);
                        const session = loadSession();
                        if (!session) return;
                        updateUserByEmail(session.email, { avatar: dataUrl });
                        renderAuthState();
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (profileAvatarClear) {
                profileAvatarClear.addEventListener('click', (e) => {
                    e.preventDefault();
                    const session = loadSession();
                    if (!session) return;
                    updateUserByEmail(session.email, { avatar: '' });
                    if (profileAvatarFile) profileAvatarFile.value = '';
                    setProfileAvatarPreview('');
                    renderAuthState();
                });
            }

            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const session = loadSession();
                    if (!session) return;
                    const u = findUserByEmail(session.email);
                    if (!u) return;

                    const nextName = (profileNameInput && profileNameInput.value || '').trim();
                    if (!nextName) {
                        showProfileMsg('Name is required.');
                        return;
                    }

                    const currentPw = (profilePwCurrent && profilePwCurrent.value || '').trim();
                    const nextPw = (profilePwNew && profilePwNew.value || '').trim();
                    if (nextPw) {
                        if (!currentPw) {
                            showProfileMsg('Enter your current password to change it.');
                            return;
                        }
                        if (currentPw !== (u.password || '')) {
                            showProfileMsg('Current password is wrong.');
                            return;
                        }
                    }

                    const patch = { name: nextName };
                    if (nextPw) patch.password = nextPw;
                    updateUserByEmail(session.email, patch);
                    renderAuthState();
                    showProfileMsg('Profile saved.');
                });
            }

            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const session = loadSession();
                    if (!session) return;
                    const ok = window.confirm('Delete your account permanently? This cannot be undone.');
                    if (!ok) return;

                    const users = loadUsers();
                    const email = String(session.email || '').toLowerCase();
                    const next = users.filter((u) => String(u.email || '').toLowerCase() !== email);
                    saveUsers(next);

                    localStorage.removeItem(`dt_orders_${email}`);
                    localStorage.removeItem('dt_cart');
                    localStorage.removeItem('dt_admin_session');
                    clearSession();

                    setProfileModalOpen(false);
                    renderAuthState();
                    alert('Account deleted.');
                });
            }

            renderAuthState();
        })();

(function () {
            const ADMIN_PW_KEY = 'dt_admin_pw';
            const ADMIN_SESSION_KEY = 'dt_admin_session';
            const USERS_KEY = 'dt_users';
            const PRODUCTS_KEY = 'dt_products';

            const adminModal = document.getElementById('adminModal');
            const adminModalPanel = document.getElementById('adminModalPanel');
            const adminModalOverlay = document.getElementById('adminModalOverlay');
            const adminModalClose = document.getElementById('adminModalClose');
            const profileBtn = document.getElementById('profileBtn');

            const cmsToggleBtn = document.getElementById('cmsToggleBtn');

            const adminMsg = document.getElementById('adminMsg');
            const adminLoginPanel = document.getElementById('adminLoginPanel');
            const adminAppPanel = document.getElementById('adminAppPanel');
            const adminLogoutBtn = document.getElementById('adminLogoutBtn');

            const adminLoginForm = document.getElementById('adminLoginForm');
            const adminUsername = document.getElementById('adminUsername');
            const adminPassword = document.getElementById('adminPassword');

            const adminChangePwForm = document.getElementById('adminChangePwForm');
            const adminPwCurrent = document.getElementById('adminPwCurrent');
            const adminPwNew = document.getElementById('adminPwNew');

            const adminTabUsers = document.getElementById('adminTabUsers');
            const adminTabProducts = document.getElementById('adminTabProducts');
            const adminUsersPanel = document.getElementById('adminUsersPanel');
            const adminProductsPanel = document.getElementById('adminProductsPanel');

            const productsExportBtn = document.getElementById('productsExportBtn');
            const productsImportBtn = document.getElementById('productsImportBtn');
            const productsResetBtn = document.getElementById('productsResetBtn');
            const productsImportFile = document.getElementById('productsImportFile');

            const adminAddUserForm = document.getElementById('adminAddUserForm');
            const adminUserEmail = document.getElementById('adminUserEmail');
            const adminUserPassword = document.getElementById('adminUserPassword');
            const adminUserRole = document.getElementById('adminUserRole');
            const adminUsersList = document.getElementById('adminUsersList');
            const adminUsersCount = document.getElementById('adminUsersCount');

            const adminAddProductForm = document.getElementById('adminAddProductForm');
            const adminProductFormTitle = document.getElementById('adminProductFormTitle');
            const adminProductName = document.getElementById('adminProductName');
            const adminProductCategory = document.getElementById('adminProductCategory');
            const adminProductPrice = document.getElementById('adminProductPrice');
            const adminProductImage = document.getElementById('adminProductImage');
            const adminProductImageFile = document.getElementById('adminProductImageFile');
            const adminProductDesc = document.getElementById('adminProductDesc');
            const adminProductSubmitBtn = document.getElementById('adminProductSubmitBtn');
            const adminProductCancelEditBtn = document.getElementById('adminProductCancelEditBtn');
            const adminProductsList = document.getElementById('adminProductsList');
            const adminProductsCount = document.getElementById('adminProductsCount');

            const dynamicEntrees = document.getElementById('dynamicEntrees');
            const dynamicPlats = document.getElementById('dynamicPlats');
            const dynamicDesserts = document.getElementById('dynamicDesserts');

            function safeJsonParse(value) {
                try { return JSON.parse(value); } catch { return null; }
            }

            function showAdminMsg(text) {
                if (!adminMsg) return;
                if (!text) {
                    adminMsg.classList.add('auth-hidden');
                    adminMsg.textContent = '';
                    return;
                }
                adminMsg.textContent = text;
                adminMsg.classList.remove('auth-hidden');
            }

            function ensureDefaultAdminPassword() {
                if (!localStorage.getItem(ADMIN_PW_KEY)) {
                    localStorage.setItem(ADMIN_PW_KEY, 'admin');
                }
            }

            function openAdminModal() {
                if (!adminModal) return;
                adminModal.classList.remove('auth-hidden');
                adminModal.setAttribute('aria-hidden', 'false');

                if (adminModalPanel) {
                    adminModalPanel.classList.remove('auth-panel-in');
                    void adminModalPanel.offsetWidth;
                    adminModalPanel.classList.add('auth-panel-in');
                }
            }

            window.dtOpenAdminModal = openAdminModal;

            function closeAdminModal() {
                if (!adminModal) return;
                adminModal.classList.add('auth-hidden');
                adminModal.setAttribute('aria-hidden', 'true');
            }

            function getAdminPassword() {
                ensureDefaultAdminPassword();
                return localStorage.getItem(ADMIN_PW_KEY) || 'admin';
            }

            function setAdminPassword(newPw) {
                localStorage.setItem(ADMIN_PW_KEY, newPw);
            }

            function isAdminLoggedIn() {
                const raw = localStorage.getItem('dt_session');
                const session = safeJsonParse(raw);
                if (session && session.role && session.role !== 'admin') return false;
                if (session && session.role === 'admin') return true;
                return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
            }

            function setAdminLoggedIn(value) {
                localStorage.setItem(ADMIN_SESSION_KEY, value ? 'true' : 'false');
            }

            function loadUsers() {
                const raw = localStorage.getItem(USERS_KEY);
                const users = safeJsonParse(raw);
                return Array.isArray(users) ? users : [];
            }

            function saveUsers(users) {
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }

            function loadProducts() {
                const raw = localStorage.getItem(PRODUCTS_KEY);
                const products = safeJsonParse(raw);
                return Array.isArray(products) ? products : [];
            }

            function saveProducts(products) {
                localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            }

            function setProductsButtonsVisibility() {
                const loggedIn = isAdminLoggedIn();
                if (productsExportBtn) productsExportBtn.classList.toggle('auth-hidden', !loggedIn);
                if (productsImportBtn) productsImportBtn.classList.toggle('auth-hidden', !loggedIn);
                if (productsResetBtn) productsResetBtn.classList.toggle('auth-hidden', !loggedIn);
            }

            if (productsExportBtn) {
                productsExportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    const products = loadProducts();
                    const payload = JSON.stringify(products, null, 2);
                    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dt_products.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                });
            }

            if (productsImportBtn) {
                productsImportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    if (!productsImportFile) return;
                    productsImportFile.value = '';
                    productsImportFile.click();
                });
            }

            if (productsImportFile) {
                productsImportFile.addEventListener('change', async () => {
                    if (!isAdminLoggedIn()) return;
                    const file = productsImportFile.files && productsImportFile.files[0];
                    if (!file) return;
                    const text = await file.text();
                    let next = null;
                    try {
                        next = JSON.parse(text);
                    } catch {
                        next = null;
                    }
                    if (!Array.isArray(next)) {
                        alert('Invalid file. Please choose a valid dt_products.json export.');
                        return;
                    }
                    const sanitized = next
                        .filter((p) => p && typeof p === 'object')
                        .map((p) => ({
                            name: String(p.name || '').trim(),
                            category: ['entree', 'plat', 'dessert'].includes(String(p.category || '').trim())
                                ? String(p.category || '').trim()
                                : 'entree',
                            price: Number(p.price || 0),
                            image: String(p.image || '').trim(),
                            description: String(p.description || '').trim(),
                        }))
                        .filter((p) => p.name);

                    saveProducts(sanitized);
                    renderProductsList();
                    renderLandingProducts();
                });
            }

            if (productsResetBtn) {
                productsResetBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    const ok = window.confirm('Reset all saved products?');
                    if (!ok) return;
                    localStorage.removeItem(PRODUCTS_KEY);
                    renderProductsList();
                    renderLandingProducts();
                });
            }

            function setAdminTab(tab) {
                const usersTab = tab === 'users';
                if (adminUsersPanel) adminUsersPanel.classList.toggle('auth-hidden', !usersTab);
                if (adminProductsPanel) adminProductsPanel.classList.toggle('auth-hidden', usersTab);

                if (adminTabUsers) {
                    adminTabUsers.className = usersTab
                        ? 'border border-brand-line/80 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink'
                        : 'border border-brand-line/80 bg-brand-paper px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted';
                }
                if (adminTabProducts) {
                    adminTabProducts.className = !usersTab
                        ? 'border border-brand-line/80 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink'
                        : 'border border-brand-line/80 bg-brand-paper px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted';
                }
            }

            function renderUsersList() {
                if (!adminUsersList) return;
                const users = loadUsers();
                if (adminUsersCount) adminUsersCount.textContent = String(users.length);

                adminUsersList.innerHTML = users.map((u, idx) => {
                    const email = u.email || '';
                    const role = u.role || 'user';
                    const avatar = u.avatar || '';
                    return `
<div class="flex items-center justify-between gap-3 border border-brand-line/80 bg-brand-paper px-4 py-3">
  <div class="flex min-w-0 items-center gap-3">
    ${avatar ? `<img src="${avatar}" alt="" class="h-10 w-10 flex-none rounded-full object-cover" />` : `<div class="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-brand-line/80 bg-white text-xs font-semibold text-brand-bronze">${String(email).slice(0,2).toUpperCase()}</div>`}
    <div class="min-w-0">
      <div class="truncate text-sm font-semibold text-brand-ink">${email}</div>
      <div class="text-xs uppercase tracking-[0.22em] text-brand-muted">${role}</div>
    </div>
  </div>
  <button type="button" class="border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700" data-admin-del-user="${idx}">Delete</button>
</div>`;
                }).join('');
            }

            function renderProductsList() {
                if (!adminProductsList) return;
                const products = loadProducts();
                if (adminProductsCount) adminProductsCount.textContent = String(products.length);

                adminProductsList.innerHTML = products.map((p, idx) => {
                    const name = p.name || '';
                    const price = typeof p.price === 'number' ? p.price.toFixed(2) : String(p.price || '0');
                    const category = String(p.category || '').toLowerCase();
                    const img = p.image || '';
                    const categoryLabel = category === 'dessert' ? 'Desserts' : category === 'plat' ? 'Plats Principaux' : 'Entrées';
                    return `
<div class="flex items-center justify-between gap-3 border border-brand-line/80 bg-brand-paper px-4 py-3">
  <div class="flex min-w-0 items-center gap-3">
    ${img ? `<img src="${img}" alt="" class="h-10 w-10 flex-none object-cover" />` : ''}
    <div class="min-w-0">
    <div class="truncate text-sm font-semibold text-brand-ink">${name}</div>
    <div class="text-xs uppercase tracking-[0.22em] text-brand-muted">${categoryLabel} · ${price} DH</div>
    </div>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <button type="button" class="border border-brand-line/80 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent" data-admin-edit-product="${idx}">Edit</button>
    <button type="button" class="border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700" data-admin-del-product="${idx}">Delete</button>
  </div>
</div>`;
                }).join('');
            }

            function renderLandingProducts() {
                const products = loadProducts();

                if (dynamicEntrees) dynamicEntrees.innerHTML = '';
                if (dynamicPlats) dynamicPlats.innerHTML = '';
                if (dynamicDesserts) dynamicDesserts.innerHTML = '';

                if (!products.length) {
                    return;
                }

                const toCard = (p) => {
                    const name = p.name || '';
                    const price = typeof p.price === 'number' ? p.price.toFixed(2) : String(p.price || '0');
                    const img = p.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80';
                    const desc = p.description || '';
                    return `
<div data-menu-card="1" class="group overflow-hidden border border-brand-line/80 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
  <div class="overflow-hidden">
    <img src="${img}" alt="${name}" class="h-56 w-full object-fill transition-transform duration-700 group-hover:scale-[1.05]">
  </div>
  <div class="p-6">
    <div class="flex items-start justify-between gap-4">
      <h4 class="font-display text-xl font-bold text-brand-ink">${name}</h4>
      <span class="text-sm font-semibold tracking-wide text-brand-bronze">${price} DH</span>
    </div>
    ${desc ? `<p class="mt-3 text-sm leading-relaxed text-brand-muted">${desc}</p>` : ''}
  </div>
</div>`;
                };

                const entrees = [];
                const plats = [];
                const desserts = [];

                for (const p of products) {
                    const c = String(p.category || 'entree').toLowerCase();
                    if (c === 'dessert') desserts.push(p);
                    else if (c === 'plat') plats.push(p);
                    else entrees.push(p);
                }

                if (dynamicEntrees) dynamicEntrees.innerHTML = entrees.map(toCard).join('');
                if (dynamicPlats) dynamicPlats.innerHTML = plats.map(toCard).join('');
                if (dynamicDesserts) dynamicDesserts.innerHTML = desserts.map(toCard).join('');
            }

            function renderAdminUI() {
                const loggedIn = isAdminLoggedIn();
                if (adminLoginPanel) adminLoginPanel.classList.toggle('auth-hidden', loggedIn);
                if (adminAppPanel) adminAppPanel.classList.toggle('auth-hidden', !loggedIn);
                if (adminLogoutBtn) adminLogoutBtn.classList.toggle('auth-hidden', !loggedIn);

                if (cmsToggleBtn) cmsToggleBtn.classList.toggle('auth-hidden', !loggedIn);
                setProductsButtonsVisibility();

                if (loggedIn) {
                    renderUsersList();
                    renderProductsList();
                }
            }

            window.dtRenderAdminUI = renderAdminUI;

            let editingProductIndex = null;

            function resetProductForm() {
                editingProductIndex = null;
                if (adminProductFormTitle) adminProductFormTitle.textContent = 'Add product';
                if (adminProductSubmitBtn) adminProductSubmitBtn.textContent = 'Add';
                if (adminProductCancelEditBtn) adminProductCancelEditBtn.classList.add('auth-hidden');
                if (adminProductName) adminProductName.value = '';
                if (adminProductCategory) adminProductCategory.value = 'entree';
                if (adminProductPrice) adminProductPrice.value = '';
                if (adminProductImage) adminProductImage.value = '';
                if (adminProductImageFile) adminProductImageFile.value = '';
                if (adminProductDesc) adminProductDesc.value = '';
            }

            ensureDefaultAdminPassword();
            setAdminTab('users');
            renderAdminUI();
            renderLandingProducts();

            const CART_KEY = 'dt_cart';
            const cartBtn = document.getElementById('cartBtn');
            const cartBadge = document.getElementById('cartBadge');
            const cartPanel = document.getElementById('cartPanel');
            const cartOverlay = document.getElementById('cartOverlay');
            const cartClose = document.getElementById('cartClose');
            const cartList = document.getElementById('cartList');
            const cartEmpty = document.getElementById('cartEmpty');
            const cartTotal = document.getElementById('cartTotal');
            const cartClear = document.getElementById('cartClear');
            const cartCheckout = document.getElementById('cartCheckout');
            const cartToDelivery = document.getElementById('cartToDelivery');

            const ordersBtn = document.getElementById('ordersBtn');
            const ordersModal = document.getElementById('ordersModal');
            const ordersOverlay = document.getElementById('ordersOverlay');
            const ordersClose = document.getElementById('ordersClose');
            const ordersList = document.getElementById('ordersList');
            const ordersEmpty = document.getElementById('ordersEmpty');

            const deliveryOrder = document.getElementById('deliveryOrder');
            const deliveryNotes = document.getElementById('deliveryNotes');

            const menuSearch = document.getElementById('menuSearch');
            const menuSearchClear = document.getElementById('menuSearchClear');

            const productModal = document.getElementById('productModal');
            const productModalOverlay = document.getElementById('productModalOverlay');
            const productModalPanel = document.getElementById('productModalPanel');
            const productModalClose = document.getElementById('productModalClose');
            const productModalTitle = document.getElementById('productModalTitle');
            const productModalImg = document.getElementById('productModalImg');
            const productModalName = document.getElementById('productModalName');
            const productModalDesc = document.getElementById('productModalDesc');
            const productModalPrice = document.getElementById('productModalPrice');
            const productModalNotes = document.getElementById('productModalNotes');
            const productModalNotesHint = document.getElementById('productModalNotesHint');
            const productModalClearNotes = document.getElementById('productModalClearNotes');
            const productModalQtyMinus = document.getElementById('productModalQtyMinus');
            const productModalQtyPlus = document.getElementById('productModalQtyPlus');
            const productModalQty = document.getElementById('productModalQty');
            const productModalAdd = document.getElementById('productModalAdd');

            let activeProduct = null;
            let activeQty = 1;

            function safeJsonParse(value) {
                try { return JSON.parse(value); } catch { return null; }
            }

            function loadCart() {
                const raw = localStorage.getItem(CART_KEY);
                const cart = safeJsonParse(raw);
                return Array.isArray(cart) ? cart : [];
            }

            function saveCart(cart) {
                localStorage.setItem(CART_KEY, JSON.stringify(cart));
            }

            function loadSession() {
                const raw = localStorage.getItem('dt_session');
                const session = safeJsonParse(raw);
                if (!session || !session.email) return null;
                return session;
            }

            function currentUserKey(suffix) {
                const session = loadSession();
                const email = session ? String(session.email || '').toLowerCase() : 'guest';
                return `dt_${suffix}_${email}`;
            }

            function loadOrders() {
                const raw = localStorage.getItem(currentUserKey('orders'));
                const orders = safeJsonParse(raw);
                return Array.isArray(orders) ? orders : [];
            }

            function saveOrders(orders) {
                localStorage.setItem(currentUserKey('orders'), JSON.stringify(orders));
            }

            function setOrdersOpen(open) {
                if (!ordersModal) return;
                ordersModal.classList.toggle('auth-hidden', !open);
                ordersModal.setAttribute('aria-hidden', open ? 'false' : 'true');
                document.body.style.overflow = open ? 'hidden' : '';
                const panel = document.getElementById('ordersPanel');
                if (open && panel) {
                    panel.classList.remove('auth-panel-in');
                    void panel.offsetWidth;
                    panel.classList.add('auth-panel-in');
                }
            }

            function stringifyCartForDelivery(cart) {
                return cart.map((it) => {
                    const qty = Number(it.qty) || 1;
                    const name = it.name || '';
                    return `${qty}x ${name}`;
                }).join(', ');
            }

            function stringifyNotesForDelivery(cart) {
                const lines = [];
                for (const it of cart) {
                    const notes = (it.notes || '').trim();
                    if (!notes) continue;
                    const qty = Number(it.qty) || 1;
                    lines.push(`${qty}x ${it.name}: ${notes}`);
                }
                return lines.join('\n');
            }

            function renderOrders() {
                if (!ordersList || !ordersEmpty) return;
                const orders = loadOrders();
                if (!orders.length) {
                    ordersList.innerHTML = '';
                    ordersEmpty.classList.remove('auth-hidden');
                    return;
                }
                ordersEmpty.classList.add('auth-hidden');
                ordersList.innerHTML = orders.slice().reverse().map((o) => {
                    const id = o.id || '';
                    const createdAt = o.createdAt || '';
                    const total = Number(o.total) || 0;
                    const items = Array.isArray(o.items) ? o.items : [];
                    const status = String(o.status || '');
                    const statusTag = status === 'delivered'
                        ? '<div class="text-xs font-semibold text-green-700">Livrée</div>'
                        : '';
                    const lines = items.map((it) => {
                        const qty = Number(it.qty) || 1;
                        const name = it.name || '';
                        const notes = (it.notes || '').trim();
                        return `<div class="text-sm text-brand-ink"><span class="font-semibold">${qty}x</span> ${name}${notes ? ` <span class=\"text-xs text-brand-muted\">— ${notes.replace(/</g, '&lt;')}</span>` : ''}</div>`;
                    }).join('');

                    return `
<div class="border border-brand-line/80 bg-white shadow-soft">
  <div class="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
    <div class="min-w-0">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">${createdAt}</div>
      <div class="mt-2 flex items-center gap-3 text-sm font-semibold text-brand-ink"><span>Order #${id}</span>${statusTag}</div>
      <div class="mt-3 space-y-2">${lines}</div>
    </div>
    <div class="shrink-0">
      <div class="text-sm font-semibold tracking-wide text-brand-bronze">${formatMoney(total)}</div>
      <div class="mt-3 grid gap-2">
        <button type="button" class="border border-brand-line/80 bg-brand-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent" data-order-reorder="${id}">Reorder</button>
      </div>
    </div>
  </div>
</div>`;
                }).join('');
            }

            function formatMoney(n) {
                const v = typeof n === 'number' && Number.isFinite(n) ? n : Number(n);
                const num = Number.isFinite(v) ? v : 0;
                return `${num.toFixed(2)} DH`;
            }

            function parsePriceText(text) {
                const raw = String(text || '').replace(',', '.');
                const m = raw.match(/\d+(?:\.\d+)?/);
                return m ? Number(m[0]) : 0;
            }

            function setCartOpen(open) {
                if (!cartPanel) return;
                cartPanel.classList.toggle('auth-hidden', !open);
                cartPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
                document.body.style.overflow = open ? 'hidden' : '';
            }

            function setProductModalOpen(open) {
                if (!productModal) return;
                productModal.classList.toggle('auth-hidden', !open);
                productModal.setAttribute('aria-hidden', open ? 'false' : 'true');
                document.body.style.overflow = open ? 'hidden' : '';
                if (open && productModalPanel) {
                    productModalPanel.classList.remove('auth-panel-in');
                    void productModalPanel.offsetWidth;
                    productModalPanel.classList.add('auth-panel-in');
                }
            }

            function setQty(next) {
                const q = Math.max(1, Math.min(99, Number(next) || 1));
                activeQty = q;
                if (productModalQty) productModalQty.textContent = String(q);
            }

            function updateNotesHint() {
                if (!productModalNotesHint || !productModalNotes) return;
                productModalNotesHint.textContent = `${String((productModalNotes.value || '').length)}/240`;
            }

            function renderCart() {
                if (!cartList || !cartTotal || !cartEmpty) return;
                const cart = loadCart();
                const count = cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
                if (cartBadge) cartBadge.textContent = String(count);

                if (!cart.length) {
                    cartList.innerHTML = '';
                    cartTotal.textContent = formatMoney(0);
                    cartEmpty.classList.remove('auth-hidden');
                    return;
                }

                cartEmpty.classList.add('auth-hidden');
                let total = 0;
                cartList.innerHTML = cart.map((it, idx) => {
                    const name = it.name || '';
                    const price = Number(it.price) || 0;
                    const qty = Number(it.qty) || 1;
                    const img = it.img || '';
                    const notes = (it.notes || '').trim();
                    total += price * qty;
                    return `
<div class="border border-brand-line/80 bg-white shadow-soft">
  <div class="flex gap-4 p-4">
    ${img ? `<img src="${img}" alt="" class="h-16 w-16 flex-none object-cover" />` : ''}
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold text-brand-ink">${name}</div>
          <div class="mt-1 text-xs uppercase tracking-[0.22em] text-brand-muted">${qty} × ${formatMoney(price)}</div>
        </div>
        <button type="button" class="border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700" data-cart-remove="${idx}">Remove</button>
      </div>
      ${notes ? `<div class="mt-3 border border-brand-line/80 bg-brand-paper px-3 py-2 text-xs leading-relaxed text-brand-muted"><span class="font-semibold text-brand-ink">Notes:</span> ${notes.replace(/</g, '&lt;')}</div>` : ''}
      <div class="mt-3 flex items-center gap-2">
        <button type="button" class="h-9 w-9 border border-brand-line/80 bg-white text-sm font-semibold text-brand-ink" data-cart-qty-minus="${idx}">−</button>
        <div class="min-w-[34px] text-center text-sm font-semibold text-brand-ink">${qty}</div>
        <button type="button" class="h-9 w-9 border border-brand-line/80 bg-white text-sm font-semibold text-brand-ink" data-cart-qty-plus="${idx}">+</button>
      </div>
    </div>
  </div>
</div>`;
                }).join('');

                cartTotal.textContent = formatMoney(total);
            }

            function applyMenuSearch(query) {
                const q = String(query || '').trim().toLowerCase();
                const cards = Array.from(document.querySelectorAll('[data-menu-card="1"]'));
                if (!q) {
                    for (const c of cards) c.style.display = '';
                    return;
                }
                for (const c of cards) {
                    const text = (c.textContent || '').toLowerCase();
                    c.style.display = text.includes(q) ? '' : 'none';
                }
            }

            function extractProductFromCard(card) {
                if (!card) return null;
                const nameEl = card.querySelector('h4');
                const priceEl = card.querySelector('span');
                const descEl = card.querySelector('p');
                const imgEl = card.querySelector('img');
                const name = (nameEl && nameEl.textContent || '').trim();
                const priceText = (priceEl && priceEl.textContent || '').trim();
                const desc = (descEl && descEl.textContent || '').trim();
                const img = imgEl ? (imgEl.getAttribute('src') || '') : '';
                return {
                    id: `${name}__${priceText}__${desc}`.slice(0, 180),
                    name,
                    price: parsePriceText(priceText),
                    priceText,
                    desc,
                    img,
                };
            }

            function openProductModalFromCard(card) {
                const p = extractProductFromCard(card);
                if (!p || !p.name) return;
                activeProduct = p;
                setQty(1);
                if (productModalTitle) productModalTitle.textContent = p.name;
                if (productModalName) productModalName.textContent = p.name;
                if (productModalDesc) productModalDesc.textContent = p.desc || '';
                if (productModalPrice) productModalPrice.textContent = p.priceText || formatMoney(p.price);
                if (productModalImg) {
                    productModalImg.src = p.img || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80';
                    productModalImg.alt = p.name;
                }
                if (productModalNotes) {
                    productModalNotes.value = '';
                    updateNotesHint();
                }
                setProductModalOpen(true);
                if (productModalNotes && typeof productModalNotes.focus === 'function') productModalNotes.focus();
            }

            document.addEventListener('click', (e) => {
                const t = e.target;
                if (!t) return;

                if (t.closest && t.closest('[data-menu-card="1"]')) {
                    const card = t.closest('[data-menu-card="1"]');
                    if (!card) return;
                    e.preventDefault();
                    openProductModalFromCard(card);
                    return;
                }

                const cartBtnClick = t.closest ? t.closest('#cartBtn') : null;
                if (cartBtn && cartBtnClick) {
                    e.preventDefault();
                    renderCart();
                    setCartOpen(true);
                    return;
                }

                const ordersBtnClick = t.closest ? t.closest('#ordersBtn') : null;
                if (ordersBtn && ordersBtnClick) {
                    e.preventDefault();
                    renderOrders();
                    setOrdersOpen(true);
                    return;
                }

                if (t.closest && (t.closest('#ordersClose') || t.closest('#ordersOverlay'))) {
                    e.preventDefault();
                    setOrdersOpen(false);
                    return;
                }

                if (t.closest && (t.closest('#cartClose') || t.closest('#cartOverlay'))) {
                    e.preventDefault();
                    setCartOpen(false);
                    return;
                }

                if (t.closest && (t.closest('#productModalClose') || t.closest('#productModalOverlay'))) {
                    e.preventDefault();
                    setProductModalOpen(false);
                    return;
                }

                if (productModalQtyMinus && t === productModalQtyMinus) {
                    e.preventDefault();
                    setQty(activeQty - 1);
                    return;
                }

                if (productModalQtyPlus && t === productModalQtyPlus) {
                    e.preventDefault();
                    setQty(activeQty + 1);
                    return;
                }

                if (productModalClearNotes && t === productModalClearNotes) {
                    e.preventDefault();
                    if (productModalNotes) productModalNotes.value = '';
                    updateNotesHint();
                    if (productModalNotes && typeof productModalNotes.focus === 'function') productModalNotes.focus();
                    return;
                }

                if (productModalAdd && t === productModalAdd) {
                    e.preventDefault();
                    if (!activeProduct) return;
                    const notes = (productModalNotes && productModalNotes.value || '').trim();
                    const cart = loadCart();
                    cart.push({
                        id: `${activeProduct.id}__${Date.now()}`,
                        name: activeProduct.name,
                        price: Number(activeProduct.price) || 0,
                        img: activeProduct.img || '',
                        notes,
                        qty: activeQty,
                    });
                    saveCart(cart);
                    renderCart();
                    setProductModalOpen(false);
                    setCartOpen(true);
                    return;
                }

                if (cartList && t.closest) {
                    const rm = t.closest('[data-cart-remove]');
                    if (rm) {
                        e.preventDefault();
                        const i = Number(rm.getAttribute('data-cart-remove'));
                        const cart = loadCart();
                        if (!Number.isNaN(i) && i >= 0 && i < cart.length) {
                            cart.splice(i, 1);
                            saveCart(cart);
                            renderCart();
                        }
                        return;
                    }
                    const minus = t.closest('[data-cart-qty-minus]');
                    if (minus) {
                        e.preventDefault();
                        const i = Number(minus.getAttribute('data-cart-qty-minus'));
                        const cart = loadCart();
                        if (!Number.isNaN(i) && i >= 0 && i < cart.length) {
                            cart[i].qty = Math.max(1, (Number(cart[i].qty) || 1) - 1);
                            saveCart(cart);
                            renderCart();
                        }
                        return;
                    }
                    const plus = t.closest('[data-cart-qty-plus]');
                    if (plus) {
                        e.preventDefault();
                        const i = Number(plus.getAttribute('data-cart-qty-plus'));
                        const cart = loadCart();
                        if (!Number.isNaN(i) && i >= 0 && i < cart.length) {
                            cart[i].qty = Math.min(99, (Number(cart[i].qty) || 1) + 1);
                            saveCart(cart);
                            renderCart();
                        }
                        return;
                    }
                }

                const cartClearClick = t.closest ? t.closest('#cartClear') : null;
                if (cartClear && cartClearClick) {
                    e.preventDefault();
                    const ok = confirm('Clear your cart?');
                    if (!ok) return;
                    saveCart([]);
                    renderCart();
                    return;
                }

                const cartCheckoutClick = t.closest ? t.closest('#cartCheckout') : null;
                if (cartCheckout && cartCheckoutClick) {
                    e.preventDefault();
                    const cart = loadCart();
                    if (!cart.length) return;
                    const session = loadSession();
                    if (!session) return;
                    const total = cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
                    const orders = loadOrders();
                    const id = String(Date.now());
                    const createdAt = new Date().toLocaleString();
                    orders.push({ id, createdAt, total, items: cart });
                    saveOrders(orders);
                    saveCart([]);
                    renderCart();
                    renderOrders();
                    setCartOpen(false);
                    return;
                }

                const cartToDeliveryClick = t.closest ? t.closest('#cartToDelivery') : null;
                if (cartToDelivery && cartToDeliveryClick) {
                    e.preventDefault();
                    const cart = loadCart();
                    if (!cart.length) return;
                    if (deliveryOrder) deliveryOrder.value = stringifyCartForDelivery(cart);
                    const notes = stringifyNotesForDelivery(cart);
                    if (deliveryNotes && notes) deliveryNotes.value = notes;
                    setCartOpen(false);
                    const section = document.getElementById('livraison');
                    if (section && typeof section.scrollIntoView === 'function') section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }

                if (ordersList && t.closest) {
                    const btn = t.closest('[data-order-reorder]');
                    if (btn) {
                        e.preventDefault();
                        const id = String(btn.getAttribute('data-order-reorder') || '');
                        const orders = loadOrders();
                        const order = orders.find((o) => String(o.id) === id);
                        if (!order || !Array.isArray(order.items)) return;
                        saveCart(order.items);
                        renderCart();
                        setOrdersOpen(false);
                        setCartOpen(true);
                        return;
                    }
                }
            }, true);

            if (productModalNotes) {
                productModalNotes.addEventListener('input', () => {
                    updateNotesHint();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                if (productModal && !productModal.classList.contains('auth-hidden')) {
                    setProductModalOpen(false);
                    return;
                }
                if (cartPanel && !cartPanel.classList.contains('auth-hidden')) {
                    setCartOpen(false);
                    return;
                }
                if (ordersModal && !ordersModal.classList.contains('auth-hidden')) {
                    setOrdersOpen(false);
                    return;
                }
            });

            renderCart();
            renderOrders();

            if (menuSearch) {
                menuSearch.addEventListener('input', () => {
                    applyMenuSearch(menuSearch.value);
                });
            }

            if (menuSearchClear) {
                menuSearchClear.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (menuSearch) menuSearch.value = '';
                    applyMenuSearch('');
                    if (menuSearch && typeof menuSearch.focus === 'function') menuSearch.focus();
                });
            }

            const CMS_KEY = 'dt_cms_overrides';
            const cmsExportBtn = document.getElementById('cmsExportBtn');
            const cmsImportBtn = document.getElementById('cmsImportBtn');
            const cmsResetBtn = document.getElementById('cmsResetBtn');
            const cmsImportFile = document.getElementById('cmsImportFile');
            let cmsEnabled = false;
            let cmsToolbar = null;
            let cmsActiveEl = null;

            function getCmsStore() {
                const raw = localStorage.getItem(CMS_KEY);
                const store = safeJsonParse(raw);
                return store && typeof store === 'object' ? store : {};
            }

            function setCmsStore(store) {
                localStorage.setItem(CMS_KEY, JSON.stringify(store));
            }

            function elKey(el) {
                if (!el) return '';
                if (el.dataset && el.dataset.cmsKey) return el.dataset.cmsKey;
                if (el.id) {
                    el.dataset.cmsKey = `#${el.id}`;
                    return el.dataset.cmsKey;
                }
                const parts = [];
                let node = el;
                while (node && node.nodeType === 1 && node !== document.body) {
                    const tag = node.tagName.toLowerCase();
                    const parent = node.parentElement;
                    if (!parent) break;
                    const siblings = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
                    const idx = siblings.indexOf(node) + 1;
                    parts.unshift(`${tag}:nth-of-type(${idx})`);
                    node = parent;
                }
                const key = parts.join('>');
                el.dataset.cmsKey = key;
                return key;
            }

            function isCmsEditable(el) {
                if (!el || el.nodeType !== 1) return false;
                const tag = el.tagName.toLowerCase();
                if (['script', 'style', 'html', 'head', 'body'].includes(tag)) return false;
                if (el.closest('nav')) return false;
                if (el.closest('#mobileMenuPanel')) return false;
                if (el.closest('#authModal') || el.closest('#adminModal')) return false;
                if (el.closest('form')) return false;
                if (['input', 'textarea', 'select', 'button'].includes(tag)) return false;
                const allowed = ['h1','h2','h3','h4','h5','h6','p','span','a','li','small','strong','em','div'];
                if (!allowed.includes(tag)) return false;
                const text = (el.textContent || '').trim();
                if (!text) return false;
                return true;
            }

            function applyCmsOverrides() {
                const store = getCmsStore();
                for (const [key, val] of Object.entries(store)) {
                    if (!val || typeof val !== 'object') continue;
                    let el = null;
                    if (key.startsWith('#')) {
                        el = document.getElementById(key.slice(1));
                    }
                    if (!el) {
                        try {
                            el = document.querySelector(key);
                        } catch {
                            el = null;
                        }
                    }
                    if (!el) continue;
                    if (val.deleted) {
                        el.style.display = 'none';
                        continue;
                    }
                    if (typeof val.html === 'string') {
                        el.innerHTML = val.html;
                    }
                }
            }

            function ensureToolbar() {
                if (cmsToolbar) return cmsToolbar;
                const bar = document.createElement('div');
                bar.id = 'cmsToolbar';
                bar.style.position = 'absolute';
                bar.style.zIndex = '9999';
                bar.style.display = 'none';
                bar.innerHTML = `
<div class="flex items-center gap-2 border border-brand-line/80 bg-white px-2 py-2 shadow-soft">
  <button type="button" data-cms-action="edit" class="border border-brand-line/80 bg-brand-cream px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">Edit</button>
  <button type="button" data-cms-action="delete" class="border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Delete</button>
</div>`;
                document.body.appendChild(bar);
                cmsToolbar = bar;
                return bar;
            }

            function hideToolbar() {
                if (!cmsToolbar) return;
                cmsToolbar.style.display = 'none';
                cmsActiveEl = null;
            }

            function showToolbarFor(el) {
                if (!cmsEnabled) return;
                if (!isCmsEditable(el)) return;
                const bar = ensureToolbar();
                const rect = el.getBoundingClientRect();
                bar.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;
                bar.style.top = `${Math.max(8, rect.top + window.scrollY - 44)}px`;
                bar.style.display = 'block';
                cmsActiveEl = el;
            }

            function setCmsEnabled(enabled) {
                cmsEnabled = !!enabled;
                if (cmsToggleBtn) cmsToggleBtn.textContent = cmsEnabled ? 'Edit mode: on' : 'Edit mode: off';
                if (!cmsEnabled) {
                    hideToolbar();
                }
            }

            function setCmsButtonsVisibility() {
                const loggedIn = isAdminLoggedIn();
                if (cmsExportBtn) cmsExportBtn.classList.toggle('auth-hidden', !loggedIn);
                if (cmsImportBtn) cmsImportBtn.classList.toggle('auth-hidden', !loggedIn);
                if (cmsResetBtn) cmsResetBtn.classList.toggle('auth-hidden', !loggedIn);
            }

            applyCmsOverrides();

            setCmsButtonsVisibility();

            if (cmsExportBtn) {
                cmsExportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    const store = getCmsStore();
                    const payload = JSON.stringify(store, null, 2);
                    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dt_cms_overrides.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                });
            }

            if (cmsImportBtn) {
                cmsImportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    if (!cmsImportFile) return;
                    cmsImportFile.value = '';
                    cmsImportFile.click();
                });
            }

            if (cmsImportFile) {
                cmsImportFile.addEventListener('change', async () => {
                    if (!isAdminLoggedIn()) return;
                    const file = cmsImportFile.files && cmsImportFile.files[0];
                    if (!file) return;
                    const text = await file.text();
                    let next = null;
                    try {
                        next = JSON.parse(text);
                    } catch {
                        next = null;
                    }
                    if (!next || typeof next !== 'object' || Array.isArray(next)) {
                        alert('Invalid file. Please choose a valid dt_cms_overrides.json export.');
                        return;
                    }
                    setCmsStore(next);
                    window.location.reload();
                });
            }

            if (cmsResetBtn) {
                cmsResetBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    const ok = window.confirm('Reset all saved edits?');
                    if (!ok) return;
                    localStorage.removeItem(CMS_KEY);
                    window.location.reload();
                });
            }

            if (cmsToggleBtn) {
                cmsToggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    setCmsEnabled(!cmsEnabled);
                });
            }

            document.addEventListener('scroll', () => {
                if (!cmsEnabled) return;
                if (!cmsActiveEl) return;
                showToolbarFor(cmsActiveEl);
            }, true);

            document.addEventListener('click', (e) => {
                if (!cmsEnabled) return;
                ensureToolbar();

                const btn = e.target && e.target.closest ? e.target.closest('[data-cms-action]') : null;
                if (btn && cmsToolbar && cmsToolbar.contains(btn)) {
                    e.preventDefault();
                    e.stopPropagation();

                    const action = btn.getAttribute('data-cms-action');
                    const el = cmsActiveEl;
                    if (!el) return;

                    const key = elKey(el);
                    const store = getCmsStore();

                    if (action === 'delete') {
                        const ok = window.confirm('Delete this text?');
                        if (!ok) return;
                        store[key] = { deleted: true };
                        setCmsStore(store);
                        el.style.display = 'none';
                        hideToolbar();
                        return;
                    }

                    if (action === 'edit') {
                        const nextHtml = window.prompt('Edit HTML (OK to save, Cancel to abort):', el.innerHTML);
                        if (nextHtml === null) return;
                        store[key] = { html: nextHtml };
                        setCmsStore(store);
                        el.innerHTML = nextHtml;
                        hideToolbar();
                    }
                    return;
                }

                const target = e.target;
                const editable = target && isCmsEditable(target) ? target : null;
                if (editable) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (cmsActiveEl === editable && cmsToolbar && cmsToolbar.style.display === 'block') {
                        hideToolbar();
                        return;
                    }

                    showToolbarFor(editable);
                    return;
                }

                if (cmsToolbar && !cmsToolbar.contains(e.target)) {
                    hideToolbar();
                }
            }, true);

            document.addEventListener('click', (e) => {
                const t = e.target;
                if (!t) return;
                if (t.closest && (t.closest('#adminModalClose') || t.closest('#adminModalOverlay'))) {
                    e.preventDefault();
                    closeAdminModal();
                }
            }, true);

            if (adminLoginForm) {
                adminLoginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    showAdminMsg('');

                    const user = (adminUsername.value || '').trim();
                    const pw = (adminPassword.value || '').trim();
                    const correctPw = getAdminPassword();

                    if (user !== 'admin@gmail.com') {
                        showAdminMsg('Wrong email. Use: admin@gmail.com');
                        return;
                    }
                    if (pw !== correctPw) {
                        showAdminMsg('Wrong password.');
                        return;
                    }

                    setAdminLoggedIn(true);
                    showAdminMsg('Login successful.');
                    renderAdminUI();
                });
            }

            if (profileBtn) {
                profileBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const adminOk = isAdminLoggedIn();
                    if (!adminOk) return;
                    setAdminLoggedIn(true);
                    renderAdminUI();
                    openAdminModal();
                });
            }

            if (adminLogoutBtn) {
                adminLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    setAdminLoggedIn(false);
                    showAdminMsg('Logged out.');
                    renderAdminUI();
                    closeAdminModal();
                });
            }

            if (adminChangePwForm) {
                adminChangePwForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    showAdminMsg('');

                    if (!isAdminLoggedIn()) {
                        showAdminMsg('Please login first to change password.');
                        return;
                    }

                    const current = (adminPwCurrent.value || '').trim();
                    const next = (adminPwNew.value || '').trim();
                    if (!current || !next) return;

                    if (current !== getAdminPassword()) {
                        showAdminMsg('Current password is wrong.');
                        return;
                    }

                    setAdminPassword(next);
                    adminPwCurrent.value = '';
                    adminPwNew.value = '';
                    showAdminMsg('Password updated.');
                });
            }

            if (adminTabUsers) {
                adminTabUsers.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    setAdminTab('users');
                });
            }

            if (adminTabProducts) {
                adminTabProducts.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    setAdminTab('products');
                });
            }

            if (adminAddUserForm) {
                adminAddUserForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    showAdminMsg('');
                    if (!isAdminLoggedIn()) return;

                    const email = (adminUserEmail.value || '').trim().toLowerCase();
                    const password = (adminUserPassword.value || '').trim();
                    const role = (adminUserRole && adminUserRole.value) ? adminUserRole.value : 'user';
                    if (!email || !password) return;

                    const users = loadUsers();
                    const exists = users.some((u) => (u.email || '').toLowerCase() === email);
                    if (exists) {
                        showAdminMsg('User already exists.');
                        return;
                    }

                    users.push({ email, password, role });
                    saveUsers(users);
                    adminUserEmail.value = '';
                    adminUserPassword.value = '';
                    renderUsersList();
                });
            }

            if (adminUsersList) {
                adminUsersList.addEventListener('click', (e) => {
                    const btn = e.target && e.target.closest ? e.target.closest('[data-admin-del-user]') : null;
                    if (!btn) return;
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;

                    const i = Number(btn.getAttribute('data-admin-del-user'));
                    const users = loadUsers();
                    if (Number.isNaN(i) || i < 0 || i >= users.length) return;
                    users.splice(i, 1);
                    saveUsers(users);
                    renderUsersList();
                });
            }

            if (adminAddProductForm) {
                adminAddProductForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    showAdminMsg('');
                    if (!isAdminLoggedIn()) return;

                    const name = (adminProductName && adminProductName.value || '').trim();
                    const category = (adminProductCategory && adminProductCategory.value || 'entree').trim();
                    const price = Number(adminProductPrice && adminProductPrice.value);
                    const url = (adminProductImage && adminProductImage.value || '').trim();
                    const desc = (adminProductDesc && adminProductDesc.value || '').trim();
                    const file = adminProductImageFile && adminProductImageFile.files ? adminProductImageFile.files[0] : null;

                    const saveProduct = (imageValue) => {
                        const products = loadProducts();
                        const isEditing = typeof editingProductIndex === 'number' && editingProductIndex >= 0 && editingProductIndex < products.length;

                        if (isEditing) {
                            const prev = products[editingProductIndex] || {};
                            const nextImage = imageValue || url || prev.image || '';
                            products[editingProductIndex] = { ...prev, name, category, price, image: nextImage, description: desc };
                        } else {
                            products.push({ name, category, price, image: imageValue || url || '', description: desc });
                        }

                        saveProducts(products);
                        resetProductForm();
                        renderProductsList();
                        renderLandingProducts();
                    };

                    if (file) {
                        const reader = new FileReader();
                        reader.onload = () => saveProduct(String(reader.result || ''));
                        reader.onerror = () => saveProduct('');
                        reader.readAsDataURL(file);
                        return;
                    }

                    saveProduct('');
                });
            }

            if (adminProductCancelEditBtn) {
                adminProductCancelEditBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;
                    resetProductForm();
                });
            }

            if (adminProductsList) {
                adminProductsList.addEventListener('click', (e) => {
                    const editBtn = e.target && e.target.closest ? e.target.closest('[data-admin-edit-product]') : null;
                    if (editBtn) {
                        e.preventDefault();
                        if (!isAdminLoggedIn()) return;
                        const i = Number(editBtn.getAttribute('data-admin-edit-product'));
                        const products = loadProducts();
                        if (Number.isNaN(i) || i < 0 || i >= products.length) return;
                        const p = products[i] || {};
                        editingProductIndex = i;

                        if (adminProductFormTitle) adminProductFormTitle.textContent = 'Edit product';
                        if (adminProductSubmitBtn) adminProductSubmitBtn.textContent = 'Save';
                        if (adminProductCancelEditBtn) adminProductCancelEditBtn.classList.remove('auth-hidden');

                        if (adminProductName) adminProductName.value = String(p.name || '');
                        if (adminProductCategory) adminProductCategory.value = String(p.category || 'entree');
                        if (adminProductPrice) adminProductPrice.value = String(p.price || '');
                        if (adminProductImage) adminProductImage.value = String(p.image || '');
                        if (adminProductImageFile) adminProductImageFile.value = '';
                        if (adminProductDesc) adminProductDesc.value = String(p.description || '');
                        return;
                    }

                    const delBtn = e.target && e.target.closest ? e.target.closest('[data-admin-del-product]') : null;
                    if (!delBtn) return;
                    e.preventDefault();
                    if (!isAdminLoggedIn()) return;

                    const i = Number(delBtn.getAttribute('data-admin-del-product'));
                    const products = loadProducts();
                    if (Number.isNaN(i) || i < 0 || i >= products.length) return;
                    products.splice(i, 1);
                    saveProducts(products);
                    if (editingProductIndex === i) resetProductForm();
                    renderProductsList();
                    renderLandingProducts();
                });
            }
        })();

(function () {
            const btn = document.getElementById('mobileMenuBtn');
            const panel = document.getElementById('mobileMenuPanel');
            if (!btn || !panel) return;

            function setOpen(open) {
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                panel.classList.toggle('auth-hidden', !open);
            }

            window.dtSetMobileMenuOpen = setOpen;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                setOpen(!isOpen);
            });

            panel.addEventListener('click', (e) => {
                const a = e.target && e.target.closest ? e.target.closest('a') : null;
                if (a) setOpen(false);
            });

            window.addEventListener('resize', () => {
                if (window.matchMedia('(min-width: 768px)').matches) {
                    setOpen(false);
                }
            });
        })();
