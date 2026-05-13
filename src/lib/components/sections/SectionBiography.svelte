<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetZoomScene from '../HelmetZoomScene.svelte'

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

  const TRACK_WIDTH = 6000
  // Progress fraction at which horizontal scroll stops and helmet zoom begins
  const P_STOP = 0.59

  const VISOR_TEXTS = [
    'The modern Olympic movement is founded on an intrinsic paradox: the aspiration for universality through a political neutrality that frequently clashes with the brutal reality of global conflicts.',
    'The case of Vladyslav Heraskevych, the Ukrainian skeleton racer disqualified during the Milano Cortina 2026 Winter Olympics, represents a fundamental breaking point in this narrative.',
    'Vladyslav Heraskevych is a symbol of moral resistance. His exclusion from competition—caused by a helmet honoring athletes killed in the war—has sparked debate about the limits of personal expression in sport.',
  ]

  const CAM_FAR   = 8.5
  const CAM_CLOSE = 1.8

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  let progress  = $state(0)
  let section
  let sectionTop = 0
  let sectionH   = 0
  let vpW = typeof window !== 'undefined' ? window.innerWidth : 1440

  onMount(() => {
    const measure = () => {
      if (!section) return
      const rect = section.getBoundingClientRect()
      sectionTop = rect.top + window.scrollY
      sectionH   = section.offsetHeight
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

  // ── Horizontal scroll: freezes when P_STOP is reached ────────────────────
  let offsetX = $derived(Math.min(1, progress / P_STOP) * Math.max(0, TRACK_WIDTH - vpW))

  // ── Zoom progress 0→1 over the helmet phase ───────────────────────────────
  let zoomP = $derived(clamp((progress - P_STOP) / (1 - P_STOP), 0, 1))

  // ── Camera Z (same curve as the original SectionHelmetZoom) ──────────────
  let cameraZ = $derived.by(() => {
    const p = zoomP
    if (p < 0.10) return CAM_FAR
    if (p < 0.36) return lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, 0.10, 0.36, 0, 1)))
    if (p < 0.84) return CAM_CLOSE
    if (p < 0.97) return lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, 0.84, 0.97, 0, 1)))
    return CAM_FAR
  })

  // ── Background colour: white → dark during zoom-in ────────────────────────
  let bgColor = $derived.by(() => {
    const t = ease(remap(zoomP, 0.10, 0.36, 0, 1))
    const r = Math.round(lerp(0xfa, 0x03, t)).toString(16).padStart(2, '0')
    const g = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    const b = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  })

  // ── Helmet canvas: render early so GLB preloads while still off-screen right ─
  // At progress ≈ 0.38 the canvas right edge enters the viewport; at P_STOP it fills screen.
  let helmetVisible = $derived(progress >= 0.38)

  // ── Ukrainian flag squares: fade out as zoom begins ───────────────────────
  let squaresOpacity = $derived(1 - ease(remap(zoomP, 0.10, 0.20, 0, 1)))

  // ── Text scroll: each paragraph in a 100vh slot → one at a time ─────────
  // 3 slots × 100vh = 300vh total. Travel: 100vh (below) → -300vh (above).
  let textY       = $derived(lerp(100, -300, clamp(invlerp(0.42, 0.84, zoomP), 0, 1)))
  let textVisible = $derived(zoomP > 0.40 && zoomP < 0.86)
</script>

<!-- id="helmet-zoom" preserved so +page.svelte navDark/showQuadratini logic still works -->
<section bind:this={section} class="bio-section" id="athlete-bio">
  <div class="sticky-wrap">

    <!-- Horizontal cards track -->
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

      <!-- 3D Helmet canvas: last element in horizontal track, slides in from the right -->
      {#if helmetVisible}
        <div class="helmet-card">
          <Canvas renderMode="always">
            <HelmetZoomScene {cameraZ} {bgColor} />
          </Canvas>
        </div>
      {/if}
    </div>

    <!-- Ukrainian flag squares (shown only at start of helmet phase) -->
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

    <!-- Visor texts: single container scrolling continuously bottom→top -->
    {#if textVisible}
      <div class="text-stage" aria-live="polite">
        <div class="text-scroll" style:transform="translateY({textY}vh)">
          {#each VISOR_TEXTS as txt}
            <p class="visor-text">{txt}</p>
          {/each}
        </div>
      </div>
    {/if}

  </div>
  <!-- Marker used by +page.svelte to detect the dark zone for navDark -->
  <span id="helmet-zoom" style="position:absolute;top:{Math.round((P_STOP + 0.063 * (1 - P_STOP)) * 100)}%;visibility:hidden" aria-hidden="true"></span>
</section>

<style>
  .bio-section {
    /* Extra height: original 4600px for horizontal scroll + ~3200px for helmet zoom */
    height: calc(100vh + 7800px);
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

  /* Horizontal track */
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

  .caption strong { font-weight: 700; }

  .card img {
    object-fit: cover;
    display: block;
  }

  /* ── Helmet card: rightmost element in the horizontal track ────────── */
  /* left: calc(TRACK_WIDTH - 100vw) → fills screen exactly at max offsetX */
  .helmet-card {
    position: absolute;
    top: 0;
    left: calc(6000px - 100vw);
    width: 100vw;
    height: 100vh;
  }

  /* ── Flag squares ───────────────────────────────────────────────────── */
  .squares {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
  }
  .sq-pair   { position: absolute; display: flex; align-items: flex-end; gap: 0; }
  .sq-single { position: absolute; }
  .sq-b { display: block; background: #005BBB; flex-shrink: 0; }
  .sq-y { display: block; background: #FFD500; flex-shrink: 0; }

  /* ── Text stage ─────────────────────────────────────────────────────── */
  .text-stage {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    /* top-aligned so translateY drives entry from below */
    align-items: flex-start;
    overflow: hidden;
    pointer-events: none;
    z-index: 4;
  }

  .text-scroll {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    will-change: transform;
  }

  /* Each paragraph occupies one full viewport height — one text visible at a time */
  .visor-text {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3rem;
    box-sizing: border-box;
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: clamp(1.1rem, 1.8vw, 1.75rem);
    line-height: 1.75;
    color: rgba(18, 14, 10, 0.92);
    letter-spacing: 0.01em;
  }
</style>
