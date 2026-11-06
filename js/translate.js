/* ============================================
   TAG — Language Toggle (EN ↔ AR)
   Google Translate integration + RTL support
   ============================================ */

// Keep the Google translation toolbar out of the storefront. The site uses
// its own EN/AR control, so the injected Google chrome is redundant.
function hideGoogleTranslateToolbar() {
  var bars = document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame, body > .skiptranslate');
  for (var i = 0; i < bars.length; i++) {
    bars[i].style.setProperty('display', 'none', 'important');
    bars[i].style.setProperty('visibility', 'hidden', 'important');
  }
  document.documentElement.style.setProperty('top', '0', 'important');
  if (document.body) {
    document.body.style.setProperty('top', '0', 'important');
    document.body.style.setProperty('margin-top', '0', 'important');
  }
}

// Global callback required by the Google Translate element script
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,ar',
    autoDisplay: false,
    // VERTICAL renders a <select class="goog-te-combo">; SIMPLE renders
    // a custom menu. Either way, switching is driven by the googtrans
    // cookie below — the widget auto-translates on load when it is set.
    layout: google.translate.TranslateElement.InlineLayout.VERTICAL
  }, 'google_translate_element');
  hideGoogleTranslateToolbar();
  requestAnimationFrame(hideGoogleTranslateToolbar);
}

(function () {
  'use strict';

  var LANG_KEY = 'tag_lang';
  var currentLang = 'en';

  // ---------- Direction / RTL ----------

  function applyDirection(lang) {
    var isAr = lang === 'ar';
    document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    if (document.body) {
      document.body.classList.toggle('lang-ar', isAr);
    }
  }

  // Arabic webfont (site fonts are Latin-only) — only loaded when needed
  function loadArabicFont() {
    if (document.getElementById('tag-arabic-font')) return;
    var link = document.createElement('link');
    link.id = 'tag-arabic-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // ---------- Saved preference ----------

  function savedLang() {
    try {
      return localStorage.getItem(LANG_KEY);
    } catch (e) {
      return null;
    }
  }

  // Google persists its choice in the "googtrans" cookie (e.g. "/en/ar")
  function langFromGoogleCookie() {
    var match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (!match) return null;
    var parts = decodeURIComponent(match[1]).split('/');
    return parts.length === 3 && parts[2] ? parts[2] : null;
  }

  // Restore language + direction before first paint
  var stored = savedLang() || langFromGoogleCookie();
  currentLang = stored === 'ar' ? 'ar' : 'en';
  applyDirection(currentLang);
  if (currentLang === 'ar') loadArabicFont();

  // ---------- Google Translate widget ----------
  // The Google widget is intentionally loaded only when Arabic is active.
  // Loading it on every English page caused unnecessary external work during
  // startup and noticeably delayed initial page rendering.

  function injectGoogleTranslate() {
    if (!document.getElementById('google_translate_element')) {
      var el = document.createElement('div');
      el.id = 'google_translate_element';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    if (!document.getElementById('tag-gt-script')) {
      var s = document.createElement('script');
      s.id = 'tag-gt-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(s);
    }

    // Google appends its toolbar asynchronously. Watch only for inserted
    // nodes (not attribute changes) so this cannot create an observer loop.
    if (!window.tagGoogleToolbarObserver) {
      window.tagGoogleToolbarObserver = new MutationObserver(hideGoogleTranslateToolbar);
      window.tagGoogleToolbarObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  // ---------- Language switching ----------
  // The widget auto-translates on load when the googtrans cookie is set,
  // so both directions work through the cookie + reload. This is the same
  // mechanism Google itself uses to keep pages translated while navigating.

  function setGoogleCookie(lang) {
    document.cookie = 'googtrans=/en/' + lang + '; path=/';
    // Also scope to the registrable domain so translation survives
    // www ↔ apex navigation in production
    var host = location.hostname;
    if (host && host !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      var parts = host.split('.');
      var registrable = parts.length > 2 ? parts.slice(-2).join('.') : host;
      document.cookie = 'googtrans=/en/' + lang + '; path=/; domain=.' + registrable;
    }
  }

  function clearGoogleCookie() {
    var expired = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'googtrans' + expired;
    var host = location.hostname;
    if (host) {
      document.cookie = 'googtrans' + expired + '; domain=' + host;
      document.cookie = 'googtrans' + expired + '; domain=.' + host;
    }
  }

  // ---------- Toggle buttons ----------

  function updateToggleUI() {
    var target = currentLang === 'en' ? 'AR' : 'EN';
    var buttons = document.querySelectorAll('[data-lang-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var label = buttons[i].querySelector('[data-lang-label]');
      // Avoid rewriting an unchanged text node. Rewrites previously woke the
      // observer below repeatedly and could keep the main thread busy.
      if (label && label.textContent !== target) label.textContent = target;
    }
  }

  // Prevent Google Translate from altering the toggle button labels. The
  // `notranslate` marker is sufficient and, unlike a mutation observer, does
  // not risk observing our own label updates in an endless loop.
  function protectToggleButtons() {
    var labels = document.querySelectorAll('[data-lang-label]');
    if (!labels.length) return;
    for (var i = 0; i < labels.length; i++) {
      labels[i].classList.add('notranslate');
      labels[i].setAttribute('translate', 'no');
    }
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    try {
      localStorage.setItem(LANG_KEY, currentLang);
    } catch (e) { /* ignore */ }

    if (currentLang === 'ar') {
      setGoogleCookie('ar');
    } else {
      clearGoogleCookie();
    }
    window.location.reload();
  }

  // ---------- Init ----------

  function init() {
    applyDirection(currentLang); // body now exists — add the class
    // English is the native page language, so do not request the Google
    // widget until a visitor has actually chosen Arabic.
    if (currentLang === 'ar') injectGoogleTranslate();
    protectToggleButtons();
    updateToggleUI();

    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-lang-toggle]') : null;
      if (btn) {
        e.preventDefault();
        toggleLanguage();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
