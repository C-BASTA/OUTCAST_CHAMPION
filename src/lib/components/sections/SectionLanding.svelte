<script>
  import { onMount } from 'svelte'

  let wrap, helmetLayer
  let _cx = 0, _cy = 0, _r = 0, _vx = 0, _vy = 0, _vr = 0
  let _t1x = 0, _t1y = 0, _t1r = 0, _t1vx = 0, _t1vy = 0, _t1vr = 0
  let _tCx = 0, _tCy = 0, _tR = 0
  let _hovering = false
  let lastMoveTime = Date.now()
  let isAutoPlaying = false

  const RADIUS = 220
  const STIFFNESS = 0.15
  const DAMPING = 0.85

  // --- LOGICA SCROLL ORIGINALE ---
  const SCROLL_RANGE = 900
  const UNIT = 'Vladyslav Heraskevyč  '
  const TEXT = UNIT.repeat(6)
  const ROWS = [{ color: '#ffd700', dir: -1 }, { color: '#0057b7', dir: 1 }, { color: '#ffd700', dir: -1 }]
  const TRAVEL = 520

  let progress = $state(0)
  let _scale = 1
  let photoScale = $derived(1 - progress * 0.78)
  let photoOpacity = $derived(Math.max(0, 1 - progress * 1.2))
  let titleOpacity = $derived(Math.max(0, 1 - progress * 6))
  let textOpacity = $derived(Math.min(1, progress * 2.5))

  onMount(() => {
    const onScroll = () => {
      const p = Math.max(0, Math.min(1, window.scrollY / SCROLL_RANGE))
      progress = p
      _scale = 1 - p * 0.78
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // --- CONFIGURAZIONE AUTO-PLAY (IL TUO ZIG-ZAG) ---
    let idleStep = 0
    let isPausing = false
    let pauseStartTime = 0
    const IDLE_WAIT = 3000
    const PAUSE_BETWEEN = 2000
    const TARGET_TOLERANCE = 100
    const idlePoints = [
      { x: 0.3, y: 0.2 }, { x: 0.7, y: 0.4 }, { x: 0.2, y: 0.6 }, { x: 0.8, y: 0.8 }
    ]

    let raf
    const tick = () => {
      const now = Date.now()
      const w = wrap?.offsetWidth || 0
      const h = wrap?.offsetHeight || 0

      // Gestione Idle Animation (Tua logica originale)
      if (!_hovering && (now - lastMoveTime > IDLE_WAIT)) {
        if (isPausing) {
          _tR = 0
          if (now - pauseStartTime > PAUSE_BETWEEN) {
            isPausing = false
            idleStep = 0
          }
        } else {
          isAutoPlaying = true
          _tR = RADIUS * 0.85
          const target = idlePoints[idleStep]
          _tCx = target.x * w
          _tCy = target.y * h
          const dist = Math.sqrt(Math.pow(_tCx - _cx, 2) + Math.pow(_tCy - _cy, 2))
          if (dist < TARGET_TOLERANCE) {
            if (idleStep === idlePoints.length - 1) {
              isPausing = true
              pauseStartTime = now
              isAutoPlaying = false
            } else { idleStep++ }
          }
        }
      } else if (_hovering) {
        isAutoPlaying = false
        isPausing = false
      }

      // Fisica Fluida
      const currentStiffness = isAutoPlaying ? 0.015 : STIFFNESS
      const currentDamping = isAutoPlaying ? 0.8 : DAMPING

      _vx += (_tCx - _cx) * currentStiffness; _vx *= currentDamping; _cx += _vx
      _vy += (_tCy - _cy) * currentStiffness; _vy *= currentDamping; _cy += _vy
      _vr += (_tR - _r) * 0.05; _vr *= 0.8; _r += _vr

      // Scia (Effetto acqua/blob)
      _t1vx += (_cx - _t1x) * 0.12; _t1vx *= 0.75; _t1x += _t1vx
      _t1vy += (_cy - _t1y) * 0.12; _t1vy *= 0.75; _t1y += _t1vy
      _t1r += (_r * 0.85 - _t1r) * 0.1; _t1r *= 0.8

      if (helmetLayer) {
        if (!isAutoPlaying && !_hovering && _r < 1) {
          helmetLayer.style.opacity = "0"
        } else {
          helmetLayer.style.opacity = "1"
          const stretch = Math.min(Math.abs(_vx + _vy) * 0.6, 60)
          
          const g = (x, y, r, sx) => {
            const px = (x / w) * 100
            const py = (y / h) * 100
            // Usiamo 80% -> 100% per lasciare un po' di "morbidezza" che il filtro contrasto trasformerà in liquido
            return `radial-gradient(${r + sx}px ${r}px at ${px}% ${py}%, black 80%, transparent 100%)`
          }

          const maskVal = [g(_cx, _cy, _r, stretch), g(_t1x, _t1y, _t1r, 0)].join(', ')
          helmetLayer.style.webkitMaskImage = maskVal
          helmetLayer.style.maskImage = maskVal
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onMove = (e) => {
      _hovering = true
      lastMoveTime = Date.now()
      const hr = wrap.getBoundingClientRect()
      _tCx = (e.clientX - hr.left) / _scale
      _tCy = (e.clientY - hr.top) / _scale
      _tR = RADIUS
    }

    const onLeave = () => { _hovering = false; _tR = 0 }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  })
</script>

<section id="athlete" class="landing">
  <div class="sticky-inner">
    <h1 class="title" style:opacity={titleOpacity}>Outcast<br />Champion</h1>

    <div
      class="photo-wrap"
      bind:this={wrap}
      style:transform="translateX(-50%) scale({photoScale})"
      style:opacity={photoOpacity}
    >
      <img class="vlad" src="/images/vlad-face-hd-transparent.png" alt="Vlad" draggable="false" />
      
      <div class="gooey-container">
        <img
          class="helmet"
          src="/images/vlad-hover-black.png"
          alt=""
          bind:this={helmetLayer}
          draggable="false"
        />
      </div>
    </div>

    <div class="name-wrap" style:opacity={textOpacity}>
      {#each ROWS as row, i}
        <div class="row-container" style:transform="translateX({row.dir * (1 - Math.min(progress * 1.5, 1)) * TRAVEL}px)">
          <div class="name-row {i % 2 === 0 ? 'marquee-left' : 'marquee-right'}" style:color={row.color}>
            {TEXT} {TEXT}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .landing {
    position: relative;
    width: 100%;
    height: calc(100vh + 900px);
  }

  .sticky-inner {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    z-index: 1;
  }

  .title {
    position: absolute;
    top: 32px;
    left: 48px;
    font-family: var(--font-primary);
    font-size: clamp(40px, 4.5vw, 72px);
    font-weight: 400;
    color: #030404;
    line-height: 1.05;
    letter-spacing: -0.02em;
    z-index: 10;
    pointer-events: none;
    user-select: none;
    will-change: opacity;
  }

  .photo-wrap {
    position: absolute;
    bottom: -8%;
    left: 50%;
    width: min(105vh, 74vw);
    height: min(105vh, 74vw);
    cursor: crosshair;
    transform-origin: 50% 40%;
    will-change: transform, opacity;
  }

  .vlad {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: top center;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    z-index: 2;
  }

  /* --- IL TRUCCO FLUIDO --- */
  .gooey-container {
    position: absolute;
    inset: 0;
    z-index: 3;
    /* Il contrasto elevato "mangia" le sfumature del blur creando bordi netti e liquidi */
    filter: brightness(1.1);
    pointer-events: none;
  }

  .helmet {
    position: absolute;
    top: -17%;
    left: 50%;
    transform: translateX(-50%);
    width: 118%;
    height: auto;
    display: block;
    z-index: 3;
    transition: opacity 0.4s ease;
    /* Il blur applicato all'immagine mascherata permette ai gradienti di "fondersi" */
  }
  /* Modifica la maschera per avere bordi sfumati che il filtro contrasto trasformerà in blob */

  .name-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
    overflow: hidden;
    z-index: 3;
    pointer-events: none;
    will-change: opacity;
  }

  .row-container {
    width: 100%;
    will-change: transform;
  }

  .name-row {
    display: inline-block;
    font-family: var(--font-primary);
    font-size: clamp(72px, 8.5vw, 128px);
    font-weight: 400;
    line-height: 1.05;
    white-space: nowrap;
  }

  /* RIGA 1 e 3: scorrono verso SINISTRA */
  .marquee-left {
    animation: marquee-l 25s linear infinite;
  }

  /* RIGA 2: scorre verso DESTRA */
  .marquee-right {
    animation: marquee-r 25s linear infinite;
  }

  @keyframes marquee-l {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes marquee-r {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }
</style>