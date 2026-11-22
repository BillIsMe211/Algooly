(() => {
  let theme = 'light';
  try {
    const saved = JSON.parse(localStorage.getItem('algosearch') || '{}');
    if (saved && saved.theme === 'dark') theme = 'dark';
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
  window.api.setTheme(theme);
})();
