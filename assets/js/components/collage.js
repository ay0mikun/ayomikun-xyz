const frame = document.querySelector('.about-collage');
const items = [...frame.querySelectorAll('.collage-item')];
const positions = new Map(items.map(item => [item, { x: 0, y: 0 }]));
let drag;
let layer = 1;

const move = (item, x, y) => {
  positions.set(item, { x, y });
  item.style.setProperty('--drag-x', `${x}px`);
  item.style.setProperty('--drag-y', `${y}px`);
};
const bounds = item => {
  const rect = item.getBoundingClientRect();
  const area = frame.getBoundingClientRect();
  // Keep the original edge crop valid without snapping on the first movement.
  return {
    left: Math.min(0, area.left - rect.left),
    right: Math.max(0, area.right - rect.right),
    top: Math.min(0, area.top - rect.top),
    bottom: Math.max(0, area.bottom - rect.bottom)
  };
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const finish = () => {
  if (!drag) return;
  const { item, pointer } = drag;
  drag = null;
  item.classList.remove('is-dragging');
  if (item.hasPointerCapture(pointer)) item.releasePointerCapture(pointer);
};

items.forEach(item => {
  item.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    finish();
    const position = positions.get(item);
    drag = { item, pointer: event.pointerId, clientX: event.clientX, clientY: event.clientY, ...position, limits: bounds(item) };
    item.style.zIndex = String(++layer);
    item.classList.add('is-dragging');
    item.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  item.addEventListener('pointermove', event => {
    if (!drag || drag.item !== item || drag.pointer !== event.pointerId) return;
    const { x, y, clientX, clientY, limits } = drag;
    move(item,
      x + clamp(event.clientX - clientX, limits.left, limits.right),
      y + clamp(event.clientY - clientY, limits.top, limits.bottom));
  });
  item.addEventListener('pointerup', finish);
  item.addEventListener('pointercancel', finish);
  item.addEventListener('lostpointercapture', finish);

});

let frameSize;
new ResizeObserver(([entry]) => {
  const size = `${entry.contentRect.width},${entry.contentRect.height}`;
  if (frameSize && frameSize !== size) {
    finish();
    items.forEach(item => move(item, 0, 0));
  }
  frameSize = size;
}).observe(frame);
