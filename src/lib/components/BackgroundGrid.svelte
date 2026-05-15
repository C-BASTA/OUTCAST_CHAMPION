<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let w, h;
  let stars = [];
  let animId;

  let colorYellow = '#ffd700';
  let colorBlue = '#0057b7';

  const MAX_STARS = 120;
  const STAR_SIZE = 18; // px, quadratino fisso piccolo

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function spawnStar() {
    const color = Math.random() > 0.5 ? colorYellow : colorBlue;
    // fase casuale così non lampeggiano tutte in sincrono
    const phase = Math.random() * Math.PI * 2;
    // velocità del lampeggio: ciclo tra 40 e 90 frame
    const period = 280 + Math.random() * 200;
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      rgb: hexToRgb(color),
      phase,
      period,
      age: 0,
      // ogni stella vive 2-4 cicli poi muore e viene sostituita
      maxAge: period * (2 + Math.random() * 2)
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Mantieni sempre MAX_STARS stelle vive
    while (stars.length < MAX_STARS) spawnStar();

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.age++;

      // Alpha: onda sinusoidale — fa lampeggiare la stella
      const alpha = Math.max(0, Math.sin(s.phase + (s.age / s.period) * Math.PI * 2));

      if (alpha > 0.01) {
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = `rgb(${s.rgb})`;
        ctx.fillRect(s.x, s.y, STAR_SIZE, STAR_SIZE);
      }

      if (s.age >= s.maxAge) stars.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  onMount(() => {
    const style = getComputedStyle(document.documentElement);
    colorYellow = style.getPropertyValue('--hex-brand-yellow-500').trim() || '#ffd700';
    colorBlue   = style.getPropertyValue('--hex-brand-blue-500').trim()   || '#0057b7';

    ctx = canvas.getContext('2d');
    init();
    draw();

    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animId);
    };
  });
</script>

<div class="bg-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .bg-container {
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
