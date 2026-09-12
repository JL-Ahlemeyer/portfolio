
// ============================================================================
// MOBILE NAV CTA NOTIFICATION ("EXPLORE WORK PROJECTS")
// ============================================================================
(function () {
  const STORAGE_KEY = 'mobile-nav-cta-dismissed';
  let ctaTimer = null;
  let ctaEl = null;

  function isDismissed() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function dismissMobileNavCta() {
    if (ctaTimer) {
      clearTimeout(ctaTimer);
      ctaTimer = null;
    }
    if (ctaEl) {
      ctaEl.classList.remove('mobile-nav-cta--visible');
      ctaEl.classList.add('mobile-nav-cta--hidden');
      setTimeout(() => {
        if (ctaEl && ctaEl.parentNode) {
          ctaEl.parentNode.removeChild(ctaEl);
          ctaEl = null;
        }
      }, 400);
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
  }

  // Expose globally so transition handlers and menu toggles can call it
  window.dismissMobileNavCta = dismissMobileNavCta;

  function createMobileNavCta() {
    if (ctaEl) return ctaEl;
    ctaEl = document.createElement('button');
    ctaEl.id = 'mobileNavCta';
    ctaEl.className = 'mobile-nav-cta';
    ctaEl.setAttribute('type', 'button');
    ctaEl.setAttribute('aria-label', 'Explore work projects');

    const label = (window.I18nManager && window.I18nManager.t('cta.explore_mobile')) || 'explore work projects';
    ctaEl.innerHTML = `
      <span data-i18n="cta.explore_mobile">${label}</span>
      <svg class="mobile-nav-cta-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    `;

    ctaEl.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissMobileNavCta();
      const navToggle = document.getElementById('navToggle');
      const navLinks = document.getElementById('navLinks');
      if (navToggle && navLinks) {
        navToggle.classList.add('active');
        navLinks.classList.add('active');
      }
    });

    document.body.appendChild(ctaEl);
    return ctaEl;
  }

  let isScheduled = false;
  function scheduleMobileNavCta() {
    if (window.innerWidth > 900) return;
    if (isDismissed()) return;
    if (isScheduled || ctaEl) return;

    // Check if burger menu is already open
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('active')) return;

    isScheduled = true;
    if (ctaTimer) clearTimeout(ctaTimer);
    ctaTimer = setTimeout(() => {
      isScheduled = false;
      if (window.innerWidth > 900 || isDismissed()) return;
      const navLinks = document.getElementById('navLinks');
      if (navLinks && navLinks.classList.contains('active')) return;

      const el = createMobileNavCta();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add('mobile-nav-cta--visible');
        });
      });
    }, 6000);
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900) {
      scheduleMobileNavCta();
    } else if (ctaEl) {
      dismissMobileNavCta();
    }
  }, { passive: true });

  // Dismiss listeners on burger menu toggle
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', dismissMobileNavCta);
  }


  // Start timer on load or DOM ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleMobileNavCta();
  } else {
    document.addEventListener('DOMContentLoaded', scheduleMobileNavCta);
  }
})();

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

