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
      img: '/images/atleti/bio-youthOlympics.jpg',
      imgW: 380, imgH: 270,
    },
    {
      x: 950, top: 200,
      boldPart: '2017', rest: ' - World Championship',
      img: '/images/atleti/bio-2017-wc.jpg',
      imgW: 480, imgH: 350,
    },
    {
      x: 1700, top: 450,
      boldPart: '2018', rest: ' - PyeongChang Olympics',
      img: '/images/atleti/bio-2018-pyeongchang.png',
      imgW: 350, imgH: 196,
    },
    {
      x: 2300, top: 45,
      boldPart: '2019', rest: ' - World Championships',
      img: '/images/atleti/bio-wc2019.jpg',
      imgW: 370, imgH: 600,
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

  const QUOTES = [
    { x: 1950, top: 85, text: "In 2022 founded the Heraskevych foundation", author: "" },
    { x: 3500, top: 515, text: "Some things are more important than sports", author: "" }
  ];

const TRACK_WIDTH = 4900
  let progress = $state(0)
  let section, sectionTop = 0, sectionH = 0
  let vpW = typeof window !== 'undefined' ? window.innerWidth : 1440
  
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
    measure(); onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  })

  let offsetX = $derived(progress * Math.max(0, TRACK_WIDTH - vpW))
  const PARALLAX_INTENSITY = 70; 

  function getParallaxAmount(cardX) {
    if (typeof window === 'undefined') return 0;
    const cardRelativeX = cardX - offsetX;
    const centerPoint = (cardRelativeX + 150) / vpW; 
    const clamped = Math.max(-1, Math.min(1, (centerPoint * 2) - 1));
    return -clamped * PARALLAX_INTENSITY;
  }
</script>

<section bind:this={section} class="bio-section">
  <!-- Overlay Grana -->
  <div class="grain-overlay"></div>

  <div class="sticky-wrap">
    <div class="cards-track" style:transform="translateX(-{offsetX}px)">
      
      <!-- Rendering Cards -->
      {#each CARDS as card}
        <div class="card" style:left="{card.x}px" style:top="{card.top}px">
          {#if !card.noTitle}
            <p class="caption"><strong>{card.boldPart}</strong>{card.rest}</p>
          {/if}
          <div class="img-frame" style:width="{card.imgW}px" style:height="{card.imgH}px">
            <img src={card.img} alt="" class="parallax-img" 
                 style:transform="translateX({getParallaxAmount(card.x)}px)" />
          </div>
        </div>
      {/each}

      <!-- Rendering Quotes -->
      {#each QUOTES as quote}
        <div class="quote-block" style:left="{quote.x}px" style:top="{quote.top}px">
          <span class="quote-text">{quote.text}</span>
          <span class="quote-author">{quote.author}</span>
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

  /* EFFETTO GRAIN SHADER */
  /*.grain-overlay {
    position: absolute;
    inset: 0;
    z-index: 0;
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
    top: 0; left: 0;
    width: 4900px;
    height: 100vh;
    will-change: transform;
  }

  /* CITAZIONI */
  .quote-block {
    position: absolute;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quote-text {
    font-family: var(--font-primary); /* O il tuo font headline */
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.1;
    color: #1a1a1a;
  }

  .quote-author {
    font-family: var(--font-secondary);
    font-size: 0.8rem;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
    opacity: 0.5;
    color: #1a1a1a;
  }

  /* CARDS & PARALLAX */
  .card { position: absolute; display: flex; flex-direction: column; gap: 10px; }
  .img-frame { position: relative; overflow: hidden; background: #eee; }
  .parallax-img {
    width: 140%; height: 110%;
    position: absolute; top: -5%; left: -20%;
    object-fit: cover;
    will-change: transform;
  }
  .caption { font-size: 1rem; color: #030404; }
</style>