<script>
  import { onMount } from 'svelte'

  const CARDS = [
    {
      x: 100,  top: 80,
      boldPart: '1999', rest: ' - Born in Kyiv',
      img: '/images/atleti/bio-kyiv.png',
      imgW: 310, imgH: 212,
    },
    {
      x: 700,  top: 70,
      noTitle: true,
      img: '/images/atleti/bio-2016-prep.png',
      imgW: 150, imgH: 200,
    },
    {
      x: 350, top: 430,
      boldPart: '2016', rest: ' - Youth Olympics',
      img: '/images/atleti/bio-2016-race.png',
      imgW: 380, imgH: 270,
    },
    {
      x: 950, top: 200,
      boldPart: '2017', rest: ' - World Championship',
      img: '/images/atleti/bio-2017-worlds.png',
      imgW: 480, imgH: 350,
    },
    {
      x: 1990, top: 450,
      boldPart: '2018', rest: ' - PyeongChang Olympics',
      img: '/images/atleti/bio-2018-pyeongchang.png',
      imgW: 350, imgH: 196,
    },
    {
      x: 2300, top: 75,
      boldPart: '2019', rest: ' - World Championships',
      img: '/images/atleti/bio-2019-worlds.png',
      imgW: 370, imgH: 277,
    },
    {
      x: 1650, top: 90,
      noTitle: true,
      img: '/images/atleti/bio-portrait-helmet.png',
      imgW: 250, imgH: 247,
    },
    {
      x: 3600, top: 80,
      boldPart: '2024', rest: ' - World Championships',
      img: '/images/atleti/bio-2024-worlds.png',
      imgW: 370, imgH: 257,
    },
    {
      x: 3780, top: 440,
      noTitle: true,
      img: '/images/atleti/bio-mic.png',
      imgW: 240, imgH: 243,
    },
    {
      x: 4180, top: 200,
      boldPart: '2026', rest: ' - Milan Cortina Olympics',
      img: '/images/atleti/bio-2026-olympic.png',
      imgW: 340, imgH: 240,
    },
    {
      x: 2900, top: 180,
      boldPart: '2022', rest: ' - Beijing Olympics',
      img: '/images/atleti/2022olympics.avif',
      imgW: 500, imgH: 400,
    },
  ]

  const TRACK_WIDTH = 4900
  let progress = $state(0)
  let section
  let sectionTop = 0
  let sectionH = 0
  let vpW = typeof window !== 'undefined' ? window.innerWidth : 1440
  
  // Riferimenti agli elementi delle card
  let cardRefs = $state({})

  onMount(() => {
    const measure = () => {
      if (!section) return
      const rect = section.getBoundingClientRect()
      sectionTop = rect.top + window.scrollY
      sectionH = section.offsetHeight
      vpW = window.innerWidth
    }
    
    const onScroll = () => {
      const raw = (window.scrollY - sectionTop) / (sectionH - window.innerHeight)
      progress = Math.max(0, Math.min(1, raw))
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    measure()
    onScroll()
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  })

  let offsetX = $derived(progress * Math.max(0, TRACK_WIDTH - vpW))
  
  // Calcola il parallasse per ogni card in base alla sua visibilità
  const PARALLAX_INTENSITY = 60; 

  function getParallaxAmount(cardX) {
    if (typeof window === 'undefined') return 0;

    // 1. Posizione della card relativa al viewport (0 = inizio schermo, vpW = fine schermo)
    const cardRelativeX = cardX - offsetX;
    
    // 2. Normalizziamo la posizione: 
    // -1 quando la card è appena uscita a sinistra
    // 0 quando è perfettamente al centro
    // 1 quando sta entrando da destra
    const centerPoint = (cardRelativeX + 100) / vpW; // 150 è circa metà larghezza card
    const normalized = (centerPoint * 2) - 1;

    // 3. Limitiamo il valore tra -1 e 1 per evitare drift eccessivi
    const clamped = Math.max(-1, Math.min(1, normalized));

    // Restituiamo lo spostamento in pixel (invertito per l'effetto parallasse)
    return -clamped * PARALLAX_INTENSITY;
  }
</script>

<section bind:this={section} class="bio-section" id="athlete-bio">
  <div class="sticky-wrap">
    <div class="cards-track" style:transform="translateX(-{offsetX}px)">
      {#each CARDS as card, i}
        <div 
          class="card" 
          style:left="{card.x}px" 
          style:top="{card.top}px"
        >
          {#if !card.noTitle}
            <p class="caption">
              <strong>{card.boldPart}</strong>{card.rest}
            </p>
          {/if}
          
          <div class="img-frame" style:width="{card.imgW}px" style:height="{card.imgH}px">
            <img
              src={card.img}
              alt={card.boldPart ?? ''}
              class="parallax-img"
              style:transform="translateX({getParallaxAmount(card.x)}px)"
            />
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .bio-section {
    height: calc(100vh + 3800px);
    background: #fafafa;
    position: relative;
  }

  .sticky-wrap {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: #fafafa;
  }

  .cards-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 4900px;
    height: 100vh;
    will-change: transform;
  }

  .card {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .caption {
    font-family: var(--font-secondary);
    font-size: 1rem;
    color: #030404;
    line-height: 1.45;
    max-width: 380px;
  }

  .caption strong {
    font-weight: 700;
  }

  .img-frame {
    position: relative;
    overflow: hidden;
    /* Opzionale: aggiungi un leggero zoom per sicurezza */
  }

  .parallax-img {
    /* L'immagine deve uscire dai bordi della maschera */
    width: 140%; 
    height: 110%;
    position: absolute;
    top: -5%;
    left: -20%; /* Centra l'immagine 140% rispetto al frame */
    
    object-fit: cover;
    display: block;
    will-change: transform;
    /* Rimuovi la transition per reattività massima */
    transition: none; 
  }

</style>