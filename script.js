/* ============================================================
   Brian Okum — Portfolio JavaScript
   
   Handles:
   - Image carousel auto-sliding and dot navigation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCarousels();
});


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
      dot.addEventListener('click', () => {
        goToSlide(carousel, index);
        resetAutoSlide(carousel);
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
      startAutoSlide(carousel, autoSlideInterval);
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
}


function resetAutoSlide(carousel) {
  const interval = parseInt(carousel.dataset.autoSlide, 10) || 2000;
  pauseAutoSlide(carousel);
  startAutoSlide(carousel, interval);
}
