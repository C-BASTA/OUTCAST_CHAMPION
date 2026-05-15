<script>
  import { onMount } from 'svelte'

  const SCROLL_HEIGHT = 1400

  let wrapper = $state(null)
  let quoteOpacity = $state(0)
  let quoteBlur = $state(10)

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
  const lerp = (a, b, t) => a + (b - a) * t

  onMount(() => {
    const onScroll = () => {
      if (!wrapper) return
      const rect     = wrapper.getBoundingClientRect()
      const total    = wrapper.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))

      // 0→0.34  : emerge lentamente in posizione
      // 0.34→0.56: resta piena
      // 0.56→0.92: si dissolve lentamente in posizione
      if (progress < 0.34) {
        const t = ease(clamp(progress / 0.34, 0, 1))
        quoteOpacity = t
        quoteBlur = lerp(10, 0, t)
      } else if (progress < 0.56) {
        quoteOpacity = 1
        quoteBlur = 0
      } else {
        const t = ease(clamp((progress - 0.56) / 0.36, 0, 1))
        quoteOpacity = 1 - t
        quoteBlur = lerp(0, 10, t)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<div class="wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky">
    <div
      class="quote-overlay"
      style:opacity={quoteOpacity}
      style:filter="blur({quoteBlur}px)"
      aria-hidden={quoteOpacity < 0.05 ? 'true' : 'false'}
    >
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
    will-change: opacity, filter;
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
