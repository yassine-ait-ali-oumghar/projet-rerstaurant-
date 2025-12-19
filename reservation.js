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
        shine: { '0%': { transform: 'translateX(-60%) rotate(12deg)' }, '100%': { transform: 'translateX(60%) rotate(12deg)' } },
      },
      animation: { shine: 'shine 1.1s ease both' },
    },
  },
};

(function(){
      const SESSION_KEY='dt_session';
      const ADMIN_SESSION_KEY='dt_admin_session';
      const RES_KEY='dt_reservations';
      const slots=['19:00','19:30','20:00','20:30','21:00','21:30','22:00'];
      const tables={basic:['B1','B2','B3','B4','B5','B6'],silver:['S1','S2','S3','S4'],gold:['G1','G2']};

      function safe(v){try{return JSON.parse(v)}catch{return null}}
      function loadSession(){const s=safe(localStorage.getItem(SESSION_KEY));return s&&s.email?s:null}
      function isAdmin(){const s=safe(localStorage.getItem(SESSION_KEY));if(s&&s.role&&s.role!=='admin')return false; if(s&&s.role==='admin')return true; return localStorage.getItem(ADMIN_SESSION_KEY)==='true'}
      function loadRes(){const r=safe(localStorage.getItem(RES_KEY));return Array.isArray(r)?r:[]}
      function saveRes(list){localStorage.setItem(RES_KEY,JSON.stringify(Array.isArray(list)?list:[]))}
      function k(t,d,tm){return `${t}__${d}__${tm}`}
      function today(){const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const da=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${da}`}

      const tier=document.getElementById('tier');
      const tierBtns=[...document.querySelectorAll('[data-tier]')];
      const date=document.getElementById('date');
      const time=document.getElementById('time');
      const table=document.getElementById('table');
      const availability=document.getElementById('availability');
      const form=document.getElementById('form');
      const name=document.getElementById('name');
      const people=document.getElementById('people');
      const phone=document.getElementById('phone');
      const err=document.getElementById('err');

      const adminPanel=document.getElementById('adminPanel');
      const adminList=document.getElementById('adminList');
      const adminCount=document.getElementById('adminCount');
      const fDate=document.getElementById('fDate');
      const fTime=document.getElementById('fTime');
      const fTier=document.getElementById('fTier');

      const toast=document.getElementById('toast');
      const toastTitle=document.getElementById('toastTitle');
      const toastText=document.getElementById('toastText');
      const toastClose=document.getElementById('toastClose');

      function showErr(m){if(!err)return; if(!m){err.classList.add('auth-hidden');err.textContent='';return;} err.textContent=m;err.classList.remove('auth-hidden');}
      function normalizePhone(raw){return String(raw||'').trim().replace(/\s+/g,'')}
      function isValidPhone(v){return /^\+212\d{9}$/.test(String(v||''))}
      function waPhoneDigits(v){return String(v||'').replace(/^\+/,'')}
      function getTier(){return tier?String(tier.value||'basic'):'basic'}
      function getDate(){return date?String(date.value||''):''}

      function computeUsed(){
        const d=getDate();
        const tr=getTier();
        const list=loadRes();
        const allowed=tables[tr]||[];
        const used=new Set(list.filter(r=>r&&r.date===d&&allowed.includes(r.tableName)).map(r=>k(r.tableName,r.date,r.time)));
        return used;
      }

      function renderTables(){
        if(!table) return;
        const list=tables[getTier()]||[];
        table.innerHTML=list.map(t=>`<option value="${t}">${t}</option>`).join('');
      }

      function renderTimes(){
        if(!time) return;
        const d=getDate();
        if(!d){time.innerHTML='<option value="">Pick a date</option>';return;}
        const used=computeUsed();
        const t=table?String(table.value||''):'';
        const av=slots.filter(s=>!used.has(k(t,d,s)));
        time.innerHTML=av.length?av.map(s=>`<option value="${s}">${s}</option>`).join(''):'<option value="">No slots</option>';
      }

      function renderAvail(){
        if(!availability) return;
        const d=getDate();
        if(!d){availability.textContent='Pick a date';return;}
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

      function setTier(v){
        const t=String(v||'basic');
        if(tier) tier.value=t;
        document.body.classList.remove('theme-basic','theme-silver','theme-gold');
        document.body.classList.add(t==='silver'?'theme-silver':t==='gold'?'theme-gold':'theme-basic');
        tierBtns.forEach(b=>b.classList.toggle('is-on',String(b.getAttribute('data-tier')||'')===t));
        renderTables();
        renderTimes();
        renderAvail();
      }

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
        adminList.innerHTML=filtered.map(r=>{
          const status=String(r.status||'NON_CONFIRMED');
          const badgeClass=status==='CONFIRMED'?'status-ok':'status-non';
          const phoneText=String(r.phone||'');
          const email=String(r.byEmail||'guest');
          return `
<div class="border border-brand-line/80 bg-brand-paper px-5 py-4">
  <div class="grid gap-3 md:grid-cols-12 md:items-center">
    <div class="md:col-span-3">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">Client</div>
      <div class="mt-1 text-sm font-semibold text-brand-ink">${String(r.name||'')}</div>
      <div class="mt-1 text-xs text-brand-muted">${email}</div>
      <div class="mt-1 text-xs text-brand-muted">${phoneText}</div>
    </div>
    <div class="md:col-span-2">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">Status</div>
      <div class="mt-2"><span class="status-badge ${badgeClass}" data-status-badge data-id="${String(r.id||'')}">${status}</span></div>
    </div>
    <div class="md:col-span-1">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">People</div>
      <div class="mt-1 text-sm font-semibold text-brand-ink">${String(r.people||'')}</div>
    </div>
    <div class="md:col-span-2">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">Date</div>
      <div class="mt-1 text-sm font-semibold text-brand-ink">${String(r.date||'')}</div>
    </div>
    <div class="md:col-span-1">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">Time</div>
      <div class="mt-1 text-sm font-semibold text-brand-ink">${String(r.time||'')}</div>
    </div>
    <div class="md:col-span-1">
      <div class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">Table</div>
      <div class="mt-1 text-sm font-semibold text-brand-ink">${String(r.tableName||'')}</div>
      <div class="mt-1 text-xs text-brand-muted">${String(r.tableClass||'')}</div>
    </div>
    <div class="md:col-span-2 md:flex md:justify-end">
      <div class="grid gap-2 md:w-full md:max-w-[220px]">
        <a class="border border-brand-line/80 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent" href="https://wa.me/${waPhoneDigits(phoneText)}?text=${encodeURIComponent('Hello, your reservation is confirmed. Thank you!')}" target="_blank" rel="noreferrer" data-action="wa" data-id="${String(r.id||'')}">Confirm (WhatsApp)</a>
        <button class="border border-brand-line/80 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent" type="button" data-action="verify" data-id="${String(r.id||'')}">Verify</button>
        <button class="border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300" type="button" data-action="delete" data-id="${String(r.id||'')}">Delete</button>
      </div>
    </div>
  </div>
</div>`;
        }).join('');
      }

      // init
      if(date){date.min=today();date.value=today();}
      if(fTime){fTime.innerHTML='<option value="">All</option>'+slots.map(s=>`<option value="${s}">${s}</option>`).join('');}
      renderTables();
      renderTimes();
      renderAvail();

      tierBtns.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setTier(b.getAttribute('data-tier')||'basic')}));
      if(table) table.addEventListener('change',()=>{renderTimes();renderAvail()});
      if(time) time.addEventListener('change',renderAvail);
      if(date) date.addEventListener('change',()=>{renderTimes();renderAvail()});

      if(toastClose&&toast) toastClose.addEventListener('click',e=>{e.preventDefault();toast.classList.remove('is-on')});

      // admin visibility
      if(isAdmin()){
        if(adminPanel) adminPanel.classList.remove('auth-hidden');
        if(fDate) fDate.addEventListener('change',renderAdmin);
        if(fTime) fTime.addEventListener('change',renderAdmin);
        if(fTier) fTier.addEventListener('change',renderAdmin);
        renderAdmin();
      }

      if(adminList){
        adminList.addEventListener('click',(e)=>{
          const btn=e.target && e.target.closest ? e.target.closest('[data-action]') : null;
          if(!btn) return;
          if(!isAdmin()) return;
          const action=String(btn.getAttribute('data-action')||'');
          const id=String(btn.getAttribute('data-id')||'');
          if(!id) return;

          if(action==='verify'){
            const list=loadRes();
            const idx=list.findIndex(r=>r&&String(r.id||'')===id);
            if(idx===-1) return;
            list[idx]={...(list[idx]||{}),status:'CONFIRMED'};
            saveRes(list);
            renderAdmin();
            const badge=adminList.querySelector(`[data-status-badge][data-id="${id}"]`);
            if(badge){
              badge.classList.add('status-pulse');
              window.setTimeout(()=>badge.classList.remove('status-pulse'),260);
            }
            return;
          }

          if(action==='delete'){
            const ok=window.confirm('Delete this reservation?');
            if(!ok) return;
            const list=loadRes().filter(r=>r&&String(r.id||'')!==id);
            saveRes(list);
            renderAdmin();
            renderTimes();
            renderAvail();
            return;
          }
        });
      }

      // realtime across tabs
      window.addEventListener('storage',(e)=>{ if(e.key===RES_KEY) {renderTimes();renderAvail(); if(isAdmin()) renderAdmin();} });

      // booking
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
          if(!nm||!pp||!d||!tm||!tb||!ph){showErr('Please fill all fields.');return;}
          if(!isValidPhone(ph)){showErr('Phone number invalid. Format: +212612910010');return;}

          const list=loadRes();
          const exists=list.some(r=>r&&r.tableName===tb&&r.date===d&&r.time===tm);
          if(exists){showErr('Reservation deja faite, choisir une autre date');renderTimes();renderAvail();return;}

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

          if(toastTitle) toastTitle.textContent=`Reservation · ${tr.toUpperCase()}`;
          if(toastText) toastText.textContent=`${nm} · ${pp} pers · ${d} ${tm} · ${tb}`;
          if(toast) toast.classList.add('is-on');

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

      // disable unavailable times by tier/date/table (handled by select options)
    })();


