(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const backTop = document.querySelector('.back-top');

  /* Mobile menu */
  menuToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  /* Header shadow + back-to-top */
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
    backTop?.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Active link highlighting for in-page sections */
  const spyLinks = [...document.querySelectorAll('.main-nav a[href^="#"], .track-toc a[href^="#"]')];
  const targets = spyLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = '#' + e.target.id;
        spyLinks.forEach(a => {
          const group = a.closest('.track-toc') ? '.track-toc' : '.main-nav';
          if (document.querySelector(`${group} a[href="${id}"]`)) a.classList.toggle('active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(t => spy.observe(t));
  }

  /* Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* Mark dates that have passed (end of day, IST) */
  const now = Date.now();
  document.querySelectorAll('.date-item[data-date]').forEach(el => {
    const end = new Date(el.dataset.date + 'T23:59:59+05:30').getTime();
    if (end < now) { el.classList.add('past'); el.classList.remove('key'); }
  });

  /* Countdowns (paper submission + conference) */
  const timers = [...document.querySelectorAll('.countdown[data-target]')];
  if (timers.length) {
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const now = Date.now();
      timers.forEach(cd => {
        const target = new Date(cd.dataset.target).getTime();
        let diff = Math.floor((target - now) / 1000);
        if (diff <= 0) {
          if (!cd.dataset.finished) { cd.dataset.finished = '1'; cd.innerHTML = `<p class="cd-done">${cd.dataset.done || ''}</p>`; }
          return;
        }
        const d = Math.floor(diff / 86400); diff -= d * 86400;
        const h = Math.floor(diff / 3600); diff -= h * 3600;
        const m = Math.floor(diff / 60); const sec = diff - m * 60;
        const set = (u, v) => { const el = cd.querySelector(`[data-unit="${u}"]`); if (el) el.textContent = v; };
        set('d', d); set('h', pad(h)); set('m', pad(m)); set('s', pad(sec));
      });
    };
    tick();
    setInterval(tick, 1000);
  }
})();

/* Downloads page: copy caption buttons */
document.querySelectorAll('.cap-copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.target);
    const label = btn.querySelector('span');
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.textContent);
    } catch (e) {
      const r = document.createRange(); r.selectNodeContents(el);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      document.execCommand('copy'); s.removeAllRanges();
    }
    label.textContent = 'Copied';
    setTimeout(() => { label.textContent = 'Copy'; }, 2000);
  });
});
