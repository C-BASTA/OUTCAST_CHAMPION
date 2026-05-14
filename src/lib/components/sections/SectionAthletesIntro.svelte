<script>
  import { onMount } from 'svelte'

  const SCROLL_HEIGHT = 1400

  let wrapper = $state(null)
  let quoteTranslateY = $state(100) // vh: 100 = sotto schermo, 0 = in posizione, -100 = sopra

  const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t))

  onMount(() => {
    const onScroll = () => {
      if (!wrapper) return
      const rect     = wrapper.getBoundingClientRect()
      const total    = wrapper.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))

      // 0→0.35  : entra dal basso (100vh → 0)
      // 0.35→0.65: resta ferma
      // 0.65→1  : esce verso l'alto (0 → -100vh)
      if (progress < 0.35) {
        quoteTranslateY = lerp(100, 0, progress / 0.35)
      } else if (progress < 0.65) {
        quoteTranslateY = 0
      } else {
        quoteTranslateY = lerp(0, -100, (progress - 0.65) / 0.35)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<div class="wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky">
    <div class="quote-overlay" style:transform="translateY({quoteTranslateY}vh)">
      <p class="quote">
        I believe they deserve to be here today with me,<br>
        and also they deserve to be with me on competition day.
      </p>
    </div>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    background: #030404;
  }

  .sticky {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    z-index: 10;
    background: transparent;
    overflow: hidden;
  }

  .quote-overlay {
    width: 100%;
    padding-left: var(--padding-lateral, 80px);
    pointer-events: none;
    will-change: transform;
  }

  .quote {
    font-family: var(--font-primary);
    font-size: clamp(1.4rem, 2.8vw, 3rem);
    font-weight: 500;
    color: rgba(250, 250, 250, 0.92);
    line-height: 1.4;
    letter-spacing: -0.02em;
    max-width: 50%;
    margin: 0;
  }

  @media (max-width: 768px) {
    .quote {
      max-width: 90%;
      font-size: clamp(1.2rem, 5vw, 1.8rem);
    }
  }
</style>