// ============================================================================
// BACKGROUND IMAGE PRELOADER WITH INTERACTIVE PRIORITY QUEUE
// ============================================================================
const ImagePreloader = (function () {
  const NAVBAR_PAGES = [
    'index.html',
    'user-understanding.html',
    'designs.html',
    'campaigns.html',
    'ai.html'
  ];

  const PAGE_IMAGES = {
    'index.html': [
      'hero.webp'
    ],
    'user-understanding.html': [
      'img_user/user_layer1.webp',
      'img_user/user_layer2.webp',
      'img_user/user_layer3.webp',
      'img_user/in_car_tutor/in-car-tutor.webp',
      'img_user/in_car_tutor/in-car-tutor2.webp',
      'img_user/in_car_tutor/in-car-tutor3big.webp',
      'img_user/eye_tracking/EyeTracking1.webp',
      'img_user/eye_tracking/EyeTracking2.webp',
      'img_user/physicans/PhysicanOnlineReviwes_1big.webp',
      'img_user/physicans/research_PhysicanOnlineReviwes_2.webp'
    ],
    'eye-tracking-study.html': [
      'img_user/eye_tracking/EyeTracking1.webp',
      'img_user/eye_tracking/EyeTracking2.webp'
    ],
    'in-car-tutor.html': [
      'img_user/in_car_tutor/in-car-tutor.webp',
      'img_user/in_car_tutor/in-car-tutor2.webp',
      'img_user/in_car_tutor/in-car-tutor3big.webp'
    ],
    'physician-review-analysis.html': [
      'img_user/physicans/PhysicanOnlineReviwes_1big.webp',
      'img_user/physicans/research_PhysicanOnlineReviwes_2.webp'
    ],
    'designs.html': [
      'img_design/img_design1.webp',
      'img_design/img_design2.webp',
      'img_design/img_design3.webp',
      'img_design/img_design6.webp',
      'img_design/img_design4.webp',
      'img_design/img_design5.webp',
      'img_design/silder/Slider1_image1.webp',
      'img_design/silder/Slider1_image2.webp',
      'img_design/silder/Slider1_image3.webp',
      'img_design/silder/Slider1_image4.webp',
      'img_design/silder/Slider1_image5.webp',
      'img_design/silder/Slider2_image1.webp',
      'img_design/silder/Slider2_image2.webp',
      'img_design/silder/Slider2_image3.webp'
    ],
    'campaigns.html': [
      'img_campaign/photography/01_ubahn.webp',
      'img_campaign/photography/02_safari.webp',
      'img_campaign/photography/03_building.webp',
      'img_campaign/photography/10_acidarab.webp',
      'img_campaign/photography/04_HDK.webp',
      'img_campaign/photography/05_art.webp',
      'img_campaign/photography/06_landscape.webp',
      'img_campaign/photography/07_noise.webp',
      'img_campaign/photography/08_muc.webp',
      'img_campaign/photography/09_DJ.webp',
      'img_campaign/flyer/01_lower.webp',
      'img_campaign/flyer/02_fritz.webp',
      'img_campaign/flyer/03_handwerk.webp',
      'img_campaign/flyer/04_core.webp',
      'img_campaign/flyer/05_cutting.webp',
      'img_campaign/flyer/06_imp.webp',
      'img_campaign/flyer/07_mode.webp',
      'img_campaign/flyer/08_boese.webp',
      'img_campaign/flyer/09_gods.webp',
      'img_campaign/fashion_03.webp',
      'img_campaign/fashion_02.webp',
      'img_campaign/fashion_01.webp',
      'img_campaign/lucky_number_01.webp',
      'img_campaign/lucky_number_03.webp',
      'img_campaign/lucky_number_04.webp',
      'img_campaign/lucky_number_02.webp',
      'img_campaign/miaac_sm.webp'
    ],
    'ai.html': [
      'img_ai/ai_img_01.webp',
      'img_ai/ai_img_02.webp'
    ]
  };

  const STORAGE_KEY = 'portfolio_preloaded_images';
  const loadedSet = new Set();
  const inFlightSet = new Set();
  let priorityQueue = [];
  let normalQueue = [];
  let isStarted = false;

  // Restore already loaded image URLs from sessionStorage
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) {
        arr.forEach(u => loadedSet.add(u));
      }
    }
  } catch (e) {}

  function saveLoadedSet() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(loadedSet)));
    } catch (e) {}
  }

  // Register current DOM images as already loaded
  function registerCurrentDomImages() {
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        if (img.complete && img.naturalWidth > 0) {
          loadedSet.add(src);
        }
      }
    });
    saveLoadedSet();
  }

  function cleanUrl(url) {
    if (!url) return 'index.html';
    let path = url.split('?')[0].split('#')[0].trim();
    if (path === '/' || path === '' || path === '.') return 'index.html';
    const slash = path.lastIndexOf('/');
    if (slash !== -1) {
      const filename = path.substring(slash + 1);
      if (filename.endsWith('.html') || filename.endsWith('.htm') || filename === '') {
        path = filename;
      }
    }
    if (!path || path === '') path = 'index.html';
    return path;
  }

  function getPageImages(pageKey) {
    const key = cleanUrl(pageKey);
    return PAGE_IMAGES[key] || [];
  }

  function downloadSingleImage(url, isPriority) {
    return new Promise(resolve => {
      if (!url || loadedSet.has(url)) {
        return resolve(url);
      }
      inFlightSet.add(url);

      const img = new Image();
      img.decoding = 'async';
      if ('fetchPriority' in img) {
        img.fetchPriority = isPriority ? 'high' : 'low';
      }

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        inFlightSet.delete(url);
        loadedSet.add(url);
        saveLoadedSet();
        resolve(url);
      };

      img.onload = finish;
      img.onerror = finish;
      img.src = url;
    });
  }

  const MAX_CONCURRENT_PRIORITY = 3;
  const MAX_CONCURRENT_NORMAL = 1;

  function processQueue() {
    // 1. Process Priority Queue first (up to MAX_CONCURRENT_PRIORITY concurrent)
    while (priorityQueue.length > 0 && inFlightSet.size < MAX_CONCURRENT_PRIORITY) {
      const url = priorityQueue.shift();
      if (url && !loadedSet.has(url) && !inFlightSet.has(url)) {
        downloadSingleImage(url, true).then(() => {
          processQueue();
        });
      }
    }

    // 2. If no priority downloads in flight or queued, process Normal Queue one by one
    if (priorityQueue.length === 0 && inFlightSet.size < MAX_CONCURRENT_NORMAL) {
      while (normalQueue.length > 0) {
        const url = normalQueue.shift();
        if (url && !loadedSet.has(url) && !inFlightSet.has(url)) {
          downloadSingleImage(url, false).then(() => {
            processQueue();
          });
          break; // Sequential background download (1 at a time)
        }
      }
    }
  }

  function buildInitialQueue() {
    const currentFile = cleanUrl(getCurrentFilename());
    const queuedSet = new Set(loadedSet);

    // 1. Current page images first
    const currentImgs = getPageImages(currentFile);
    currentImgs.forEach(url => {
      if (!queuedSet.has(url)) {
        normalQueue.push(url);
        queuedSet.add(url);
      }
    });

    // 2. Then all pages in navbar sequence
    NAVBAR_PAGES.forEach(page => {
      const imgs = getPageImages(page);
      imgs.forEach(url => {
        if (!queuedSet.has(url)) {
          normalQueue.push(url);
          queuedSet.add(url);
        }
      });
    });

    // 3. Subpages / remaining
    Object.keys(PAGE_IMAGES).forEach(page => {
      const imgs = PAGE_IMAGES[page];
      imgs.forEach(url => {
        if (!queuedSet.has(url)) {
          normalQueue.push(url);
          queuedSet.add(url);
        }
      });
    });
  }

  function prioritizePage(pageKey) {
    if (!pageKey) return;
    const key = cleanUrl(pageKey);
    const imgs = getPageImages(key);
    if (!imgs || imgs.length === 0) return;

    // Filter images that still need downloading
    const needed = imgs.filter(u => !loadedSet.has(u) && !inFlightSet.has(u) && !priorityQueue.includes(u));
    if (needed.length === 0) return;

    // Remove them from normal queue so they aren't downloaded twice
    normalQueue = normalQueue.filter(u => !needed.includes(u));

    // Prepend to priority queue
    priorityQueue = needed.concat(priorityQueue);

    // Immediately kick off processing with high priority
    processQueue();
  }

  function start() {
    if (isStarted) return;
    isStarted = true;
    registerCurrentDomImages();
    buildInitialQueue();
    processQueue();
  }

  // Setup automatic link listeners for hover, touch, click priority
  function setupInteractionListeners() {
    function handleInteraction(e) {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href && (href.endsWith('.html') || !href.includes(':') || href.startsWith('.'))) {
        prioritizePage(href);
      }
    }

    document.addEventListener('pointerenter', handleInteraction, { passive: true, capture: true });
    document.addEventListener('touchstart', handleInteraction, { passive: true, capture: true });
    document.addEventListener('focusin', handleInteraction, { passive: true, capture: true });
    document.addEventListener('mousedown', handleInteraction, { passive: true, capture: true });
    document.addEventListener('click', handleInteraction, { passive: true, capture: true });
  }

  // Initialize
  setupInteractionListeners();

  if (document.readyState === 'complete') {
    setTimeout(start, 150);
  } else {
    window.addEventListener('load', () => {
      setTimeout(start, 200);
    });
  }

  return {
    start,
    prioritizePage,
    downloadSingleImage,
    getLoadedImages: () => Array.from(loadedSet),
    getQueueStatus: () => ({
      loaded: loadedSet.size,
      inFlight: inFlightSet.size,
      priorityQueueLen: priorityQueue.length,
      normalQueueLen: normalQueue.length
    })
  };
})();
window.ImagePreloader = ImagePreloader;

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

                // Clean URL search param without re-scrolling while preserving language
        if (window.location.search.includes('dir=')) {
          const currentLang = (window.I18nManager && window.I18nManager.getLanguage()) || 'en';
          const cleanSearch = window.location.search.replace(/[?&]dir=[^&#]*/, '').replace(/^&/, '?');
          const finalSearch = cleanSearch && cleanSearch !== '?' 
            ? cleanSearch 
            : (currentLang && currentLang !== 'en' ? `?lang=${currentLang}` : '');
          history.replaceState(null, '', window.location.pathname + finalSearch + (window.location.hash || ''));
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
  const sliderCta = document.getElementById('sliderCta');
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

    // Hide/show slider CTA
    if (sliderCta) {
      if (index > 0) {
        sliderCta.classList.add('slider-cta--hidden');
        try {
          sessionStorage.setItem('slider-cta-dismissed-' + getCurrentFilename(), '1');
        } catch (e) {}
      } else {
        const dismissed = sessionStorage.getItem('slider-cta-dismissed-' + getCurrentFilename());
        if (!dismissed) {
          sliderCta.classList.remove('slider-cta--hidden');
        } else {
          sliderCta.classList.add('slider-cta--hidden');
        }
      }
    }

    // Persist active slide for desktop slider restoration
    try {
      sessionStorage.setItem('last-active-slide-' + getCurrentFilename(), index);
    } catch (e) {}
  }

  // Slider CTA click
  if (sliderCta) {
    sliderCta.addEventListener('click', (e) => {
      e.stopPropagation();
      if (current < slides.length - 1) {
        positionSlides(current + 1);
      }
    });
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

  // Init: restore the slide the user last visited (persisted via sessionStorage).
  // Falls back to slide 0 if no saved position exists.
  (function () {
    let targetSlide = 0;
    try {
      const saved = sessionStorage.getItem('last-active-slide-' + getCurrentFilename());
      if (saved !== null && !isNaN(parseInt(saved, 10))) {
        targetSlide = Math.max(0, Math.min(slides.length - 1, parseInt(saved, 10)));
      }
    } catch (e) {}
    // Desktop: restore; mobile stacked view: always start at top.
    const isDesktopSlider = window.innerWidth > 900;
    positionSlides(isDesktopSlider ? targetSlide : 0, false);
  })();
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
  let currentPendingTarget = null;
  let currentPendingDirection = null;

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
        font-size: 13.5px;
        font-weight: 300;
        letter-spacing: 0.04em;
        padding: 10px 22px;
        border-radius: 999px;
        box-shadow: 0 4px 22px rgba(0, 0, 0, 0.28);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      `;

      // Allow clicking/tapping the notification pill to trigger navigation
      hintEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentPendingTarget && currentPendingDirection && !isTransitioning) {
          if (resetTimer) clearTimeout(resetTimer);
          scrollCount = 2;
          executeTransition(currentPendingTarget, currentPendingDirection);
        }
      });

      document.body.appendChild(hintEl);
    }
    return hintEl;
  }

  function showHint(direction, targetPage, step) {
    if (targetPage && window.ImagePreloader) window.ImagePreloader.prioritizePage(targetPage);
    const el = createOrGetHint();
    const pageKey = targetPage.replace('.html', '');
    const targetLabel = (window.I18nManager && window.I18nManager.t('page.' + pageKey)) || PAGE_LABELS[targetPage] || 'page';
    const isDe = window.I18nManager && window.I18nManager.getLanguage() === 'de';
    const scrollPrompt = isDe ? (direction === 'next' ? 'Erneut scrollen für' : 'Erneut hochscrollen für') : (direction === 'next' ? 'scroll again for' : 'scroll up again for');
    const loadingPrompt = isDe ? 'lade' : 'loading';
    const arrow = direction === 'next' ? '↓' : '↑';

    if (direction === 'next') {
      el.style.top = 'auto';
      el.style.bottom = '20px';
    } else {
      el.style.bottom = 'auto';
      el.style.top = '72px';
    }

    if (step === 1) {
      currentPendingTarget = targetPage;
      currentPendingDirection = direction;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.innerHTML = `<span>${scrollPrompt} <strong>${targetLabel}</strong></span> <span style="font-size: 14px;">${arrow}</span>`;

      // Shift page content to make space so the notification does NOT obscure any text
      const mainEl = document.querySelector('main');
      if (mainEl && !isTransitioning) {
        const peekShift = direction === 'next' ? '-64px' : '64px';
        mainEl.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)';
        mainEl.style.transform = `translateY(${peekShift})`;
      }
    } else {
      el.style.pointerEvents = 'none';
      el.style.cursor = 'default';
      currentPendingTarget = null;
      currentPendingDirection = null;
      el.innerHTML = `<span>${loadingPrompt} <strong>${targetLabel}</strong>...</span>`;
    }

    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  }

  function hideHint() {
    if (hintEl) {
      hintEl.style.opacity = '0';
      hintEl.style.transform = 'translateX(-50%) translateY(10px)';
      hintEl.style.pointerEvents = 'none';
      hintEl.style.cursor = 'default';
      currentPendingTarget = null;
      currentPendingDirection = null;
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
    if (window.dismissMobileNavCta) window.dismissMobileNavCta();
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

    // Preserve language parameter during transition
    const currentLang = (window.I18nManager && window.I18nManager.getLanguage()) || 'en';
    const langParam = currentLang ? `&lang=${currentLang}` : '';

    // Pass direction flag to trigger matching entrance scroll on destination page
    const destination = direction === 'prev' 
      ? `${targetUrl}?dir=prev${langParam}#bottom` 
      : `${targetUrl}?dir=next${langParam}`;

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

    window.addEventListener('touchmove', (e) => {
    if (!isTrackingTouch || isTransitioning || !e.touches || e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - touchStartY;
    const diffX = Math.abs(currentX - touchStartX);

    // Cancel browser pull-to-refresh reload ONLY when pulling downwards at the very top of the page
    if (diffY > 0 && wasAtTopOnStart && isAtPageTop() && Math.abs(diffY) > diffX) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  }, { passive: false });

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
