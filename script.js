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

function getCurrentFilename() {
  const path = window.location.pathname;
  let file = path.substring(path.lastIndexOf('/') + 1);
  if (!file || file === '') file = 'index.html';
  return file;
}

// Check if navigated from below (scrolled up from subsequent page)
const isNavigatedFromBelow = window.location.hash === '#bottom' || window.location.search.includes('dir=prev') || window.location.search.includes('from=bottom');

// === ENTRANCE SCROLL ANIMATION (PAGE ROLLS IN) ===
(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dir = urlParams.get('dir');
  if (!dir) return;

  const mainEl = document.querySelector('main');
  if (!mainEl) return;

  // Next page (scrolling down): content scrolls up in from bottom (80vh)
  // Previous page (scrolling up): content scrolls down in from top (-80vh)
  const enterOffset = dir === 'next' ? '70vh' : '-70vh';

  mainEl.style.opacity = '0.7';
  mainEl.style.transform = `translateY(${enterOffset})`;
  mainEl.style.willChange = 'transform, opacity';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mainEl.style.transition = 'transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
      mainEl.style.opacity = '1';
      mainEl.style.transform = 'translateY(0)';

      setTimeout(() => {
        mainEl.style.transition = '';
        mainEl.style.transform = '';
        mainEl.style.opacity = '';
        mainEl.style.willChange = '';

        // Clean URL search param without re-scrolling
        if (window.location.search.includes('dir=')) {
          const cleanSearch = window.location.search.replace(/[?&]dir=[^&#]*/, '').replace(/^&/, '?');
          history.replaceState(null, '', window.location.pathname + cleanSearch + (window.location.hash || ''));
        }
      }, 500);
    });
  });
})();

// === HORIZONTAL SLIDER ===
const track = document.getElementById('slidesTrack');
const rightPanel = document.querySelector('.slider-panel');

