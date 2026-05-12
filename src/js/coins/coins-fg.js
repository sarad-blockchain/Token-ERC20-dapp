/**
 * js/coins-fg.js
 * Foreground layer — smaller, faster fat coins that pass IN FRONT of the UI,
 * creating a parallax 3-D depth illusion.
 * Same drawing technique as coins-bg.js but lighter alpha so text stays readable.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('canvas-fg');
  const ctx    = canvas.getContext('2d');
  let W, H;

  const PALETTES = [
    { body: '#4c1d95', rim: '#8b5cf6', hi: '#ddd6fe', shadow: '#1e0a44' },
    { body: '#1e3a8a', rim: '#3b82f6', hi: '#bfdbfe', shadow: '#0f1e4a' },
    { body: '#5b21b6', rim: '#a78bfa', hi: '#ede9fe', shadow: '#2e1065' },
  ];

  function randomPalette() {
    return PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }

  function makeCoin() {
    const pal = randomPalette();
    const r   = 14 + Math.random() * 28;   // smaller than bg
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r,
      tilt:    Math.random() * Math.PI,
      tiltSpd: (Math.random() - 0.5) * 0.012,
      angle:   Math.random() * Math.PI * 2,
      angleSpd:(Math.random() - 0.5) * 0.014,
      vx:      (Math.random() - 0.5) * 0.55,
      vy:      (Math.random() - 0.5) * 0.40,
      pal,
      thickness: 0.20 + Math.random() * 0.14,
      alpha:     0.22 + Math.random() * 0.28,   // lighter — UI must stay legible
    };
  }

  function drawCoin(c) {
    const { x, y, r, angle, tilt, pal, alpha, thickness } = c;
    const ry   = Math.abs(Math.cos(tilt)) * r * 0.48 + 2;
    const rimH = r * thickness;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;

    /* glow */
    const glow = ctx.createRadialGradient(0, 0, ry * 0.2, 0, 0, r * 1.7);
    glow.addColorStop(0, hexAlpha(pal.rim, 0.20));
    glow.addColorStop(1, hexAlpha(pal.body, 0));
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.7, ry * 1.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    /* bottom rim */
    const rimGrad = ctx.createLinearGradient(0, ry, 0, ry + rimH);
    rimGrad.addColorStop(0, hexAlpha(pal.shadow, 0.85));
    rimGrad.addColorStop(1, hexAlpha(pal.shadow, 0.20));
    ctx.beginPath();
    ctx.ellipse(0, ry + rimH * 0.5, r * 0.98, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    /* face */
    const face = ctx.createRadialGradient(-r * 0.25, -ry * 0.35, r * 0.05, 0, 0, r);
    face.addColorStop(0,    hexAlpha(pal.hi,     0.80));
    face.addColorStop(0.35, hexAlpha(pal.rim,    0.85));
    face.addColorStop(0.72, hexAlpha(pal.body,   0.90));
    face.addColorStop(1,    hexAlpha(pal.shadow, 0.55));
    ctx.beginPath();
    ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = face;
    ctx.fill();

    /* specular */
    const spec = ctx.createRadialGradient(
      -r * 0.30, -ry * 0.30, 0,
      -r * 0.10, -ry * 0.10, r * 0.55
    );
    spec.addColorStop(0,    'rgba(255,255,255,0.50)');
    spec.addColorStop(0.45, 'rgba(255,255,255,0.08)');
    spec.addColorStop(1,    'rgba(255,255,255,0.00)');
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -ry * 0.15, r * 0.55, ry * 0.45, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    /* rim line */
    ctx.beginPath();
    ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(pal.rim, 0.30);
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const c of coins) {
      c.angle += c.angleSpd;
      c.tilt  += c.tiltSpd;
      c.x     += c.vx;
      c.y     += c.vy;
      if (c.x < -80)  c.x = W + 60;
      if (c.x > W+80) c.x = -60;
      if (c.y < -80)  c.y = H + 60;
      if (c.y > H+80) c.y = -60;
      drawCoin(c);
    }
    requestAnimationFrame(tick);
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const coins = Array.from({ length: 7 }, makeCoin);
  tick();

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
})();
