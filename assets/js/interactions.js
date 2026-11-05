// Match the reference site's Lenis 1.0.42 configuration (intensity 16 / 10).
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let scrolling;
  let frame;
  const configure = () => {
    cancelAnimationFrame(frame);
    scrolling?.destroy();
    scrolling = null;
    if (preference.matches || typeof Lenis === 'undefined') return;
    scrolling = new Lenis({ duration: 1.6 });
    const tick = (time) => {
      scrolling.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  preference.addEventListener('change', configure);
  configure();
})();

// Reveal links once as they enter view; keep the HTML visible without JavaScript.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.bio a, .contact-links a')];
  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = entry.target;
      observer.unobserve(link);
      if (link === document.activeElement) return;
      const animation = link.animate([
        { opacity: 0, filter: 'blur(8px)' },
        { opacity: 1, filter: 'blur(0px)' }
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
