// Match the reference site's Lenis 1.0.42 configuration (intensity 16 / 10).
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let scrolling;
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

// Reveal links once as they enter view; keep the HTML visible without JavaScript.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.contact-links a')];
  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = entry.target;
      observer.unobserve(link);
      if (link === document.activeElement) return;
      const animation = link.querySelector('.link-label').animate([
        { opacity: 0, transform: 'translateY(3px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 450, delay: links.indexOf(link) % 4 * 45, easing: 'ease-out', fill: 'backwards' });
      animations.add(animation);
      animation.addEventListener('finish', () => animations.delete(animation), { once: true });
      link.addEventListener('focus', () => animation.cancel(), { once: true });
    });
  }, { threshold: 0.25 });
  links.forEach(link => observer.observe(link));
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });
})();
