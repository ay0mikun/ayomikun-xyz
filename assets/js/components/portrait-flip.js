import { playPaperFlip } from './hover-sound.js?v=20261121-19';

const portrait = document.querySelector('.hero-photo');
const card = portrait.querySelector('.hero-photo-flipper');
const pin = portrait.querySelector('.hero-photo-pin');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let flipped = false;
let busy = false;
let animations = [];

portrait.addEventListener('click', async () => {
  if (busy) return;
  playPaperFlip(preference.matches ? 0 : .2);
  const from = flipped ? 180 : 0;
  flipped = !flipped;
  const to = flipped ? 180 : 0;
  portrait.setAttribute('aria-pressed', String(flipped));
  card.style.transform = `rotateY(${to}deg)`;
  if (preference.matches) return;
  busy = true;
  portrait.setAttribute('aria-busy', 'true');
  animations = [
    pin.animate([
      { transform: 'translate(0,0) rotate(0deg)', offset: 0 },
      { transform: 'translate(-4px,-13px) rotate(-18deg)', offset: .2 },
      { transform: 'translate(-4px,-13px) rotate(-18deg)', offset: .78 },
      { transform: 'translate(0,0) rotate(0deg)', offset: 1 }
    ], { duration: 1000, easing: 'ease-in-out' }),
    card.animate([
      { transform: `rotateY(${from}deg)` },
      { transform: `rotateY(${to}deg)` }
    ], { duration: 620, delay: 200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' })
  ];
  await Promise.allSettled(animations.map(animation => animation.finished));
  animations.forEach(animation => animation.cancel());
  animations = [];
  portrait.removeAttribute('aria-busy');
  busy = false;
});

preference.addEventListener('change', () => {
  if (preference.matches) animations.forEach(animation => animation.finish());
});
