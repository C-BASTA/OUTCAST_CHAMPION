<script>
  import { onMount } from 'svelte'

  // Variabili CSS
  let paddingLateral = $state(80);
  let paddingTopMain = $state(80);
  
  // Parametri di sistema
  let progress = $state(0);
  let section = $state();
  let vpW = $state(1440);
  let isMobile = $state(false);
  
  // Riferimento base
  const REFERENCE_WIDTH = 1440;
  const MOBILE_BREAKPOINT = 768;
  let scaleFactor = $derived(isMobile ? 1 : vpW / REFERENCE_WIDTH);

  // Dati originali (solo per reference, usati nelle due versioni)
  const CARDS_DATA = [
    { boldPart: '1999', rest: ' - Born in Kyiv', img: '/images/atleti/bio-kyiv.png', imgW: 350, imgH: 220 },
    { noTitle: true, img: '/images/atleti/bio-2016-prep.png', imgW: 200, imgH: 250 },
    { boldPart: '2016', rest: ' - Youth Olympics', img: '/images/atleti/bio-youthOlympics.jpg', imgW: 350, imgH: 220 },
    { boldPart: '2017', rest: ' - World Championship', img: '/images/atleti/bio-2017-wc.jpg', imgW: 480, imgH: 350 },
    { boldPart: '2018', rest: ' - PyeongChang Olympics', img: '/images/atleti/bio-2018-pyeongchang.png', imgW: 350, imgH: 196 },
    { boldPart: '2019', rest: ' - World Championships', img: '/images/atleti/bio-wc2019.jpg', imgW: 370, imgH: 600 },
    { noTitle: true, img: '/images/atleti/bio-portrait-helmet.png', imgW: 250, imgH: 247 },
    { boldPart: '2022', rest: ' - Beijing Olympics', img: '/images/atleti/2022olympics.avif', imgW: 500, imgH: 400 },
    { boldPart: '2024', rest: ' - World Championships', img: '/images/atleti/bio-2024-worlds.png', imgW: 370, imgH: 257 },
    { noTitle: true, img: '/images/atleti/bio-mic.png', imgW: 240, imgH: 243 },
    { boldPart: '2026', rest: ' - Milan Cortina Olympics', img: '/images/atleti/bio-2026-olympic.png', imgW: 340, imgH: 240 },
  ];

  const QUOTES_DATA = [
    { text: "First Ukrainian athlete in World Skeleton Championships" },
    { text: "Heraskevych Foundation's founder" },
    { text: "Some things are more important than sports" }
  ];

  // Versione ORIZZONTALE (desktop)
  let horizontalCards = $derived(isMobile ? [] : CARDS_DATA.map((card, i) => {
    let x;
    if (i === 0) x = paddingLateral;
    else if (i === 1) x = 650 * scaleFactor;
    else if (i === 2) x = (paddingLateral + 70) * scaleFactor;
    else if (i === 3) x = 1050 * scaleFactor;
    else if (i === 4) x = 1700 * scaleFactor;
    else if (i === 5) x = 2300 * scaleFactor;
    else if (i === 6) x = 1650 * scaleFactor;
    else if (i === 7) x = 2900 * scaleFactor;
    else if (i === 8) x = 3600 * scaleFactor;
    else if (i === 9) x = 3780 * scaleFactor;
    else x = 4180 * scaleFactor;
    
    // Top positioning (alcune card hanno top specifico)
    let top;
    if (i === 0) top = paddingTopMain;
    else if (i === 1) top = 370;
    else if (i === 2) top = 430;
    else if (i === 3) top = 200;
    else if (i === 4) top = 450;
    else if (i === 5) top = 80;
    else if (i === 6) top = 90;
    else if (i === 7) top = 180;
    else if (i === 8) top = 80;
    else if (i === 9) top = 440;
    else top = 200;
    
    return { ...card, x, top };
  }));

  let horizontalQuotes = $derived(isMobile ? [] : QUOTES_DATA.map((quote, i) => {
    let x;
    let top;
    if (i === 0) { x = 650 * scaleFactor; top = 70; }
    else if (i === 1) { x = 1950 * scaleFactor; top = 85; }
    else { x = 3500 * scaleFactor; top = 515; }
    return { ...quote, x, top };
  }));

  // Versione VERTICALE (mobile)
  let verticalCards = $derived(isMobile ? CARDS_DATA : []);
  let verticalQuotes = $derived(isMobile ? QUOTES_DATA : []);

  let lastCardX = $derived(isMobile ? 0 : Math.max(...horizontalCards.map(c => c.x + (c.imgW || 0))));
  let trackWidth = $derived(isMobile ? 0 : lastCardX + paddingLateral);
  let offsetX = $derived(isMobile ? 0 : progress * Math.max(0, trackWidth - vpW));

  // Altezza sezione (diversa per mobile/desktop)
  let sectionHeight = $derived(isMobile ? 'auto' : `calc(100vh + ${trackWidth - vpW}px)`);

  onMount(() => {
    const style = getComputedStyle(document.documentElement);
    paddingLateral = parseInt(style.getPropertyValue('--padding-lateral')) || 80;
    paddingTopMain = parseInt(style.getPropertyValue('--padding-top-main')) || 80;

    const checkMobile = () => {
      isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      vpW = window.innerWidth;
    };

    const measure = () => {
      vpW = window.innerWidth;
      checkMobile();
    };

    const onScroll = () => {
      if (!section || isMobile) return;
      const rect = section.getBoundingClientRect();
      const totalScrollable = section.offsetHeight - window.innerHeight;
      const current = -rect.top;
      progress = Math.max(0, Math.min(1, current / totalScrollable));
    };

    checkMobile();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  });

  function getParallax(cardX) {
    if (isMobile) return 0;
    const cardRelativeX = cardX - offsetX;
    const centerPoint = (cardRelativeX + 150) / vpW;
    const clamped = Math.max(-1, Math.min(1, (centerPoint * 2) - 1));
    return -clamped * 70; 
  }
