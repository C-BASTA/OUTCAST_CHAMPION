<script>
  import { onMount } from 'svelte'

  const COLS = 120
  const ROWS = 70
  const total = COLS * ROWS
  const PHASE_SPLIT = 0.65
  const SCROLL_HEIGHT = 3500
  const EXTRA_SCROLL = 1000  // spazio extra dopo la citazione (blocco meccanico)

  let canvas
  let wrapper
  let quoteOpacity = $state(0)
  let cellOrder = []
  let hasReleased = $state(false)

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function draw(progress) {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    const cellW = w / COLS
    const cellH = h / ROWS

    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, w, h)

    const count = Math.floor(progress * total)
    for (let i = 0; i < count; i++) {
      const idx = cellOrder[i]
      const col = idx % COLS
      const row = Math.floor(idx / COLS)
      ctx.fillStyle = '#030404'
      ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1)
    }
  }

  function update() {
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const totalHeight = SCROLL_HEIGHT + EXTRA_SCROLL
    const scrolled = Math.max(0, Math.min(1, -rect.top / totalHeight))

    if (scrolled <= (SCROLL_HEIGHT / totalHeight)) {
      // Fase quadratini
      const blockProgress = scrolled / (SCROLL_HEIGHT / totalHeight)
      draw(blockProgress / PHASE_SPLIT)
      quoteOpacity = 0
    } else {
      // Fase citazione
      draw(1)
      quoteOpacity = 1
      
      // Rilascia quando l'utente ha scrollato l'extra
      if (scrolled >= 0.95 && !hasReleased) {
        hasReleased = true
        // Sblocca naturalmente, niente animazioni invasive
      }
    }
  }

  onMount(() => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    cellOrder = shuffle([...Array(total).keys()])
    draw(0)

    let rafId
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    
    function onResize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      update()
    }
    window.addEventListener('resize', onResize)
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  })
</script>

<!-- L'altezza include l'extra scroll meccanico -->
<div class="intro-wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT + EXTRA_SCROLL}px)">
  <div class="sticky-canvas">
    <canvas bind:this={canvas}></canvas>
    
    <!-- Solo la citazione, niente bottoni, niente messaggi -->
    <div class="quote-overlay" style="opacity: {quoteOpacity}">
      <p class="quote">
        I believe they deserve to be here today with me,<br> and also they deserve to be with me on competition day.
      </p>
    </div>
  </div>
</div>

<style>
  .intro-wrapper {
    position: relative;
    width: 100%;
  }

  .sticky-canvas {
    position: sticky;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .quote-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-left: var(--padding-lateral);
    pointer-events: none;
    transition: opacity 0.3s ease-out;
  }

  .quote {
    font-family: var(--font-primary);
    font-size: var(--font-size-h2);
    font-weight: 500;
    color: var(--color-ink);
    line-height: 1.4;
    letter-spacing: -0.02em;
    max-width: 50%;
  }

  @media (max-width: 768px) {
    .quote { 
      max-width: 90%;
    }
  }
</style>