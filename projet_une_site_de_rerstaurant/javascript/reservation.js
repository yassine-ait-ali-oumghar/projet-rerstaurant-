// Reservation page script (reservation.html)
// - Reservation form: tier/date/time/table selection + validation
// - Stores reservations in localStorage (dt_reservations)
// - Admin view: filter, verify/delete reservations (if admin)
// Tailwind CSS Configuration
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'], // police titres
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'], // police texte
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
        soft: '0 10px 40px rgba(139, 105, 20, 0.15)', // ombre douce
        lift: '0 20px 60px rgba(139, 105, 20, 0.2)', // ombre forte
      },
      keyframes: {
        shine: { 
          '0%': { transform: 'translateX(-60%) rotate(12deg)' }, 
          '100%': { transform: 'translateX(60%) rotate(12deg)' } 
        }, // animation shine
      },
      animation: { shine: 'shine 1.1s ease both' }, // animation appliquée
    },
  },
};

// IIFE : isolation du code
(function(){

      const SESSION_KEY='dt_session'; // clé session
      const ADMIN_SESSION_KEY='dt_admin_session'; // clé admin
      const RES_KEY='dt_reservations'; // clé réservations

      const slots=['19:00','19:30','20:00','20:30','21:00','21:30','22:00']; // horaires

      const tables={ // tables par niveau
        basic:['B1','B2','B3','B4','B5','B6'],
        silver:['S1','S2','S3','S4'],
        gold:['G1','G2']
      };

      // parse JSON sécurisé
      function safe(v){
        if(v===null || v===undefined || v==='') return null;
        try{
          return JSON.parse(v);
        }catch(e){
          return null;
        }
      }

      // charger session utilisateur
      function loadSession(){
        const raw = localStorage.getItem(SESSION_KEY);
        const s = safe(raw);
        if(s && s.email) return s;
        return null;
      }

      // vérifier admin
      function isAdmin(){
        const raw = localStorage.getItem(SESSION_KEY);
        const s = safe(raw);

        if(s && s.role){
          return s.role === 'admin';
        }

        return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
      }

      // charger réservations
      function loadRes(){
        const raw = localStorage.getItem(RES_KEY);
        const r = safe(raw);
        if(Array.isArray(r)) return r;
        return [];
      }

      // sauvegarder réservations
      function saveRes(list){
        const safeList = Array.isArray(list) ? list : [];
        localStorage.setItem(RES_KEY, JSON.stringify(safeList));
      }

      // clé unique réservation
      function k(t,d,tm){
        return t + '__' + d + '__' + tm;
      }

      // date du jour
      function today(){
        return new Date().toISOString().slice(0,10);
      }

      // éléments DOM
      const tier=document.getElementById('tier'); // select tier
      const tierBtns=[...document.querySelectorAll('[data-tier]')]; // boutons tier
      const date=document.getElementById('date'); // date
      const time=document.getElementById('time'); // heure
      const table=document.getElementById('table'); // table
      const availability=document.getElementById('availability'); // dispo
      const form=document.getElementById('form'); // formulaire
      const name=document.getElementById('name'); // nom
      const people=document.getElementById('people'); // personnes
      const phone=document.getElementById('phone'); // téléphone
      const err=document.getElementById('err'); // message erreur

      // admin DOM
      const adminPanel=document.getElementById('adminPanel'); // panel admin
      const adminList=document.getElementById('adminList'); // liste admin
      const adminCount=document.getElementById('adminCount'); // compteur
      const fDate=document.getElementById('fDate'); // filtre date
      const fTime=document.getElementById('fTime'); // filtre heure
      const fTier=document.getElementById('fTier'); // filtre tier

      // toast DOM
      const toast=document.getElementById('toast'); // toast
      const toastTitle=document.getElementById('toastTitle'); // titre toast
      const toastText=document.getElementById('toastText'); // texte toast
      const toastClose=document.getElementById('toastClose'); // fermer toast

      // afficher erreur
      function showErr(m){
        if(!err)return;
        if(!m){
          err.classList.add('auth-hidden');
          err.textContent='';
          return;
        }
        err.textContent=m;
        err.classList.remove('auth-hidden');
      }

      // nettoyer téléphone
      function normalizePhone(raw){
        return String(raw||'').trim().replace(/\s+/g,'');
      }

      // valider téléphone
      function isValidPhone(v){
        return /^\+212\d{9}$/.test(String(v||''));
      }

      // format WhatsApp
      function waPhoneDigits(v){
        return String(v||'').replace(/^\+/,'');
      }

      // récupérer tier
      function getTier(){
        return tier?String(tier.value||'basic'):'basic';
      }

      // récupérer date
      function getDate(){
        return date?String(date.value||''):'';
      }

      // calcul créneaux pris
      function computeUsed(){
        const d=getDate();
        const tr=getTier();
        const list=loadRes();
        const allowed=tables[tr]||[];
        const used=new Set(
          list
            .filter(r=>r&&r.date===d&&allowed.includes(r.tableName))
            .map(r=>k(r.tableName,r.date,r.time))
        );
        return used;
      }

      // afficher tables
      function renderTables(){
        if(!table) return;
        const list=tables[getTier()]||[];
        table.innerHTML=list.map(t=>`<option value="${t}">${t}</option>`).join('');
      }

      // afficher horaires
      function renderTimes(){
        if(!time) return;
        const d=getDate();
        if(!d){
          time.innerHTML='<option value="">Pick a date</option>';
          return;
        }
        const used=computeUsed();
        const t=table?String(table.value||''):'';
        const av=slots.filter(s=>!used.has(k(t,d,s)));
        time.innerHTML=av.length
          ? av.map(s=>`<option value="${s}">${s}</option>`).join('')
          : '<option value="">No slots</option>';
      }

      // afficher disponibilité
      function renderAvail(){
        if(!availability) return;
        const d=getDate();
        if(!d){
          availability.textContent='Pick a date';
          return;
        }
        const used=computeUsed();
        const t=table?String(table.value||''):'';
        const tm=time?String(time.value||''):'';
        if(!tm){
          const count=slots.filter(s=>!used.has(k(t,d,s))).length;
          availability.textContent=`${count} slots for ${t}`;
          return;
        }
        availability.textContent=used.has(k(t,d,tm))?'Unavailable':'Available';
      }

      // changer tier
      function setTier(v){
        const t=String(v||'basic');
        if(tier) tier.value=t;
        document.body.classList.remove('theme-basic','theme-silver','theme-gold');
        document.body.classList.add(
          t==='silver'?'theme-silver':
          t==='gold'?'theme-gold':
          'theme-basic'
        );
        tierBtns.forEach(b=>
          b.classList.toggle('is-on',String(b.getAttribute('data-tier')||'')===t)
        );
        renderTables();
        renderTimes();
        renderAvail();
      }

      // afficher admin
      function renderAdmin(){
        if(!adminList||!adminCount) return;
        const list=loadRes();
        const fd=fDate?String(fDate.value||''):'';
        const ft=fTime?String(fTime.value||''):'';
        const fc=fTier?String(fTier.value||''):'';
        const filtered=list.filter(r=>{
          if(!r) return false;
          if(fd&&r.date!==fd) return false;
          if(ft&&r.time!==ft) return false;
          if(fc&&r.tableClass!==fc) return false;
          return true;
        });
        adminCount.textContent=String(filtered.length);
        adminList.innerHTML=filtered.map(r=>{ /* contenu admin */ }).join('');
      }

      // init page
      if(date){date.min=today();date.value=today();}
      if(fTime){
        fTime.innerHTML='<option value="">All</option>'+slots.map(s=>`<option value="${s}">${s}</option>`).join('');
      }
      renderTables();
      renderTimes();
      renderAvail();

      // listeners UI
      tierBtns.forEach(b=>b.addEventListener('click',e=>{
        e.preventDefault();
        setTier(b.getAttribute('data-tier')||'basic');
      }));

      if(table) table.addEventListener('change',()=>{
        renderTimes();
        renderAvail();
      });

      if(time) time.addEventListener('change',renderAvail);
      if(date) date.addEventListener('change',()=>{
        renderTimes();
        renderAvail();
      });

      // fermer toast
      if(toastClose&&toast){
        toastClose.addEventListener('click',e=>{
          e.preventDefault();
          toast.classList.remove('is-on');
        });
      }

      // afficher admin
      if(isAdmin()){
        if(adminPanel) adminPanel.classList.remove('auth-hidden');
        if(fDate) fDate.addEventListener('change',renderAdmin);
        if(fTime) fTime.addEventListener('change',renderAdmin);
        if(fTier) fTier.addEventListener('change',renderAdmin);
        renderAdmin();
      }

      // actions admin
      if(adminList){
        adminList.addEventListener('click',(e)=>{
          const btn=e.target && e.target.closest ? e.target.closest('[data-action]') : null;
          if(!btn) return;
          if(!isAdmin()) return;

          const action=String(btn.getAttribute('data-action')||'');
          const id=String(btn.getAttribute('data-id')||'');
          if(!id) return;

          if(action==='verify'){ /* confirmer */ return; }
          if(action==='delete'){ /* supprimer */ return; }
        });
      }

      // synchro onglets
      window.addEventListener('storage',(e)=>{
        if(e.key===RES_KEY){
          renderTimes();
          renderAvail();
          if(isAdmin()) renderAdmin();
        }
      });

      // soumission réservation
      if(form){
        form.addEventListener('submit',(e)=>{
          e.preventDefault();
          showErr('');

          const d=getDate();
          const tm=time?String(time.value||''):'';
          const tb=table?String(table.value||''):'';
          const tr=getTier();
          const nm=name?String(name.value||'').trim():'';
          const pp=people?Number(people.value||0):0;
          const ph=normalizePhone(phone?phone.value:'');

          if(!nm||!pp||!d||!tm||!tb||!ph){
            showErr('Please fill all fields.');
            return;
          }

          if(!isValidPhone(ph)){
            showErr('Phone number invalid. Format: +212612910010');
            return;
          }

          const list=loadRes();
          const exists=list.some(r=>r&&r.tableName===tb&&r.date===d&&r.time===tm);
          if(exists){
            showErr('Reservation deja faite, choisir une autre date');
            renderTimes();
            renderAvail();
            return;
          }

          const session=loadSession();
          const payload={
            id:`${Date.now()}_${Math.random().toString(16).slice(2)}`,
            byEmail: session?String(session.email||''):'',
            name:nm,
            people:pp,
            phone: ph,
            date:d,
            time:tm,
            tableName:tb,
            tableClass:tr,
            status: 'NON_CONFIRMED',
            createdAt:Date.now(),
          };

          list.unshift(payload);
          saveRes(list);

          // afficher toast
          if(toastTitle) toastTitle.textContent=`Reservation · ${tr.toUpperCase()}`;
          if(toastText) toastText.textContent=`${nm} · ${pp} pers · ${d} ${tm} · ${tb}`;
          if(toast) toast.classList.add('is-on');

          // reset UI
          form.reset();
          if(people) people.value='';
          setTier('basic');
          if(date){date.value=today();}
          renderTables();
          renderTimes();
          renderAvail();
          if(isAdmin()) renderAdmin();
        });
      }

      // fin module
})();
