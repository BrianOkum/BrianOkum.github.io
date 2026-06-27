/* ============================================================
   Brian Okum — Portfolio JavaScript

   Handles:
   - Image carousel auto-sliding and dot navigation
   - CAD landing page hover state machine (home / index.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCarousels();
  initCadLanding();
});


/* ---------- CAD LANDING (home page) ---------- */

function initCadLanding() {
  const stage = document.querySelector('.cad-stage');
  if (!stage) return; // Page doesn't have a CAD stage — nothing to do

  // States in the "portfolio family" — entering any of these shows sub-callouts
  // and dims the non-portfolio main callouts.
  const PORTFOLIO_GROUP = new Set([
    'portfolio', 'visualcomms', 'userenable', 'qualcomp', 'singsource', 'procdev'
  ]);

  // Navigation map: which target sends the visitor where on click.
  const NAV = {
    about:       'about.html',
    portfolio:   'portfolio.html',
    contact:     'contact.html',
    visualcomms: 'portfolio.html#visual-communication',
    userenable:  'portfolio.html#user-enablement',
    qualcomp:    'portfolio.html#quality-compliance',
    singsource:  'portfolio.html#single-sourcing',
    procdev:     'portfolio.html#process-development'
  };

  const GRACE_MS = 200; // hover-intent grace period before reverting to default
  let revertTimer = null;

  function setState(state) {
    if (revertTimer) { clearTimeout(revertTimer); revertTimer = null; }
    stage.dataset.state = state;
    if (PORTFOLIO_GROUP.has(state)) stage.dataset.group = 'portfolio';
    else delete stage.dataset.group;
  }

  function scheduleRevert() {
    if (revertTimer) clearTimeout(revertTimer);
    revertTimer = setTimeout(() => {
      stage.dataset.state = 'default';
      delete stage.dataset.group;
      revertTimer = null;
    }, GRACE_MS);
  }

  stage.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('mouseenter', () => setState(el.dataset.target));
    el.addEventListener('mouseleave', scheduleRevert);
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const href = NAV[el.dataset.target];
      if (href) window.location.href = href;
    });
  });
}


/* ---------- CAROUSEL ---------- */

function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const autoSlideInterval = parseInt(carousel.dataset.autoSlide, 10) || 2000;

    if (slides.length === 0) return;

    // Create pagination dots
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(carousel, index);
        pauseAutoSlide(carousel);
        carousel.dataset.lingering = 'true';
        // 18.75-second linger (25% longer than the prior 15s), then resume normal timing
        const lingerTimer = setTimeout(() => {
          carousel.dataset.lingering = '';
          nextSlide(carousel);
          startAutoSlide(carousel, autoSlideInterval);
        }, 18750);
        carousel.dataset.lingerTimer = lingerTimer;
      });
      dotsContainer.appendChild(dot);
    });

    // Start auto-sliding
    startAutoSlide(carousel, autoSlideInterval);

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      pauseAutoSlide(carousel);
    });

    carousel.addEventListener('mouseleave', () => {
      // Don't override a linger pause from a dot click
      if (carousel.dataset.lingering !== 'true') {
        startAutoSlide(carousel, autoSlideInterval);
      }
    });
  });
}


function goToSlide(carousel, index) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  slides[index].classList.add('active');
  dots[index].classList.add('active');

  // Store current index
  carousel.dataset.currentSlide = index;
}


function nextSlide(carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const current = parseInt(carousel.dataset.currentSlide, 10) || 0;
  const next = (current + 1) % slides.length;
  goToSlide(carousel, next);
}


function startAutoSlide(carousel, interval) {
  // Clear any existing timer first
  pauseAutoSlide(carousel);
  
  const timerId = setInterval(() => {
    nextSlide(carousel);
  }, interval);

  carousel.dataset.timerId = timerId;
}


function pauseAutoSlide(carousel) {
  const timerId = carousel.dataset.timerId;
  if (timerId) {
    clearInterval(parseInt(timerId, 10));
    carousel.dataset.timerId = '';
  }
  // Also clear any linger timer from a dot click
  const lingerTimer = carousel.dataset.lingerTimer;
  if (lingerTimer) {
    clearTimeout(parseInt(lingerTimer, 10));
    carousel.dataset.lingerTimer = '';
  }
}


function resetAutoSlide(carousel) {
  const interval = parseInt(carousel.dataset.autoSlide, 10) || 2000;
  pauseAutoSlide(carousel);
  startAutoSlide(carousel, interval);
}
