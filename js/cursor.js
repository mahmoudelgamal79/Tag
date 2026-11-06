/* ======================================================================
   TAG — Shared custom cursor (single initialization per page)
   ----------------------------------------------------------------------
   Desktop-only: skipped automatically on touch devices
   ((hover: none) media query).

   Usage:
     1. Load this script ONCE per page, after the cursor DOM elements.
     2. Provide the cursor markup on any page that wants the custom cursor:

        <div class="cursor-ring" id="cursorRing"><div class="cursor-ring-inner"></div></div>
        <div class="cursor-dot" id="cursorDot"><div class="cursor-dot-inner"></div></div>

     3. Pages WITHOUT this markup keep the native browser cursor — the
        native cursor is never hidden unless the JS cursor is active.

   This replaces the duplicated inline initCustomCursor() blocks that used
   to live in checkout.js, confirmation.html, account.js, auth.js,
   dashboard.js, size-guide.html and script.js — those in-page versions
   MUST be removed so listeners are not doubled.
   ====================================================================== */
(() => {
  'use strict';

  // Guard: prevent multiple initializations
  if (window.__TAG_CURSOR_INITIALIZED__) return;
  window.__TAG_CURSOR_INITIALIZED__ = true;

  // Guard: desktop-only. On phones/tablets (no fine pointer) we do nothing
  // and let the native cursor do its job.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let ring = document.getElementById('cursorRing');
  let dot = document.getElementById('cursorDot');
  
  // Auto-inject cursor markup if not present
  if (!ring || !dot) {
    const cursorRingHTML = '<div class="cursor-ring" id="cursorRing"><div class="cursor-ring-inner"></div></div>';
    const cursorDotHTML = '<div class="cursor-dot" id="cursorDot"><div class="cursor-dot-inner"></div></div>';
    document.body.insertAdjacentHTML('beforeend', cursorRingHTML + cursorDotHTML);
    ring = document.getElementById('cursorRing');
    dot = document.getElementById('cursorDot');
  }

  const isInteractive = (el) => {
    if (!el) return false;
    return !!el.closest('a, button, [data-cursor="hover"], input, textarea, [role="button"]');
  };

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  let raf = 0;
  let hovering = false;
  let hidden = true;

  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (hidden) {
      hidden = false;
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
      // Activate the CSS hook in style.css: the native cursor is hidden
      // ONLY while the JS cursor is actually running.
      document.body.classList.add('cursor-active');
    }
  };

  const onLeave = () => {
    hidden = true;
    dot.classList.add('hidden');
    ring.classList.add('hidden');
    document.body.classList.remove('cursor-active');
  };

  const onEnter = () => {
    hidden = false;
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
    document.body.classList.add('cursor-active');
  };

  const onOver = (e) => {
    if (isInteractive(e.target) && !hovering) {
      hovering = true;
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    }
  };

  const onOut = (e) => {
    if (isInteractive(e.target) && hovering) {
      hovering = false;
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    }
  };

  // Background-aware cursor color: turns dark on light backgrounds
  const updateCursorColor = () => {
    // Get the element directly under the cursor
    const elUnderCursor = document.elementFromPoint(mouseX, mouseY);
    if (!elUnderCursor) return;
    
    // Walk up to find the nearest element with a background color
    let current = elUnderCursor;
    let bgColor = null;
    let maxDepth = 10;
    
    while (current && maxDepth > 0) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;
      // Check if background is not transparent/rgba(0,0,0,0)
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        // Parse the color
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
          // Calculate luminance
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // If background is light (luminance > 0.5), use dark cursor
          if (luminance > 0.5) {
            bgColor = 'dark';
          } else {
            bgColor = 'light';
          }
          break;
        }
      }
      current = current.parentElement;
      maxDepth--;
    }
    
    // If no background found (transparent all the way up), default to dark
    if (bgColor === null) {
      bgColor = 'dark';
    }
    
    if (bgColor === 'dark') {
      dot.classList.add('cursor-dark');
      ring.classList.add('cursor-dark');
    } else {
      dot.classList.remove('cursor-dark');
      ring.classList.remove('cursor-dark');
    }
  };

  // Throttled color update (every 100ms)
  let colorRaf = 0;
  let lastColorUpdate = 0;
  const throttledColorUpdate = () => {
    const now = performance.now();
    if (now - lastColorUpdate > 100) {
      lastColorUpdate = now;
      updateCursorColor();
    }
  };

  const animate = () => {
    dotX += (mouseX - dotX) * 0.55;
    dotY += (mouseY - dotY) * 0.55;
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    throttledColorUpdate();
    raf = requestAnimationFrame(animate);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);
  document.addEventListener('mouseleave', onLeave);
  document.addEventListener('mouseenter', onEnter);
  raf = requestAnimationFrame(animate);
})();
