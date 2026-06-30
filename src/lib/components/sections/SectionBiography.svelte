<script>
  import { onMount, tick } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  
  import { getLayoutTokens } from '$lib/styles/tokens/index'

  let paddingLateral = $state(80)
  let paddingTopMain = $state(80)

  let section    = $state()
  let cardsTrack = $state()
  let offsetX    = $state(0)
  let vpW        = $state(1440)
  let vpH        = $state(900)
  let isMobile   = $state(false)

  const REFERENCE_WIDTH   = 1440
  const MOBILE_BREAKPOINT = 768

  // Vertical extents of the reference layout (top of highest element, bottom of lowest)
  const REFERENCE_CONTENT_TOP    = 150
  const REFERENCE_CONTENT_BOTTOM = 763
  const REFERENCE_CONTENT_HEIGHT = REFERENCE_CONTENT_BOTTOM - REFERENCE_CONTENT_TOP

  let scaleFactor    = $derived(isMobile ? 1 : vpW / REFERENCE_WIDTH)
  let verticalScale  = $derived(isMobile ? 1 : (vpH - 2 * paddingTopMain) / REFERENCE_CONTENT_HEIGHT)
  let verticalOffset = $derived(isMobile ? 0 : paddingTopMain - REFERENCE_CONTENT_TOP * verticalScale)

  const CARDS_DATA = [
    { boldPart: '1999', rest: ' - Born in Kyiv',              img: '/images/bio/bio-kyiv.png',              imgW: 350, imgH: 220 },
    { noTitle: true,                                           img: '/images/bio/bio-2016-prep.png',         imgW: 200, imgH: 250 },
    { boldPart: '2016', rest: ' - Youth Olympics',            img: '/images/bio/bio-youthOlympics.jpg',     imgW: 350, imgH: 220 },
    { boldPart: '2017', rest: ' - World Championship',        img: '/images/bio/bio-2017-wc.jpg',           imgW: 480, imgH: 350 },
    { boldPart: '2018', rest: ' - PyeongChang Olympics',      img: '/images/bio/bio-2018-pyeongchang.png',  imgW: 350, imgH: 196 },
    { boldPart: '2019', rest: ' - World Championships',       img: '/images/bio/bio-wc2019.jpg',            imgW: 370, imgH: 600 },
    { noTitle: true,                                           img: '/images/bio/bio-portrait-helmet.png',  imgW: 250, imgH: 247 },
    { boldPart: '2022', rest: ' - Beijing Olympics',          img: '/images/bio/bio-2022olympics.avif',         imgW: 500, imgH: 400 },
    { boldPart: '2024', rest: ' - World Championships',       img: '/images/bio/bio-2024-worlds.png',       imgW: 370, imgH: 257 },
    { noTitle: true,                                           img: '/images/bio/bio-mic.png',               imgW: 240, imgH: 243 },
    { boldPart: '2026', rest: ' - Milan Cortina Olympics',    img: '/images/bio/bio-2026-olympic.png',      imgW: 340, imgH: 240 },
  ]

  const QUOTES_DATA = [
    { text: "First Ukrainian athlete in World Skeleton Championships" },
    { text: "Heraskevych Foundation's founder" },
    { text: "Some things are more important than sports" },
  ]

  let horizontalCards = $derived(isMobile ? [] : CARDS_DATA.map((card, i) => {
    const xMap = [
      paddingLateral,
      650 * scaleFactor,
      (paddingLateral + 70) * scaleFactor,
      1050 * scaleFactor,
      1700 * scaleFactor,
      2300 * scaleFactor,
      1650 * scaleFactor,
      2900 * scaleFactor,
      3600 * scaleFactor,
      3780 * scaleFactor,
      4180 * scaleFactor,
    ]
    // Raw top values from the reference design (reference_content_top = 150, reference_content_bottom = 763)
    const rawTopMap = [160, 450, 510, 280, 530, 160, 170, 260, 160, 520, 280]
    return {
      ...card,
      x: xMap[i] ?? 0,
      top: Math.round((rawTopMap[i] ?? 160) * verticalScale + verticalOffset),
      imgH: Math.round(card.imgH * verticalScale),
    }
  }))

  let horizontalQuotes = $derived(isMobile ? [] : QUOTES_DATA.map((quote, i) => {
    const positions = [
      { x: 650 * scaleFactor,  rawTop: 150 },
      { x: 1950 * scaleFactor, rawTop: 165 },
      { x: 3500 * scaleFactor, rawTop: 540 },
    ]
    return {
      ...quote,
      x: positions[i].x,
      top: Math.round(positions[i].rawTop * verticalScale + verticalOffset),
    }
  }))

  const MOBILE_EXCLUDED = new Set(['/images/bio/bio-2026-olympic.png'])
  let verticalCards  = $derived(isMobile ? CARDS_DATA.filter(c => !MOBILE_EXCLUDED.has(c.img)) : [])
  let verticalQuotes = $derived(isMobile ? QUOTES_DATA : [])

    let lastCardX     = $derived(isMobile ? 0 : Math.max(...horizontalCards.map(c => c.x + (c.imgW || 0))))
  let trackWidth    = $derived(isMobile ? 0 : lastCardX + paddingLateral)
  let maxOffsetX    = $derived(Math.max(0, trackWidth - vpW))
  
  const PAUSE_PX    = 600
  let sectionHeight = $derived(isMobile ? 'auto' : `calc(100vh + ${maxOffsetX + PAUSE_PX}px)`)



  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < MOBILE_BREAKPOINT
      vpW = window.innerWidth
      vpH = window.innerHeight
      const layout = getLayoutTokens(window.innerWidth)
      paddingLateral = layout.paddingLateral
      paddingTopMain = layout.paddingTopBiography
    }

    checkMobile()

    let tween = null
    let tickerFn = null
    const mobileTweens = []

    if (!isMobile) {
      tween = gsap.to(cardsTrack, {
        x: () => -maxOffsetX,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
            end: () => `+=${maxOffsetX}`,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      })

      // Legge la x reale (interpolata dal scrub) ogni frame → parallax sincronizzato
      tickerFn = () => {
        if (cardsTrack) {
          offsetX = Math.abs(gsap.getProperty(cardsTrack, 'x') || 0)
        }
      }
      gsap.ticker.add(tickerFn)
    } else {
      // Mobile: parallax verticale legato allo scroll, una ScrollTrigger per card
      tick().then(() => {
        if (!section) return
        section.querySelectorAll('.vertical-img').forEach((img) => {
          mobileTweens.push(
            gsap.fromTo(
              img,
              { yPercent: 7 },
              {
                yPercent: -7,
                ease: 'none',
                scrollTrigger: {
                  trigger: img.closest('.vertical-card'),
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            )
          )
        })
      })
    }

    const onResize = async () => {
      checkMobile()
      await tick()
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      tween?.scrollTrigger?.kill()
      tween?.kill()
      if (tickerFn) gsap.ticker.remove(tickerFn)
      mobileTweens.forEach((t) => {
        t.scrollTrigger?.kill()
        t.kill()
      })
    }
  })

  function getParallax(cardX) {
    if (isMobile) return 0
    const centerPoint = (cardX - offsetX + 150) / vpW
    const clamped = Math.max(-1, Math.min(1, centerPoint * 2 - 1))
    return -clamped * 70
  }
