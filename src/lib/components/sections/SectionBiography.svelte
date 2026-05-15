<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetZoomScene from '../helmetConfigurator/HelmetZoomScene.svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  let paddingLateral = $state(80)
  let paddingTopMain = $state(80)

  let progress  = $state(0)
  let section   = $state()
  let vpW       = $state(1440)
  let isMobile  = $state(false)

  const REFERENCE_WIDTH    = 1440
  const MOBILE_BREAKPOINT  = 768
  let scaleFactor = $derived(isMobile ? 1 : vpW / REFERENCE_WIDTH)

  // ── Helmet zoom constants ─────────────────────────────────────────────────
  const CAM_FAR   = 8.5
  const CAM_CLOSE = 1.8
  const ZOOM_PX   = 4000  // 4 step circa: 3 frasi + uscita verso la sezione successiva
  const EXTRA_PAD = 2400  // spazio vuoto dopo l'ultima card → casco appare da solo

  const VISOR_TEXTS = [
    'The modern Olympic movement is founded on an intrinsic paradox: the aspiration for universality through a political neutrality that frequently clashes with the brutal reality of global conflicts.',
    'The case of Vladyslav Heraskevych, the Ukrainian skeleton racer disqualified during the Milano Cortina 2026 Winter Olympics, represents a fundamental breaking point in this narrative.',
    'Vladyslav Heraskevych is a symbol of moral resistance. His exclusion from competition—caused by a helmet honoring athletes killed in the war—has sparked debate about the limits of personal expression in sport.',
  ]

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2
  const TEXT_WINDOWS = [[0.20, 0.42], [0.42, 0.64], [0.64, 0.86]]
  const T_IN = 0.055, T_OUT = 0.055

  // ── Card data (versione team) ─────────────────────────────────────────────
  const CARDS_DATA = [
    { boldPart: '1999', rest: ' - Born in Kyiv',              img: '/images/atleti/bio-kyiv.png',              imgW: 350, imgH: 220 },
    { noTitle: true,                                           img: '/images/atleti/bio-2016-prep.png',         imgW: 200, imgH: 250 },
    { boldPart: '2016', rest: ' - Youth Olympics',            img: '/images/atleti/bio-youthOlympics.jpg',     imgW: 350, imgH: 220 },
    { boldPart: '2017', rest: ' - World Championship',        img: '/images/atleti/bio-2017-wc.jpg',           imgW: 480, imgH: 350 },
    { boldPart: '2018', rest: ' - PyeongChang Olympics',      img: '/images/atleti/bio-2018-pyeongchang.png',  imgW: 350, imgH: 196 },
    { boldPart: '2019', rest: ' - World Championships',       img: '/images/atleti/bio-wc2019.jpg',            imgW: 370, imgH: 600 },
    { noTitle: true,                                           img: '/images/atleti/bio-portrait-helmet.png',  imgW: 250, imgH: 247 },
    { boldPart: '2022', rest: ' - Beijing Olympics',          img: '/images/atleti/2022olympics.avif',         imgW: 500, imgH: 400 },
    { boldPart: '2024', rest: ' - World Championships',       img: '/images/atleti/bio-2024-worlds.png',       imgW: 370, imgH: 257 },
    { noTitle: true,                                           img: '/images/atleti/bio-mic.png',               imgW: 240, imgH: 243 },
    { boldPart: '2026', rest: ' - Milan Cortina Olympics',    img: '/images/atleti/bio-2026-olympic.png',      imgW: 340, imgH: 240 },
  ]

  const QUOTES_DATA = [
    { text: "First Ukrainian athlete in World Skeleton Championships" },
    { text: "Heraskevych Foundation's founder" },
    { text: "Some things are more important than sports" },
  ]

  // ── Desktop: posizioni card responsive ───────────────────────────────────
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
    const topMap = [paddingTopMain, 370, 430, 200, 450, 80, 90, 180, 80, 440, 200]
    return { ...card, x: xMap[i] ?? 0, top: topMap[i] ?? 100 }
  }))

  let horizontalQuotes = $derived(isMobile ? [] : QUOTES_DATA.map((quote, i) => {
    const positions = [
      { x: 650 * scaleFactor,  top: 70  },
      { x: 1950 * scaleFactor, top: 85  },
      { x: 3500 * scaleFactor, top: 515 },
    ]
    return { ...quote, ...positions[i] }
  }))

  // ── Mobile: layout verticale ──────────────────────────────────────────────
  let verticalCards  = $derived(isMobile ? CARDS_DATA  : [])
  let verticalQuotes = $derived(isMobile ? QUOTES_DATA : [])

  // ── Scroll geometry ───────────────────────────────────────────────────────
  let lastCardX  = $derived(isMobile ? 0 : Math.max(...horizontalCards.map(c => c.x + (c.imgW || 0))))
  let trackWidth = $derived(isMobile ? 0 : lastCardX + paddingLateral + EXTRA_PAD)
  let maxOffsetX = $derived(Math.max(0, trackWidth - vpW))

  // pStop: fraction of total scroll at which horizontal ends, zoom begins
  let pStop         = $derived(maxOffsetX > 0 ? maxOffsetX / (maxOffsetX + ZOOM_PX) : 0.59)
  let sectionHeight = $derived(isMobile ? 'auto' : `calc(100vh + ${maxOffsetX + ZOOM_PX}px)`)

  // ── Derived scroll values ─────────────────────────────────────────────────
  let offsetX = $derived(isMobile ? 0 : Math.min(1, progress / pStop) * maxOffsetX)
  let zoomP   = $derived(isMobile ? 0 : clamp((progress - pStop) / (1 - pStop), 0, 1))

  let cameraZ = $derived.by(() => {
    const p = zoomP
    if (p < 0.20) return lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, 0.00, 0.20, 0, 1)))
    if (p < 0.86) return CAM_CLOSE
    if (p < 0.98) return lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, 0.86, 0.98, 0, 1)))
    return CAM_FAR
  })

  let bgColor = $derived.by(() => {
    // Durante il dezoom: Three.js canvas trasparente, il pixel canvas è visibile sotto
    if (zoomP >= 0.86) return 'transparent'
    const t = ease(remap(zoomP, 0.00, 0.20, 0, 1))
    const r = Math.round(lerp(0xfa, 0x03, t)).toString(16).padStart(2, '0')
    const g = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    const b = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  })

  // ── Pixel canvas (dezoom background) ─────────────────────────────────────
  const PIXEL_COLS = 40
  const PIXEL_ROWS = 25
  let pixelCanvas  = $state(null)
  let pixelCellOrder = []

  function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // Progresso pixel: 0 quando dezoom inizia (zoomP=0.86), 1 quando finisce (zoomP=0.98)
  let pixelProgress = $derived(clamp(remap(zoomP, 0.86, 0.98, 0, 1), 0, 1))

  // Inizializza canvas una volta montato
  $effect(() => {
    if (!pixelCanvas || pixelCellOrder.length > 0) return
    pixelCanvas.width  = window.innerWidth
    pixelCanvas.height = window.innerHeight
    pixelCellOrder = shuffleArr([...Array(PIXEL_COLS * PIXEL_ROWS).keys()])
  })

  // Disegna i pixel al variare dello scroll
  $effect(() => {
    if (!pixelCanvas || zoomP < 0.86) return
    const ctx   = pixelCanvas.getContext('2d')
    const w     = pixelCanvas.width
    const h     = pixelCanvas.height
    const cellW = w / PIXEL_COLS
    const cellH = h / PIXEL_ROWS
    const total = PIXEL_COLS * PIXEL_ROWS

    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, w, h)

    const count = Math.floor(pixelProgress * total)
    for (let i = 0; i < count; i++) {
      const idx = pixelCellOrder[i]
      const col = idx % PIXEL_COLS
      const row = Math.floor(idx / PIXEL_COLS)
      ctx.fillStyle = '#030404'
      ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1)
    }
  })

  // Precarica il modello GLB quando il casco sta per entrare nel viewport
  let helmetVisible  = $derived(!isMobile && progress >= pStop * 0.65)
  let squaresOpacity = $derived(1 - ease(remap(zoomP, 0.00, 0.10, 0, 1)))

  function textAnim(i) {
    const [ws, we] = TEXT_WINDOWS[i]
    const p = zoomP
    if (p <= ws || p >= we) return { opacity: 0, y: p < ws ? 56 : -56 }
    if (p < ws + T_IN) {
      const t = ease(remap(p, ws, ws + T_IN, 0, 1))
      return { opacity: t, y: lerp(56, 0, t) }
    }
    if (p > we - T_OUT) {
      const t = ease(remap(p, we - T_OUT, we, 0, 1))
      return { opacity: 1 - t, y: lerp(0, -56, t) }
    }
    return { opacity: 1, y: 0 }
  }

  onMount(() => {
    const style = getComputedStyle(document.documentElement)
    paddingLateral = parseInt(style.getPropertyValue('--padding-lateral')) || 80
    paddingTopMain = parseInt(style.getPropertyValue('--padding-top-main')) || 80

    const checkMobile = () => {
      isMobile = window.innerWidth < MOBILE_BREAKPOINT
      vpW = window.innerWidth
    }

    const onScroll = () => {
      if (!section || isMobile) return
      const rect = section.getBoundingClientRect()
      const totalScrollable = section.offsetHeight - window.innerHeight
      progress = Math.max(0, Math.min(1, -rect.top / totalScrollable))

      // Attiva il canvas globale quando la bio finisce (dezoom completo)
      // e mantienilo finché l'utente è nella zona di transizione verso athletes
      const bioEnding = progress >= 0.98
      if (bioEnding !== helmetStore.visible) {
        helmetStore.visible = bioEnding
        if (bioEnding) {
          helmetStore.cameraY = 0.25
          helmetStore.cameraZ = 8.5
          helmetStore.lookAtY = 0.20
          helmetStore.rotX   = 0.25
          helmetStore.rotY   = Math.PI
          helmetStore.rotZ   = 0
          helmetStore.viewerPaddingLeft = '0%'
        }
      }
    }

    checkMobile()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkMobile)
    }
  })

  function getParallax(cardX) {
    if (isMobile) return 0
    const centerPoint = (cardX - offsetX + 150) / vpW
    const clamped = Math.max(-1, Math.min(1, centerPoint * 2 - 1))
    return -clamped * 70
  }
