function setBodyThemeAttribute() {
  const isDeterministic = (theme) => theme === 'light' || theme === 'dark';
  const preloadedTheme = document.documentElement.dataset.theme;
  if (isDeterministic(preloadedTheme)) return;

  const localTheme = localStorage.getItem('theme');
  if (preloadedTheme !== 'system' && isDeterministic(localTheme)) {
    document.documentElement.dataset.theme = localTheme;
    return;
  }

  // Both preloaded and local are neither light nor dark
  const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const computedTheme = isSystemDark ? 'dark' : 'light';
  document.documentElement.dataset.theme = computedTheme;

  // Prevent Next.js from screwing with the root element, as that causes additional flicker
  const observer = new MutationObserver((mutations) =>
    mutations.forEach((mutation) => {
      /** @type {HTMLElement} */
      const target = mutation.target;
      const currentValue = target.getAttribute(mutation.attributeName);
      if (currentValue !== computedTheme) mutation.target.dataset.theme = computedTheme;
    }),
  );

  observer.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-theme'],
  });

  // The previous flickering would always stop once the page is fully loaded; thus, we can
  // now unlock changes to the root element
  window.addEventListener('load', () => {
    setTimeout(observer.disconnect, 400);
  });
}
setBodyThemeAttribute();
