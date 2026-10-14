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

  /* Countdown: submission deadline, then the conference itself */
  const cd = document.getElementById('countdown');
  if (cd) {
    const label = document.getElementById('countdown-label');
    const milestones = [
      { t: new Date('2026-12-15T23:59:59+05:30').getTime(), text: 'Paper submission closes in' },
      { t: new Date('2027-03-12T09:00:00+05:30').getTime(), text: 'Conference begins in' }
    ];
    const cells = { d: cd.querySelector('[data-unit="d"]'), h: cd.querySelector('[data-unit="h"]'), m: cd.querySelector('[data-unit="m"]'), s: cd.querySelector('[data-unit="s"]') };
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const t = Date.now();
      const next = milestones.find(m => m.t > t);
      if (!next) { label.textContent = 'Thank you for joining RDAE 2027'; cd.hidden = true; return; }
      label.textContent = next.text;
      let diff = Math.floor((next.t - t) / 1000);
      const d = Math.floor(diff / 86400); diff -= d * 86400;
      const h = Math.floor(diff / 3600); diff -= h * 3600;
      const m = Math.floor(diff / 60); const s = diff - m * 60;
      cells.d.textContent = d; cells.h.textContent = pad(h); cells.m.textContent = pad(m); cells.s.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }
})();
