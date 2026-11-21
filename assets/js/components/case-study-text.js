// Shared by case studies: increase leading only when a text block actually wraps.
const study = document.querySelector('.case-study');
if (study) {
  const blocks = [...study.querySelectorAll('p, h1, h2, h3, h4, dt, dd, figcaption, li')];
  const update = () => {
    const wrapped = blocks.map(block => {
      const range = document.createRange();
      range.selectNodeContents(block);
      const tops = [];
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height && !tops.some(top => Math.abs(top - rect.top) < 2)) tops.push(rect.top);
      }
      return tops.length > 1;
    });
    blocks.forEach((block, index) => block.classList.toggle('is-multiline', wrapped[index]));
  };
  let width;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === width) return;
    width = entry.contentRect.width;
    update();
  }).observe(study);
  document.fonts.ready.then(update);
}
