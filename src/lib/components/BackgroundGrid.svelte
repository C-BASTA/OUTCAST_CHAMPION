<script>
  import { onMount } from 'svelte';

  let { hideColored = false } = $props();

  let canvasLight;
  let ctxLight;
  let w, h;
  let animId;

  let colorYellow = '#ffd700';
  let colorBlue   = '#0057b7';

  const MAX_COLORED = 18;
  const STAR_SIZE   = 18;

  let coloredStars = [];

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  function spawnStar() {
    const rgb    = [hexToRgb(colorYellow), hexToRgb(colorBlue)][Math.floor(Math.random() * 2)];
    const phase  = Math.random() * Math.PI * 2;
    const period = 280 + Math.random() * 200;
    coloredStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      rgb, phase, period,
      age: 0,
      maxAge: period * (2 + Math.random() * 2),
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
          const alpha = Math.max(0, Math.sin(s.phase + (s.age / s.period) * Math.PI * 2));
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
    w = window.innerWidth;
    h = window.innerHeight;
    canvasLight.width  = w;
    canvasLight.height = h;
  }

  onMount(() => {
    const style = getComputedStyle(document.documentElement);
    colorYellow = style.getPropertyValue('--hex-brand-yellow-500').trim() || '#ffd700';
    colorBlue   = style.getPropertyValue('--hex-brand-blue-500').trim()   || '#0057b7';

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
