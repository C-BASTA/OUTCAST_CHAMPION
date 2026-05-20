<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetZoomScene from '../helmetConfigurator/HelmetZoomScene.svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  const TOTAL_SCROLL      = 5200   // px of scroll space after 100vh
  const ENTRY_END         = 0.18   // fraction of progress dedicated to entry animation
  const CAM_FAR           = 8.5
  const CAM_CLOSE         = 1.8
  const MOBILE_BREAKPOINT = 768

  const VISOR_TEXTS = [
    'The modern Olympic movement is founded on an intrinsic paradox: the aspiration for universality through a political neutrality that frequently clashes with the brutal reality of global conflicts.',
    'The case of Vladyslav Heraskevych, the Ukrainian skeleton racer disqualified during the Milano Cortina 2026 Winter Olympics, represents a fundamental breaking point in this narrative.',
    'Vladyslav Heraskevych is a symbol of moral resistance. His exclusion from competition—caused by a helmet honoring athletes killed in the war—has sparked debate about the limits of personal expression in sport.',
  ]
  const TEXT_WINDOWS = [[0.20, 0.42], [0.42, 0.64], [0.64, 0.86]]
  const T_IN = 0.055, T_OUT = 0.055

  let progress = $state(0)
  let section  = $state(null)
  let vpH      = $state(900)
  let isMobile = $state(false)

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // progress 0→ENTRY_END → entryP 0→1 (eased)
  let entryP = $derived(ease(clamp(progress / ENTRY_END, 0, 1)))
  // progress ENTRY_END→1 → zoomP 0→1
  let zoomP  = $derived(clamp((progress - ENTRY_END) / (1 - ENTRY_END), 0, 1))

  let cameraZ = $derived.by(() => {
    const p = zoomP
    if (p < 0.20) return lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, 0.00, 0.20, 0, 1)))
    if (p < 0.86) return CAM_CLOSE
    if (p < 0.98) return lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, 0.86, 0.98, 0, 1)))
    return CAM_FAR
  })

  let helmetTransform = $derived.by(() => {
    if (entryP >= 1) return ''
    const ty = lerp(100, 0, entryP)
    return `translateY(${ty.toFixed(3)}vh)`
  })

  // Vertical parallax on the bg photo: pans upward continuously from first scroll
  let bgParallaxY = $derived(-progress * vpH * 0.15)

  // Background photo fades out as camera starts zooming in
  let bgOpacity = $derived(1 - ease(remap(zoomP, 0.00, 0.28, 0, 1)))

  // Pixel canvas (exit dissolve)
  const PIXEL_COLS = 40
  const PIXEL_ROWS = 25
  let pixelCanvas    = $state(null)
  let pixelCellOrder = []

  function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  let pixelProgress = $derived(clamp(remap(zoomP, 0.86, 0.98, 0, 1), 0, 1))

  $effect(() => {
    if (!pixelCanvas || pixelCellOrder.length > 0) return
    pixelCanvas.width  = window.innerWidth
    pixelCanvas.height = window.innerHeight
    pixelCellOrder = shuffleArr([...Array(PIXEL_COLS * PIXEL_ROWS).keys()])
  })

  $effect(() => {
    if (!pixelCanvas) return
    const ctx = pixelCanvas.getContext('2d')
    const w   = pixelCanvas.width
    const h   = pixelCanvas.height

    if (zoomP < 0.86) {
      ctx.clearRect(0, 0, w, h)
      return
    }

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
    const checkSize = () => {
      vpH = window.innerHeight
      isMobile = window.innerWidth < MOBILE_BREAKPOINT
    }

    const onScroll = () => {
      if (!section || isMobile) return
      const rect = section.getBoundingClientRect()
      const totalScrollable = section.offsetHeight - window.innerHeight
      progress = Math.max(0, Math.min(1, -rect.top / totalScrollable))

      const sectionEnded = rect.bottom <= window.innerHeight + 1
      if (sectionEnded !== helmetStore.visible) {
        helmetStore.visible = sectionEnded
        if (sectionEnded) {
          helmetStore.cameraY = 0.25
          helmetStore.cameraZ = 8.5
          helmetStore.lookAtY = 0.20
          helmetStore.rotX   = 0.25
          helmetStore.rotY   = Math.PI - 0.35
          helmetStore.rotZ   = 0
          helmetStore.viewerPaddingLeft = '0%'
        }
      }
    }

    checkSize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkSize)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkSize)
    }
  })
