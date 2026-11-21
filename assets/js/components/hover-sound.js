// Prepare the tiny tick before hovering a control; request the browser's interactive audio latency.
let context;
let buffer;
let resuming;
const prepareTick = () => {
  if (buffer) return;
  buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .02), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    samples[i] = (Math.random() * 2 - 1) * Math.min(1, t / .001) * Math.exp(-t / .004) * (1 - i / samples.length) * .14;
  }
};
const unlock = () => {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    prepareTick();
    prepareSoftSounds();
    if (context.state === 'suspended' && !resuming) {
      resuming = context.resume().catch(() => {}).finally(() => { resuming = null; });
    }
  } catch { /* Audio is optional when unsupported or blocked. */ }
};
document.addEventListener('pointerdown', unlock, { passive: true });
document.addEventListener('keydown', unlock);
document.addEventListener('pointermove', unlock, { once: true, passive: true });
const playTick = () => {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 5400;
  filter.Q.value = 1.8;
  gain.gain.value = 1;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  source.start();
};
document.querySelectorAll('.hero-socials a, .resume-button, .bottom-nav a, .bottom-nav button, .experience .dropdown-trigger').forEach(item => {
  item.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || document.hidden) return;
    unlock();
    if (context?.state === 'running') playTick();
    else if (resuming) {
      const entered = performance.now();
      // Never queue a stale hover sound behind a later browser permission unlock.
      resuming.then(() => {
        if (context.state === 'running' && !document.hidden && item.matches(':hover') && performance.now() - entered < 100) playTick();
      });
    }
  });
});

// Paper-turn cue used by the reference avatar: two noise layers and a light sine transient.
export function playPaperFlip(delay = 0) {
  unlock();
  if (!context || document.hidden) return;
  const play = () => {
    if (context.state !== 'running' || document.hidden) return;
    const master = context.createGain();
    master.gain.value = 1;
    master.connect(context.destination);
    const layers = [
      { filter: 'lowpass', frequency: 1800, q: .7, offset: 0, attack: .006, decay: .08, peak: .11 },
      { filter: 'bandpass', frequency: 4200, q: 1.2, offset: .04, attack: .004, decay: .065, peak: .08 },
      { frequency: 2400, offset: .075, attack: .002, decay: .045, peak: .02 }
    ];
    let remaining = layers.length;
    for (const layer of layers) {
      const start = context.currentTime + delay + layer.offset;
      const duration = layer.attack + layer.decay + .05;
      const gain = context.createGain();
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(layer.peak, start + layer.attack);
      gain.gain.exponentialRampToValueAtTime(.0001, start + layer.attack + layer.decay);
      let source;
      let filter;
      if (layer.filter) {
        const noise = context.createBuffer(1, Math.floor(duration * context.sampleRate), context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        source = context.createBufferSource();
        source.buffer = noise;
        filter = context.createBiquadFilter();
        filter.type = layer.filter;
        filter.frequency.value = layer.frequency;
        filter.Q.value = layer.q;
        source.connect(filter).connect(gain);
      } else {
        source = context.createOscillator();
        source.type = 'sine';
        source.frequency.value = layer.frequency;
        source.connect(gain);
      }
      gain.connect(master);
      source.onended = () => {
        source.disconnect();
        filter?.disconnect();
        gain.disconnect();
        if (--remaining === 0) master.disconnect();
      };
      source.start(start);
      source.stop(start + duration);
    }
  };
  if (context.state === 'running') play();
  else context.resume().then(play).catch(() => {});
}

export function playCopyConfirmation() {
  unlock();
  if (!context || document.hidden) return;
  const play = () => {
    if (context.state !== 'running' || document.hidden) return;
    const master = context.createGain();
    const boost = context.createGain();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = 1;
    boost.gain.value = 4;
    compressor.threshold.value = -8;
    compressor.knee.value = 6;
    compressor.ratio.value = 12;
    compressor.attack.value = .002;
    compressor.release.value = .08;
    master.connect(boost).connect(compressor).connect(context.destination);
    const delay = context.createDelay(1);
    const filter = context.createBiquadFilter();
    const feedback = context.createGain();
    const wet = context.createGain();
    delay.delayTime.value = .1;
    filter.type = 'lowpass';
    filter.frequency.value = 4500;
    feedback.gain.value = .22;
    wet.gain.value = .16;
    master.connect(delay).connect(filter).connect(feedback).connect(delay);
    filter.connect(wet).connect(boost);
    for (const [frequency, offset, decay, peak] of [
      [880, 0, .09, .06], [1108.73, .06, .1, .06], [1318.51, .12, .18, .07]
    ]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + offset;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .004 + decay);
      oscillator.connect(gain).connect(master);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + .004 + decay + .05);
    }
    setTimeout(() => {
      [master, boost, compressor, delay, filter, feedback, wet].forEach(node => node.disconnect());
    }, 1000);
  };
  if (context.state === 'running') play();
  else context.resume().then(play).catch(() => {});
}

// Only the four CC0 Soft cues are shipped; reuse the existing Web Audio context.
const softBuffers = new Map();
let softLoading;
function prepareSoftSounds() {
  if (softLoading || !context) return;
  softLoading = Promise.all(['hover', 'press', 'open', 'error'].map(async cue => {
    try {
      const response = await fetch(new URL(`../../sounds/soft-${cue}.mp3`, import.meta.url));
      if (!response.ok) return;
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      softBuffers.set(cue, buffer);
    } catch { /* Keep decorative interactions usable if audio fails. */ }
  }));
}
const playSoftSound = cue => {
  unlock();
  const buffer = softBuffers.get(cue);
  if (!buffer || context?.state !== 'running' || document.hidden) return false;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.onended = () => source.disconnect();
  source.start();
  return true;
};
document.querySelectorAll('.collage-item').forEach(item => {
  item.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') playSoftSound('hover');
  });
  item.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) playSoftSound('press');
  });
});

// One semantic click binding; visual feedback remains in the respective components.
document.addEventListener('click', event => {
  const target = event.target.closest('.resume-button, .bottom-nav-resume, .project-link, .project-pending-trigger');
  if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const unavailable = target.matches('.project-pending-trigger');
  const played = playSoftSound(unavailable ? 'error' : 'open');
  if (played && target.matches('.project-link') && !target.target && !event.defaultPrevented) {
    // Let the cue register before same-tab navigation tears down this audio context.
    event.preventDefault();
    setTimeout(() => location.assign(target.href), 140);
  }
});
