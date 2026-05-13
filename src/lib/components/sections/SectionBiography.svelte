<script>
  import { onMount } from 'svelte'

  const CARDS = [
    {
      x: 100,  top: 80,
      boldPart: '12/1/1999,', rest: ' born in Kyiv',
      img: '/images/atleti/bio-kyiv.png',
      imgW: 310, imgH: 212,
      ukraineOverlay: true,
    },
    {
      x: 480,  top: 450,
      boldPart: 'Boxing', rest: ' is his first sport, until 2014',
      img: '/images/atleti/bio-boxing.png',
      imgW: 200, imgH: 235,
    },
    {
      x: 860,  top: 70,
      noTitle: true,
      img: '/images/atleti/bio-2016-prep.png',
      imgW: 255, imgH: 270,
    },
    {
      x: 1250, top: 430,
      boldPart: 'In 2016', rest: ' makes his debut at the Youth Olympics',
      img: '/images/atleti/bio-2016-race.png',
      imgW: 380, imgH: 192,
      ukraineOverlay: true,
    },
    {
      x: 1680, top: 80,
      boldPart: '24-2-2017,', rest: ' first Ukrainian athlete to compete in a world championship',
      img: '/images/atleti/bio-2017-worlds.png',
      imgW: 305, imgH: 213,
      ukraineOverlay: true,
    },
    {
      x: 2100, top: 450,
      boldPart: 'Pyeongchang 2018', rest: '',
      img: '/images/atleti/bio-2018-pyeongchang.png',
      imgW: 350, imgH: 196,
    },
    {
      x: 2530, top: 75,
      boldPart: '2019 World Championships', rest: '',
      img: '/images/atleti/bio-2019-worlds.png',
      imgW: 370, imgH: 277,
    },
    {
      x: 2960, top: 440,
      noTitle: true,
      img: '/images/atleti/bio-portrait-helmet.png',
      imgW: 250, imgH: 247,
    },
    {
      x: 3360, top: 80,
      boldPart: '2024 World Championships', rest: '',
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
      x: 4180, top: 80,
      boldPart: '2026 Milano-Cortina Olympics', rest: '',
      img: '/images/atleti/bio-2026-olympic.png',
      imgW: 340, imgH: 240,
      ukraineOverlay: true,
    },
    {
      x: 4580, top: 420,
      boldPart: '2026 Milano-Cortina Olympics', rest: '',
      img: '/images/atleti/bio-2026-milano.png',
      imgW: 215, imgH: 275,
      ukraineOverlay: true,
    },
  ]

  const TRACK_WIDTH = 4900
  let progress = $state(0)
  let section
  let sectionTop = 0
  let sectionH = 0
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
    measure()
    onScroll()
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  })

  let offsetX = $derived(progress * Math.max(0, TRACK_WIDTH - vpW))
</script>

<section bind:this={section} class="bio-section" id="athlete-bio">
  <div class="sticky-wrap">
    <div class="cards-track" style:transform="translateX(-{offsetX}px)">
      {#each CARDS as card}
        <div class="card" style:left="{card.x}px" style:top="{card.top}px">
          {#if !card.noTitle}
            <p class="caption">
              <strong>{card.boldPart}</strong>{card.rest}
            </p>
          {/if}
          
          <div class="img-frame" style:width="{card.imgW}px" style:height="{card.imgH}px">
  <div class="parallax-container" style:transform="translateX({(progress - 0.5) * 150}px)">
    <img
      src={card.img}
      alt={card.boldPart ?? ''}
      class="parallax-img"
      style:width="{card.imgW + 100}px"
    />
  </div>
  {#if card.ukraineOverlay}
    <div class="ukraine-overlay"></div>
  {/if}
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
    display: block;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* Parallasse ORIZZONTALE: immagine più larga della cornice */
.parallax-container {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: transform 0.05s linear;
}

.parallax-img {
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
}

  /* Overlay blu Ucraina */
  .ukraine-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 87, 183, 0.5);
    pointer-events: none;
  }
</style>