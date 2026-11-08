(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('.nav__mobile a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 860) setMenu(false); });

  /* ---------- Active section in nav ---------- */
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Project rail arrows ---------- */
  const rail = $('.rail');
  const arrows = $$('.arrow');
  if (rail && arrows.length) {
    const step = () => {
      const card = rail.querySelector('.mini');
      return card ? card.getBoundingClientRect().width + 18 : 320;
    };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      arrows.forEach((b) => {
        b.disabled = b.dataset.dir === '-1' ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
      });
    };
    arrows.forEach((b) => b.addEventListener('click', () => {
      rail.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' });
    }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  let lastFocus = null;
  const openLb = (src, alt) => {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lb).focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  $$('.shot[data-full]').forEach((btn) => btn.addEventListener('click', () => {
    openLb(btn.dataset.full, $('img', btn)?.alt);
  }));
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) closeLb();
    else if (nav.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Copy email ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };
  const emailBtn = $('#copyEmail');
  if (emailBtn) {
    emailBtn.addEventListener('click', async () => {
      const email = emailBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied to clipboard');
      } catch {
        window.location.href = 'mailto:' + email;
      }
    });
  }
})();