if (track && rightPanel) {
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

    // Persist active slide for desktop slider restoration
    try {
      sessionStorage.setItem('last-active-slide-' + getCurrentFilename(), index);
    } catch (e) {}
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

  // Touch/swipe support (only on desktop or non-stacked mobile)
  rightPanel.addEventListener('touchstart', (e) => {
    if (window.innerWidth <= 900 && document.querySelector('.layout-flipped')) return;
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

  // Init: if coming from below on desktop horizontal slider, restore the slide the user last selected
  const isDesktopSlider = window.innerWidth > 900;
  if (isNavigatedFromBelow && isDesktopSlider) {
    let targetSlide = slides.length - 1; // Default fallback to last slide
    try {
      const saved = sessionStorage.getItem('last-active-slide-' + getCurrentFilename());
      if (saved !== null && !isNaN(parseInt(saved, 10))) {
        targetSlide = Math.max(0, Math.min(slides.length - 1, parseInt(saved, 10)));
      }
    } catch (e) {}
    positionSlides(targetSlide, false);
  } else {
    positionSlides(0, false);
  }
}

// On vertically scrollable pages (or mobile stacked view), scroll to bottom if navigated from below
if (isNavigatedFromBelow) {
  const jumpToBottom = () => {
    const docH = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight
    );
    window.scrollTo({ top: docH, behavior: 'instant' });
  };
  jumpToBottom();
  requestAnimationFrame(jumpToBottom);
  setTimeout(jumpToBottom, 60);
  setTimeout(jumpToBottom, 250);
  // Clean URL hash without triggering scroll
  setTimeout(() => {
    if (window.location.hash === '#bottom') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, 350);
}

// === BIDIRECTIONAL DOUBLE-SCROLL PAGE TRANSITIONS ===
(function () {
  const PAGE_SEQUENCE = [
    'index.html',
    'user-understanding.html',
    'designs.html',
    'campaigns.html',
    'ai.html'
  ];

  const PAGE_LABELS = {
    'index.html': 'home',
    'user-understanding.html': 'user understanding',
    'designs.html': 'designs',
    'campaigns.html': 'campaigns',
    'ai.html': 'ai'
  };

  function getTargetPages() {
    const currentFile = getCurrentFilename();
    const idx = PAGE_SEQUENCE.indexOf(currentFile);
    return {
      prev: idx > 0 ? PAGE_SEQUENCE[idx - 1] : null,
      next: idx !== -1 && idx < PAGE_SEQUENCE.length - 1 ? PAGE_SEQUENCE[idx + 1] : null
    };
  }

  const { prev: prevPage, next: nextPage } = getTargetPages();
  if (!prevPage && !nextPage) return; // Neither prev nor next page exists

  let isTransitioning = false;
  let hintEl = null;

  function createOrGetHint() {
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.id = 'pageScrollHint';
      hintEl.style.cssText = `
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 26, 26, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #f5f5f5;
        font-family: var(--font-inter, -apple-system, sans-serif);
        font-size: 13px;
        font-weight: 300;
        letter-spacing: 0.04em;
        padding: 8px 18px;
        border-radius: 999px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      document.body.appendChild(hintEl);
    }
    return hintEl;
  }

  function showHint(direction, targetPage, step) {
    const el = createOrGetHint();
    const targetLabel = PAGE_LABELS[targetPage] || 'page';
    const arrow = direction === 'next' ? '↓' : '↑';

    if (direction === 'next') {
      el.style.top = 'auto';
      el.style.bottom = '20px';
    } else {
      el.style.bottom = 'auto';
      el.style.top = '72px';
    }

    if (step === 1) {
      el.innerHTML = `<span>scroll again for <strong>${targetLabel}</strong></span> <span style="font-size: 14px;">${arrow}</span>`;

      // Shift page content to make space so the notification does NOT obscure any text
      const mainEl = document.querySelector('main');
      if (mainEl && !isTransitioning) {
        const peekShift = direction === 'next' ? '-64px' : '64px';
        mainEl.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)';
        mainEl.style.transform = `translateY(${peekShift})`;
      }
    } else {
      el.innerHTML = `<span>loading <strong>${targetLabel}</strong>...</span>`;
    }

    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  }

  function hideHint() {
    if (hintEl) {
      hintEl.style.opacity = '0';
      hintEl.style.transform = 'translateX(-50%) translateY(10px)';
    }

    // Smoothly return content back to normal resting position when notification disappears
    const mainEl = document.querySelector('main');
    if (mainEl && !isTransitioning) {
      mainEl.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)';
      mainEl.style.transform = 'translateY(0)';
      setTimeout(() => {
        if (!isTransitioning && !activeDirection) {
          mainEl.style.transform = '';
          mainEl.style.transition = '';
        }
      }, 340);
    }
  }

  // Pure scroll-like exit animation: content scrolls all the way off screen
  function executeTransition(targetUrl, direction) {
    if (isTransitioning || !targetUrl) return;
    isTransitioning = true;
    showHint(direction, targetUrl, 2);

    const mainEl = document.querySelector('main');
    if (mainEl) {
      // Outgoing content scrolls vertically out of view
      const exitOffset = direction === 'next' ? '-75vh' : '75vh';
      mainEl.style.transition = 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease';
      mainEl.style.transform = `translateY(${exitOffset})`;
      mainEl.style.opacity = '0.5';
    }

    // Pass direction flag to trigger matching entrance scroll on destination page
    const destination = direction === 'prev' ? `${targetUrl}?dir=prev#bottom` : `${targetUrl}?dir=next`;

    setTimeout(() => {
      window.location.href = destination;
    }, 340);
  }

  function isAtPageTop() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const windowH = window.innerHeight;

    // Desktop horizontal slider layout
    if (docH <= windowH + 30) {
      const trackEl = document.getElementById('slidesTrack');
      if (trackEl && typeof current !== 'undefined') {
        return current === 0;
      }
      return true;
    }

    return scrollY <= 14;
  }

  function isAtPageBottom() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowH = window.innerHeight;
    const docH = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight
    );

    // Desktop horizontal slider layout
    if (docH <= windowH + 30) {
      const trackEl = document.getElementById('slidesTrack');
      if (trackEl && typeof current !== 'undefined') {
        const slidesCount = trackEl.querySelectorAll('.slide').length;
        return current === slidesCount - 1;
      }
      return true;
    }

    return (scrollY + windowH) >= (docH - 24);
  }

  // Track how long user has been settled at boundary (prevents scroll-arrival from triggering)
  let bottomSettleTime = 0;
  let topSettleTime = 0;

  function updateSettleTimes() {
    const atBottom = isAtPageBottom();
    const atTop = isAtPageTop();

    if (atBottom) {
      if (!bottomSettleTime) bottomSettleTime = Date.now();
    } else {
      bottomSettleTime = 0;
    }

    if (atTop) {
      if (!topSettleTime) topSettleTime = Date.now();
    } else {
      topSettleTime = 0;
    }
  }

  window.addEventListener('scroll', updateSettleTimes, { passive: true });
  updateSettleTimes();

  // --- Double Scroll State Tracking ---
  const DOUBLE_SCROLL_WINDOW = 1100; // ms window to complete second scroll
  let activeDirection = null; // 'next' or 'prev'
  let scrollCount = 0;
  let resetTimer = null;

  function registerScrollGesture(direction) {
    if (isTransitioning) return;

    const targetUrl = direction === 'next' ? nextPage : prevPage;
    if (!targetUrl) return;

    if (activeDirection === direction && scrollCount === 1) {
      // Second deliberate scroll confirmed!
      if (resetTimer) clearTimeout(resetTimer);
      scrollCount = 2;
      executeTransition(targetUrl, direction);
    } else {
      // First deliberate scroll registered
      activeDirection = direction;
      scrollCount = 1;
      showHint(direction, targetUrl, 1);

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        scrollCount = 0;
        activeDirection = null;
        hideHint();
      }, DOUBLE_SCROLL_WINDOW);
    }
  }

  // --- Wheel Handling (Desktop) ---
  let wheelAccumulator = 0;
  let wheelResetTimer = null;
  let isWheelFlickCoolingDown = false;
  const WHEEL_FLICK_THRESHOLD = 260; // Deliberate strong scroll threshold

  window.addEventListener('wheel', (e) => {
    if (isTransitioning) return;
    const now = Date.now();

    // Scrolling down at bottom -> next page
    if (e.deltaY > 0 && isAtPageBottom() && nextPage) {
      if (bottomSettleTime && (now - bottomSettleTime > 200) && !isWheelFlickCoolingDown) {
        wheelAccumulator += e.deltaY;
        if (wheelAccumulator >= WHEEL_FLICK_THRESHOLD) {
          isWheelFlickCoolingDown = true;
          wheelAccumulator = 0;
          registerScrollGesture('next');
          setTimeout(() => { isWheelFlickCoolingDown = false; }, 450);
        }
      }
    }
    // Scrolling up at top -> prev page
    else if (e.deltaY < 0 && isAtPageTop() && prevPage) {
      if (topSettleTime && (now - topSettleTime > 200) && !isWheelFlickCoolingDown) {
        wheelAccumulator += Math.abs(e.deltaY);
        if (wheelAccumulator >= WHEEL_FLICK_THRESHOLD) {
          isWheelFlickCoolingDown = true;
          wheelAccumulator = 0;
          registerScrollGesture('prev');
          setTimeout(() => { isWheelFlickCoolingDown = false; }, 450);
        }
      }
    } else {
      wheelAccumulator = 0;
    }

    if (wheelResetTimer) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(() => {
      wheelAccumulator = 0;
    }, 220);
  }, { passive: true });

  // --- Touch Handling (Mobile) ---
  let touchStartY = 0;
  let touchStartX = 0;
  let wasAtTopOnStart = false;
  let wasAtBottomOnStart = false;
  let isTrackingTouch = false;
  const TOUCH_PULL_THRESHOLD = 90; // Deliberate 90px pull past boundary

  window.addEventListener('touchstart', (e) => {
    if (isTransitioning || e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    wasAtTopOnStart = isAtPageTop();
    wasAtBottomOnStart = isAtPageBottom();
    isTrackingTouch = true;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isTrackingTouch || isTransitioning) return;
    isTrackingTouch = false;

    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = touchStartY - endY; // Positive = pulled finger up (scroll down)
    const deltaX = Math.abs(endX - touchStartX);

    // Ensure predominantly vertical pull
    if (Math.abs(deltaY) < deltaX * 1.2) return;

    // Pulled up past bottom -> next page (MUST have started at the bottom)
    if (deltaY >= TOUCH_PULL_THRESHOLD && wasAtBottomOnStart && nextPage) {
      registerScrollGesture('next');
    }
    // Pulled down past top -> prev page (MUST have started at the top)
    else if (deltaY <= -TOUCH_PULL_THRESHOLD && wasAtTopOnStart && prevPage) {
      registerScrollGesture('prev');
    }
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    isTrackingTouch = false;
  }, { passive: true });
})();
