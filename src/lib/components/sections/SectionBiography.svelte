<script>
  import { onMount } from 'svelte'

  // Ogni card: posizione nella traccia orizzontale (x), altezza verticale (top),
  // testo con la prima parola in bold, foto.
  // noTitle: true → solo foto, senza didascalia (come la card del microfono)
  const CARDS = [
    {
      x: 100,  top: 80,
      boldPart: '12/1/1999,', rest: ' born in Kyiv',
      img: '/images/atleti/bio-kyiv.png',
      imgW: 310, imgH: 212,
    },
    {
      x: 580,  top: 450,
      boldPart: 'Boxing', rest: ' is his first sport, until 2014',
      img: '/images/atleti/bio-boxing.png',
      imgW: 200, imgH: 235,
    },
    {
      x: 1040, top: 70,
      noTitle: true,
      img: '/images/atleti/bio-2016-prep.png',
      imgW: 255, imgH: 270,
    },
    {
      x: 1530, top: 430,
      boldPart: 'In 2016', rest: ' makes his debut at the Youth Olympics',
      img: '/images/atleti/bio-2016-race.png',
      imgW: 380, imgH: 192,
    },
    {
      x: 2050, top: 80,
      boldPart: '24-2-2017,', rest: ' first Ukrainian athlete to compete in a world championship',
      img: '/images/atleti/bio-2017-worlds.png',
      imgW: 305, imgH: 213,
    },
    {
      x: 2540, top: 450,
      boldPart: 'Pyeongchang 2018', rest: '',
      img: '/images/atleti/bio-2018-pyeongchang.png',
      imgW: 350, imgH: 196,
    },
    {
      x: 3040, top: 75,
      boldPart: '2019 World Championships', rest: '',
      img: '/images/atleti/bio-2019-worlds.png',
      imgW: 370, imgH: 277,
    },
    {
      x: 3540, top: 440,
      noTitle: true,
      img: '/images/atleti/bio-portrait-helmet.png',
      imgW: 250, imgH: 247,
    },
    {
      x: 4040, top: 80,
      boldPart: '2024 World Championships', rest: '',
      img: '/images/atleti/bio-2024-worlds.png',
      imgW: 370, imgH: 257,
    },
    {
      x: 4530, top: 440,
      noTitle: true,
      img: '/images/atleti/bio-mic.png',
      imgW: 240, imgH: 243,
    },
    {
      x: 5010, top: 80,
      boldPart: '2026 Milano-Cortina Olympics', rest: '',
      img: '/images/atleti/bio-2026-olympic.png',
      imgW: 340, imgH: 240,
    },
    {
      x: 5500, top: 420,
      boldPart: '2026 Milano-Cortina Olympics', rest: '',
      img: '/images/atleti/bio-2026-milano.png',
      imgW: 215, imgH: 275,
    },
  ]

  // Larghezza totale della traccia (12 card, ~500px di spaziatura media)
  const TRACK_WIDTH = 6000

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

  // Offset orizzontale: varia da 0 a (TRACK_WIDTH - viewport_width)
  let offsetX = $derived(progress * Math.max(0, TRACK_WIDTH - vpW))
</script>

<section bind:this={section} class="bio-section" id="athlete-bio">
  <div class="sticky-wrap">

    <!-- Il nav globale (Navbar.svelte) copre già questo spazio → niente header locale -->

    <!-- Traccia orizzontale -->
    <div
      class="cards-track"
      style:transform="translateX(-{offsetX}px)"
    >
      {#each CARDS as card}
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
          <img
            src={card.img}
            alt={card.boldPart ?? ''}
            style:width="{card.imgW}px"
            style:height="{card.imgH}px"
          />
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .bio-section {
    /* Altezza totale = tempo di scroll disponibile per percorrere la traccia (12 card) */
    height: calc(100vh + 4600px);
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


  /* La traccia è ampia quanto TRACK_WIDTH, si muove con translateX */
  .cards-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 6000px;
    height: 100vh;
    will-change: transform;
    transition: transform 0.05s linear;
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

  .card img {
    object-fit: cover;
    display: block;
  }
</style>
