<script>
  import { onMount } from 'svelte'

  const SCROLL_HEIGHT = 1400

  let wrapper = $state(null)
  let quoteOpacity = $state(0)

  onMount(() => {
    const onScroll = () => {
      if (!wrapper) return
      const rect     = wrapper.getBoundingClientRect()
      const total    = wrapper.offsetHeight - window.innerHeight
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      // Fade in rapido (0→1 nel primo 40% dello scroll)
      quoteOpacity = Math.min(1, progress / 0.4)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<div class="wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky">
    <div class="quote-overlay" style:opacity={quoteOpacity}>
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
    background: #030404;
  }

  .quote-overlay {
    width: 100%;
    padding-left: var(--padding-lateral, 80px);
    pointer-events: none;
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
