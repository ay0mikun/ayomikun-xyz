const note = document.querySelector('.footer-note');
const copy = note.querySelector('.footer-note-copy');
const signature = note.querySelector('animated-signature');
const text = copy.textContent.trim();
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let lines = [];
let drawings = [];
let signatureTimer;
let played = false;
let lastWidth = 0;

const splitLines = () => {
  drawings.forEach(animation => animation.cancel());
  const words = text.split(/\s+/).map(word => {
    const span = document.createElement('span');
    span.textContent = word;
    return span;
  });
  copy.replaceChildren(...words.flatMap((word, index) => index ? [document.createTextNode(' '), word] : [word]));
  const groups = [];
  let top;
  words.forEach(word => {
    if (word.offsetTop !== top) {
      groups.push([]);
      top = word.offsetTop;
    }
    groups.at(-1).push(word.textContent);
  });
  lines = groups.map(group => {
    const line = document.createElement('span');
    line.className = 'footer-note-line';
    line.textContent = group.join(' ');
    return line;
  });
  copy.replaceChildren(...lines.flatMap((line, index) => index ? [document.createElement('br'), line] : [line]));
  copy.classList.toggle('is-waiting', !played && !motion.matches);
};

const play = () => {
  played = true;
  copy.classList.remove('is-waiting');
  if (motion.matches) {
    signature.replay();
    return;
  }
  drawings = lines.map((line, index) => line.animate([
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0 0 0)' }
  ], { duration: 650, delay: index * 550, easing: 'linear', fill: 'backwards' }));
  signatureTimer = setTimeout(() => signature.replay(), (lines.length - 1) * 550 + 750);
};

document.fonts.load('36px Caveat').then(() => {
  lastWidth = copy.clientWidth;
  splitLines();
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (Math.abs(width - lastWidth) < 1) return;
    lastWidth = width;
    splitLines();
  }).observe(copy);
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    play();
  }, { threshold: .35 });
  observer.observe(note);
}).catch(() => {
  copy.textContent = text;
  copy.classList.remove('is-waiting');
  signature.replay();
});

motion.addEventListener('change', () => {
  if (!motion.matches) return;
  clearTimeout(signatureTimer);
  drawings.forEach(animation => animation.cancel());
  copy.classList.remove('is-waiting');
  signature.replay();
});
