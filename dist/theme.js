/** @file Theme preference and high-contrast Cesium label palettes. */
export const THEME_KEY = 'cesium-advanced-controls-theme';
export const THEMES = {
  dark: {
    sky: '#000000',
    labelText: '#ffffff',
    labelBackground: '#111820',
    labelOutline: '#111820',
    moveText: '#fff1ca',
    moveOutline: '#111820',
  },
  light: {
    sky: '#dce9f2',
    labelText: '#17222c',
    labelBackground: '#ffffff',
    labelOutline: '#ffffff',
    moveText: '#4e3200',
    moveOutline: '#ffffff',
  },
};
/**
 * Keep the theme separate from shape saves/history. Storage failures leave the
 * toggle usable. Dark is the existing app default; remember explicit choices.
 * @param {Object} options DOM/storage boundary and renderer refresh callback.
 * @returns {()=>string} Current theme name.
 */
export function bindThemeToggle({ root, button, meta, storage, onChange }) {
  let theme = 'dark';
  try {
    const saved = storage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch {}
  const apply = () => {
    root.setAttribute('data-theme', theme);
    button.setAttribute('aria-pressed', String(theme === 'light'));
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.classList.toggle('lit', theme === 'light');
    meta?.setAttribute('content', THEMES[theme].sky);
    onChange(THEMES[theme]);
  };
  button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      storage.setItem(THEME_KEY, theme);
    } catch {}
    apply();
  });
  apply();
  return () => theme;
}
