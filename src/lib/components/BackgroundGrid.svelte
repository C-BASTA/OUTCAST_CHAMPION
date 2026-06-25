<script>
  import { onMount } from 'svelte';
  import { palette } from '$lib/styles/tokens/index';

  let { hideColored = false } = $props();

  let canvasLight;
  let ctxLight;
  let w, h;
  let dpr = 1;
  let animId;

  let colorYellow = palette.brandYellow500;
  let colorBlue   = palette.brandBlue500;

  const MAX_COLORED = 40;
  const PIXEL_COLS = 280;
  const PIXEL_ROWS = 175;
  let STAR_SIZE = 6;

  let coloredStars = [];

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  const ZONES = 6;

  function spawnStar() {
    const rgb    = [hexToRgb(colorYellow), hexToRgb(colorBlue)][Math.floor(Math.random() * 2)];
    const period = 500 + Math.random() * 400;

    const zoneW = w / ZONES;
    const counts = new Array(ZONES).fill(0);
    for (const s of coloredStars) counts[Math.min(ZONES - 1, Math.floor(s.x / zoneW))]++;

    // Tra le zone con il minimo, scegline una a caso (evita sempre la prima)
    const minCount = Math.min(...counts);
    const candidates = counts.reduce((acc, c, i) => (c === minCount ? [...acc, i] : acc), []);
    const zone = candidates[Math.floor(Math.random() * candidates.length)];

    coloredStars.push({
      x: zone * zoneW + Math.random() * zoneW,
      y: Math.random() * h,
      rgb, period,
      age: 0,
      maxAge: period,
    });
  }

  function draw() {
    if (ctxLight) {
      if (hideColored) {
        coloredStars.length = 0;
        ctxLight.clearRect(0, 0, w, h);
      } else {
        ctxLight.clearRect(0, 0, w, h);
        while (coloredStars.length < MAX_COLORED) spawnStar();

        for (let i = coloredStars.length - 1; i >= 0; i--) {
          const s = coloredStars[i];
          s.age++;
          const alpha = Math.sin((s.age / s.maxAge) * Math.PI);
          if (alpha > 0.01) {
            ctxLight.globalAlpha = alpha * 0.85;
            ctxLight.fillStyle   = `rgb(${s.rgb})`;
            ctxLight.fillRect(s.x, s.y, STAR_SIZE, STAR_SIZE);
          }
          if (s.age >= s.maxAge) coloredStars.splice(i, 1);
        }
        ctxLight.globalAlpha = 1;
      }
    }
    animId = requestAnimationFrame(draw);
  }

  function init() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvasLight.width  = Math.round(w * dpr);
    canvasLight.height = Math.round(h * dpr);
    if (ctxLight) ctxLight.setTransform(dpr, 0, 0, dpr, 0, 0);
    coloredStars = []; // respawn con distribuzione corretta sulla nuova dimensione
  }

  onMount(() => {
    ctxLight = canvasLight.getContext('2d');
    init();
    draw();

    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  });
</script>

<div class="bg-layer">
  <canvas bind:this={canvasLight}></canvas>
</div>

<style>
  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
</style>
