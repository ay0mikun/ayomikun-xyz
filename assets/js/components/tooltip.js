// Shared tooltip: hover/focus opens it; Escape, blur or scrolling dismisses it.
const tooltip = document.createElement('span');
tooltip.id = 'nav-tooltip';
tooltip.className = 'nav-tooltip';
tooltip.setAttribute('role', 'tooltip');
tooltip.hidden = true;
const tooltipText = document.createElement('span');
tooltipText.className = 'nav-tooltip-text';
tooltip.append(tooltipText);
document.body.append(tooltip);
let active;
let timer;

const hide = () => {
  clearTimeout(timer);
  active?.removeAttribute('aria-describedby');
  active = null;
  tooltip.hidden = true;
};
const show = trigger => {
  clearTimeout(timer);
  const moving = !tooltip.hidden;
  active?.removeAttribute('aria-describedby');
  if (trigger.closest('[inert]')) return;
  tooltip.classList.toggle('is-tracking', moving);
  active = trigger;
  tooltipText.textContent = trigger.dataset.tooltip;
  tooltip.hidden = false;
  trigger.setAttribute('aria-describedby', tooltip.id);
  const width = Math.min(tooltipText.scrollWidth + 12, innerWidth - 16);
  tooltip.style.width = `${width}px`;
  const rect = trigger.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const left = Math.max(8, Math.min(center - width / 2, innerWidth - width - 8));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
};
const scheduleHide = () => {
  clearTimeout(timer);
  timer = setTimeout(hide, 120);
};

document.querySelectorAll('[data-tooltip]').forEach(trigger => {
  trigger.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    clearTimeout(timer);
    show(trigger);
  });
  trigger.addEventListener('pointerleave', event => {
    clearTimeout(timer);
    if (!event.relatedTarget?.closest?.('.bottom-nav')) scheduleHide();
  });
  trigger.addEventListener('focus', () => {
    if (trigger.matches(':focus-visible')) show(trigger);
  });
  trigger.addEventListener('blur', scheduleHide);
  trigger.addEventListener('pointerdown', hide);
});
document.querySelector('.bottom-nav')?.addEventListener('pointerleave', scheduleHide);
tooltip.addEventListener('pointerenter', () => clearTimeout(timer));
tooltip.addEventListener('pointerleave', scheduleHide);
document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
document.addEventListener('scroll', hide, { passive: true });
window.addEventListener('resize', hide, { passive: true });
