<script>
  import { onMount } from 'svelte';

  let canvasLight;
  let canvasDark;
  let ctxLight, ctxDark;
  let w, h;
  let animId;

  let colorYellow = '#ffd700';
  let colorBlue   = '#0057b7';

  // ── Contatori ────────────────────────────────────────────────────────
  const MAX_COLORED = 25;   // quadratini colorati per le sezioni chiare
  const MAX_BW      = 60;   // quadratini grigi per le sezioni scure
  const STAR_SIZE   = 18;

  let coloredStars = [];
  let bwStars      = [];

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  function spawnStar(pool, rgbList) {
    const rgb    = rgbList[Math.floor(Math.random() * rgbList.length)];
    const phase  = Math.random() * Math.PI * 2;
    const period = 280 + Math.random() * 200;
    pool.push({
      x: Math.random() * w,
      y: Math.random() * h,
      rgb,
      phase,
      period,
      age: 0,
      maxAge: period * (2 + Math.random() * 2),
    });
  }

  function drawPool(ctx, pool, max, rgbList, maxAlpha) {
    ctx.clearRect(0, 0, w, h);
    while (pool.length < max) spawnStar(pool, rgbList);

    for (let i = pool.length - 1; i >= 0; i--) {
      const s = pool[i];
      s.age++;
      const alpha = Math.max(0, Math.sin(s.phase + (s.age / s.period) * Math.PI * 2));
      if (alpha > 0.01) {
        ctx.globalAlpha = alpha * maxAlpha;
        ctx.fillStyle   = `rgb(${s.rgb})`;
        ctx.fillRect(s.x, s.y, STAR_SIZE, STAR_SIZE);
      }
      if (s.age >= s.maxAge) pool.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    // Canvas 1: quadratini giallo/blu su sfondo chiaro
    drawPool(
      ctxLight, coloredStars, MAX_COLORED,
      [hexToRgb(colorYellow), hexToRgb(colorBlue)],
      0.85
    );

    // Canvas 2: quadratini grigi (mix-blend-mode screen → visibili solo su scuro)
    drawPool(
      ctxDark, bwStars, MAX_BW,
      ['245,245,245', '210,210,210', '175,175,175'],
      0.65
    );

    animId = requestAnimationFrame(draw);
  }

  function init() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvasLight.width  = canvasDark.width  = w;
    canvasLight.height = canvasDark.height = h;
  }

  onMount(() => {
    const style = getComputedStyle(document.documentElement);
    colorYellow = style.getPropertyValue('--hex-brand-yellow-500').trim() || '#ffd700';
    colorBlue   = style.getPropertyValue('--hex-brand-blue-500').trim()   || '#0057b7';

    ctxLight = canvasLight.getContext('2d');
    ctxDark  = canvasDark.getContext('2d');
    init();
    draw();

    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  });
</script>

<!-- Canvas colorato: z-index basso, coperto dalle sezioni scure -->
<div class="bg-layer bg-light">
  <canvas bind:this={canvasLight}></canvas>
</div>

<!-- Canvas B&W: z-index sopra le sezioni scure, mix-blend-mode:screen
     → invisibile sul bianco (bianco+bianco=bianco), visibile sul nero -->
<div class="bg-layer bg-dark-bw">
  <canvas bind:this={canvasDark}></canvas>
</div>

<style>
  .bg-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .bg-light {
    z-index: 0;
  }

  .bg-dark-bw {
    z-index: 1;
    mix-blend-mode: screen;
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
</style>
