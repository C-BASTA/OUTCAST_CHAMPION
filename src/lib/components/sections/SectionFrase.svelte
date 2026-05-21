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
    const lines = section.querySelectorAll('.line');

    gsap.fromTo(lines, 
      { 
        opacity: 0,
        y: 60 
      }, 
      {
        opacity: 1,
        y: 0, 
        duration: 1,
        ease: "power2.out",
        stagger: 0.12, 
        scrollTrigger: {
          trigger: section,
          start: "top center", 
          end: "bottom center", // Definisce anche il punto di uscita inferiore
          invalidateOnRefresh: true,
          toggleActions: "play reverse play reverse", // <-- MODIFICATO QUI: l'animazione ora va avanti e indietro all'infinito
          markers: false 
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
    <span class="line">
      For me, the <strong class="accent accent-sacrifice">sacrifice</strong>
    </span>
    <span class="line">of the people depicted </span>
    <span class="line">on this helmet weighs </span>
    <span class="line">
       more than any <strong class="accent accent-sacrifice">medal</strong>
    </span>
    <span class="line">because they gave</span>
     <span class="line">the most precious thing</span>
    <span class="line">
      they had: <strong class="accent accent-sacrifice">their lives.</strong>
    </span>
  </blockquote>
</section>

<style>
  .frase-section {
    position: relative;
    width: 100%;
    height: 80vh;
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
    gap: clamp(3px, 0.45vw, 8px);
    max-width: min(1180px, 92vw);
  }

  .line {
    display: block;
    font-family: var(--font-primary);
    font-size: clamp(30px, 4.85vw, 76px);
    font-weight: 400;
    color: var(--color-dark);
    line-height: 1.02;
    letter-spacing: 0;
    will-change: transform, opacity; /* Ottimizza le performance di rendering */
    opacity: 0;
    
  }

  .accent {
    display: inline-block;
    font-family: var(--font-third);
    font-weight: 900;
    font-style: normal;
    line-height: 0.86;
    transform: translateY(-0.035em);
  }

  .accent-sacrifice {
    color: var(--hex-brand-blue-700);
  }

  .accent-medal {
    color: var(--hex-brand-blue-500);
  }

  .accent-lives {
    color: var(--hex-brand-blue-300);
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