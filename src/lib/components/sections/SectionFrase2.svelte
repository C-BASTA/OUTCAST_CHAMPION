<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  

  // Registra il plugin in modo sicuro
  gsap.registerPlugin(ScrollTrigger)

  let section
  let ctx

  onMount(() => {
    ctx = gsap.context(() => {
      // Stesso effetto della prima citazione: reveal legato allo scroll (scrub),
      // non un'animazione a tempo one-shot.
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
            // Inizia a comparire prima: il reveal parte appena la sezione entra
            // dal basso (bordo alto all'80% della viewport). Alza il valore
            // (es. '90%') per anticiparla ancora, abbassalo per ritardarla.
            start: 'top 80%',
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
    /* Contenuto centrato (come la prima citazione) così lo scrub la rivela con
       lo stesso tempismo; altezza ridotta a 100vh per avvicinarla agli atleti
       (meno spazio vuoto sopra). Abbassa ancora per stringere di più. */
    height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    z-index: 10;
    padding: clamp(0px, 2.5vh, 24px) clamp(20px, 6vw, 76px) clamp(32px, 8vh, 72px);
    /* Stacco dal Regolamento sotto (desktop; il mobile ha il suo margin-bottom). */
    margin-bottom: 10vh;
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
    /* Stesso stile della prima citazione: sezione 90vh e blockquote alzato.
       Alzandola si avvicina anche alla sezione atleti che la precede. */
    .frase-section {
      align-items: center;
      min-height: auto;
      height: 80vh;
      padding: 28px 20px;
      /* Più stacco dal regolamento che segue */
      margin-bottom: clamp(96px, 26vh, 360px);
    }

    blockquote {
      max-width: 100%;
      text-align: left;
      transform: translateY(-40px);
    }

    .line {
      font-size: clamp(30px, 10.8vw, 40px);
      line-height: 1.2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
