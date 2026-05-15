<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetZoomScene from '../helmetConfigurator/HelmetZoomScene.svelte'

  const VISOR_TEXTS = [
    'The modern Olympic movement is founded on an intrinsic paradox: the aspiration for universality through a political neutrality that frequently clashes with the brutal reality of global conflicts.',
    'The case of Vladyslav Heraskevych, the Ukrainian skeleton racer disqualified during the Milano Cortina 2026 Winter Olympics, represents a fundamental breaking point in this narrative.',
    'Vladyslav Heraskevych is a symbol of moral resistance. His exclusion from competition—caused by a helmet honoring athletes killed in the war—has sparked debate about the limits of personal expression in sport.',
  ]

  // Scroll phase boundaries (0 = section top, 1 = section bottom)
  //  0.00–0.20  initial/zoom in: helmet starts empty
  //  0.20–0.42  scroll step 1: text 1 fades in/out
  //  0.42–0.64  scroll step 2: text 2 fades in/out
  //  0.64–0.86  scroll step 3: text 3 fades in/out
  //  0.86–0.98  scroll step 4: zoom out and pass to next section
  const CAM_FAR   = 8.5
  const CAM_CLOSE = 1.8
  const TEXT_WINDOWS = [[0.20, 0.42], [0.42, 0.64], [0.64, 0.86]]
  const T_IN = 0.055, T_OUT = 0.055

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const invlerp = (a, b, x) => (x - a) / (b - a)
  const remap   = (x, a, b, c, d) => lerp(c, d, clamp(invlerp(a, b, x), 0, 1))
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  let wrapperEl = $state(null)
  let progress  = $state(0)

  onMount(() => {
    const onScroll = () => {
      if (!wrapperEl) return
      const rect     = wrapperEl.getBoundingClientRect()
      const scrolled = -rect.top
      const max      = rect.height - window.innerHeight
      progress = clamp(scrolled / max, 0, 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })

  // ─── Camera Z ──────────────────────────────────────────────────────────────
  let cameraZ = $derived.by(() => {
    const p = progress
    if (p < 0.20)  return lerp(CAM_FAR, CAM_CLOSE, ease(remap(p, 0.00, 0.20, 0, 1)))
    if (p < 0.86)  return CAM_CLOSE
    if (p < 0.98)  return lerp(CAM_CLOSE, CAM_FAR, ease(remap(p, 0.86, 0.98, 0, 1)))
    return CAM_FAR
  })

  // ─── Background colour (passed to scene — no HTML overlay needed) ──────────
  // White (#fafafa) → dark (#030404) during zoom-in, stays dark during zoom-out
  let bgColor = $derived.by(() => {
    const t = ease(remap(progress, 0.00, 0.20, 0, 1))
    const r = Math.round(lerp(0xfa, 0x03, t)).toString(16).padStart(2, '0')
    const g = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    const b = Math.round(lerp(0xfa, 0x04, t)).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  })

  // ─── Ukrainian flag squares: fade out as zoom begins ──────────────────────
  let squaresOpacity = $derived(1 - ease(remap(progress, 0.00, 0.10, 0, 1)))

  // ─── Text animations ───────────────────────────────────────────────────────
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

    <!-- 3D canvas — always visible, background colour managed by Three.js scene -->
    <div class="canvas-wrap">
      <Canvas renderMode="always">
        <HelmetZoomScene {cameraZ} {bgColor} />
      </Canvas>
    </div>

    <!-- Ukrainian flag squares (visible only at section entry) -->
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

    <!-- Visor text overlays -->
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

  </div>
</div>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<style>
  /* overflow-x: clip prevents horizontal bleed without breaking position:sticky */
  .zoom-wrapper {
    position: relative;
    height: 500vh;
    overflow-x: clip;
  }

  .zoom-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }

  /* Canvas fills the sticky viewport */
  .canvas-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  /* ─ Flag squares ──────────────────────────────────────────── */
  .squares {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.1s linear;
  }
  .sq-pair   { position: absolute; display: flex; align-items: flex-end; gap: 0; }
  .sq-single { position: absolute; }
  .sq-b { display: block; background: #005BBB; flex-shrink: 0; }
  .sq-y { display: block; background: #FFD500; flex-shrink: 0; }

  /* ─ Text stage ────────────────────────────────────────────── */
  .text-stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 3;
    /* Nudge up slightly: visor center is above the geometric center */
    padding-bottom: 10vh;
  }

  .visor-text {
    position: absolute;
    max-width: 54ch;
    text-align: center;
    font-family: var(--font-primary, 'GeistPixel', monospace);
    font-size: clamp(0.85rem, 1.35vw, 1.3rem);
    line-height: 1.7;
    color: var(--color-dark);
    padding: 0 1rem;
    margin: 0;
    will-change: transform, opacity;
    letter-spacing: 0.01em;
  }
</style>
