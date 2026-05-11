<script>
  import { onMount } from 'svelte'

  // Ogni card: posizione nella traccia orizzontale (x), altezza verticale (top),
  // testo con la prima parola in bold, foto
  const CARDS = [
    {
      x: 120,
      top: 80,
      boldPart: '12/1/1999,',
      rest: ' born in Kyiv',
      img: '/images/atleti/kyiv.jpg',
      imgW: 310, imgH: 210,
    },
    {
      x: 600,
      top: 460,
      boldPart: 'Boxing',
      rest: ' is his first sport, until 2014',
      img: '/images/atleti/boxing.jpg',
      imgW: 220, imgH: 260,
    },
    {
      x: 1020,
      top: 90,
      boldPart: 'In 2016',
      rest: ' makes his debut at the Youth Olympics',
      img: '/images/atleti/skeleton-2016.jpg',
      imgW: 380, imgH: 380,
    },
    {
      x: 1600,
      top: 440,
      boldPart: '24-2-2017,',
      rest: ' first Ukrainian athlete to compete in a world championship',
      img: '/images/atleti/skeleton-race.jpg',
      imgW: 440, imgH: 220,
    },
    {
      x: 2220,
      top: 60,
      boldPart: 'Pyeongchang 2018',
      rest: '',
      img: '/images/atleti/pyeongchang.jpg',
      imgW: 380, imgH: 260,
    },
    {
      x: 2760,
      top: 340,
      boldPart: '2019 World Championships',
      rest: '',
      img: '/images/atleti/worlds-2019.jpg',
      imgW: 380, imgH: 280,
    },
  ]

  // Larghezza totale della traccia
  const TRACK_WIDTH = 3400

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

    <!-- Header -->
    <div class="bio-header">
      <span class="logo">Outcast Champion</span>
      <nav class="bio-nav">
        <a href="#athlete" class="active">Athlete</a>
        <a href="#case">Case</a>
        <a href="#helmet">Helmet</a>
        <a href="#verdict">Verdict</a>
        <a href="#about-us">About Us</a>
      </nav>
    </div>

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
          <p class="caption">
            <strong>{card.boldPart}</strong>{card.rest}
          </p>
          <img
            src={card.img}
            alt={card.boldPart}
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
    /* Altezza totale = tempo di scroll disponibile per percorrere la traccia */
    height: calc(100vh + 2200px);
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

  .bio-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 24px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 20;
  }

  .logo {
    font-family: var(--font-primary);
    font-size: 1.1rem;
    color: #030404;
    letter-spacing: -0.01em;
  }

  .bio-nav {
    display: flex;
    gap: 2rem;
  }

  .bio-nav a {
    font-family: var(--font-secondary);
    font-size: 1.1rem;
    color: #030404;
    text-decoration: none;
    font-weight: 500;
  }

  .bio-nav a.active {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  /* La traccia è ampia quanto TRACK_WIDTH, si muove con translateX */
  .cards-track {
    position: absolute;
    top: 0;
    left: 0;
    width: 3400px;
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
