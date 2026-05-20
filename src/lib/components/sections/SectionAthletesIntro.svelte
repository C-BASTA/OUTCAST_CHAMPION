<script>
  import { onMount } from 'svelte'

  const SCROLL_HEIGHT = 2000

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
      <div class="quote-block quote-block--left">
        <p class="quote">
          I believe they deserve <br>to be here today <br>with me,
        </p>
      </div>

      <div class="quote-block quote-block--right" aria-hidden={quoteOpacity < 0.05 ? 'true' : 'false'}>
        <p class="quote quote--right">
          and also <br> they deserve <br>to be with me <br>on competition day.
        </p>
      </div>
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
    padding: 0 var(--padding-lateral, 80px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
    will-change: opacity, filter;
  }

  .quote-block {
    flex: 0 0 50%;
    max-width: 100%;
  }

  .quote-block--left {
    display: flex;
    justify-content: flex-start;
    transform: translateY(-60%);
  }

  .quote-block--right {
    display: flex;
    justify-content: flex-end;
    transform: translateY(50%);
  }

  .quote {
    font-family: var(--font-primary);
    font-size: clamp(4rem, 2.8vw, 3rem);
    font-weight: 500;
    color: rgba(250, 250, 250, 0.92);
    line-height: 1.4;
    letter-spacing: -0.02em;
    max-width: 100%;
    width: 100%;
    margin: 0;
    white-space: normal;
  }

  .quote--right {
    text-align: right;
  }

  @media (max-width: 1168px) {
    .quote-overlay {
      flex-direction: column;
      align-items: flex-start;
      padding: 0 var(--padding-lateral, 80px);
    }

    .quote-block {
      flex: 0 0 100%;
      max-width: 100%;
    }

    .quote {
      max-width: 90%;
      font-size: clamp(1.2rem, 5vw, 1.8rem);
      text-align: left;
    }

    .quote--right {
      text-align: left;
    }
  }
</style>
