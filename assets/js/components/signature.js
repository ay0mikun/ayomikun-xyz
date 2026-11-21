import { playPenStroke } from './hover-sound.js?v=20261121-21';

// <animated-signature duration="2600"> draws the original SVG along its pen path.
(() => {
  const base = import.meta.url;
  const fallback = new URL('../../images/footer-signature.svg', base).href;
  const source = new URL('../../images/signature-writing.svg', base).href;
  let artwork;
  class AnimatedSignature extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      const cursor = new URL('../../cursors/select-20.png', base).href;
      const initialArtwork = this.getAttribute('ink') === 'dark' ? new URL('../../images/footer-signature-dark.svg', base).href : fallback;
      this.shadowRoot.innerHTML = `<style>
        :host{display:block;line-height:0;width:100%}
        button{width:100%;display:grid;place-items:center;min-height:44px;padding:0;border:0;border-radius:4px;background:transparent;color:inherit;cursor:url("${cursor}") 8 3,pointer}
        button:focus-visible{outline:2px solid #b1b0ae;outline-offset:5px}
        svg,img{display:block;width:100%;height:auto;pointer-events:none}
      </style><button type="button" aria-label="Replay Johnpaul signature animation"><img src="${initialArtwork}" width="116.574" height="28.0804" alt=""></button>`;
      this.shadowRoot.querySelector('button').addEventListener('click', () => { playPenStroke(); this.replay(); });
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.stop = () => { if (this.motion.matches) { this.animation?.cancel(); if (this.pen) this.pen.style.strokeDashoffset = '0'; } };
    }
    async connectedCallback() {
      this.motion.addEventListener('change', this.stop);
      try {
        artwork ??= fetch(source).then(response => {
          if (!response.ok) throw new Error('Signature unavailable');
          return response.text();
        });
        const drawingSource = this.getAttribute('ink') === 'dark' ? new URL('../../images/footer-signature-dark.svg', base).href : fallback;
        const svg = new DOMParser().parseFromString(await artwork, 'image/svg+xml').documentElement;
        if (!this.isConnected) return;
        svg.setAttribute('aria-hidden', 'true');
        // Keep the existing pen motion, using the lighter artwork from the new footer.
        const drawing = svg.querySelector('[mask]');
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', drawingSource);
        image.setAttribute('width', '116.574');
        image.setAttribute('height', '28.0804');
        image.setAttribute('preserveAspectRatio', 'none');
        drawing.replaceChildren(image);
        this.shadowRoot.querySelector('img,svg').replaceWith(svg);
        this.pen = svg.querySelector('#pen-path');
        this.length = this.pen.getTotalLength();
        this.pen.style.strokeDasharray = String(this.length);
        this.pen.style.strokeDashoffset = this.hasAttribute('manual') && !this.motion.matches ? String(this.length) : '0';
        if (this.pendingReplay) this.replay();
        if (this.hasAttribute('manual')) return;
        this.observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            this.replay();
            this.observer.disconnect();
          }
        }, { threshold: .5 });
        this.observer.observe(this);
      } catch { /* The unmodified signature remains visible if loading fails. */ }
    }
    replay() {
      this.animation?.cancel();
      if (!this.pen) { this.pendingReplay = true; return; }
      this.pen.style.strokeDashoffset = '0';
      if (this.motion.matches) return;
      const duration = Number(this.getAttribute('duration') ?? 2600);
      this.animation = this.pen.animate([
        { strokeDashoffset: String(this.length) },
        { strokeDashoffset: '0' }
      ], { duration: Number.isFinite(duration) ? Math.max(0,duration) : 2600, easing: 'linear' });
    }
    disconnectedCallback() {
      this.observer?.disconnect();
      this.animation?.cancel();
      this.motion.removeEventListener('change', this.stop);
    }
  }
  if (!customElements.get('animated-signature')) customElements.define('animated-signature', AnimatedSignature);
})();
