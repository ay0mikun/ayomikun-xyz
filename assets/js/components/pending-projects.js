// Reuse data-pending-project for any case study that is still in progress.
document.querySelectorAll('[data-pending-project]').forEach(project => {
  const button = project.querySelector('.project-pending-trigger');
  const tag = project.querySelector('.coming-soon-tag');
  const status = project.querySelector('[data-pending-status]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let attempts = 0;
  let timeout;
  let shake;
  button.addEventListener('click', () => {
    project.classList.add('is-pending-active');
    status.textContent = 'This case study is still in progress. Coming soon.';
    clearTimeout(timeout);
    timeout = setTimeout(() => project.classList.remove('is-pending-active'), 2000);
    if (++attempts < 2 || motion.matches) return;
    shake?.cancel();
    shake = tag.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-3px) rotate(-1deg)' },
      { transform: 'translateX(3px) rotate(1deg)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(1px)' },
      { transform: 'translateX(0)' }
    ], { duration: 320, easing: 'ease-in-out' });
  });
  motion.addEventListener('change', () => { if (motion.matches) shake?.cancel(); });
});
