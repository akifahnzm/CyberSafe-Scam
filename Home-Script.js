(function () {
  'use strict';

  var TOTAL = 12;
  var START_URL = null; // e.g. 'scenario.html' once you build the scenario page

  // Safe storage helpers (storage can be blocked)
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  /* ---------- Progress + Start button ---------- */
  var done = parseInt(load('csl-done', '0'), 10) || 0;
  var started = load('csl-started', 'false') === 'true';

  var doneEl = document.getElementById('done');
  var totalEl = document.getElementById('total');
  var startBtn = document.getElementById('start-btn');
  var statusEl = document.getElementById('status');

  function renderProgress() {
    doneEl.textContent = done;
    totalEl.textContent = TOTAL;
    startBtn.textContent = started ? 'Continue Learning' : 'Start Learning';
  }

  startBtn.addEventListener('click', function () {
    var first = !started;
    started = true;
    save('csl-started', 'true');
    renderProgress();
    statusEl.textContent = first
      ? 'Learning started. Scenario 1 of ' + TOTAL + ' is ready.'
      : 'Continuing at scenario ' + Math.min(done + 1, TOTAL) + ' of ' + TOTAL + '.';
    if (START_URL) window.location.href = START_URL;
  });

  /* ---------- Theme picker ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');
  var themeMenu = document.getElementById('theme-menu');
  var themeLabel = document.getElementById('theme-label');
  var items = Array.prototype.slice.call(themeMenu.querySelectorAll('button'));
  var names = { light: 'Light', dark: 'Dark', contrast: 'High contrast' };

  function applyTheme(theme) {
    if (!names[theme]) theme = 'light';
    root.setAttribute('data-theme', theme);
    themeLabel.textContent = names[theme];
    items.forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.theme === theme));
    });
    save('csl-theme', theme);
  }

  function openMenu() {
    themeMenu.hidden = false;
    themeBtn.setAttribute('aria-expanded', 'true');
    var current = items.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0];
    (current || items[0]).focus();
  }
  function closeMenu(returnFocus) {
    themeMenu.hidden = true;
    themeBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) themeBtn.focus();
  }

  themeBtn.addEventListener('click', function () {
    themeMenu.hidden ? openMenu() : closeMenu(false);
  });
  items.forEach(function (b) {
    b.addEventListener('click', function () {
      applyTheme(b.dataset.theme);
      closeMenu(true);
    });
  });
  themeMenu.addEventListener('keydown', function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Escape') { closeMenu(true); }
    else if (e.key === 'Tab') { closeMenu(false); }
  });
  document.addEventListener('click', function (e) {
    if (!themeMenu.hidden && !themeMenu.contains(e.target) && e.target !== themeBtn && !themeBtn.contains(e.target)) {
      closeMenu(false);
    }
  });

  // Skip link: move focus to main
  document.querySelector('.skip-link').addEventListener('click', function () {
    var main = document.getElementById('main');
    setTimeout(function () { main.focus(); }, 0);
  });

  applyTheme(load('csl-theme', 'light'));
  renderProgress();
})();