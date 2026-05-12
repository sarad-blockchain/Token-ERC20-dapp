/**
 * js/coins-bg.js
 * Background layer of 3D fat coins — large, slow, behind the UI.
 * Uses canvas 2D with layered radial/linear gradients to fake
 * a chunky coin with a thick rim and specular highlight.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('canvas-bg');
  const ctx    = canvas.getContext('2d');
  let W, H;

  /* ── Colour palettes (blue-purple family) ── */
  const PALETTES = [
    { body: '#5b3fc4', rim: '#8b6ef0', hi: '#c4b5fd', shadow: '#1e1060' },
    { body: '#2056b4', rim: '#4fa8ff', hi: '#bfdbfe', shadow: '#0c2a5a' },
    { body: '#6b21a8', rim: '#a855f7', hi: '#e9d5ff', shadow: '#2e0a44' },
    { body: '#1d4ed8', rim: '#60a5fa', hi: '#dbeafe', shadow: '#0a1e5e' },
  ];

  function randomPalette() {
    return PALETTES[Math.floor(Math.random() * PALETTES.length)];
  }

  /* ── Factory ── */
  function makeCoin() {
    const pal = randomPalette();
    const r   = 40 + Math.random() * 70;        // base radius
    return {
      x:       Math.random() * W,
      y:       Math.random() * H,
      r,
      /* tilt drives apparent ry — coin spins in 3-D */
      tilt:    Math.random() * Math.PI,
      tiltSpd: (Math.random() - 0.5) * 0.005,
      /* rotation in screen plane */
      angle:   Math.random() * Math.PI * 2,
      angleSpd:(Math.random() - 0.5) * 0.006,
      /* drift velocity */
      vx:      (Math.random() - 0.5) * 0.2,
      vy:      (Math.random() - 0.5) * 0.15,
      pal,
      /* fat factor: how thick the rim looks */
      thickness: 0.22 + Math.random() * 0.12,   // fraction of r
      alpha:     0.55 + Math.random() * 0.35,
    };
  }

  /* ── Draw one coin ── */
  function drawCoin(c) {
    const { x, y, r, angle, tilt, pal, alpha, thickness } = c;

    /* apparent semi-minor axis (coin tilt) */
    const ry = Math.abs(Math.cos(tilt)) * r * 0.48 + 4;
    /* thick rim height */
    const rimH = r * thickness;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;

    /* ── Outer diffuse glow ── */
    const glow = ctx.createRadialGradient(0, 0, ry * 0.2, 0, 0, r * 1.7);
    glow.addColorStop(0, hexAlpha(pal.rim, 0.18));
    glow.addColorStop(1, hexAlpha(pal.body, 0));
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.7, ry * 1.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    /* ── Thick bottom rim (3-D depth shadow) ── */
    const rimGrad = ctx.createLinearGradient(0, ry, 0, ry + rimH);
    rimGrad.addColorStop(0, hexAlpha(pal.shadow, 0.9));
    rimGrad.addColorStop(1, hexAlpha(pal.shadow, 0.3));
    ctx.beginPath();
    ctx.ellipse(0, ry + rimH * 0.5, r * 0.98, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    /* ── Main coin face ── */
    const face = ctx.createRadialGradient(-r * 0.25, -ry * 0.35, r * 0.05, 0, 0, r);
    face.addColorStop(0,   hexAlpha(pal.hi,   0.85));
    face.addColorStop(0.35, hexAlpha(pal.rim,  0.90));
    face.addColorStop(0.72, hexAlpha(pal.body, 0.95));
    face.addColorStop(1,    hexAlpha(pal.shadow, 0.6));
    ctx.beginPath();
    ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = face;
    ctx.fill();

    /* ── Specular hot-spot (top-left) ── */
    const spec = ctx.createRadialGradient(
      -r * 0.30, -ry * 0.30, 0,
      -r * 0.10, -ry * 0.10, r * 0.55
    );
    spec.addColorStop(0,   'rgba(255,255,255,0.55)');
    spec.addColorStop(0.45, 'rgba(255,255,255,0.10)');
    spec.addColorStop(1,    'rgba(255,255,255,0.00)');
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -ry * 0.15, r * 0.55, ry * 0.45, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    /* ── Rim edge line ── */
    ctx.beginPath();
    ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(pal.rim, 0.40);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /* ── Tick ── */
  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const c of coins) {
      c.angle += c.angleSpd;
      c.tilt  += c.tiltSpd;
      c.x     += c.vx;
      c.y     += c.vy;
      if (c.x < -140) c.x = W + 100;
      if (c.x > W + 140) c.x = -100;
      if (c.y < -140) c.y = H + 100;
      if (c.y > H + 140) c.y = -100;
      drawCoin(c);
    }
    requestAnimationFrame(tick);
  }

  /* ── Init ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  const coins = Array.from({ length: 12 }, makeCoin);
  tick();

  /* ── Util: hex + alpha ── */
  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
})();