</script>

<!-- Desktop Layout (orizzontale) -->
{#if !isMobile}
  <section 
    bind:this={section} 
    class="bio-section bio-section--horizontal" 
    style:height="{sectionHeight}"
  >
    <div class="grain-overlay"></div>
    <div class="sticky-wrap">
      <div 
        class="cards-track" 
        style:width="{trackWidth}px" 
        style:transform="translateX(-{offsetX}px)"
      >
        {#each horizontalCards as card}
          <div class="card" style:left="{card.x}px" style:top="{card.top}px">
            {#if !card.noTitle}
              <p class="caption"><strong>{card.boldPart}</strong>{card.rest}</p>
            {/if}
            <div class="img-frame" style:width="{card.imgW}px" style:height="{card.imgH}px">
              <img src={card.img} alt="" class="parallax-img" 
                   style:transform="translateX({getParallax(card.x)}px)" />
            </div>
          </div>
        {/each}

        {#each horizontalQuotes as quote}
          <div class="quote-block" style:left="{quote.x}px" style:top="{quote.top}px">
            <span class="quote-text">{quote.text}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- Mobile Layout (verticale) -->
{#if isMobile}
  <section class="bio-section bio-section--vertical">
    <div class="grain-overlay"></div>
    <div class="vertical-container">
      {#each verticalCards as card, i}
        <div class="vertical-card" style:animation-delay="{i * 0.05}s">
          {#if !card.noTitle}
            <p class="vertical-caption">
              <strong>{card.boldPart}</strong>{card.rest}
            </p>
          {/if}
          <div class="vertical-img-frame" style:aspect-ratio="{card.imgW}/{card.imgH}">
            <img src={card.img} alt="" class="vertical-img" loading="lazy" />
          </div>
        </div>
        
        <!-- Mostra quote tra le card -->
        {#if verticalQuotes[i]}
          <div class="vertical-quote">
            <span class="vertical-quote-text">"{verticalQuotes[i].text}"</span>
          </div>
        {/if}
      {/each}
    </div>
  </section>
{/if}

<style>
  /* Desktop styles (orizzontale) */
  .bio-section--horizontal {
    position: relative;
    background: #fafafa;
    width: 100%;
  }

  /*.grain-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    opacity: 0.2;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }*/

  .sticky-wrap {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }

  .cards-track {
    position: absolute;
    top: 0;
    height: 100vh;
    will-change: transform;
  }

  .card {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .img-frame {
    position: relative;
    overflow: hidden;
    background: #eee;
  }

  .parallax-img {
    width: 140%;
    height: 100%;
    position: absolute;
    left: -20%;
    object-fit: cover;
    will-change: transform;
  }

  .caption {
    font-size: 1rem;
    color: #030404;
    line-height: 1.45;
  }

  .quote-block {
    position: absolute;
    max-width: 280px;
  }

  .quote-text {
    font-family: var(--font-primary, serif);
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.1;
    color: #1a1a1a;
  }

  /* ========== MOBILE STYLES (verticale) ========== */
  .bio-section--vertical {
    background: #fafafa;
    padding: 80px 24px 120px;
    min-height: 100vh;
  }

  .vertical-container {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 60px;
  }

  .vertical-card {
    animation: fadeInUp 0.6s ease both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .vertical-caption {
    font-size: 1rem;
    color: #030404;
    line-height: 1.45;
    margin-bottom: 8px;
    font-family: var(--font-secondary, sans-serif);
  }

  .vertical-caption strong {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .vertical-img-frame {
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: #eee;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .vertical-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .vertical-quote {
    margin: 20px 0 10px;
    padding: 0 16px;
    border-left: 3px solid #030404;
  }

  .vertical-quote-text {
    font-family: var(--font-primary, serif);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    color: #1a1a1a;
    font-style: italic;
  }

  /* Tablet (opzionale: mantieni orizzontale ma più compatto) */
  @media (max-width: 1024px) and (min-width: 769px) {
    .quote-text {
      font-size: 1.8rem;
    }
    
    .caption {
      font-size: 0.9rem;
    }
  }
</style>