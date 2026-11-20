const motion = matchMedia('(prefers-reduced-motion: reduce)');
const visible = new Set();
const videos = [...document.querySelectorAll('.project-video')];
const syncPlayback = () => {
  videos.forEach(video => {
    if (visible.has(video) && !document.hidden && !motion.matches) video.play().catch(() => {});
    else video.pause();
  });
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visible.add(entry.target);
    else visible.delete(entry.target);
  });
  syncPlayback();
}, { threshold: .1 });
videos.forEach(video => observer.observe(video));
document.addEventListener('visibilitychange', syncPlayback);
motion.addEventListener('change', syncPlayback);
