document.querySelectorAll('[data-image-comparison]').forEach(comparison => {
  const range = comparison.querySelector('input[type="range"]');
  const update = () => {
    const before = Number(range.value);
    comparison.style.setProperty('--split', `${before}%`);
    range.setAttribute('aria-valuetext', `${before}% before, ${100 - before}% after`);
  };
  range.addEventListener('input', update);
  update();
});
