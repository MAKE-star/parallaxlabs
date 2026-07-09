// Parallax Labs — shared behaviour

document.addEventListener('DOMContentLoaded', () => {

  /* mobile nav toggle */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* signature parallax: two lenses drift apart at rest, converge as you scroll the hero
     — literalises "parallax: the shift between two viewpoints that resolves into depth" */
  const code = document.querySelector('.lens-code');
  const data = document.querySelector('.lens-data');
  const stage = document.querySelector('.lens-stage');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (code && data && stage && !reduceMotion) {
    const apply = () => {
      const rect = stage.getBoundingClientRect();
      const progress = Math.min(Math.max(1 - rect.top / window.innerHeight, 0), 1);
      const spread = 115 + 35 * (1 - progress); // rest further apart, converge to just-touching (never overlapping — both photos stay fully visible)
      code.style.transform = `translate(${-spread}px, ${-spread * 0.4}px)`;
      data.style.transform = `translate(${spread}px, ${spread * 0.4}px)`;
    };
    apply();
    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', apply);
  } else if (code && data) {
    code.style.transform = 'translate(-125px, -50px)';
    data.style.transform = 'translate(125px, 50px)';
  }

  /* scroll-reveal: fade+rise sections into view as the user scrolls */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* project request form -> Netlify Forms via AJAX, modal shows progress + confirmation */
  const form = document.querySelector('#project-form');
  const modalOverlay = document.querySelector('#request-modal');

  function setModalState(state) {
    if (!modalOverlay) return;
    modalOverlay.querySelectorAll('.modal-state').forEach((el) => {
      const isActive = el.dataset.state === state;
      el.hidden = !isActive;
      // restart CSS animations (spinner/checkmark) each time a state is shown
      if (isActive) {
        el.querySelectorAll('*').forEach((child) => {
          child.style.animation = 'none';
          // eslint-disable-next-line no-unused-expressions
          child.offsetHeight; // force reflow
          child.style.animation = '';
        });
      }
    });
  }

  function openModal(state) {
    if (!modalOverlay) return;
    setModalState(state);
    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
  }

  if (modalOverlay) {
    modalOverlay.querySelectorAll('.modal-close').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });
    // clicking the dimmed backdrop closes it, but only once the request has settled
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay && !modalOverlay.querySelector('[data-state="loading"]:not([hidden])')) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open') &&
          !modalOverlay.querySelector('[data-state="loading"]:not([hidden])')) {
        closeModal();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      openModal('loading');
      fetch('/contact.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(() => {
          setModalState('success');
          form.reset();
        })
        .catch(() => {
          setModalState('error');
        });
    });
  }
});