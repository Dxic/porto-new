// ---------- Scroll reveal (staggered per group) ----------
const reduceMotionGlobal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealGroups = new Map(); // parent element -> ordered children

document.querySelectorAll('.reveal').forEach(el=>{
  const parent = el.parentElement;
  if(!revealGroups.has(parent)) revealGroups.set(parent, []);
  revealGroups.get(parent).push(el);
});

if(reduceMotionGlobal){
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
} else if('IntersectionObserver' in window){
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const group = revealGroups.get(el.parentElement) || [el];
      const index = group.indexOf(el);
      setTimeout(()=> el.classList.add('in-view'), Math.max(index, 0) * 70);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

// ---------- Active nav link tracking ----------
const navAnchors = document.querySelectorAll('.navlinks a');

if('IntersectionObserver' in window && navAnchors.length){
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const link = document.querySelector(`.navlinks a[href="#${entry.target.id}"]`);
      if(!link) return;
      if(entry.isIntersecting){
        navAnchors.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  document.querySelectorAll('section[id]').forEach(sec => navObserver.observe(sec));
}

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('navlinks');

if(navToggle && navLinks){
  navToggle.addEventListener('click', ()=>{
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && navLinks.classList.contains('open')){
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// ---------- Hero terminal typing effect ----------
const lines = [
  { prompt: '$', text: 'whoami' },
  { plain: '→ Dicky belajar Full Stack Web Development dari dasar, salah satunya Laravel, sambil ngulik security' },
  { prompt: '$', text: 'cat status.txt' },
  { plain: '→ Masih tahap belajar, dibangun pelan-pelan lewat proyek nyata' },
  { prompt: '$', text: 'ls proyek/' },
  { plain: '→ ucapan-ultah.html  chatnexus-v2/  data-penduduk-app/  webgis-umkm/  d1xxy-optimize/' },
];

const body = document.getElementById('term-body');
let li = 0;

function revealHeroContent(){
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const scrollHint = document.querySelector('.scroll-hint');
  if(heroTitle) setTimeout(()=> heroTitle.classList.add('in-view'), 0);
  if(heroSub) setTimeout(()=> heroSub.classList.add('in-view'), 150);
  if(scrollHint) setTimeout(()=> scrollHint.classList.add('in-view'), 300);
}

function typeLine(){
  if(li >= lines.length){
    const cur = document.createElement('span');
    cur.className = 'cursor';
    body.appendChild(cur);
    revealHeroContent();
    return;
  }
  const item = lines[li];
  const div = document.createElement('div');
  div.className = 'term-line';
  body.appendChild(div);

  if(item.prompt){
    const promptSpan = document.createElement('span');
    promptSpan.className = 'prompt';
    promptSpan.textContent = item.prompt + ' ';
    div.appendChild(promptSpan);
    const valSpan = document.createElement('span');
    valSpan.className = 'val';
    div.appendChild(valSpan);

    let i = 0;
    const type = () => {
      if(i <= item.text.length){
        valSpan.textContent = item.text.slice(0, i);
        i++;
        setTimeout(type, 28);
      } else {
        li++;
        setTimeout(typeLine, 220);
      }
    };
    type();
  } else {
    div.textContent = item.plain;
    div.style.color = 'var(--paper-dim)';
    li++;
    setTimeout(typeLine, 260);
  }
}

if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  lines.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'term-line';
    div.textContent = item.prompt ? (item.prompt + ' ' + item.text) : item.plain;
    body.appendChild(div);
  });
} else {
  typeLine();
}

// ---------- Skill scan bars ----------
const skillRows = document.querySelectorAll('.skill-row');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function skillLabel(percent){
  if(percent >= 60) return 'Cukup Kuat';
  if(percent >= 40) return 'Berkembang';
  return 'Baru Mulai';
}

function fillSkill(row){
  const target = parseInt(row.dataset.percent, 10) || 0;
  const fill = row.querySelector('.skill-fill');
  const pctLabel = row.querySelector('.skill-pct');
  const tag = row.querySelector('.skill-tag');
  if(tag) tag.textContent = skillLabel(target);
  row.classList.add('filled');

  if(reduceMotion){
    fill.style.width = target + '%';
    pctLabel.textContent = target + '%';
    return;
  }

  fill.style.width = target + '%';
  let current = 0;
  const duration = 1100;
  const start = performance.now();

  function step(now){
    const progress = Math.min((now - start) / duration, 1);
    current = Math.round(progress * target);
    pctLabel.textContent = current + '%';
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if('IntersectionObserver' in window && skillRows.length){
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        fillSkill(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  skillRows.forEach(row => observer.observe(row));
} else {
  skillRows.forEach(fillSkill);
}

// ---------- Case detail modal ----------
const caseDetails = {
  '01': {
    title: 'Ucapan Ulang Tahun Interaktif',
    body: [
      'Website ucapan ulang tahun personal, dibuat sebagai latihan front-end murni tanpa framework berat.',
      'Fokus latihan: animasi CSS, transisi antar momen/scene, dan layout responsif. Langkah awal sebelum masuk ke proyek yang lebih kompleks.',
      'Stack: HTML, CSS, JavaScript vanilla.'
    ]
  },
  '02': {
    title: 'ChatNexus v2',
    body: [
      'Aplikasi chat room real-time, dikerjakan bareng tim sebagai proyek kelompok.',
      'Mendukung banyak ruang obrolan, autentikasi pengguna, dan pengiriman pesan instan.',
      'Bagian saya: struktur backend, autentikasi, dan alur data real-time.',
      'Catatan: link live saat ini cuma percobaan deploy di Railway, bukan versi production final.'
    ]
  },
  '03': {
    title: 'Aplikasi Pencatatan Data Penduduk',
    body: [
      'Aplikasi desktop pencatatan data kependudukan berbasis Python, dikemas menjadi file .exe untuk kemudahan distribusi.',
      'Mendukung multi-user dengan hak akses berjenjang (admin, petugas, dsb), validasi input, kontrol akses, dan audit trail.',
      'Stack: Python, SQLite/MySQL, desktop packaging, dan sistem otorisasi role-based.'
    ]
  },
  '04': {
    title: 'WebGIS UMKM Sungai Miai',
    body: [
      'WebGIS UMKM yang dibangun dengan Laravel, memungkinkan pemetaan usaha mikro, kecil, dan menengah secara visual.',
      'Fitur utama: peta interaktif, filter kategori, statistik UMKM, dan preview gambar usaha langsung dari masing-masing marker.',
      'Thumbnail usaha muncul saat user klik marker, membuat detail lokasi dan profil usaha lebih mudah diakses.',
      '<strong>Fitur lengkap:</strong> admin dashboard, login user, data UMKM, penambahan UMKM, dan peta publik.',
      '<strong>Teknologi:</strong> Laravel, MySQL, Blade, Leaflet, dan preview gambar untuk pengalaman yang lebih informatif.'
    ]
  },
  '05': {
    title: 'd1xxy OPTIMIZE',
    body: [
      'Aplikasi desktop berbasis PyQt6 untuk melakukan tuning performa Windows 11, dikerjakan sebagai side project di luar kuliah yang jalan paralel dengan proyek lain.',
      'Menyediakan 60+ tweak lintas kategori: power, CPU, RAM, storage, cleanup, sampai gaming. Masing-masing dengan penjelasan risiko dan tombol undo, jadi tweak yang diterapkan tetap bisa dibatalkan.',
      'Ada dashboard real-time yang memantau CPU load, RAM usage, disk speed, dan network speed, lengkap dengan rekomendasi otomatis (prioritas High/Med/Low) berdasarkan kondisi sistem.',
      'Ada asisten AI bawaan yang bisa jawab pertanyaan seputar kondisi hardware dan kasih saran tweak sesuai kebutuhan, misalnya buat gaming atau biar RAM nggak kepakai banyak.',
      '<strong>Stack:</strong> Python, PyQt6, sequential tweak executor dengan pre-flight check, dry-run, dan audit log.'
    ]
  }
};

const overlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalPanel = overlay.querySelector('.modal');
let lastFocusedTrigger = null;

function openModal(data, trigger){
  lastFocusedTrigger = trigger;
  modalBody.innerHTML = `<h3>${data.title}</h3>` + data.body.map(p=>`<p>${p}</p>`).join('');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  modalClose.focus();
}

function closeModal(){
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  if(lastFocusedTrigger) lastFocusedTrigger.focus();
}

document.querySelectorAll('.case-link[data-case]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const id = btn.dataset.case;
    const data = caseDetails[id];
    if(!data) return;
    openModal(data, btn);
  });
});

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', (e)=>{
  if(e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e)=>{
  if(!overlay.classList.contains('open')) return;

  if(e.key === 'Escape'){
    closeModal();
    return;
  }

  // Simple focus trap: keep Tab cycling within the modal
  if(e.key === 'Tab'){
    const focusable = modalPanel.querySelectorAll('button, a[href]');
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  }
});

// ---------- Scroll progress bar + back-to-top button ----------
const progressFill = document.getElementById('scroll-progress-fill');
const toTopBtn = document.getElementById('to-top');

function updateScrollUI(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if(progressFill) progressFill.style.width = progress + '%';
  if(toTopBtn) toTopBtn.classList.toggle('visible', scrollTop > window.innerHeight * 0.6);
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

if(toTopBtn){
  toTopBtn.addEventListener('click', ()=>{
    window.scrollTo({ top: 0, behavior: reduceMotionGlobal ? 'auto' : 'smooth' });
  });
}

// ---------- Eyebrow typewriter (each "$ command" types itself in) ----------
const eyebrows = document.querySelectorAll('.eyebrow');

function typeEyebrow(el){
  const text = el.textContent;
  el.textContent = '';
  el.classList.add('typing');
  const cursor = document.createElement('span');
  cursor.className = 'cursor eyebrow-cursor';
  el.appendChild(cursor);

  let i = 0;
  const step = ()=>{
    if(i < text.length){
      cursor.insertAdjacentText('beforebegin', text[i]);
      i++;
      setTimeout(step, 28);
    } else {
      cursor.remove();
      el.classList.remove('typing');
    }
  };
  step();
}

if(eyebrows.length){
  if(reduceMotionGlobal || !('IntersectionObserver' in window)){
    // leave static text as-is
  } else {
    const eyebrowObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        typeEyebrow(entry.target);
        eyebrowObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    eyebrows.forEach(el => eyebrowObserver.observe(el));
  }
}

// ---------- Stat number count-up ----------
const countTargets = document.querySelectorAll('[data-count-to]');

if(countTargets.length){
  const countUp = (el)=>{
    const target = parseInt(el.dataset.countTo, 10) || 0;
    if(reduceMotionGlobal){ el.textContent = target; return; }
    const duration = 700;
    const start = performance.now();
    const step = (now)=>{
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(progress * target);
      if(progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if('IntersectionObserver' in window){
    const countObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    countTargets.forEach(el => countObserver.observe(el));
  } else {
    countTargets.forEach(countUp);
  }
}

// ---------- Theme toggle (light/dark, remembered per browser) ----------
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-toggle-icon');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const THEME_KEY = 'dicky-portfolio-theme';

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  if(themeIcon) themeIcon.textContent = theme === 'light' ? '☾' : '☀';
  if(themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  if(themeColorMeta) themeColorMeta.setAttribute('content', theme === 'light' ? '#f3ede1' : '#0a0d11');
}

function getStoredTheme(){
  try{ return localStorage.getItem(THEME_KEY); }catch(e){ return null; }
}

function storeTheme(theme){
  try{ localStorage.setItem(THEME_KEY, theme); }catch(e){ /* ignore, e.g. private mode */ }
}

const savedTheme = getStoredTheme();
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(savedTheme || (systemPrefersLight ? 'light' : 'dark'));

if(themeToggle){
  themeToggle.addEventListener('click', ()=>{
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    storeTheme(next);
  });
}

// ---------- Easter egg: squash the bug (bug bounty, literally) ----------
const crawlBug = document.getElementById('crawl-bug');
let bugsSquashed = 0;

if(crawlBug){
  crawlBug.addEventListener('click', ()=>{
    if(crawlBug.classList.contains('squashed')) return;
    bugsSquashed++;
    crawlBug.classList.add('squashed');

    const rect = crawlBug.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'bounty-popup';
    popup.textContent = `bounty +1 (${bugsSquashed})`;
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.top - 6) + 'px';
    document.body.appendChild(popup);
    setTimeout(()=> popup.remove(), 1000);

    setTimeout(()=>{
      crawlBug.classList.remove('squashed');
      crawlBug.style.animation = 'none';
      void crawlBug.offsetWidth; // force reflow so the crawl animation restarts cleanly
      crawlBug.style.animation = '';
    }, 1300);
  });
}
const tiltEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotionGlobal;

if(tiltEnabled){
  document.querySelectorAll('.case').forEach(card=>{
    let frame = null;

    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      if(frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(()=>{
        card.style.transition = 'none';
        card.style.transform = `perspective(900px) translateY(-3px) rotateX(${(-py * 3.5).toFixed(2)}deg) rotateY(${(px * 3.5).toFixed(2)}deg)`;
      });
    });

    card.addEventListener('mouseleave', ()=>{
      if(frame) cancelAnimationFrame(frame);
      card.style.transition = 'transform .4s var(--ease)';
      card.style.transform = '';
      setTimeout(()=>{ card.style.transition = ''; }, 420);
    });
  });
}
