import { playCopyConfirmation } from './hover-sound.js?v=20261121-14';

const copyButton = document.querySelector('[data-copy-email]');
const status = document.querySelector('[data-nav-status]');
let resetFeedback;
const copyShape = '5.333,5.333 14.667,5.333 14.667,14.667 5.333,14.667 5.333,5.333';
const checkShape = '3,8 6.5,11.5 9.75,7.75 13,4 13,4';
const setCopied = copied => {
  const line = copyButton.querySelector('polyline');
  const motion = line.querySelector('animate');
  const target = copied ? checkShape : copyShape;
  const source = copyButton.classList.contains('is-copied') ? checkShape : copyShape;
  copyButton.classList.toggle('is-copied', copied);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    motion.endElement();
    line.setAttribute('points', target);
  } else {
    motion.setAttribute('from', source);
    motion.setAttribute('to', target);
    motion.beginElement();
  }
};

copyButton?.addEventListener('click', async () => {
  clearTimeout(resetFeedback);
  const label = copyButton.querySelector('[data-copy-label]');
  try {
    await navigator.clipboard.writeText('adebayojohnpaul885@gmail.com');
    playCopyConfirmation();
    label.textContent = 'Copied!';
    setCopied(true);
    status.textContent = 'Email address copied to clipboard.';
  } catch {
    status.textContent = 'Could not copy. Email me at adebayojohnpaul885@gmail.com.';
  }
  resetFeedback = setTimeout(() => {
    label.textContent = 'Copy mail';
    setCopied(false);
    status.textContent = '';
  }, 2500);
});

const navigation = document.querySelector('.bottom-nav');
const hero = document.querySelector('.hero');
if (navigation && hero) {
  new IntersectionObserver(([entry]) => {
    const visible = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    navigation.classList.toggle('is-visible', visible);
    navigation.inert = !visible;
  }).observe(hero);
}
