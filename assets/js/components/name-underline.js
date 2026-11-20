const nameButton = document.querySelector('.hero-name-replay');
const pencil = document.querySelector('.name-pencil-path');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let drawing;

nameButton?.addEventListener('click', () => {
  drawing?.cancel();
  if (motion.matches) return;
  drawing = pencil.animate([
    { strokeDashoffset: '1' },
    { strokeDashoffset: '0' }
  ], { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)' });
});

motion.addEventListener('change', () => {
  if (motion.matches) drawing?.cancel();
});
