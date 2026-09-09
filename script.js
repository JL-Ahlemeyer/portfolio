// Mobile accordion dropdowns
document.querySelectorAll('.accordion-header').forEach((header) => {
  header.addEventListener('click', (e) => {
    if (window.innerWidth > 900) return;
    const content = header.nextElementSibling;
    const isExpanded = header.classList.contains('active');
    header.classList.toggle('active', !isExpanded);
    if (content) {
      content.classList.toggle('active', !isExpanded);
    }
    header.setAttribute('aria-expanded', !isExpanded);
  });
});

// Mobile navbar toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active')) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }
    }
  });
}

// === HORIZONTAL SLIDER ===
const track = document.getElementById('slidesTrack');
const slides = Array.from(track.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
let current = 0;
let startX = 0;
let isDragging = false;

// Layer 2 parallax — startet rechts, bewegt sich pro Slide nach links
const LAYER2_OFFSETS = [50, 25, 0];
const imageLayer2 = document.getElementById('imageLayer3');

// Layer 2 middle — halfway between layer1 (0px) and layer3
const LAYER_MIDDLE_OFFSETS = [25, 13, 0];
const imageLayerMiddle = document.getElementById('imageLayer2');

// Position all slides side by side via translateX
function positionSlides(index, animate = true) {
  slides.forEach((slide, i) => {
    slide.style.transition = animate
      ? 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    slide.style.transform = `translateX(${-index * 100}%)`;
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  // Shift layer 3 (top) on each slide
  if (imageLayer2) {
    const offset = LAYER2_OFFSETS[index] ?? LAYER2_OFFSETS[LAYER2_OFFSETS.length - 1];
    imageLayer2.style.transition = animate
      ? 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    imageLayer2.style.transform = `translateX(${offset}px)`;
  }

  // Shift layer 2 (middle) on each slide
  if (imageLayerMiddle) {
    const offset = LAYER_MIDDLE_OFFSETS[index] ?? LAYER_MIDDLE_OFFSETS[LAYER_MIDDLE_OFFSETS.length - 1];
    imageLayerMiddle.style.transition = animate
      ? 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    imageLayerMiddle.style.transform = `translateX(${offset}px)`;
  }

  current = index;
}


// Dot click
dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    positionSlides(parseInt(dot.dataset.index));
  });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' && current < slides.length - 1) {
    positionSlides(current + 1);
  } else if (e.key === 'ArrowLeft' && current > 0) {
    positionSlides(current - 1);
  }
});

// Touch/swipe support
const rightPanel = document.querySelector('.slider-panel');

rightPanel.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
}, { passive: true });

rightPanel.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && current < slides.length - 1) positionSlides(current + 1);
    else if (diff < 0 && current > 0) positionSlides(current - 1);
  }
  isDragging = false;
}, { passive: true });

// Mouse drag support (desktop)
rightPanel.addEventListener('mousedown', (e) => {
  startX = e.clientX;
  isDragging = true;
});

window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  const diff = startX - e.clientX;
  if (Math.abs(diff) > 60) {
    if (diff > 0 && current < slides.length - 1) positionSlides(current + 1);
    else if (diff < 0 && current > 0) positionSlides(current - 1);
  }
  isDragging = false;
});

// Init
positionSlides(0, false);
