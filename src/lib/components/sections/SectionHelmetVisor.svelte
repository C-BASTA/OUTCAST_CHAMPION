<script>
  import { onMount } from 'svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  const TOTAL_SCROLL      = 15000   // px of scroll space after 100vh (longer = dissolve spreads over more scroll → fewer pixels off per cm)
  const ENTRY_END         = 0.1   // fraction of progress for the entry rise (smaller = helmet comes up sooner → less white gap before it)
  const ENTRY_START_Y     = 100   // vh: helmet starts fully offscreen below = smooth glide (must match the p===0 offscreen value to avoid a jump). Use ENTRY_END to tune how soon it settles.
  const CAM_FAR           = 8.5
  const CAM_CLOSE         = 1.8
  const MOBILE_BREAKPOINT = 768
  const SIDE              = 0.35

  const VISOR_TEXTS = [
    [
      'The modern Olympic movement',
      'is founded on an intrinsic paradox:',
      'the aspiration for universality',
      'through a political neutrality',
      'that frequently clashes',
      'with the brutal reality',
      'of global conflicts.',
    ],
    [
      'Vladyslav Heraskevych',
      'is a symbol of moral resistance.',
      'His exclusion from competition',
      'caused by a helmet honoring',
      'athletes killed in the war',
      'has sparked debate about',
      'the limits of personal expression',
      'in sport.',
    ],
  ]
  const TEXT_WINDOWS = [[0.18, 0.52], [0.52, 0.86]]
  const T_IN = 0.08, T_OUT = 0.05

  // The helmet start the parrallax as soon as the section enters
  let progress = $state(0)
  let section  = $state(null)
  let vpH      = $state(900)
  let isMobile = $state(false)

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // progress ENTRY_END→1 → zoomP 0→1 (usato solo per il testo e il pixel canvas)
  let zoomP = $derived(clamp((progress - ENTRY_END) / (1 - ENTRY_END), 0, 1))

  function computeVisorStoreValues(p) {
    // entryP: 0→1 durante la fase di entrata
    const entryP = ease(clamp(p / ENTRY_END, 0, 1))

    // cameraZ: zoom in durante la prima parte, poi zoom out all'uscita
    let camZ
    if (p < 0.20) camZ = lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, 0.00, 0.20, 0, 1)))
    else if (p < 0.86) camZ = CAM_CLOSE
    else if (p < 0.98) camZ = lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, 0.86, 0.98, 0, 1)))
    else camZ = CAM_FAR

    // rotY: ruota di lato all'inizio, poi fronta, poi di lato all'uscita
    let rotY
    if (p <= 0.20) rotY = lerp(Math.PI + SIDE, Math.PI, ease(clamp(p / 0.20, 0, 1)))
    else if (p <= 0.86) rotY = Math.PI
    else if (p <= 0.98) rotY = lerp(Math.PI, Math.PI - SIDE, ease(clamp((p - 0.86) / 0.12, 0, 1)))
    else rotY = Math.PI - SIDE

    // entryTransformY: il casco sale dal basso durante l'entrata
    const entryTransformY = entryP >= 1 ? 0 : lerp(ENTRY_START_Y, 0, entryP)

    // floatWeight: la fluttuazione si azzera durante lo zoom-in
    const floatWeight = ease(Math.max(0, Math.min(1, 1 - p / 0.18)))

    return { camZ, rotY, entryTransformY, floatWeight }
  }

  // Vertical parallax on the bg photo: pans upward continuously from first scroll
  //let bgParallaxY = $derived(-progress * vpH )
  let bgParallaxY = $derived(-ease(progress) * vpH * 0.5)

  // Background photo fades out as camera starts zooming in
  let bgOpacity = $derived(1 - ease(remap(zoomP, 0.00, 0.28, 0, 1)))

  // Pixel canvas (exit dissolve)
  const PIXEL_COLS = 243
  const PIXEL_ROWS = 152
  let pixelCanvas  = $state(null)
  // Cells pre-sorted by reveal threshold so the draw effect can binary-search
  // to the cutoff and only iterate the cells it actually draws (O(K) not O(N)).
  let sortedCells  = []

  // Spread the dissolve over a wider zoomP window so pixels switch off in smaller
  // batches across more scroll frames (smoother pixel-by-pixel reveal).
  const PIXEL_START = 0.86
  const PIXEL_END   = 1.0
  let pixelProgress = $derived(clamp(remap(zoomP, PIXEL_START, PIXEL_END, 0, 1), 0, 1))

  // Mostra le stelle grigie (di HelmetGlobal) durante la dissolvenza/cambio colore,
  // anche se helmetStore.visible è ancora false in questa fase.
  $effect(() => {
    helmetStore.starsVisible = !isMobile && zoomP >= PIXEL_START
  })

  // Count of sorted cells whose threshold <= val (cells already past the front).
  function cellsBelow(val) {
    let lo = 0, hi = sortedCells.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sortedCells[mid].threshold <= val) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  $effect(() => {
    if (!pixelCanvas || sortedCells.length > 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    pixelCanvas.width  = Math.round(window.innerWidth * dpr)
    pixelCanvas.height = Math.round(window.innerHeight * dpr)

    const total = PIXEL_COLS * PIXEL_ROWS
    const cells = new Array(total)
    for (let i = 0; i < total; i++) {
      const row      = Math.floor(i / PIXEL_COLS)
      const rowT     = row / PIXEL_ROWS                     // 0 = top, 1 = bottom
      // Top→bottom bias (0.05→0.85) plus tighter jitter so thresholds stay spread
      // across [0,1] with little clamping — pixels keep vanishing right to the end
      // instead of a chunk all clamping to 1.0 and popping off at once.
      const colJitter = (Math.random() - 0.5) * 0.30
      const rowJitter = (Math.random() - 0.5) * 0.22
      cells[i] = {
        col: i % PIXEL_COLS,
        row,
        threshold: Math.max(0, Math.min(1, rowT * 0.80 + 0.05 + colJitter + rowJitter))
      }
    }
    cells.sort((a, b) => a.threshold - b.threshold)
    sortedCells = cells
  })

  $effect(() => {
    if (!pixelCanvas || sortedCells.length === 0) return
    const ctx = pixelCanvas.getContext('2d')
    const w   = pixelCanvas.width
    const h   = pixelCanvas.height

    if (zoomP < PIXEL_START) {
      ctx.clearRect(0, 0, w, h)
      return
    }

    const cellW = w / PIXEL_COLS
    const cellH = h / PIXEL_ROWS
    const p     = pixelProgress

    // Pixel-by-pixel: each cell is hard black once pixelProgress passes its threshold.
    const drawCount = cellsBelow(p)

    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#030404'
    for (let j = 0; j < drawCount; j++) {
      const { col, row } = sortedCells[j]
      ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1)
    }
  })

  const INIT_BLUR_FIRST = 5
  const INIT_BLUR_REST  = 5
  const INIT_OPQ_FIRST  = 0.12
  const INIT_OPQ_REST   = 0.12

  function lineAnim(textIdx, lineIdx, numLines) {
    const [ws, we] = TEXT_WINDOWS[textIdx]
    const p = zoomP

    const initBlur = lineIdx === 0 ? INIT_BLUR_FIRST : INIT_BLUR_REST
    const initOpq  = lineIdx === 0 ? INIT_OPQ_FIRST  : INIT_OPQ_REST

    if (p <= ws || p >= we) {
      return { opacity: 0, blur: initBlur, y: p < ws ? 40 : -40 }
    }

    // Exit: all lines fade+blur out together
    if (p > we - T_OUT) {
      const t = ease(remap(p, we - T_OUT, we, 0, 1))
      return { opacity: lerp(1, 0, t), blur: lerp(0, initBlur, t), y: lerp(0, -40, t) }
    }

    // Entry: stagger each line across a wider window
    const staggerSpan = 0.12
    const lineStart = ws + (lineIdx / numLines) * staggerSpan
    const lineEnd = lineStart + T_IN

    if (p < lineStart) return { opacity: 0, blur: initBlur, y: 40 }

    const t = ease(clamp(remap(p, lineStart, lineEnd, 0, 1), 0, 1))
    return {
      opacity: lerp(initOpq, 1, t),
      blur:    lerp(initBlur, 0, t),
      y:       lerp(40, 0, t)
    }
  }

  onMount(() => {
    const checkSize = () => {
      vpH = window.innerHeight
      isMobile = window.innerWidth < MOBILE_BREAKPOINT
    }

    // Edge trigger: scriviamo sullo store solo quando cambia lo stato sectionEnded,
    // non ad ogni evento scroll. Così SectionAthletes può gestire il casco liberamente.
    let lastSectionEnded = false

    const onScroll = () => {
      if (!section) return
      const rect = section.getBoundingClientRect()
      const totalScrollable = section.offsetHeight - window.innerHeight
      progress = Math.max(0, Math.min(1, -rect.top / totalScrollable))

      const sectionEnded = rect.bottom <= window.innerHeight + 1

      if (sectionEnded) {
        // Solo alla prima volta che la sezione finisce: scriviamo stato finale
        if (!lastSectionEnded) {
          lastSectionEnded = true
          helmetStore.visible          = true
          helmetStore.entryTransformY  = 0
          helmetStore.floatWeight      = 1
          helmetStore.lookAtX          = 0
          helmetStore.cameraY          = 0.25
          helmetStore.cameraZ          = 8.5
          helmetStore.lookAtY          = 0.20
          helmetStore.rotX             = 0.25
          helmetStore.rotY             = Math.PI - 0.35
          helmetStore.rotZ             = 0
          helmetStore.viewerPaddingLeft = '0%'
          helmetStore.exitY            = 0
        }
        // Dopo la transizione non tocchiamo più lo store: SectionAthletes gestisce
        return
      }

      // Sezione attiva (scrolling verso il basso o ritorno verso l'alto)
      if (lastSectionEnded) {
        // Utente ha scrollato indietro nella sezione
        lastSectionEnded = false
        helmetStore.visible = false
      }

      const p = progress
      if (p === 0) {
        helmetStore.entryTransformY = 100
        helmetStore.floatWeight     = 0
      } else {
        const v = computeVisorStoreValues(p)
        helmetStore.cameraZ          = isMobile ? v.camZ + 1.5 : v.camZ
        helmetStore.cameraY          = 0.25
        helmetStore.lookAtX          = 0
        helmetStore.lookAtY          = 0.20
        helmetStore.rotX             = 0.25
        helmetStore.rotY             = v.rotY
        helmetStore.rotZ             = 0
        helmetStore.smoothRotation   = false
        helmetStore.entryTransformY  = v.entryTransformY
        helmetStore.floatWeight      = v.floatWeight
        if (isMobile) {
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
    <!-- Pixel canvas: fuori dallo sticky-wrap → partecipa al root stacking context
         a z-index:2 (sotto HelmetGlobal z-index:3, sopra la pagina) -->
    <canvas bind:this={pixelCanvas} class="pixel-bg"></canvas>

    <div class="sticky-wrap">

      <!-- Visor texts: appear during zoom hold phase -->
      {#if zoomP > 0.16 && zoomP < 0.90}
        <div class="text-stage" aria-live="polite">
          {#each VISOR_TEXTS as lines, i}
            {@const [ws, we] = TEXT_WINDOWS[i]}
            {#if zoomP > ws - 0.02 && zoomP < we + 0.02}
              <div class="visor-block">
                {#each lines as line, j}
                  {@const anim = lineAnim(i, j, lines.length)}
                  <span
                    class="visor-line"
                    style:opacity={anim.opacity}
                    style:transform="translateY({anim.y}px)"
                    style:filter={anim.blur > 0 ? `blur(${anim.blur.toFixed(2)}px)` : 'none'}
                  >{line}</span>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      {/if}

    </div>
  </section>
{/if}

<!-- ── Mobile (scroll-driven) ─────────────────────────────────────────── -->
{#if isMobile}
  {@const dezoomStarted = progress > 0.82}
  <section
    bind:this={section}
    class="visor-section--mobile"
    id="helmet-visor"
    style:background={dezoomStarted ? '#030404' : '#FAFAFA'}
  >
    <div class="mobile-sticky">
      <div class="mobile-texts">
        {#each VISOR_TEXTS as lines, i}
          {@const [ws, we] = TEXT_WINDOWS[i]}
          {#if zoomP > ws - 0.02 && zoomP < we + 0.02}
            <p class="mobile-visor-text">
              {#each lines as line, j}
                {@const anim = lineAnim(i, j, lines.length)}
                <span
                  style:opacity={anim.opacity}
                  style:transform="translateY({anim.y}px)"
                  style:filter={anim.blur > 0 ? `blur(${anim.blur.toFixed(2)}px)` : 'none'}
                  style:display="block"
                >{line}</span>
              {/each}
            </p>
          {/if}
        {/each}
      </div>
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
    background: transparent;
    z-index: 4;
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
    will-change: transform;
  }

  /* Pixel canvas: exit dissolve — position fixed così resta sotto HelmetGlobal (z-index:3)
     e non viene inglobato nello stacking context dello sticky-wrap (z-index:4) */
  .pixel-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: block;
    pointer-events: none;
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
  
  .visor-block {
    position: absolute;
    padding: 0 3rem;
    max-width: 900px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .visor-line {
    display: block;
    text-align: center;
    font-family: var(--font-primary, 'GeistPixel');
    font-size: clamp(24px, 3.2vw, 48px);
    white-space: nowrap;
    color: var(--color-ink-inverted);
    will-change: opacity, transform;
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  .visor-section--mobile {
    background: #030404;
    height: calc(100vh + 8000px);
    position: relative;
  }

  .visor-section--mobile .mobile-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 32px;
    padding-top: 0;
    margin-top: -20vh;
    z-index: 10;
    pointer-events: none;
  }

  .mobile-texts {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    text-align: center;
  }

  .mobile-visor-text {
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: 0.95rem;
    color: #030404;
    line-height: 1.6;
  }
</style>
