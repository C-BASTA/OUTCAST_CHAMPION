<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  gsap.registerPlugin(ScrollTrigger)

  let section
  let ctx

  onMount(() => {
    ctx = gsap.context(() => {
      const lines = section.querySelectorAll('.line, .quotes')

      gsap.fromTo(lines,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: section,
            start: 'top 40%',
            end: 'center center',
            scrub: 1,
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
    height: 130vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 10;
    padding: clamp(28px, 6vw, 76px);
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
    line-height: 1.02;
    letter-spacing: 0;
    will-change: transform, opacity;
    opacity: 0;
  }

  .quotes {
    display: block;
    font-family: 'GeistPixel-Square', monospace;
    font-size: clamp(60px, 11vw, 200px);
    color: #fafafa;
    line-height: 1;
    letter-spacing: 0.05em;
    opacity: 0;
    margin-bottom: clamp(-48px, -3.5vw, -24px);
  }

  .accent {
    display: inline-block;
    font-family: 'GeistPixel-Square';
    font-weight: 400;
    font-style: normal;
    line-height: 0.86;
    transform: translateY(-0.035em);
    color: var(--hex-brand-blue-500);
  }

  @media (max-width: 760px) {
    .frase-section {
      align-items: center;
      padding: 28px 20px;
    }

    blockquote {
      max-width: 100%;
      text-align: left;
    }

    .line {
      font-size: clamp(30px, 10.8vw, 58px);
      line-height: 1.03;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
