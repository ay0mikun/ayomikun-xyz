// Reusable light-DOM footer, initialized by the shared main module.
// Existing server-rendered content is preserved for immediate and no-JavaScript access.
const footerBase = new URL('../../../', import.meta.url);
class PortfolioFooter extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector('footer')) this.innerHTML = `<footer class="section"><div class="container section-content">
    <div class="signoff"><img class="portrait" src="${new URL('assets/images/profile.png', footerBase).href}" width="48" height="48" alt="Ayo"><animated-signature></animated-signature></div>
    <p class="footer-copy">I'm interested in opportunities where I can contribute to product thinking, design execution and the development of useful digital experiences.</p>
    <nav class="contact-links" aria-label="Contact"><a href="mailto:adebayojohnpaul885@gmail.com" target="_blank" rel="noopener noreferrer"><span class="link-label">Send a mail</span></a><a href="https://x.com/Ayo_Design" target="_blank" rel="noopener noreferrer"><span class="link-label">Twitter</span></a><a href="https://www.linkedin.com/in/johnpauladebayo/" target="_blank" rel="noopener noreferrer"><span class="link-label">LinkedIn</span></a><a href="https://drive.google.com/file/d/1aAd5R4C7v3J3VwL5frNz7BCr2YNsZg_4/view?usp=sharing" target="_blank" rel="noopener noreferrer"><span class="link-label">Resume</span></a></nav>
  </div></footer>`;
  }
}
customElements.define('portfolio-footer', PortfolioFooter);
