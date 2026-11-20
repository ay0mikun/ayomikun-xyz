// Preserve server-rendered footer content; supply the same footer when reused elsewhere.
const footerBase = new URL('../../../', import.meta.url);
const lagosTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos', hour: 'numeric', minute: '2-digit', hour12: true
});
class PortfolioFooter extends HTMLElement {
  clockTimer;
  updateClock = () => {
    clearTimeout(this.clockTimer);
    const clock = this.querySelector('[data-lagos-clock]');
    if (!clock || document.hidden) return;
    const now = new Date();
    clock.textContent = lagosTime.format(now).toLowerCase();
    clock.dateTime = now.toISOString();
    this.clockTimer = setTimeout(this.updateClock, 60000 - now.getTime() % 60000);
  };
  connectedCallback() {
    if (!this.querySelector('footer')) this.innerHTML = `<footer class="site-footer" id="site-footer">
    <div class="footer-note">
      <span class="footer-paper-frame" aria-hidden="true"><img class="footer-paper" src="${footerBase.href}assets/images/footer-paper-textured.webp" width="913" height="910" alt="" loading="lazy" decoding="async"></span>
      <div class="footer-note-content">
        <p class="footer-note-copy">I'm open to opportunities and roles where I can contribute to product thinking, design and the development of digital experiences.</p>
        <animated-signature class="footer-signature" ink="dark" manual></animated-signature>
      </div>
    </div>
    <div class="footer-bottom">
      <img class="footer-divider" src="${footerBase.href}assets/icons/footer-divider-paper.svg" width="600" height="1" alt="" loading="lazy" decoding="async">
      <div class="container footer-credits"><p>Lagos, UTC+1 · <time data-lagos-clock>local time</time></p><p>© 2026 Johnpaul Adebayo</p></div>
    </div>
  </footer>`;
    this.updateClock();
    document.addEventListener('visibilitychange', this.updateClock);
  }
  disconnectedCallback() {
    clearTimeout(this.clockTimer);
    document.removeEventListener('visibilitychange', this.updateClock);
  }
}
customElements.define('portfolio-footer', PortfolioFooter);
