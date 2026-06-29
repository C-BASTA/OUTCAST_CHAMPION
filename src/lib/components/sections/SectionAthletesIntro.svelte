<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  

  gsap.registerPlugin(ScrollTrigger);

  const SCROLL_HEIGHT = 900

  let wrapper
  let ctx

  onMount(() => {
    // Usiamo gsap.context per isolare le animazioni in Svelte
    ctx = gsap.context(() => {
      const lines = wrapper.querySelectorAll('.quotes, .line');

      // Creiamo una Timeline legata allo scroll della sezione sticky
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',      // Parte quando il wrapper tocca la cima dello schermo
          end: 'bottom bottom',  // Finisce quando abbiamo consumato i 1400px di scroll
          scrub: 1,              // Lega l'animazione millimetricamente alla rotellina
          invalidateOnRefresh: true
        }
      });

      // 1. FASE DI ENTRATA: Le righe compaiono a cascata dal basso verso l'alto
      tl.fromTo(lines, 
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, ease: "power2.out", stagger: 0.15, duration: 1 }
      );

      // 2. FASE DI STASI: Un piccolo spazio vuoto nella timeline mantiene il testo visibile mentre si scrolla
      tl.to({}, { duration: 1.5 }); 

      // 3. FASE DI USCITA: Le righe svaniscono e continuano a salire verso l'alto
      tl.to(lines, 
        { opacity: 0, y: -60, ease: "power2.in", stagger: 0.1, duration: 1 }
      );

    }, wrapper);

    return () => {
      if (ctx) ctx.revert();
    }
  })

  onDestroy(() => {
    if (ctx) ctx.revert();
  });
</script>
<div class="wrapper" bind:this={wrapper} style="height: calc(100vh + {SCROLL_HEIGHT}px)">
  <div class="sticky">
    <div class="quote-overlay">
      <p class="quote">
        <span class="quotes">&ldquo;</span>
        <span class="line">I believe they deserve</span>
        <span class="line">to be here today with me</span>
        <span class="line">and also they deserve</span>
        <span class="line">to be with me</span>
        <span class="line">on competition day.</span>
      </p>
    </div>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
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
    
  }

  .quote {
    font-family: var(--font-primary);
    font-size: clamp(1.4rem, 2.8vw, 3rem);
    font-weight: 500;
    color: var(--color-canvas)
    letter-spacing: -0.02em;
    width: fit-content;
    max-width: 50%;
    display: flex;
    flex-direction: column;
    gap: 0;
    
  }

  .line {
    display: block;
    will-change: transform, opacity;
    /* Evita il flash iniziale nascondendo le righe nel CSS prima dell'avvio di GSAP */
    opacity: 0;
  }

  .quotes {
    display: block;
    
    font-family: 'GeistPixel-Square', monospace;
    font-size: clamp(60px, 11vw, 200px);
    letter-spacing: 0.05em;
    will-change: transform, opacity;
    opacity: 0;
    margin-bottom: -0.4em;
  text-align: left;
   
    display: flex;
    flex-direction: column;
   
  }

  @media (max-width: 768px) {
    .quote {
      max-width: 90%;
      font-size: clamp(1.2rem, 5vw, 1.8rem);
    }
    
    .quote-overlay {
      padding-left: 20px; /* Ottimizzazione padding per mobile */
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .line {
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>