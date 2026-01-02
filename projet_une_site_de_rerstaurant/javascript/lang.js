(function(){
  // i18n module: stores language choice, translates [data-i18n] nodes, and manages RTL/LTR.
  const LANG_KEY = 'dt_lang';

  // Get persisted language (en/fr/ar). Defaults to English.
  function getLang(){
    const v = (localStorage.getItem(LANG_KEY) || 'en').toLowerCase();
    if (v === 'ar' || v === 'fr' || v === 'en') return v;
    return 'en';
  }

  // Translate a key for a given language (fallback to English).
  function t(key, lang){
    const l = (lang || getLang());
    const map = dict[l] || dict.en;
    const v = map && map[key];
    if(typeof v === 'string') return v;
    const fallback = dict.en && dict.en[key];
    return typeof fallback === 'string' ? fallback : '';
  }

  // Translation dictionary
  const dict = {
    en: {
      'nav.back_home': 'Back home',
      'nav.language': 'Language',
      'nav.home': 'Home', 
      'nav.menu': 'Menu',
      'nav.about': 'About',
      'nav.delivery': 'Delivery',
      'nav.mini_games': 'Mini games',
      'nav.stats': 'Stats',
      'nav.reserve': 'Reserve',
      'nav.sales': 'Sales',
      'common.logout': 'Logout',
      'common.live': 'Live',

      'common.login': 'Login',
      'common.register': 'Register',
      'common.profile': 'Profile',
      'common.admin_tools': 'Admin tools',
      'common.cart': 'Cart',
      'common.my_orders': 'My orders',
      'common.open_menu': 'Open menu',

      'delivery.title': 'Delivery',
      'delivery.subtitle': 'Order online and get your dishes delivered',
      'delivery.fast_title': 'Fast delivery',
      'delivery.fast_desc': 'Delivery in 2–4 hours within a 400km radius around the restaurant',
      'delivery.fees_title': 'Delivery fees',
      'delivery.fees_desc': '5€ delivery fee. Free from 50€ order',
      'delivery.hours_title': 'Hours',
      'delivery.zone_title': 'Delivery area',
      'delivery.zone_desc': 'Morocco',
      'delivery.form_title': 'Order form',
      'delivery.form_desc': 'Fill the form to place your delivery order',
      'delivery.help_title': 'Need help?',
      'delivery.help_desc': 'Order via WhatsApp (fast reply)',
      'delivery.full_name': 'Full name',
      'delivery.phone': 'Phone',
      'delivery.address': 'Delivery address',
      'delivery.city': 'City',
      'delivery.datetime': 'Preferred delivery date & time',
      'delivery.order': 'Your order',
      'delivery.notes': 'Special instructions',
      'delivery.submit': 'Order',
      'delivery.track_title': 'Track your delivery',
      'delivery.track_waiting': 'Waiting for order',
      'delivery.track_hint': 'Click on Order to start a delivery simulation and track the driver live.',

      'delivery.ph_name': 'Full name',
      'delivery.ph_phone': 'Phone number',
      'delivery.ph_address': 'Delivery address',
      'delivery.ph_city': 'City',
      'delivery.ph_order': 'List the dishes you want with quantities (e.g., 2x Duck à l’Orange, 1x BBQ ribs, 1x Chocolate soufflé)',
      'delivery.ph_notes': 'Allergies, access code, delivery instructions...',

      'footer.nav': 'Navigation',
      'footer.info': 'Information',
      'footer.newsletter': 'Newsletter',

      'auth.no_account': 'No account found. Please register first.',
      'auth.wrong_password': 'Wrong password. Try again.',
      'auth.email_exists': 'Email already exists. Please login instead.',

      'menu.search_title': 'Search in menu',
      'menu.search_help': 'Quickly search for dishes (name / description)',
      'menu.search_placeholder': 'Search... (e.g., chocolate, duck, truffle)',
      'menu.filter.label': 'Filter',
      'menu.filter.all': 'All',
      'menu.filter.entrees': 'Appetizers',
      'menu.filter.mains': 'Main Courses',
      'menu.filter.desserts': 'Desserts',
      'menu.clear': 'Clear',
      'menu.entrees': 'Appetizers',
      'menu.mains': 'Main Courses',
      'menu.desserts': 'Desserts',

      'menu.item.entree1.title': 'Teriyaki beef lettuce wraps',
      'menu.item.entree1.desc': 'Tender grilled beef glazed with teriyaki sauce, served in crisp lettuce with fresh red-cabbage salad and a hint of lemon for the perfect balance of sweet, fresh, and tangy.',
      'menu.item.entree2.title': 'Fresh salad canapé',
      'menu.item.entree2.desc': 'A light canapé topped with a mix of crunchy salads, presented side-on to highlight textures and freshness. Perfect as a starter or appetizer.',
      'menu.item.entree3.title': 'Fried beef with smoked cheese',
      'menu.item.entree3.desc': 'Crispy beef bites served with golden fries, topped with a flavorful tomato sauce and melted smoked cheese for a rich, indulgent dish.',

      'menu.item.main1.title': 'BBQ marinated pork ribs (2 racks)',
      'menu.item.main1.desc': 'Two racks of pork ribs, marinated and grilled on the barbecue—tender and juicy—coated in a smoky, slightly sweet BBQ sauce.',
      'menu.item.main2.title': 'Colorful meat salad',
      'menu.item.main2.desc': 'A tasty salad with tender meat, crunchy peppers, fresh tomatoes, and sweet corn, served to showcase its colors and freshness.',
      'menu.item.main3.title': 'Duck à l’Orange',
      'menu.item.main3.desc': 'Farm-raised duck breast, Grand Marnier orange sauce, thyme-roasted potatoes.',

      'menu.item.dessert1.title': 'Chocolate soufflé',
      'menu.item.dessert1.desc': 'Warm Valrhona 70% chocolate soufflé, Madagascar vanilla ice cream, red-berry coulis.',
      'menu.item.dessert2.title': 'Tarte Tatin',
      'menu.item.dessert2.desc': 'Caramelized Golden apple tart, Normandy crème fraîche, salted butter caramel.',
      'menu.item.dessert3.title': 'Millefeuille',
      'menu.item.dessert3.desc': 'House-made millefeuille, vanilla pastry cream, mirror glaze, seasonal fruits.',

      'sells.nav_title': 'Sales · Admin',
      'sells.section': 'Admin dashboard',
      'sells.title': 'Sales',
      'sells.subtitle': 'Track revenue by period and category from saved orders.',
      'sells.period.label': 'Period',
      'sells.period.day': 'Daily',
      'sells.period.week': 'Weekly',
      'sells.period.month': 'Monthly',
      'sells.period.year': 'Yearly',
      'sells.chart.title': 'Revenue by category',
      'sells.chart.hint': 'Donut chart is computed from saved orders.',
      'sells.empty': 'No orders found for this period.',
      'sells.kpi.title': 'KPIs',
      'sells.kpi.revenue': 'Revenue',
      'sells.kpi.orders': 'Orders',
      'sells.kpi.avg': 'Avg order',
      'sells.source': 'Source: localStorage keys dt_orders_* (per user).',
      'sells.other': 'Other',
    },
    fr: {
      'nav.back_home': 'Retour accueil',
      'nav.language': 'Langue',
      'nav.home': 'Accueil',
      'nav.menu': 'Menu',
      'nav.about': 'À Propos',
      'nav.delivery': 'Livraison',
      'nav.mini_games': 'Mini games',
      'nav.stats': 'Stats',
      'nav.reserve': 'Réserver',
      'nav.sales': 'Ventes',
      'common.logout': 'Déconnexion',
      'common.live': 'Live',

      'common.login': 'Login',
      'common.register': 'Register',
      'common.profile': 'Profile',
      'common.admin_tools': 'Admin tools',
      'common.cart': 'Cart',
      'common.my_orders': 'My orders',
      'common.open_menu': 'Open menu',

      'delivery.title': 'Livraison',
      'delivery.subtitle': 'Commandez en ligne et recevez vos plats à domicile',
      'delivery.fast_title': 'Livraison Rapide',
      'delivery.fast_desc': 'Livraison en 2h-4h dans un rayon de 400km autour du restaurant',
      'delivery.fees_title': 'Frais de Livraison',
      'delivery.fees_desc': '5€ de frais de livraison. Gratuit à partir de 50€ de commande',
      'delivery.hours_title': 'Horaires',
      'delivery.zone_title': 'Zone de Livraison',
      'delivery.zone_desc': 'Maroc',
      'delivery.form_title': 'Formulaire de Commande',
      'delivery.form_desc': 'Remplissez le formulaire pour passer votre commande en livraison',
      'delivery.help_title': "Besoin d'aide ?",
      'delivery.help_desc': 'Passez commande via WhatsApp (réponse rapide)',
      'delivery.full_name': 'Nom complet',
      'delivery.phone': 'Téléphone',
      'delivery.address': 'Adresse de livraison',
      'delivery.city': 'Ville',
      'delivery.datetime': 'Date et heure de livraison souhaitée',
      'delivery.order': 'Votre commande',
      'delivery.notes': 'Instructions spéciales',
      'delivery.submit': 'Commander',
      'delivery.track_title': 'Suivi de votre livraison',
      'delivery.track_waiting': 'En attente de commande',
      'delivery.track_hint': 'Cliquez sur Commander pour lancer une simulation de livraison et suivre le livreur en direct.',

      'delivery.ph_name': 'Nom complet',
      'delivery.ph_phone': 'Téléphone',
      'delivery.ph_address': 'Adresse de livraison',
      'delivery.ph_city': 'Ville',
      'delivery.ph_order': "Indiquez les plats que vous souhaitez commander avec les quantités (ex: 2x Canard à l'Orange, 1x Ribs BBQ, 1x Soufflé au Chocolat)",
      'delivery.ph_notes': "Allergies, code d'accès, instructions de livraison...",

      'footer.nav': 'Navigation',
      'footer.info': 'Informations',
      'footer.newsletter': 'Newsletter',

      'auth.no_account': "Aucun compte trouvé. Veuillez d'abord vous inscrire.",
      'auth.wrong_password': 'Mot de passe incorrect. Réessayez.',
      'auth.email_exists': "Cet email existe déjà. Veuillez vous connecter.",

      'menu.search_title': 'Rechercher dans le menu',
      'menu.search_help': 'Rechercher rapidement des plats (nom / description)',
      'menu.search_placeholder': 'Rechercher... (ex: chocolat, canard, truffe)',
      'menu.filter.label': 'Filtrer',
      'menu.filter.all': 'Tous',
      'menu.filter.entrees': 'Apéritifs',
      'menu.filter.mains': 'Plats principaux',
      'menu.filter.desserts': 'Desserts',
      'menu.clear': 'Effacer',
      'menu.entrees': 'Apéritifs',
      'menu.mains': 'Plats principaux',
      'menu.desserts': 'Desserts',

      'menu.item.entree1.title': 'Rouleaux de boeuf teriyaki laitue',
      'menu.item.entree1.desc': 'Boeuf grillé tendre glacé avec sauce teriyaki, servi dans de la laitue croquante avec salade de chou rouge frais et une touche de citron pour un équilibre parfait entre le sucré, le frais et l\'acidulé.',
      'menu.item.entree2.title': 'Canapé salade fraîche',
      'menu.item.entree2.desc': 'Un canapé léger surmonté d\'un mélange de salades croquantes, présenté de côté pour mettre en valeur les textures et la fraîcheur. Parfait comme apéritif ou amuse-bouche.',
      'menu.item.entree3.title': 'Boeuf frit avec fromage fumé',
      'menu.item.entree3.desc': 'Morceaux de boeuf croustillants servis avec des frites dorées, surmontés d\'une sauce tomate savoureuse et de fromage fumé fondu pour un plat riche et gourmand.',

      'menu.item.main1.title': 'Côtes de porc marinées BBQ (2 racks)',
      'menu.item.main1.desc': 'Deux racks de côtes de porc, marinées et grillées sur le barbecue—tendres et juteuses—recouvertes d\'une sauce BBQ fumée et légèrement sucrée.',
      'menu.item.main2.title': 'Salade de viande colorée',
      'menu.item.main2.desc': 'Une salade savoureuse avec de la viande tendre, des poivrons croquants, des tomates fraîches et du maïs sucré, servie pour mettre en valeur ses couleurs et sa fraîcheur.',
      'menu.item.main3.title': 'Canard à l\'Orange',
      'menu.item.main3.desc': 'Poitrine de canard de ferme, sauce à l\'orange Grand Marnier, pommes de terre rôties au thym.',

      'menu.item.dessert1.title': 'Soufflé au chocolat',
      'menu.item.dessert1.desc': 'Soufflé au chocolat Valrhona 70% chaud, glace à la vanille de Madagascar, coulis de fruits rouges.',
      'menu.item.dessert2.title': 'Tarte Tatin',
      'menu.item.dessert2.desc': 'Tarte aux pommes dorées caramélisées, crème fraîche de Normandie, caramel au beurre salé.',
      'menu.item.dessert3.title': 'Millefeuille',
      'menu.item.dessert3.desc': 'Millefeuille maison, crème pâtissière à la vanille, glaçage miroir, fruits de saison.',

      'sells.nav_title': 'Ventes · Admin',
      'sells.section': 'Dashboard admin',
      'sells.title': 'Ventes',
      'sells.subtitle': 'Suivez les revenus par période et par catégorie à partir des commandes enregistrées.',
      'sells.period.label': 'Période',
      'sells.period.day': 'Jour',
      'sells.period.week': 'Semaine',
      'sells.period.month': 'Mois',
      'sells.period.year': 'Année',
      'sells.chart.title': 'Revenus par catégorie',
      'sells.chart.hint': 'Le graphique en anneau est calculé à partir des commandes enregistrées.',
      'sells.empty': 'Aucune commande trouvée pour cette période.',
      'sells.kpi.title': 'Indicateurs',
      'sells.kpi.revenue': 'Revenus',
      'sells.kpi.orders': 'Commandes',
      'sells.kpi.avg': 'Panier moyen',
      'sells.source': 'Source : clés localStorage dt_orders_* (par utilisateur).',
      'sells.other': 'Autres',
    },
    ar: {
      'nav.back_home': 'العودة للرئيسية',
      'nav.language': 'اللغة',
      'nav.home': 'الرئيسية',
      'nav.menu': 'القائمة',
      'nav.about': 'من نحن',
      'nav.delivery': 'التوصيل',
      'nav.mini_games': 'ألعاب',
      'nav.stats': 'إحصائيات',
      'nav.reserve': 'احجز',
      'nav.sales': 'المبيعات',
      'common.logout': 'تسجيل الخروج',
      'common.live': 'مباشر',

      'common.login': 'تسجيل الدخول',
      'common.register': 'إنشاء حساب',
      'common.profile': 'الملف الشخصي',
      'common.admin_tools': 'أدوات المدير',
      'common.cart': 'السلة',
      'common.my_orders': 'طلباتي',
      'common.open_menu': 'فتح القائمة',
      'stat.desc': 'إحصائيات حسب اللعبة (الأخضر = فوز، الأحمر = خسارة). تحديث تلقائي.',
      'stat.graph': 'الرسم',
      'stat.axes': 'اللعبة (X) · العدد (Y)',
      'stat.details': 'تفاصيل',
      'stat.game': 'اللعبة',
      'stat.wins': 'فوز',
      'stat.losses': 'خسارة',
      'stat.total_wins': 'إجمالي الفوز',
      'stat.total_losses': 'إجمالي الخسارة',
      'stat.my_products': 'منتجاتي',
      'stat.my_products_desc': 'قيّم منتجاتك (1–5). تحديث مع حركة.',
      'stat.rate_product': 'قيّم منتجًا',
      'stat.product': 'المنتج',
      'stat.rating': 'التقييم',
      'stat.my_rating': 'تقييمي:',

      'home.since': 'منذ 2010',
      'home.hero_line1': 'تجربة',
      'home.hero_line2': 'طهي',
      'home.hero_line3': 'استثنائية',
      'home.hero_sub': 'حيث يلتقي فن الطهي بالتميّز',
      'home.discover_menu': 'اكتشف القائمة',
      'home.reserve_table': 'احجز طاولة',
      'home.scroll': 'مرّر',

      'about.title': 'من نحن',
      'about.subtitle': 'شغف بفن الطهي لأكثر من عقد',
      'about.story_tag': 'قصتنا',
      'about.story_title': 'تميّز طهي منذ 2010',
      'about.p1': 'منذ 2010، يقدّم Le Gourmet مطبخًا راقيًا يجمع بين الأصالة والابتكار. يبدع طاهينا الحائز على نجوم أطباقًا مميزة باستخدام أفضل المكونات المحلية والموسمية المختارة بعناية.',
      'about.p2': 'نؤمن أن كل وجبة يجب أن تكون تجربة لا تُنسى، لذلك نهتم بكل التفاصيل من اختيار المكونات إلى التقديم الفني. كل طبق يحكي قصة، وكل نكهة توقظ شعورًا.',
      'about.years': 'سنوات التميّز',
      'about.stars': 'نجوم ميشلان',
      'about.clients': 'عملاء راضون',

      'menu.title': 'قائمتنا',
      'menu.subtitle': 'سيمفونية من النكهات الراقية',
      'menu.search_title': 'بحث في القائمة',
      'menu.search_help': 'ابحث بسرعة عن الأطباق (الاسم / الوصف)',
      'menu.search_placeholder': 'ابحث... (مثال: شوكولاتة، بط، كمأة)',
      'menu.filter.label': 'تصفية',
      'menu.filter.all': 'الكل',
      'menu.filter.entrees': 'مقبلات',
      'menu.filter.mains': 'الأطباق الرئيسية',
      'menu.filter.desserts': 'حلويات',
      'menu.clear': 'مسح',
      'menu.entrees': 'مقبلات',
      'menu.mains': 'الأطباق الرئيسية',
      'menu.desserts': 'حلويات',

      'menu.item.entree1.title': 'لفائف لحم ترياكي بالخس',
      'menu.item.entree1.desc': 'لحم مشوي طري بصلصة الترياكي، يُقدّم داخل أوراق خس مقرمشة مع سلطة ملفوف أحمر ولمسة ليمون لتوازن مثالي بين الحلاوة والانتعاش والحموضة.',
      'menu.item.entree2.title': 'كانابيه سلطة طازجة',
      'menu.item.entree2.desc': 'كانابيه خفيف مع خليط من السلطات المقرمشة، عرض جانبي لإبراز القوام والانتعاش. مناسب كمقبلات أو فاتح للشهية.',
      'menu.item.entree3.title': 'لحم مقلي مع جبن مدخن',
      'menu.item.entree3.desc': 'قطع لحم مقرمشة مع بطاطس مقلية ذهبية، مغطاة بصلصة طماطم لذيذة وجبن مدخن ذائب لطبق غني وشهي.',

      'menu.item.main1.title': 'أضلاع لحم خنزير متبلة باربكيو (قطعتان)',
      'menu.item.main1.desc': 'قطعتان من أضلاع لحم الخنزير متبلة ومشوية على الباربكيو—طرية وعصارية—مغطاة بصلصة باربكيو مدخنة وحلوة قليلاً.',
      'menu.item.main2.title': 'سلطة لحم ملونة',
      'menu.item.main2.desc': 'سلطة لذيذة من لحم طري وفلفل مقرمش وطماطم طازجة وذرة حلوة، تُقدّم لإبراز ألوانها وانتعاشها.',
      'menu.item.main3.title': 'بط بالبرتقال',
      'menu.item.main3.desc': 'صدر بط بلدي، صلصة برتقال غراند مارنييه، بطاطس مشوية بالزعتر.',

      'menu.item.dessert1.title': 'سوفليه الشوكولاتة',
      'menu.item.dessert1.desc': 'سوفليه شوكولاتة فالرهونا 70% دافئ، آيس كريم فانيلا مدغشقر، صلصة توت أحمر.',
      'menu.item.dessert2.title': 'تارت تاتان',
      'menu.item.dessert2.desc': 'تارت تفاح مكرمل، كريمة طازجة، كراميل زبدة مملحة.',
      'menu.item.dessert3.title': 'ميلفوي',
      'menu.item.dessert3.desc': 'ميلفوي منزلي، كريمة باتيسيير بالفانيلا، تغطية لامعة، فواكه موسمية.',

      'sells.nav_title': 'المبيعات · المدير',
      'sells.section': 'لوحة المدير',
      'sells.title': 'المبيعات',
      'sells.subtitle': 'تتبّع الإيرادات حسب الفترة والفئة من الطلبات المحفوظة.',
      'sells.period.label': 'الفترة',
      'sells.period.day': 'يومي',
      'sells.period.week': 'أسبوعي',
      'sells.period.month': 'شهري',
      'sells.period.year': 'سنوي',
      'sells.chart.title': 'الإيرادات حسب الفئة',
      'sells.chart.hint': 'مخطط الدائرة يتم حسابه من الطلبات المحفوظة.',
      'sells.empty': 'لا توجد طلبات لهذه الفترة.',
      'sells.kpi.title': 'مؤشرات',
      'sells.kpi.revenue': 'الإيرادات',
      'sells.kpi.orders': 'الطلبات',
      'sells.kpi.avg': 'متوسط الطلب',
      'sells.source': 'المصدر: مفاتيح localStorage dt_orders_* (لكل مستخدم).',
      'sells.other': 'أخرى',

      'lang.title': 'اللغة',
      'lang.subtitle': 'اختر اللغة',
      'lang.heading': 'الإنجليزية / الفرنسية / العربية',
      'lang.desc': 'سيتم تغيير لغة الواجهة في جميع الصفحات.',
      'lang.select': 'اختر اللغة',
      'lang.english': 'English',
      'lang.current': 'اللغة الحالية:',
    }
  };

  // Apply document direction and <html lang> based on selected language.
  function applyDirection(lang){
    if(lang === 'ar'){
      document.documentElement.setAttribute('dir','rtl');
      document.documentElement.setAttribute('lang','ar');
    } else {
      document.documentElement.setAttribute('dir','ltr');
      document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'en');
    }
  }

  // Replace textContent (or an attribute) for all nodes using data-i18n.
  function translate(lang){
    const map = dict[lang] || dict.en;
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((el) => {
      const key = el.getAttribute('data-i18n') || '';
      if(!key) return;
      const txt = map[key];
      if(typeof txt !== 'string') return;
      const attr = el.getAttribute('data-i18n-attr');
      if(attr){
        el.setAttribute(attr, txt);
      } else {
        el.textContent = txt;
      }
    });
  }

  // Persist language then re-apply translations.
  function setLang(next){
    const v = String(next || 'en').toLowerCase();
    localStorage.setItem(LANG_KEY, (v === 'ar' || v === 'fr' || v === 'en') ? v : 'en');
    applyLang();
  }

  // Create the language picker modal once (on-demand).
  function ensureLangModal(){
    if(document.getElementById('dtLangModal')) return;

    const wrap = document.createElement('div');
    wrap.id = 'dtLangModal';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:22px;';
    wrap.innerHTML = `
      <div id="dtLangOverlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div>
      <div style="position:relative;width:min(420px,92vw);border-radius:18px;border:1px solid rgba(212,196,168,0.75);background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);padding:18px 16px;box-shadow:0 22px 80px rgba(0,0,0,0.35);">
        <div style="font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(61,47,10,0.75);" data-i18n="lang.select">Select language</div>
        <div style="margin-top:10px;display:grid;gap:10px;">
          <button type="button" data-lang-pick="en" class="ui-pill" style="width:100%;justify-content:center;">🇬🇧 English</button>
          <button type="button" data-lang-pick="fr" class="ui-pill" style="width:100%;justify-content:center;">🇫🇷 Français</button>
          <button type="button" data-lang-pick="ar" class="ui-pill" style="width:100%;justify-content:center;">🇲🇦 العربية</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const overlay = wrap.querySelector('#dtLangOverlay');
    if(overlay){
      overlay.addEventListener('click', () => { wrap.style.display = 'none'; });
    }

    wrap.addEventListener('click', (e) => {
      const t = e && e.target;
      if(!t || !t.getAttribute) return;
      const pick = t.getAttribute('data-lang-pick');
      if(!pick) return;
      setLang(pick);
      wrap.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
      if(e && e.key === 'Escape') wrap.style.display = 'none';
    });
  }

  // Open the language picker modal.
  function openLangModal(){
    ensureLangModal();
    const el = document.getElementById('dtLangModal');
    if(!el) return;
    el.style.display = 'flex';
    translate(getLang());
    highlightSelectedInModal();
  }

  // Highlight the currently selected language button inside the modal.
  function highlightSelectedInModal(){
    const el = document.getElementById('dtLangModal');
    if(!el) return;
    const current = getLang();
    const btns = el.querySelectorAll('[data-lang-pick]');
    btns.forEach((b) => {
      const v = String(b.getAttribute('data-lang-pick') || '').toLowerCase();
      const active = v === current;
      if(active){
        b.style.borderColor = 'rgba(212,175,55,0.95)';
        b.style.background = 'linear-gradient(180deg, rgba(139,105,20,0.92), rgba(110,82,14,0.92))';
        b.style.color = 'rgba(255,255,255,0.92)';
        b.style.boxShadow = '0 22px 70px rgba(139,105,20,0.22)';
      } else {
        b.style.borderColor = '';
        b.style.background = '';
        b.style.color = '';
        b.style.boxShadow = '';
      }
    });
  }

  // Bind the language button(s) in nav + mobile menu.
  function bindLangButtons(){
    const btn1 = document.getElementById('langBtn');
    const btn2 = document.getElementById('mobileLangBtn');
    [btn1, btn2].forEach((b) => {
      if(!b || b.__dtLangBtnBound) return;
      b.__dtLangBtnBound = true;
      b.addEventListener('click', (e) => {
        e.preventDefault();
        openLangModal();
      });
    });
  }

  // Update theme toggle label according to language and dark-mode state.
  function updateThemeButtonsText(lang){
    const toggleIds = ['themeToggle','themeToggleMain'];
    toggleIds.forEach((id) => {
      const btn = document.getElementById(id);
      if(!btn) return;
      const isDark = document.body.classList.contains('dark-mode');
      if(lang === 'ar') btn.textContent = isDark ? 'نهار' : 'ليل';
      else if(lang === 'fr') btn.textContent = isDark ? 'Clair' : 'Sombre';
      else btn.textContent = isDark ? 'Light' : 'Dark';
    });
  }

  // Bind any <select data-lang-select> controls (if present).
  function bindLangSelects(){
    const nodes = document.querySelectorAll('select[data-lang-select]');
    if(!nodes.length) return;
    const lang = getLang();
    nodes.forEach((sel) => {
      if(sel && sel.value !== lang) sel.value = lang;
      if(sel && !sel.__dtLangBound){
        sel.__dtLangBound = true;
        sel.addEventListener('change', () => {
          const v = String(sel.value || 'en').toLowerCase();
          localStorage.setItem(LANG_KEY, (v === 'ar' || v === 'fr' || v === 'en') ? v : 'en');
          applyLang();
        });
      }
    });
  }

  // Apply language: direction, translate nodes, update theme label, and bind UI controls.
  function applyLang(){
    const lang = getLang();
    applyDirection(lang);
    translate(lang);
    updateThemeButtonsText(lang);
    bindLangSelects();
    bindLangButtons();
    highlightSelectedInModal();
  }

  // Expose helpers globally for other scripts.
  window.dtApplyLang = applyLang;
  window.dtGetLang = getLang;
  window.dtT = t;

  document.addEventListener('DOMContentLoaded', () => {
    applyLang();
  });
})();
