<script>
  import { onMount } from 'svelte'
  import { introState } from '$lib/introState.svelte.js'

  let { onDone } = $props()

  let canvas
  let quoteOpacity = $state(0)

  const COLS = 40
  const ROWS = 25
  const total = COLS * ROWS
  const SCROLL_MAX = 3000
  const PHASE_SPLIT = 0.65
  const DONE_THRESHOLD = 0.92

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
    const t = introState.scrolled / SCROLL_MAX

    if (t <= PHASE_SPLIT) {
      draw(t / PHASE_SPLIT)
      quoteOpacity = 0
    } else {
      draw(1)
      const quoteProgress = (t - PHASE_SPLIT) / (DONE_THRESHOLD - PHASE_SPLIT)
      quoteOpacity = Math.min(1, quoteProgress)
    }
  }

  let doneFired = false

  function onwheel(e) {
    e.preventDefault()
    const prev = introState.scrolled
    introState.scrolled = Math.max(0, Math.min(SCROLL_MAX, introState.scrolled + e.deltaY))

    const t = introState.scrolled / SCROLL_MAX
    const tPrev = prev / SCROLL_MAX

    if (t >= DONE_THRESHOLD && tPrev < DONE_THRESHOLD && !doneFired) {
      doneFired = true
      setTimeout(onDone, 400)
      return
    }

    update()
  }

  let touchStartY = 0
  let lastTouchY = 0

  function ontouchstart(e) {
    touchStartY = e.touches[0].clientY
    lastTouchY  = e.touches[0].clientY
  }

  function ontouchmove(e) {
    e.preventDefault()
    const delta = lastTouchY - e.touches[0].clientY
    lastTouchY = e.touches[0].clientY
    onwheel({ preventDefault: () => {}, deltaY: delta * 3 })
  }

  onMount(() => {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    cellOrder = shuffle([...Array(total).keys()])
    // Ripristina lo stato visivo se si torna indietro
    update()
  })
</script>

<div
  class="wrapper"
  on:wheel={onwheel}
  on:touchstart={ontouchstart}
  on:touchmove={ontouchmove}
  role="presentation"
>
  <canvas bind:this={canvas}></canvas>

  <div class="quote-overlay" style="opacity: {quoteOpacity}">
    <p class="quote">
      I believe they deserve to be here today with me,<br> and also they deserve to be with me on competition day.
    </p>
    <span class="hint">scroll per continuare</span>
  </div>
</div>

<style>
  .wrapper {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }

  .quote-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding-left: var(--padding-lateral);
    gap: var(--size-6);
    pointer-events: none;
    transition: opacity 0.1s linear;
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

  .hint {
    font-family: var(--font-primary);
    font-size: var(--size-3);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-ink-secondary);
    animation: blink 2s ease infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  @media (max-width: 768px) {
    .quote {
      max-width: 100%;
      padding-right: var(--padding-lateral);
    }
  }
</style>