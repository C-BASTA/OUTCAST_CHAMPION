<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  

  let section
  let ctx

  onMount(() => {
    ctx = gsap.context(() => {
      const lines = section.querySelectorAll('.line')
      const quote = section.querySelector('blockquote')

      gsap.fromTo(lines,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 0.7,
          stagger: 0.15,
          scrollTrigger: {
            trigger: quote,
            start: 'top 96%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          }
        }
      )
    }, section)

    return () => { if (ctx) ctx.revert() }
  })

  onDestroy(() => { if (ctx) ctx.revert() })
</script>

<section bind:this={section} class="frase-section">
  <blockquote>
    <span class="line">Sport demands neutrality</span>
    <span class="line">from the people it cannot</span>
    <span class="line">afford to silence.</span>
    <span class="line">He refused to be neutral.</span>
    <span class="line">The institution called it</span>
    <span class="line">a violation. History might</span>
    <span class="line">call it the only honest</span>
    <span class="line">thing that happened that year.</span>
  </blockquote>
</section>

<style>
  .frase-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow: visible;
    z-index: 10;
    padding: clamp(0px, 2.5vh, 24px) clamp(20px, 6vw, 76px) clamp(32px, 8vh, 72px);
    background-color: transparent;
  }

  blockquote {
    text-align: center;
    quotes: none;
    display: flex;
    flex-direction: column;
    gap: clamp(1px, 0.2vw, 3px);
    max-width: min(1180px, 92vw);
  }

  .line {
    display: block;
    font-family: var(--font-primary);
    font-size: clamp(30px, 4.85vw, 76px);
    font-weight: 400;
    color: #fafafa;
    letter-spacing: 0;
    will-change: transform, opacity;
    opacity: 0;
    user-select: text;
  }

  .line::selection {
    background: #FAFAFA;
    color: #030404;
  }

  @media (max-width: 760px) {
    .frase-section {
      align-items: center;
      padding: 28px 20px;
      margin-bottom: clamp(56px, 20vh, 300px);
    }

    blockquote {
      max-width: 100%;
      text-align: left;
    }

    .line {
      font-size: clamp(30px, 10.8vw, 40px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
