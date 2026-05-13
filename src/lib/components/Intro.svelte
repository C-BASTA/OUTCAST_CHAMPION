<script>
  import { onMount } from 'svelte'
  import { introState } from '$lib/introState.svelte.js'

  const COLS = 40
  const ROWS = 25
  const total = COLS * ROWS
  const PHASE_SPLIT = 0.65      // 0→65% quadratini, 65→100% citazione
  const SCROLL_HEIGHT = 2500    // altezza sticky in px (quanto "spazio" di scroll)

  let canvas
  let wrapper
  let quoteOpacity = $state(0)
  let cellOrder = []

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

    // Quanto abbiamo scrollato dentro la sezione sticky (0→1)
    const scrolled = Math.max(0, Math.min(1, -rect.top / SCROLL_HEIGHT))

    if (scrolled <= PHASE_SPLIT) {
      draw(scrolled / PHASE_SPLIT)
      quoteOpacity = 0
    } else {
      draw(1)
      quoteOpacity = Math.min(1, (scrolled - PHASE_SPLIT) / (1 - PHASE_SPLIT))
    }
  }

  onMount(() => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    cellOrder = shuffle([...Array(total).keys()])
    draw(0)

    // Aggiorna ogni frame mentre si scrolla
    let rafId
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  })
</script>

<!--
  Il wrapper ha altezza = 100vh (sticky) + SCROLL_HEIGHT px di spazio scroll.
  Il canvas è sticky così rimane a schermo mentre si scrolla dentro il wrapper.
-->
<div class="intro-wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky-canvas">
    <canvas bind:this={canvas}></canvas>
    <div class="quote-overlay" style="opacity: {quoteOpacity}">
      <p class="quote">
        "Non è il trofeo che conta,<br>
        ma la strada che ti ha portato fin qui."
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
    .quote { max-width: 90%; }
  }
</style>