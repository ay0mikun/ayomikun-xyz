import { adjustScrollImmediately } from '../interactions.js?v=20261120-2';

const jobs = [...document.querySelectorAll('.experience [data-dropdown]')].map(dropdown => {
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  return { dropdown, trigger, panel };
});
let stopTracking = () => {};
const setExpanded = (job, expanded) => {
  job.trigger.setAttribute('aria-expanded', String(expanded));
  job.panel.inert = !expanded;
};

// When an earlier description collapses, keep the selected job at its viewport position.
const keepSelectedJobInPlace = (selected, closing) => {
  const top = selected.trigger.getBoundingClientRect().top;
  document.documentElement.classList.add('is-switching-experience');
  const observer = new ResizeObserver(() => {
    const delta = selected.trigger.getBoundingClientRect().top - top;
    if (Math.abs(delta) > .5) adjustScrollImmediately(delta);
  });
  const stop = () => {
    clearTimeout(timeout);
    observer.disconnect();
    document.documentElement.classList.remove('is-switching-experience');
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
  };
  const duration = Math.max(...getComputedStyle(closing.panel).transitionDuration.split(',').map(value => parseFloat(value) * 1000));
  const timeout = setTimeout(stop, duration + 80);
  observer.observe(closing.panel);
  window.addEventListener('wheel', stop, { passive: true, once: true });
  window.addEventListener('touchmove', stop, { passive: true, once: true });
  stopTracking = stop;
};

jobs.forEach(job => {
  job.trigger.addEventListener('click', () => {
    stopTracking();
    const opening = job.trigger.getAttribute('aria-expanded') !== 'true';
    const previous = jobs.find(other => other !== job && other.trigger.getAttribute('aria-expanded') === 'true');
    if (opening && previous && (previous.dropdown.compareDocumentPosition(job.dropdown) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      keepSelectedJobInPlace(job, previous);
    }
    jobs.forEach(other => setExpanded(other, other === job && opening));
  });

  job.dropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape' && job.trigger.getAttribute('aria-expanded') === 'true') {
      stopTracking();
      setExpanded(job, false);
      job.trigger.focus({ preventScroll: true });
      event.preventDefault();
    }
  });
});
