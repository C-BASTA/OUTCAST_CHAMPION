<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetZoomScene from '../HelmetZoomScene.svelte'

  // ─── Texts shown inside the visor ────────────────────────────────────────
  const VISOR_TEXTS = [
    'The modern Olympic movement is founded on an intrinsic paradox: the aspiration for universality through a political neutrality that frequently clashes with the brutal reality of global conflicts.',
    'The case of Vladyslav Heraskevych, the Ukrainian skeleton racer disqualified during the Milano Cortina 2026 Winter Olympics, represents a fundamental breaking point in this narrative.',
    'Vladyslav Heraskevych is a symbol of moral resistance. His exclusion from competition—caused by a helmet honoring athletes killed in the war—has sparked debate about the limits of personal expression in sport.',
  ]

  // Scroll phase boundaries (0–1)
  //  0.00–0.12  initial: full helmet, white bg
  //  0.12–0.36  zoom in:  cameraZ 8.5 → 1.8
  //  0.36–0.42  pause:    visor fills screen, no text
  //  0.42–0.56  text 1
  //  0.56–0.70  text 2
  //  0.70–0.84  text 3
  //  0.84–0.97  zoom out: cameraZ 1.8 → 8.5
  //  0.97–1.00  fade-out / handoff to gallery
  const ZOOM_IN_START  = 0.12, ZOOM_IN_END  = 0.36
  const ZOOM_OUT_START = 0.84, ZOOM_OUT_END = 0.97
  const CAM_FAR = 8.5, CAM_CLOSE = 1.8
  const TEXT_WINDOWS = [[0.42, 0.56], [0.56, 0.70], [0.70, 0.84]]
  const T_IN = 0.06, T_OUT = 0.05

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // ─── Scroll state ─────────────────────────────────────────────────────────
  let wrapperEl = $state(null)
  let progress  = $state(0)

  onMount(() => {
    const onScroll = () => {
      if (!wrapperEl) return
      const rect   = wrapperEl.getBoundingClientRect()
      const scrolled   = -rect.top
      const scrollable = rect.height - window.innerHeight
      progress = clamp(scrolled / scrollable, 0, 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })

  // ─── Derived scroll values ────────────────────────────────────────────────
  let cameraZ = $derived.by(() => {
    const p = progress
    if (p < ZOOM_IN_START)  return CAM_FAR
    if (p < ZOOM_IN_END)    return lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, ZOOM_IN_START, ZOOM_IN_END, 0, 1)))
    if (p < ZOOM_OUT_START) return CAM_CLOSE
    if (p < ZOOM_OUT_END)   return lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, ZOOM_OUT_START, ZOOM_OUT_END, 0, 1)))
    return CAM_FAR
  })

  // Dark overlay: 0 = white bg visible, 1 = fully dark
  let darkOverlay = $derived(ease(remap(progress, ZOOM_IN_START, ZOOM_IN_START + 0.18, 0, 1)))

  // Flag squares opacity: visible only before zoom starts
  let squaresOpacity = $derived(1 - ease(remap(progress, ZOOM_IN_START, ZOOM_IN_START + 0.10, 0, 1)))

  // Per-text animation state
  function textAnim(i) {
    const [ws, we] = TEXT_WINDOWS[i]
    const p = progress
    if (p <= ws || p >= we) return { opacity: 0, y: p < ws ? 70 : -70 }
    if (p < ws + T_IN) {
      const t = ease(remap(p, ws, ws + T_IN, 0, 1))
      return { opacity: t, y: lerp(70, 0, t) }
    }
    if (p > we - T_OUT) {
      const t = ease(remap(p, we - T_OUT, we, 0, 1))
      return { opacity: 1 - t, y: lerp(0, -70, t) }
    }
    return { opacity: 1, y: 0 }
  }
</script>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<div class="zoom-wrapper" id="helmet-zoom" bind:this={wrapperEl}>
  <div class="zoom-sticky">

    <!-- 3D Canvas (bottom layer) -->
    <div class="canvas-wrap">
      <Canvas renderMode="always">
        <HelmetZoomScene {cameraZ} />
      </Canvas>
    </div>

    <!-- Dark overlay: fades in as we zoom into the visor -->
    <div class="dark-overlay" style:opacity={darkOverlay} aria-hidden="true"></div>

    <!-- Ukrainian flag squares (only visible at entry, before zoom) -->
    <div class="squares" style:opacity={squaresOpacity} aria-hidden="true">
      <!-- bottom-left cluster -->
      <div class="sq-pair" style="left:4%; bottom:7%">
        <span class="sq-b" style="width:44px;height:44px"></span>
        <span class="sq-y" style="width:44px;height:44px"></span>
      </div>
      <!-- left middle -->
      <div class="sq-single sq-y" style="left:26%;top:64%;width:32px;height:32px"></div>
      <!-- top right: two separate squares -->
      <div class="sq-single sq-y" style="right:26%;top:32%;width:52px;height:52px"></div>
      <div class="sq-pair" style="right:7%;top:32%">
        <span class="sq-y" style="width:44px;height:44px"></span>
        <span class="sq-b" style="width:38px;height:38px"></span>
      </div>
      <!-- right middle -->
      <div class="sq-single sq-b" style="right:16%;top:75%;width:38px;height:38px"></div>
      <!-- bottom right cluster -->
      <div class="sq-pair" style="right:14%;bottom:8%">
        <span class="sq-y" style="width:42px;height:42px"></span>
        <span class="sq-b" style="width:42px;height:42px"></span>
      </div>
    </div>

    <!-- Visor text overlays -->
    <div class="text-stage" aria-live="polite">
      {#each VISOR_TEXTS as txt, i}
        {@const { opacity, y } = textAnim(i)}
        <p
          class="visor-text"
          style:opacity
          style:transform="translateY({y}px)"
          aria-hidden={opacity < 0.05}
        >{txt}</p>
      {/each}
    </div>

  </div>
</div>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<style>
  /* Outer scroll container — sets total scroll distance */
  .zoom-wrapper {
    position: relative;
    height: calc(100vh + 3200px);
    background: var(--hex-neutral-50, #fafafa);
  }

  /* Sticky viewport — stays fixed while user scrolls through wrapper */
  .zoom-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: var(--hex-neutral-50, #fafafa);
  }

  /* 3D canvas fills the sticky container */
  .canvas-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  /* Dark overlay — covers the white bg as we zoom in */
  .dark-overlay {
    position: absolute;
    inset: 0;
    background: #030404;
    pointer-events: none;
    z-index: 1;
  }

  /* Ukrainian flag squares */
  .squares {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }
  .sq-pair {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .sq-single {
    position: absolute;
  }
  .sq-b { display: block; background: #005BBB; }
  .sq-y { display: block; background: #FFD500; }

  /* Text stage: centered over the visor */
  .text-stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 3;
    /* Nudge text up slightly to align with visor center (visor is above geometric center) */
    padding-bottom: 8vh;
  }

  /* Individual text paragraph */
  .visor-text {
    position: absolute;
    max-width: 54ch;
    text-align: center;
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: clamp(0.9rem, 1.4vw, 1.35rem);
    line-height: 1.7;
    color: rgba(230, 225, 210, 0.82);
    padding: 0 1rem;
    margin: 0;
    will-change: transform, opacity;
    letter-spacing: 0.01em;
  }
</style>
