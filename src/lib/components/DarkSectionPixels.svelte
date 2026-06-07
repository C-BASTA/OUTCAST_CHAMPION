<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let w, h;
  let dpr = 1;
  let animId;

  const MAX_PIXELS = 30;
  const PIXEL_SIZE = 6;

  let pixels = [];

  function spawn() {
    const phase  = Math.random() * Math.PI * 2;
    const period = 280 + Math.random() * 200;
    pixels.push({
      x: Math.random() * w,
      y: Math.random() * h,
      phase, period,
      age: 0,
      maxAge: period * (2 + Math.random() * 2),
    });
  }

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      while (pixels.length < MAX_PIXELS) spawn();

      for (let i = pixels.length - 1; i >= 0; i--) {
        const p = pixels[i];
        p.age++;
        const alpha = Math.max(0, Math.sin(p.phase + (p.age / p.period) * Math.PI * 2));
        if (alpha > 0.01) {
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle   = '#ffffff';
          ctx.fillRect(p.x, p.y, PIXEL_SIZE, PIXEL_SIZE);
        }
        if (p.age >= p.maxAge) pixels.splice(i, 1);
      }
      ctx.globalAlpha = 1;
    }
    animId = requestAnimationFrame(draw);
  }

  function init() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = canvas.parentElement;
    w = parent.offsetWidth  || window.innerWidth;
    h = parent.offsetHeight || window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pixels = [];
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    init();
    draw();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animId);
      init();
      draw();
    });
    ro.observe(canvas.parentElement);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
</style>