</script>

<!-- ── Desktop layout (orizzontale) ────────────────────────────────────── -->
{#if !isMobile}
  <section
    bind:this={section}
    class="bio-section bio-section--horizontal"
    id="athlete-bio"
    style:height={sectionHeight}
  >
    <div class="grain-overlay"></div>
    <div class="sticky-wrap">
      <div
        class="cards-track"
        bind:this={cardsTrack}
        style:width="{trackWidth}px"
      >
        {#each horizontalCards as card}
          <div class="card" style:left="{card.x}px" style:top="{card.top}px">
            {#if !card.noTitle}
              <p class="caption"><strong>{card.boldPart}</strong>{card.rest}</p>
            {/if}
            <div class="img-frame" style:width="{card.imgW}px" style:height="{card.imgH}px">
              <img src={card.img} alt=""
                   class="parallax-img"
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

<!-- ── Mobile layout (verticale) ──────────────────────────────────────── -->
{#if isMobile}
  <section bind:this={section} class="bio-section bio-section--vertical" id="athlete-bio">
    <div class="grain-overlay"></div>
    <div class="vertical-container">
      {#each verticalCards as card, i}
        <div class="vertical-card vertical-card--{i % 2 === 0 ? 'left' : 'right'}" style:animation-delay="{i * 0.05}s">
          <div class="vertical-img-frame" style:aspect-ratio="{card.imgW}/{card.imgH}">
            <img src={card.img} alt="" class="vertical-img" loading="lazy" />
          </div>
          {#if !card.noTitle}
            <p class="vertical-caption">
              <strong>{card.boldPart}</strong>{card.rest}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  /* ── Desktop ─────────────────────────────────────────────────────────── */
  .bio-section--horizontal {
    position: relative;
    width: 100%;
  }

  .grain-overlay {
    position: absolute;
    inset: 0;
    z-index: 7;
    pointer-events: none;
  }

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
    z-index: 1;
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
    background: var(--color-canvas);
  }

  .parallax-img {
    width: 140%;
    max-inline-size: none;   /* opt out of base.css img clamp; needs >100% for parallax room */
    height: 100%;
    position: absolute;
    left: -20%;
    object-fit: cover;
    will-change: transform;
  }

  @keyframes helmet-bob {
    0%   { translate: 0px 0px;   rotate: 0deg; }
    30%  { translate: 0px -6px;  rotate: 0.8deg; }
    60%  { translate: 0px -3px;  rotate: -0.5deg; }
    100% { translate: 0px 0px;   rotate: 0deg; }
  }

  .caption {
    font-size: 1rem;
    color: #030404;
    font-family: 'GeistPixel-Square', monospace;
  }
  .caption strong { font-weight: 700; }

  .quote-block {
    position: absolute;
    max-width: 280px;
  }
  .quote-text {
    font-family: var(--font-primary);
    font-size: 2.5rem;
    color: #1a1a1a;
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  .bio-section--vertical {
    background: transparent;
    padding: 80px 0 120px;
    min-height: 100vh;
  }
  .vertical-container {
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding: 0 20px;
  }
  .vertical-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 58vw;
    animation: fadeInUp 0.6s ease both;
  }
  .vertical-card--left  { align-self: flex-start; }
  .vertical-card--right { align-self: flex-end; }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vertical-caption {
    font-size: 0.85rem;
    color: #030404;
    font-family: 'GeistPixel-Square', monospace;
    line-height: 1.4;
  }
  .vertical-caption strong { font-weight: 700; }
  .vertical-img-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .vertical-img {
    position: absolute;
    left: 0;
    top: -10%;
    width: 100%;
    height: 120%;          /* extra vertical room for the scroll parallax */
    object-fit: cover;
    display: block;
    will-change: transform;
  }
  .vertical-quote {
    width: 58vw;
    padding: 0 0 0 14px;
    border-left: 2px solid #030404;
  }
  .vertical-quote--left  { align-self: flex-start; }
  .vertical-quote--right { align-self: flex-end; }
  .vertical-quote-text {
    font-family: 'GeistPixel-Square', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    font-style: italic;
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    .quote-text { font-size: 1.8rem; }
    .caption    { font-size: 0.9rem; }
  }
</style>