</script>

<!-- ── Desktop layout (orizzontale + helmet zoom) ──────────────────────── -->
{#if !isMobile}
  <section
    bind:this={section}
    class="bio-section bio-section--horizontal"
    id="athlete-bio"
    style:height={sectionHeight}
  >
    <div class="grain-overlay"></div>
    <div class="sticky-wrap">

      <!-- Pixel background: visibile durante il dezoom, dietro il casco 3D -->
      <canvas bind:this={pixelCanvas} class="pixel-bg"></canvas>

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

      <!-- Casco 3D: nascosto quando il canvas globale è attivo -->
      {#if helmetVisible && !helmetStore.visible}
        <div class="helmet-card" style:left="{maxOffsetX - offsetX}px">
          <Canvas renderMode="always">
            <HelmetZoomScene {cameraZ} {bgColor} />
          </Canvas>
        </div>
      {/if}

      <!-- Quadratini bandiera ucraina: svaniscono all'inizio dello zoom -->
      {#if zoomP > 0 && squaresOpacity > 0.01}
        <div class="squares" style:opacity={squaresOpacity} aria-hidden="true">
          <div class="sq-pair" style="left:4%;bottom:7%">
            <span class="sq-b" style="width:44px;height:44px"></span>
            <span class="sq-y" style="width:44px;height:44px"></span>
          </div>
          <div class="sq-single sq-y" style="left:26%;top:64%;width:32px;height:32px"></div>
          <div class="sq-single sq-y" style="right:26%;top:32%;width:52px;height:52px"></div>
          <div class="sq-pair" style="right:7%;top:32%">
            <span class="sq-y" style="width:44px;height:44px"></span>
            <span class="sq-b" style="width:38px;height:38px"></span>
          </div>
          <div class="sq-single sq-b" style="right:16%;top:75%;width:38px;height:38px"></div>
          <div class="sq-pair" style="right:14%;bottom:8%">
            <span class="sq-y" style="width:42px;height:42px"></span>
            <span class="sq-b" style="width:42px;height:42px"></span>
          </div>
        </div>
      {/if}

      <!-- Testi visor: uno step di scroll per frase, con fade in/out -->
      {#if zoomP > 0.16 && zoomP < 0.90}
        <div class="text-stage" aria-live="polite">
          {#each VISOR_TEXTS as txt, i}
            {@const { opacity, y } = textAnim(i)}
            <p
              class="visor-text"
              style:opacity
              style:transform="translateY({y}px)"
              aria-hidden={opacity < 0.05 ? 'true' : 'false'}
            >{txt}</p>
          {/each}
        </div>
      {/if}

    </div>
  </section>
{/if}

<!-- ── Mobile layout (verticale) ──────────────────────────────────────── -->
{#if isMobile}
  <section class="bio-section bio-section--vertical" id="athlete-bio">
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
  /* ── Desktop ─────────────────────────────────────────────────────────── */
  .bio-section--horizontal {
    position: relative;
    width: 100%;
    /*background: #fafafa;*/
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
    /*background: #fafafa;*/
  }

  /* Pixel canvas: sfondo dezoom — z-index 2 (copre le foto bio) */
  .pixel-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: block;
    pointer-events: none;
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
    font-family: var(--font-secondary, sans-serif);
  }
  .caption strong { font-weight: 700; }

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

  /* ── Helmet card — z-index 3 (sopra pixel canvas) ───────────────────── */
  .helmet-card {
    position: absolute;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 3;
  }

  /* ── Flag squares ────────────────────────────────────────────────────── */
  .squares {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
  }
  .sq-pair   { position: absolute; display: flex; align-items: flex-end; }
  .sq-single { position: absolute; }
  .sq-b { display: block; background: #005BBB; flex-shrink: 0; }
  .sq-y { display: block; background: #FFD500; flex-shrink: 0; }

  /* ── Visor texts ─────────────────────────────────────────────────────── */
  .text-stage {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    pointer-events: none;
    z-index: 4;  /* sopra helmet (3), sotto quote-screen (5) */
    padding-bottom: 10vh;
  }
  .visor-text {
    position: absolute;
    padding: 0 3rem;
    box-sizing: border-box;
    max-width: 700px;
    margin: 0;
    text-align: center;
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: clamp(1.1rem, 1.8vw, 1.75rem);
    line-height: 1.75;
    color: var(--color-dark);
    letter-spacing: 0.01em;
    will-change: opacity, transform;
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  .bio-section--vertical {
    background: var(--color-canvas);
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
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vertical-caption {
    font-size: 1rem;
    color: #030404;
    line-height: 1.45;
    margin-bottom: 8px;
    font-family: var(--font-secondary, sans-serif);
  }
  .vertical-caption strong { font-weight: 700; font-size: 1.1rem; }
  .vertical-img-frame {
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: var(--color-canvas);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .vertical-img { width: 100%; height: 100%; object-fit: cover; display: block; }
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

  @media (max-width: 1024px) and (min-width: 769px) {
    .quote-text { font-size: 1.8rem; }
    .caption    { font-size: 0.9rem; }
  }
</style>
