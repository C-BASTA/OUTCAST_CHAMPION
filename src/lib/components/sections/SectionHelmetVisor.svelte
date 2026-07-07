<script>
  import { onMount, tick } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  // Scroll space in viewport heights — scales with any screen size.
  // Desktop: 6 vh-lengths of scrollable room; mobile: 4.
  const SCROLL_VH_DESKTOP = 600
  const SCROLL_VH_MOBILE  = 400

  const ENTRY_END         = 0.1
  const ENTRY_START_Y     = 80
  const CAM_FAR           = 8.5
  const CAM_CLOSE         = 1.8
  const CAM_CLOSE_MOBILE  = 2.3
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

  const MOBILE_VISOR_TEXTS = [
    [
      'The modern Olympic movement',
      'is founded on an',
      'intrinsic paradox:',
      'the aspiration for universality',
      'through a political neutrality',
      'that frequently clashes',
      'with the brutal reality',
      'of global conflicts.',
    ],
    [
      'Vladyslav Heraskevych',
      'is a symbol of',
      'moral resistance.',
      'His exclusion from competition',
      'caused by a helmet honoring',
      'athletes killed in the war',
      'has sparked debate about',
      'the limits of personal',
      'expression in sport.',
    ],
  ]

  const TEXT_WINDOWS = [[0.18, 0.52], [0.52, 0.86]]
  const T_IN = 0.08, T_OUT = 0.05

  let progress = $state(0)
  let section  = $state(null)
  let vpH      = $state(900)
  let isMobile = $state(false)

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  let zoomP = $derived(clamp((progress - ENTRY_END) / (1 - ENTRY_END), 0, 1))

  function computeVisorStoreValues(p, camClose) {
    const entryP = ease(clamp(p / ENTRY_END, 0, 1))

    let camZ
    if (p < 0.20) camZ = lerp(CAM_FAR, camClose, ease(remap(p, 0.00, 0.20, 0, 1)))
    else if (p < 0.86) camZ = camClose
    else if (p < 0.98) camZ = lerp(camClose, CAM_FAR, ease(remap(p, 0.86, 0.98, 0, 1)))
    else camZ = CAM_FAR

    let rotY
    if (p <= 0.20) rotY = lerp(Math.PI + SIDE, Math.PI, ease(clamp(p / 0.20, 0, 1)))
    else if (p <= 0.86) rotY = Math.PI
    else if (p <= 0.98) rotY = lerp(Math.PI, Math.PI - SIDE, ease(clamp((p - 0.86) / 0.12, 0, 1)))
    else rotY = Math.PI - SIDE

    const entryTransformY = entryP >= 1 ? 0 : lerp(ENTRY_START_Y, 0, entryP)
    const floatWeight = ease(Math.max(0, Math.min(1, 1 - p / 0.18)))

    return { camZ, rotY, entryTransformY, floatWeight }
  }

  let bgParallaxY = $derived(-ease(progress) * vpH * 0.5)
  let bgOpacity   = $derived(1 - ease(remap(zoomP, 0.00, 0.28, 0, 1)))

  const CELL_SIZE  = 6
  let pixelCanvas  = $state(null)
  let sortedCells  = []
  let pixelCols    = 0
  let pixelRows    = 0

  const PIXEL_START = 0.86
  const PIXEL_END   = 1.0
  let pixelProgress = $derived(clamp(remap(zoomP, PIXEL_START, PIXEL_END, 0, 1), 0, 1))

  $effect(() => {
    helmetStore.starsVisible = zoomP >= PIXEL_START
  })

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

    pixelCols = Math.ceil(window.innerWidth  / CELL_SIZE)
    pixelRows = Math.ceil(window.innerHeight / CELL_SIZE)

    const total = pixelCols * pixelRows
    const cells = new Array(total)
    for (let i = 0; i < total; i++) {
      const col  = i % pixelCols
      const row  = Math.floor(i / pixelCols)
      const rowT = row / pixelRows
      const colJitter = (Math.random() - 0.5) * 0.30
      const rowJitter = (Math.random() - 0.5) * 0.22
      cells[i] = {
        col, row,
        threshold: Math.max(0, Math.min(1, rowT * 0.80 + 0.05 + colJitter + rowJitter))
      }
    }
    cells.sort((a, b) => a.threshold - b.threshold)
    sortedCells = cells
  })

  $effect(() => {
    if (!pixelCanvas || sortedCells.length === 0 || pixelCols === 0) return
    const ctx = pixelCanvas.getContext('2d')
    const w   = pixelCanvas.width
    const h   = pixelCanvas.height

    if (zoomP < PIXEL_START) {
      ctx.clearRect(0, 0, w, h)
      return
    }

    const cellSize = w / pixelCols
    const p        = pixelProgress
    const drawCount = cellsBelow(p)

    ctx.fillStyle = '#FAFAFA'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#030404'
    for (let j = 0; j < drawCount; j++) {
      const { col, row } = sortedCells[j]
      ctx.fillRect(col * cellSize, row * cellSize, cellSize + 1, cellSize + 1)
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

    if (p > we - T_OUT) {
      const t = ease(remap(p, we - T_OUT, we, 0, 1))
      return { opacity: lerp(1, 0, t), blur: lerp(0, initBlur, t), y: lerp(0, -40, t) }
    }

    const staggerSpan = 0.12
    const lineStart = ws + (lineIdx / numLines) * staggerSpan
    const lineEnd   = lineStart + T_IN

    if (p < lineStart) return { opacity: 0, blur: initBlur, y: 40 }

    const t = ease(clamp(remap(p, lineStart, lineEnd, 0, 1), 0, 1))
    return {
      opacity: lerp(initOpq, 1, t),
      blur:    lerp(initBlur, 0, t),
      y:       lerp(40, 0, t)
    }
  }

  // Writes the "section ended" final state to helmetStore once.
  function applyEndState() {
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

  onMount(async () => {
    const checkSize = () => {
      vpH      = window.innerHeight
      isMobile = window.innerWidth < MOBILE_BREAKPOINT
    }
    checkSize()
    // Aspetta che Svelte aggiorni il DOM dopo il cambio di isMobile,
    // così `section` punta alla sezione giusta (mobile o desktop) prima
    // che ScrollTrigger venga creato.
    await tick()
    window.addEventListener('resize', checkSize)

    let lastSectionEnded = false

    // Timer used to debounce onLeaveBack: if onLeave fires within 200ms it means
    // the back-scroll was a glitch (position:fixed body removal in AthleteDetail
    // briefly exposes scroll=0 before window.scrollTo restores the real position).
    let leaveBackTimer = null

    // ScrollTrigger fires via Lenis → ScrollTrigger.update() wired in layout.svelte.
    // start:'top top' / end:'bottom bottom' maps exactly to the old manual formula:
    //   progress = -rect.top / (section.offsetHeight - window.innerHeight)
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom bottom',
      onUpdate(self) {
        progress = self.progress

        // progress === 1 coincides with rect.bottom === window.innerHeight (section ended)
        if (self.progress >= 1) {
          if (!lastSectionEnded) {
            lastSectionEnded = true
            applyEndState()
          }
          return
        }

        // User scrolled back into the section from below
        if (lastSectionEnded) {
          lastSectionEnded = false
          helmetStore.visible = false
        }

        const p = self.progress
        if (p === 0) {
          helmetStore.entryTransformY = ENTRY_START_Y
          helmetStore.floatWeight     = 0
        } else {
          const v = computeVisorStoreValues(p, isMobile ? CAM_CLOSE_MOBILE : CAM_CLOSE)
          helmetStore.cameraZ          = v.camZ
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
      },
      // Fired when the user scrolls forward past the section end (progress stays 1).
      // Also cancels any pending leaveBack reset — if both fire within 200ms it was
      // a scroll=0 glitch (AthleteDetail position:fixed removal), not genuine back-scroll.
      onLeave() {
        if (!lastSectionEnded) {
          lastSectionEnded = true
          applyEndState()
        }
      },
      // Fired when the user scrolls back before the section start
      onLeaveBack() {
         clearTimeout(leaveBackTimer)
        leaveBackTimer = null
       clearTimeout(leaveBackTimer)
        leaveBackTimer = setTimeout(() => {
          leaveBackTimer = null
          progress = 0
          if (lastSectionEnded) {
            lastSectionEnded = false
            helmetStore.visible = false
          }
          helmetStore.entryTransformY = ENTRY_START_Y
          helmetStore.floatWeight     = 0
        }, 200)
      },
    })

    return () => {
      st.kill()
      clearTimeout(leaveBackTimer)
      window.removeEventListener('resize', checkSize)
    }
  })
</script>

<!-- Pixel canvas: position fixed, shared between desktop and mobile.
     z-index:2 (below HelmetGlobal z-index:3, above page) -->
<canvas bind:this={pixelCanvas} class="pixel-bg"></canvas>

<!-- ── Desktop ────────────────────────────────────────────────────────────── -->
{#if !isMobile}
  <section
    bind:this={section}
    class="visor-section"
    id="helmet-visor"
    style:height="{SCROLL_VH_DESKTOP + 100}vh"
  >
    <div class="sticky-wrap">

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

<!-- ── Mobile ─────────────────────────────────────────────────────────────── -->
{#if isMobile}
  <section
    bind:this={section}
    class="visor-section--mobile"
    id="helmet-visor"
    style:height="calc(100vh + 8000px)"
  >
    <div class="mobile-sticky">
      <div class="mobile-texts">
        {#each MOBILE_VISOR_TEXTS as lines, i}
          {@const [ws, we] = TEXT_WINDOWS[i]}
          {#if zoomP > ws - 0.02 && zoomP < we + 0.02}
            <p class="mobile-visor-text">
              {#each lines as line, j}
                {@const anim = lineAnim(i, j, lines.length)}
                <span
                  class="mobile-visor-line"
                  style:opacity={anim.opacity}
                  style:transform="translateY({anim.y}px)"
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

  /* Pixel canvas: fixed so it sits below HelmetGlobal (z-index:3) and outside
     the sticky-wrap stacking context (z-index:4). */
  .pixel-bg {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: block;
    pointer-events: none;
  }

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
    color: neutral-50;
    will-change: opacity, transform;
    pointer-events: auto;
    user-select: text;
  }

  .visor-line::selection {
    background: #FAFAFA;
    color: #030404;
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  .visor-section--mobile {
    background: transparent;
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
    padding: 0 18px;
    padding-top: 0;
    margin-top: -20vh;
    z-index: 10;
    pointer-events: none;
  }

  .mobile-texts {
    display: flex;
    flex-direction: column;
    gap: 28px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    text-align: center;
  }

  .mobile-visor-text {
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: clamp(1.1rem, 5.1vw, 1.3rem);
    color: #FAFAFA;
    line-height: 1.5;
    pointer-events: auto;
    user-select: text;
  }

  .mobile-visor-text::selection,
  .mobile-visor-line::selection {
    background: #FAFAFA;
    color: #030404;
  }

  .mobile-visor-line {
    display: block;
    will-change: opacity, transform;
  }
</style>