</script>

<!-- ── Desktop (sticky vertical scroll + 3D helmet) ───────────────────── -->
{#if !isMobile}
  <section
    bind:this={section}
    class="visor-section"
    id="helmet-visor"
    style:height="calc(100vh + {TOTAL_SCROLL}px)"
  >
    <div class="sticky-wrap">

      <!-- Full-bleed background photo: visible during entry, fades as zoom begins -->
      <div class="bg-photo" style:opacity={bgOpacity}>
        <img
          src="/images/VladAfterBio.jpeg"
          alt="Vladyslav Heraskevych"
          style:transform="translate3d(0, {bgParallaxY}px, 0)"
        />
      </div>

      <!-- Pixel canvas: exit dissolve (z-index 2, above photo) -->
      <canvas bind:this={pixelCanvas} class="pixel-bg"></canvas>

      <!-- MODIFICATO: .helmet-card rimane FISSA e invisibile al 100% dello schermo per non rompere Three.js -->
      <!-- .helmet-card rimane FISSA e invisibile al 100% dello schermo per non rompere Three.js -->
      <div class="helmet-card">
        <!-- Spostiamo la transform CSS su questo div interno dedicato all'animazione di entrata -->
        <div class="canvas-transform-wrapper" style:transform={helmetTransform}>
          <div class="canvas-container">
            <Canvas renderMode="always">
              <HelmetZoomScene {zoomP} {cameraZ} />
            </Canvas>
          </div>
        </div>
      </div>

      <!-- Visor texts: appear during zoom hold phase -->
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

<!-- ── Mobile (static fallback) ───────────────────────────────────────── -->
{#if isMobile}
  <section class="visor-section--mobile" id="helmet-visor">
    <div class="mobile-photo">
      <img src="/images/VladAfterBio.jpeg" alt="Vladyslav Heraskevych" />
    </div>
    <div class="mobile-texts">
      {#each VISOR_TEXTS as txt}
        <p class="mobile-visor-text">{txt}</p>
      {/each}
    </div>
  </section>
{/if}

<style>
  /* ── Desktop ─────────────────────────────────────────────────────────── */
  .visor-section {
    position: relative;
    width: 100%;
  }

  .sticky-wrap {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: #030404;
  }

  /* Full-bleed bg photo with vertical parallax room */
  .bg-photo {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    will-change: opacity;
  }
  
  .bg-photo img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 130%;
    object-fit: cover;
    object-position: center 40%;
    display: block;
    will-change: transform;
  }

  /* Pixel canvas: sits above photo (z 2), below helmet (z 3) */
  .pixel-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: block;
    pointer-events: none;
  }

  /* Helmet card contenitore: Rigidamente fisso e grande quanto lo schermo */
  .helmet-card {
    position: absolute;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 3;
    pointer-events: none; /* Evita che blocchi eventi di click sotto */
  }

  .canvas-transform-wrapper {
    width: 100%;
    height: 100%;
    will-change: transform;
    pointer-events: auto;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .canvas-container :global(canvas) {
    display: block;
  }

  /* Visor texts: above helmet */
  .text-stage {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    pointer-events: none;
    z-index: 4;
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
    color: var(--hex-neutral-900);
    letter-spacing: 0.01em;
    will-change: opacity, transform;
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  .visor-section--mobile {
    background: #030404;
    padding: 80px 24px 80px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .mobile-photo {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 8px;
  }
  
  .mobile-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .mobile-texts {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .mobile-visor-text {
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: 1rem;
    line-height: 1.75;
    color: var(--hex-neutral-900);
    margin: 0;
    padding: 0 0 0 16px;
    border-left: 2px solid rgba(250, 250, 250, 0.4);
  }
</style>