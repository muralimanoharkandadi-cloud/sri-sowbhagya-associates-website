/* Home page hero slider.
   - Rolls automatically through the slides.
   - Stops while the cursor is on the slider (or keyboard focus is inside it, or a finger is down),
     and every slide is a link, so a click opens that page.
   - Every slide change uses a different transition effect from the one before.
   - Swipe and the left/right keys also move between slides (the on-screen arrows, dots and
     pause button are hidden; they only appear for keyboard users who tab into them).
   - Respects "reduce motion": the slider then starts paused and the visitor can press Play.
   Markup lives in index.html (#heroSlider). */
(function () {
  'use strict';

  var root = document.getElementById('heroSlider');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.hs-slide'));
  if (slides.length < 2) return;

  var viewport = root.querySelector('.hs-viewport');
  var dotsWrap = root.querySelector('.hs-dots');
  var prevBtn = root.querySelector('.hs-prev');
  var nextBtn = root.querySelector('.hs-next');
  var pauseBtn = root.querySelector('.hs-pause');

  var DURATION = parseInt(root.getAttribute('data-interval'), 10) || 5500;
  var START_DELAY = parseInt(root.getAttribute('data-start-delay'), 10);
  if (isNaN(START_DELAY)) START_DELAY = 1800; /* let the page's entrance animation finish first */

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var index = 0;
  var timer = null;
  var startedAt = 0;
  var remaining = DURATION;

  var ready = false;            /* becomes true after the entrance animation */
  var userPaused = reduceMotion; /* pause/play button */
  var hovering = false;         /* mouse cursor on the slider */
  var focused = false;          /* keyboard focus inside the slider */
  var touching = false;         /* finger down on the slider */
  var pageHidden = !!document.hidden;
  var offscreen = false;
  var suppressClick = false;    /* swallow the click that ends a swipe */

  var dots = [];

  /* ---------- transition effects: a different one every time ---------- */

  var EFFECTS = ['fade', 'slide-left', 'slide-right', 'slide-up', 'zoom-in', 'zoom-out', 'wipe', 'flip', 'blur'];
  var FX_MS = 900;          /* a little longer than the CSS animation (0.85s) */
  var bag = [];
  var lastFx = '';
  var fxTimer = null;

  /* Shuffled "bag": every effect is used once before any repeats, and the same one never runs twice in a row */
  function nextFx() {
    if (reduceMotion) return 'none';
    if (!bag.length) {
      bag = EFFECTS.slice();
      for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = bag[i]; bag[i] = bag[j]; bag[j] = t;
      }
      if (bag[bag.length - 1] === lastFx) {
        var t2 = bag[0]; bag[0] = bag[bag.length - 1]; bag[bag.length - 1] = t2;
      }
    }
    lastFx = bag.pop();
    return lastFx;
  }

  function clearFx() {
    if (fxTimer) { clearTimeout(fxTimer); fxTimer = null; }
    slides.forEach(function (s) { s.classList.remove('is-entering', 'is-leaving'); });
  }

  /* ---------- helpers ---------- */

  function playing() {
    return ready && !(userPaused || hovering || focused || touching || pageHidden || offscreen);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule() {
    clearTimer();
    startedAt = Date.now();
    timer = setTimeout(function () {
      timer = null;
      go(index + 1);
    }, remaining);
  }

  function loadBg(slide) {
    var media = slide.querySelector('[data-bg]');
    if (media && !media.style.backgroundImage) {
      media.style.backgroundImage = 'url("' + media.getAttribute('data-bg') + '")';
    }
  }

  function setSlideState(slide, active) {
    var link = slide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    if (active) link.removeAttribute('tabindex');
    else link.setAttribute('tabindex', '-1');
  }

  function updateDots() {
    for (var i = 0; i < dots.length; i++) {
      if (i === index) dots[i].setAttribute('aria-current', 'true');
      else dots[i].removeAttribute('aria-current');
    }
  }

  function updatePauseButton() {
    if (!pauseBtn) return;
    pauseBtn.textContent = userPaused ? '\u25B6' : '\u275A\u275A';
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  }

  /* Re-evaluate whether the slideshow should be running and update the page to match */
  function sync() {
    var p = playing();
    root.classList.toggle('is-paused', !p);
    root.classList.toggle('show-hint', ready && (hovering || focused) && !userPaused);
    if (viewport) viewport.setAttribute('aria-live', p ? 'off' : 'polite');

    if (p) {
      if (!timer) schedule();
    } else if (timer) {
      clearTimer();
      remaining = Math.max(400, remaining - (Date.now() - startedAt));
    }
    updatePauseButton();
  }

  function go(n) {
    var count = slides.length;
    n = ((n % count) + count) % count;

    if (n !== index) {
      var leaving = slides[index];
      clearFx(); /* finish any transition that is still running */
      var fx = nextFx();
      root.setAttribute('data-fx', fx);

      setSlideState(leaving, false);
      index = n;
      loadBg(slides[index]);
      loadBg(slides[(index + 1) % count]);
      setSlideState(slides[index], true);

      if (fx !== 'none') {
        leaving.classList.add('is-leaving');
        slides[index].classList.add('is-entering');
        fxTimer = setTimeout(clearFx, FX_MS);
      }
      updateDots();
    }

    remaining = DURATION;
    clearTimer();
    if (playing()) schedule();
  }

  /* ---------- build controls ---------- */

  if (dotsWrap) {
    slides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hs-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + (slide.getAttribute('data-name') || ''));
      dot.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  slides.forEach(function (slide, i) {
    setSlideState(slide, i === 0);
  });
  loadBg(slides[0]);
  loadBg(slides[1]);
  updateDots();
  updatePauseButton();

  /* Fetch the remaining slide pictures once the page is idle */
  function preloadAll() {
    slides.forEach(loadBg);
  }
  if (window.requestIdleCallback) window.requestIdleCallback(preloadAll, { timeout: 4000 });
  else setTimeout(preloadAll, 2500);

  /* ---------- buttons ---------- */

  if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); });
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      sync();
    });
  }

  /* ---------- hover / focus / touch pause ---------- */

  if (window.PointerEvent) {
    root.addEventListener('pointerenter', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      hovering = true;
      sync();
    });
    root.addEventListener('pointerleave', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      hovering = false;
      sync();
    });
  } else {
    root.addEventListener('mouseenter', function () { hovering = true; sync(); });
    root.addEventListener('mouseleave', function () { hovering = false; sync(); });
  }

  root.addEventListener('focusin', function (e) {
    /* Only keyboard focus pauses; a mouse click on an arrow should not leave it paused */
    var keyboard = true;
    try { keyboard = e.target.matches(':focus-visible'); } catch (err) { keyboard = true; }
    focused = keyboard;
    sync();
  });

  root.addEventListener('focusout', function (e) {
    if (!e.relatedTarget || !root.contains(e.relatedTarget)) {
      focused = false;
      sync();
    }
  });

  /* ---------- swipe ---------- */

  var touchX = 0;
  var touchY = 0;

  root.addEventListener('touchstart', function (e) {
    var t = e.touches && e.touches[0];
    if (!t) return;
    touchX = t.clientX;
    touchY = t.clientY;
    touching = true;
    sync();
  }, { passive: true });

  function endTouch(e) {
    var t = e.changedTouches && e.changedTouches[0];
    touching = false;
    if (t && e.type === 'touchend') {
      var dx = t.clientX - touchX;
      var dy = t.clientY - touchY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 450);
        go(dx < 0 ? index + 1 : index - 1);
      }
    }
    sync();
  }

  root.addEventListener('touchend', endTouch, { passive: true });
  root.addEventListener('touchcancel', endTouch, { passive: true });

  /* A swipe must not also open the page under the finger */
  root.addEventListener('click', function (e) {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* Optional analytics hook (only fires if Google Analytics is present on the page) */
  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'hero_slide_click', { slide: slide.getAttribute('data-name') || '' });
      }
    });
  });

  /* ---------- keyboard ---------- */

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(index - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(index + 1); e.preventDefault(); }
    else if (e.key === 'Home') { go(0); e.preventDefault(); }
    else if (e.key === 'End') { go(slides.length - 1); e.preventDefault(); }
  });

  /* ---------- page visibility / scrolled out of view ---------- */

  document.addEventListener('visibilitychange', function () {
    pageHidden = !!document.hidden;
    sync();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      offscreen = !entries[entries.length - 1].isIntersecting;
      sync();
    }, { threshold: 0.2 });
    io.observe(root);
  }

  /* ---------- start ---------- */

  setTimeout(function () {
    ready = true;
    root.classList.add('is-ready');
    remaining = DURATION;
    sync();
  }, reduceMotion ? 0 : START_DELAY);
})();

