<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  

  // Registra il plugin in modo sicuro
  gsap.registerPlugin(ScrollTrigger);

  let section
  let ctx

  onMount(() => {
  ctx = gsap.context(() => {
    const lines = section.querySelectorAll('.line, .quotes');

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
    );
  }, section);

  return () => {
    if (ctx) ctx.revert();
  }
})

  onDestroy(() => {
    if (ctx) ctx.revert();
  });
</script>

<section bind:this={section} class="frase-section">
  <blockquote>
    <span class="quotes">&ldquo;</span>
    <span class="line">
      For me, the <strong class="accent accent-sacrifice">sacrifice</strong> of
    </span>
    <span class="line">the people depicted on </span>
    <span class="line"> this helmet weighs more </span>
    <span class="line">
        than any <span class="nowrap"><strong class="accent accent-sacrifice">medal</strong>,</span> because
    </span>
    <span class="line"> they gave the most</span>
     <span class="line"> precious thing they had:</span>
    <span class="line">
      <strong class="accent accent-sacrifice">their lives</strong>.
    </span>
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
    z-index: 1;
    padding: clamp(28px, 6vw, 76px);
    background-color: transparent; /* Si adatta allo sfondo della tua pagina */
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
    color: var(--color-dark);
    letter-spacing: 0;
    will-change: transform, opacity; /* Ottimizza le performance di rendering */
    opacity: 0;
    
  }

  .quotes {
    display: block;
    font-family: 'GeistPixel-Square', monospace;
    font-size: clamp(60px, 11vw, 200px);
    color: var(--color-dark);
    letter-spacing: 0.05em;
    opacity: 0;
    margin-bottom: clamp(-48px, -3.5vw, -24px);
  }

  .nowrap {
    white-space: nowrap;
  }

  .accent {
    display: inline-block;
    font-family: 'GeistPixel-Square';
    font-weight: 400;
    font-style: normal;
    transform: translateY(-0.035em);
  }

  .accent-sacrifice {
    color: var(--hex-brand-blue-500);
  }

  .accent-medal {
    color: var(--hex-brand-blue-500);
  }

  .accent-lives {
    color: var(--hex-brand-blue-500);
  }

  @media (max-width: 760px) {
    .frase-section {
      align-items: center;
      /* Meno spazio vuoto sopra/sotto la citazione: sezione più bassa che
         su desktop (130vh → 90vh). Abbassa ancora questo valore per stringere. */
      height: 110vh;
      /* Stacco dalla biografia che segue: aumenta per distanziarla di più. */
      margin-bottom: 8vh;
      padding: 28px 20px;
    }

    blockquote {
      max-width: 100%;
      text-align: left;
      /* Alza la citazione lasciando più spazio sotto (resta centrata, poi
         spostata su). Aumenta questo valore per alzarla ancora di più. */
      transform: translateY(-40px);
    }

    .line {
      font-size: clamp(40px, 6.8vw, 28px);
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