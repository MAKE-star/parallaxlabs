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

  /* project request form -> Netlify Forms via AJAX, inline success state */
  const form = document.querySelector('#project-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(() => {
          form.style.display = 'none';
          document.querySelector('.form-success').style.display = 'block';
        })
        .catch(() => {
          alert("Something didn't send. Please email parallaxlabs.tech@gmail.com directly.");
        });
    });
  }
});
