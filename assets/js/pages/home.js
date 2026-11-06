import '../main.js';
import '../components/dropdown.js';
import '../components/pending-projects.js';

const track = document.getElementById('gallery');
const group = track.querySelector('.carousel-group');
const duplicate = group.cloneNode(true);
duplicate.setAttribute('aria-hidden', 'true');
track.append(duplicate);

const carousel = document.querySelector('.carousel');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let carouselAnimation;
let speedFrame;
let targetRate = 1;
let paused = false;
let inView = false;
let groupWidth = 0;
const syncPlayback = () => {
  if (paused || !inView || document.hidden) carouselAnimation?.pause();
  else carouselAnimation?.play();
};

// Change playback speed without restarting the loop or shifting its position.
const easeSpeed = (rate) => {
  targetRate = rate;
  cancelAnimationFrame(speedFrame);
  if (!carouselAnimation) return;
  const animation = carouselAnimation;
  const initialRate = animation.playbackRate;
  const started = performance.now();
  const tick = (now) => {
    if (animation !== carouselAnimation) return;
    const progress = Math.min((now - started) / 350, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animation.updatePlaybackRate(initialRate + (rate - initialRate) * eased);
    if (progress < 1) speedFrame = requestAnimationFrame(tick);
  };
  speedFrame = requestAnimationFrame(tick);
};

const animateGallery = () => {
  const previous = carouselAnimation;
  const phase = previous ? (Number(previous.currentTime ?? 0) / previous.effect.getTiming().duration) % 1 : 0.5;
  previous?.cancel();
  cancelAnimationFrame(speedFrame);
  carouselAnimation = null;
  carousel.classList.toggle('is-animated', !motionPreference.matches);
  if (motionPreference.matches) return;
  carousel.scrollLeft = 0;
  const distance = groupWidth;
  if (!distance) return;
  // Two identical groups make the last-to-first transition seamless, including the 8px gap.
  const duration = distance / 40 * 1000;
  carouselAnimation = track.animate([
    { transform: 'translateX(0)' },
    { transform: `translateX(-${distance}px)` }
  ], { duration, iterations: Infinity, easing: 'linear' });
  carouselAnimation.currentTime = phase * duration;
  carouselAnimation.updatePlaybackRate(targetRate);
  syncPlayback();
};
const updateSpeed = () => easeSpeed(carousel.matches(':focus-within') ? 0 : carousel.matches(':hover') ? 0.35 : 1);
carousel.addEventListener('pointerenter', updateSpeed);
carousel.addEventListener('pointerleave', updateSpeed);
carousel.addEventListener('focusin', updateSpeed);
carousel.addEventListener('focusout', () => requestAnimationFrame(updateSpeed));
motionPreference.addEventListener('change', animateGallery);
new ResizeObserver(([entry]) => {
  // ResizeObserver provides the measurement without forcing a synchronous layout.
  const width = entry.borderBoxSize[0].inlineSize;
  if (width === groupWidth) return;
  groupWidth = width;
  animateGallery();
}).observe(group);
document.addEventListener('visibilitychange', syncPlayback);
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncPlayback();
}, { threshold: 0 }).observe(carousel);
carousel.addEventListener('keydown', event => {
  if (!carouselAnimation) return;
  if (event.code === 'Space') {
    event.preventDefault();
    paused = !paused;
    syncPlayback();
    return;
  }
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const duration = carouselAnimation.effect.getTiming().duration;
  const delta = (event.key === 'ArrowRight' ? 1 : -1) * carousel.clientWidth * 0.75 / 40 * 1000;
  carouselAnimation.currentTime = ((Number(carouselAnimation.currentTime) + delta) % duration + duration) % duration;
});
