document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));

  const setExpanded = (expanded) => {
    trigger.setAttribute('aria-expanded', String(expanded));
    panel.inert = !expanded;
  };

  trigger.addEventListener('click', () => {
    setExpanded(trigger.getAttribute('aria-expanded') !== 'true');
  });

  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
      setExpanded(false);
      trigger.focus();
      event.preventDefault();
    }
  });
});