/* Headline flash.
   The opening animation plays once on load. After that the headline flashes again
   - every 15 seconds while it is on screen, and
   - whenever it comes back into view after being scrolled out of sight. */
(function () {
  'use strict';

  var hero = document.querySelector('.hero-live');
  var title = hero && hero.querySelector('.hero-title');
  if (!hero || !title) return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduceMotion) return;

  var INTERVAL = parseInt(hero.getAttribute('data-flash-interval'), 10) || 15000;
  var SETTLE = 3300;   /* the opening animation lasts about 2.7s */
  var REPLAY_MS = 2600;

  var settled = false;  /* opening animation finished */
  var visible = true;   /* headline mostly on screen */
  var wasOut = false;   /* headline has been completely out of view */
  var timer = null;
  var clearTimer = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(tick, INTERVAL);
  }

  function flash() {
    if (!settled || !visible || document.hidden) return;
    hero.classList.remove('flash-replay');
    void hero.offsetWidth; /* force a reflow so the animation restarts */
    hero.classList.add('flash-replay');
    clearTimeout(clearTimer);
    clearTimer = setTimeout(function () { hero.classList.remove('flash-replay'); }, REPLAY_MS);
    schedule(); /* the next 15 seconds are counted from this flash */
  }

  function tick() {
    if (settled && visible && !document.hidden) flash();
    else schedule();
  }

  setTimeout(function () {
    settled = true;
    hero.classList.add('is-settled');
  }, SETTLE);

  schedule();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var e = entries[entries.length - 1];
      visible = e.intersectionRatio >= 0.5;
      if (e.intersectionRatio === 0) {
        wasOut = true;
      } else if (visible && wasOut) {
        wasOut = false;
        flash();
      }
    }, { threshold: [0, 0.5] });
    io.observe(title);
  }
})();
