(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Nav shadow + active link
  const nav = document.getElementById('nav');
  const links = [...menu.querySelectorAll('a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    const y = scrollY + innerHeight * 0.35;
    let current = 0;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal (staggered by sibling order via CSS)
  const items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => io.observe(el));
  }

  // Hero stickers: mouse parallax + gentle scroll drift
  if (reduced) return;
  const hero = document.getElementById('home');
  const stickers = [...hero.querySelectorAll('.st[data-depth]')];
  const portrait = hero.querySelector('.portrait');
  let mx = 0, my = 0, tx = 0, ty = 0, ticking = false;

  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  });
  hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!ticking) { ticking = true; requestAnimationFrame(tick); } });

  function tick() {
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    const drift = Math.min(scrollY, innerHeight) * 0.08;
    portrait.style.setProperty('--pointer-x', `${mx * 16}px`);
    portrait.style.setProperty('--pointer-y', `${my * 16}px`);
    stickers.forEach(s => {
      const d = +s.dataset.depth * 0.8;
      // uses `transform` so it never fights the `translate`/`rotate` used by CSS float animations
      s.style.transform = `translate(${mx * d}px, ${my * d - drift * (d / 30)}px)`;
    });
    if (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001) requestAnimationFrame(tick);
    else ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking && scrollY < innerHeight) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
})();
