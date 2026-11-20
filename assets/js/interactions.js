let scrolling;

// Keep layout adjustments in sync with Lenis instead of starting a second scroll.
export const adjustScrollImmediately = delta => {
  if (scrolling) scrolling.scrollTo(window.scrollY + delta, { immediate: true, force: true });
  else window.scrollBy({ top: delta, behavior: 'instant' });
};

// Match the reference site's Lenis 1.0.42 configuration (intensity 16 / 10).
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  let clock = 0;
  let previousTime;
  const start = () => {
    if (frame === null && !document.hidden && scrolling?.isScrolling) {
      previousTime = undefined;
      frame = requestAnimationFrame(tick);
    }
  };
  const tick = (time) => {
    // Advance Lenis only by active frame time, excluding time spent idle or hidden.
    if (previousTime !== undefined) clock += time - previousTime;
    previousTime = time;
    scrolling?.raf(clock);
    frame = null;
    if (!document.hidden && scrolling?.isScrolling) frame = requestAnimationFrame(tick);
  };
  const configure = () => {
    cancelAnimationFrame(frame);
    frame = null;
    scrolling?.destroy();
    scrolling = null;
    clock = 0;
    if (preference.matches || typeof Lenis === 'undefined') return;
    scrolling = new Lenis({ duration: 1.6 });
    scrolling.on('className change', start);
  };
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    frame = null;
    start();
  });
  preference.addEventListener('change', configure);
  configure();
})();
