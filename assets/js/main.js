// Pink Alert: shared page behavior. The site works without JavaScript.
document.documentElement.classList.remove('no-js');

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const links = document.querySelector('.nav-links');
if (menuBtn && links) {
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });
}

// Copy buttons: <button data-copy="#id">
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const src = document.querySelector(btn.dataset.copy);
    if (!src) return;
    const text = src.innerText.replace(/^\$ /gm, '').trim();
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = old), 1600);
    } catch { /* clipboard blocked; the text is still selectable */ }
  });
});

// Design-sheet lightbox
const lb = document.querySelector('.lightbox');
document.querySelectorAll('[data-lightbox]').forEach((btn) => {
  btn.addEventListener('click', () => { if (lb && lb.showModal) lb.showModal(); });
});
if (lb) lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.close')) lb.close(); });

// Lazy YouTube embed: no third-party requests until the visitor presses play
document.querySelectorAll('[data-youtube]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.youtube}?autoplay=1&rel=0`;
    iframe.title = btn.getAttribute('aria-label') || 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'; // YouTube refuses embeds with no referrer (error 153)
    btn.replaceWith(iframe);
  });
});

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// ---------- Navigation always lands at the top of a page ----------
// A refresh always starts at the top (the browser would otherwise restore the old position)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const navType = (performance.getEntriesByType('navigation')[0] || {}).type;
if (navType === 'reload' && location.hash) history.replaceState(null, '', location.pathname + location.search);
const toTop = () => { if (!location.hash) window.scrollTo(0, 0); };
toTop();
window.addEventListener('load', toTop);
window.addEventListener('pageshow', (e) => { if (e.persisted) toTop(); });
const here = (location.pathname.split('/').pop() || 'index.html');
document.querySelectorAll('.nav-links a, a.brand, a.foot-logo').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = (a.getAttribute('href') || '').split('#')[0] || 'index.html';
    if (target === here) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Fade sections and cards in as they scroll into view ----------
const FADE = [
  // each heading, paragraph, card and figure fades in on its own as it scrolls into view
  '.hero-grid > div:first-child > *', '.scan-fig', '.head > *', '.statement > div:first-child > *', '.statement .cols > div',
  '.viewer', '.spec-grid > div', '.sequence li', '.doc-figure', '.pipeline li', '.two-col > * > *', '.two-col > .code', '.pull',
  '.alerts > div', '.results > div', '.demo', '.demo-note', '.roadmap li', '.next a', '.disclaimer', '.foot-grid > div',
  '.video', '.paper-cover', '.paper > div > *', '.ways > div', '.creds > div', '.founder-grid > div:last-child > :not(.creds)', '.contact > *',
];
const INLINE = new Set(['EM', 'STRONG', 'SPAN', 'A', 'B', 'SUB', 'BR', 'I']);
if (!reduceMotion && 'IntersectionObserver' in window) {
  const els = [...new Set(FADE.flatMap((sel) => [...document.querySelectorAll(sel)]))]
    // skip anything already inside another fading element, so nothing fades twice
    .filter((el) => !INLINE.has(el.tagName) && !el.closest('.site-header') && !(el.parentElement && el.parentElement.closest(FADE.join(','))));
  els.forEach((el) => {
    el.classList.add('fade');
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('fade'));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 90 + 'ms';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; io.unobserve(el);
      el.classList.add('in');
      // Once visible, drop the fade classes so hover effects run at full speed
      setTimeout(() => { el.classList.remove('fade', 'in'); el.style.transitionDelay = ''; }, 1000 + parseInt(el.style.transitionDelay || 0, 10));
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}

// ---------- Numbers count up from zero when they appear ----------
const counters = document.querySelectorAll('[data-count]');
function runCount(el) {
  const end = parseFloat(el.dataset.count), dur = 1600, t0 = performance.now();
  const row = el.closest('tr');
  const bar = row && row.querySelector('.weightbar[data-w]');
  if (bar) bar.style.width = bar.dataset.w;
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(end * e).toLocaleString();
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if (!reduceMotion && 'IntersectionObserver' in window) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { cio.unobserve(en.target); runCount(en.target); } });
  }, { threshold: 0.6 });
  counters.forEach((el) => { el.textContent = '0'; cio.observe(el); });
} else {
  document.querySelectorAll('.weightbar[data-w]').forEach((b) => (b.style.width = b.dataset.w));
}
