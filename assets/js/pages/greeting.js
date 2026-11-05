// getHours() uses the visitor's device timezone, including daylight saving time.
function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return 'Good Morning!';
  if (hour >= 12 && hour < 17) return 'Good Afternoon!';
  if (hour >= 17 && hour < 21) return 'Good Evening!';
  return 'Hello there,';
}

(() => {
  const heading = document.getElementById('greeting');
  let timer;
  const update = () => {
    clearTimeout(timer);
    heading.textContent = greetingForHour(new Date().getHours());
    if (!document.hidden) timer = setTimeout(update, 60000 - Date.now() % 60000);
  };
  document.addEventListener('visibilitychange', update);
  window.addEventListener('focus', update);
  update();
})();
