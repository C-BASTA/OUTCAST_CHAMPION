<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let w, h;
  let activeDots = [];
  let lastScrollY = 0;
  
  // Colori prelevati dalle variabili globali
  let colorYellow = '#ffd700';
  let colorBlue = '#0057b7';

  const GRID_SIZE = 40;
  const MAX_DOTS = 250;

  // Variabili per il controllo del flusso
  let mouseX = 0;
  let mouseY = 0;
  let distAccumulator = 0; // Accumulatore di distanza

  function addDot(x, y, isSpecial = false) {
    if (activeDots.length > MAX_DOTS) return;

    const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
    const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;

    // Controllo anti-sovrapposizione più severo
    if (activeDots.some(d => d.x === gx && d.y === gy && d.life < 15)) return;

    const sizes = isSpecial ? [5, 10, 15] : [2, 5, 12];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const mainColor = Math.random() > 0.5 ? colorYellow : colorBlue;

    activeDots.push({
      x: gx,
      y: gy,
      size,
      color: mainColor,
      life: 0,
      // Se è creato dal mouse (isSpecial), dura meno tempo
      maxLife: isSpecial ? 20 + Math.random() * 20 : 40 + Math.random() * 50,
      brightness: isSpecial ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      glitch: (Math.random() - 0.5) * 4
    });
  }

  function draw() {
    // Sfondo semi-trasparente per scia fluida
    ctx.fillStyle = 'rgba(250, 250, 250, 0.85)'; 
    ctx.fillRect(0, 0, w, h);

    if (Math.random() < 1) addDot(Math.random() * w, Math.random() * h);

    for (let i = activeDots.length - 1; i >= 0; i--) {
      let d = activeDots[i];
      d.life++;
      d.x += d.vx;
      d.y += d.vy;

      let progress = d.life / d.maxLife;
      let alpha = Math.sin(progress * Math.PI) * d.brightness;

      // --- EFFETTO GLITCH COLORATO ---
      // Ombra del colore opposto per un look dinamico
      ctx.shadowBlur = d.size > 8 ? 12 * alpha : 0;
      ctx.shadowColor = d.color;
      
      // Quadratino Glitch (spostato di lato)
      ctx.fillStyle = d.color === colorYellow ? `rgba(0, 87, 183, ${alpha * 0.3})` : `rgba(255, 215, 0, ${alpha * 0.3})`;
      ctx.fillRect(d.x + d.glitch, d.y - d.glitch, d.size, d.size);

      // --- QUADRATINO PRINCIPALE ---
      ctx.fillStyle = d.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      // Se il colore è esadecimale, lo gestiamo semplicemente così:
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.size, d.size);
      ctx.globalAlpha = 1;
      
      ctx.shadowBlur = 0;

      if (d.life >= d.maxLife) activeDots.splice(i, 1);
    }
    requestAnimationFrame(draw);
  }

  onMount(() => {
    // Recupera i colori reali dalle tue variabili CSS
    const style = getComputedStyle(document.documentElement);
    colorYellow = style.getPropertyValue('--hex-brand-yellow-500').trim() || '#ffd700';
    colorBlue = style.getPropertyValue('--hex-brand-blue-500').trim() || '#0057b7';

    ctx = canvas.getContext('2d');
    init();
    draw();

    const handleMouseMove = (e) => {
      // Calcoliamo la distanza percorsa dal mouse dall'ultimo punto creato
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      distAccumulator += distance;
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Crea un quadratino solo ogni 25 pixel di movimento
      if (distAccumulator > 25) {
        // E solo con una probabilità del 40% (per non fare una linea continua)
        if (Math.random() < 0.4) {
          addDot(e.clientX, e.clientY, true);
        }
        distAccumulator = 0; // Reset accumulatore
      }
    };    

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      for (let i = 0; i < Math.min(delta / 12, 4); i++) addDot(Math.random() * w, Math.random() * h);
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('resize', init);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
    };
  });

  function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
</script>

<div class="bg-fixed-container">
  <canvas bind:this={canvas} class="bg-grid"></canvas>
</div>

<style>
  .bg-fixed-container {
    position: fixed;
    inset: 0;
    background: var(--color-canvas, #fafafa);
    z-index: -1;
    pointer-events: none;
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* Multiply rende i colori gialli e blu molto "vibranti" sullo sfondo chiaro */
    mix-blend-mode: multiply;
    filter: saturate(1.2);
  }
</style>