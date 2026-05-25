<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  const SCROLL_HEIGHT = 1400

  let wrapper = $state(null)
  let quoteOpacity = $state(0)

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2

  onMount(() => {
    const proxy = { v: 0 }
    const scrollTween = gsap.to(proxy, {
      v: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      }
    })

    const tickerFn = () => {
      const progress = proxy.v
      if (progress < 0.34) {
        quoteOpacity = ease(clamp(progress / 0.34, 0, 1))
      } else if (progress < 0.56) {
        quoteOpacity = 1
      } else {
        quoteOpacity = 1 - ease(clamp((progress - 0.56) / 0.36, 0, 1))
      }
    }
    gsap.ticker.add(tickerFn)

    return () => {
      scrollTween.scrollTrigger?.kill()
      scrollTween.kill()
      gsap.ticker.remove(tickerFn)
    }
  })
</script>

<div class="wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky">
    <div
      class="quote-overlay"
      style:opacity={quoteOpacity}
      aria-hidden={quoteOpacity < 0.05 ? 'true' : 'false'}
    >
      <p class="quote">
        I believe they deserve to be here today with me, and also they deserve to be with me on competition day.
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
    will-change: opacity;
  }

  .quote {
    font-family: var(--font-primary);
    font-size: clamp(1.4rem, 2.8vw, 3rem);
    font-weight: 500;
    color: var(--color-canvas);
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
