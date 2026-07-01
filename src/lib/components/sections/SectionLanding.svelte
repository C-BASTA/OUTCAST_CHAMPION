<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  
  import { palette } from '$lib/styles/tokens/index'

  let wrap, revealCanvas
  let section = $state()
  let _scale = 1 // fisso, serve solo per il calcolo del mouse
  let ctx
  let helmetImage
  let _cx = 0, _cy = 0, _r = 0, _vx = 0, _vy = 0, _vr = 0
  let _tCx = 0, _tCy = 0, _tR = 0
  let _hovering = false
  let lastMoveTime = Date.now()
  let isAutoPlaying = false
  let photoW = 0
  let photoH = 0
  let canvasW = 0
  let canvasH = 0
  let lastPointerX = 0
  let lastPointerY = 0
  let lastPointerTime = 0
  let lastFrameTime = 0
  let lastTilePulse = 0
  let tiles = []

  // Riferimento al layer comune per l'effetto 3D
  let photoMotion

  // --- SPRING 3D ---
  // target: valori verso cui tendiamo (impostati da mouse/gyro)
  // cur:    valore corrente (aggiornato frame per frame con spring)
  // vel:    velocità corrente
  const S3_STIFF = 0.055  // rigidità: più basso = più lento e "pesante"
  const S3_DAMP  = 0.82   // smorzamento: più basso = più rimbalzo
  const S3_MAX_ROT  = 2   // gradi massimi di rotazione (solo accenno, non stretch)
  const S3_MAX_DRIFT = 18 // px massimi di traslazione parallax (effetto profondità)

  let s3_tRotX = 0, s3_tRotY = 0   // target rotation
  let s3_tDX   = 0, s3_tDY   = 0   // target drift (px)
  let s3_rX = 0, s3_rY = 0         // current rotation
  let s3_dX = 0, s3_dY = 0         // current drift
  let s3_vRX = 0, s3_vRY = 0       // velocity rotation
  let s3_vDX = 0, s3_vDY = 0       // velocity drift

  // oscillazione idle (floating autonomo)
  const FLOAT_AMP  = 3    // px ampiezza oscillazione Y
  const FLOAT_TILT = 0.4  // gradi ampiezza tilt idle
  let s3_mouseInside = false
  // Su dispositivi touch non c'è hover: il floating idle non si fermerebbe mai
  // → lo disattiviamo e l'immagine resta ferma.
  let isTouch = false

  const RADIUS = 190
  const STIFFNESS = 0.15
  const DAMPING = 0.85
  const MAX_TILES = 280
  const TILE_FADE_START = 0.58
  const REVEAL_PAD_X = 0.09
  const REVEAL_PAD_TOP = 0.22
  const HELMET_SCALE = 0.45
  const HELMET_CENTER_Y = 0.54
  // Su mobile la foto riempie il box con la testa più in alto: il casco va alzato
  // e rimpicciolito rispetto al desktop.
  const HELMET_CENTER_Y_MOBILE = 0.32
  const HELMET_SCALE_MOBILE = 0.4
  let helmetMobile = false

  // --- LOGICA SCROLL ORIGINALE ---
  const SCROLL_RANGE = 300
  const UNIT = 'Vladyslav Heraskevyč  '
  const TEXT = UNIT.repeat(6)
  const ROWS = [{ color: palette.brandYellow500, dir: -1 }, { color: palette.brandBlue500, dir: 1 }, { color: palette.brandYellow500, dir: -1 }]
  const TRAVEL = 420

  let progress = $state(0)
  let photoOpacity = $derived(Math.max(0, 1 - progress * 1.2))
  let titleOpacity = $derived(Math.max(0, 1 - progress * 6))
  let textOpacity = $derived(Math.min(1, progress * 2.5))

  // Soglia oltre la quale la maschera viene disattivata
  const MASK_DISABLE_PROGRESS = 0.17
  let maskActive = true

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  const rand = (min, max) => min + Math.random() * (max - min)
  const pick = (items) => items[Math.floor(Math.random() * items.length)]

  function resizeCanvas() {
    if (!wrap || !revealCanvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    helmetMobile = window.innerWidth < 768
    photoW = wrap.offsetWidth
    photoH = wrap.offsetHeight
    canvasW = photoW * (1 + REVEAL_PAD_X * 2)
    canvasH = photoH * (1 + REVEAL_PAD_TOP)
    revealCanvas.width = Math.max(1, Math.floor(canvasW * dpr))
    revealCanvas.height = Math.max(1, Math.floor(canvasH * dpr))
    ctx = revealCanvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
  }

  function addTile(x, y, size, ttl, delay = 0, isTrail = false) {
    if (!canvasW || !canvasH) return

    const s = Math.round(size)
    tiles.push({
      x: Math.round(x - s / 2),
      y: Math.round(y - s / 2),
      size: s,
      age: -delay,
      ttl,
      isTrail
    })

    if (tiles.length > MAX_TILES) {
      tiles.splice(0, tiles.length - MAX_TILES)
    }
  }

  function spawnTiles(x, y, amount, speed = 0, dirX = 0, dirY = 0, isAuto = false) {
    const unit = Math.max(0.72, Math.min(photoW, photoH) / 900)
    const fast = speed > 28 || isAuto
    const sizes = fast
      ? [15, 20, 30, 45, 84, 112, 140]
      : [13, 18, 28, 40, 56]
    const spread = clamp((isAuto ? 96 : 28) + speed * 1.35, 26, 190) * unit
    const ttlBase = isAuto ? 940 : clamp(300 + speed * 9, 340, 940)

    for (let i = 0; i < amount; i++) {
      const size = pick(sizes) * unit * rand(0.82, 1.18)
      const angle = Math.random() * Math.PI * 2
      const distance = spread * Math.pow(Math.random(), 0.56)
      const trail = fast ? rand(0, spread * 0.75) : 0
      const px = x + Math.cos(angle) * distance - dirX * trail + rand(-size * 0.3, size * 0.3)
      const py = y + Math.sin(angle) * distance - dirY * trail + rand(-size * 0.3, size * 0.3)
      addTile(px, py, size, ttlBase * rand(0.72, 1.26), i * rand(0, 12))
    }
  }

  function spawnTrail(x, y, speed, dirX, dirY, isAuto = false) {
    if (!dirX && !dirY) return

    const unit = Math.max(0.72, Math.min(photoW, photoH) / 900)
    const length = clamp((isAuto ? 86 : 34) + speed * 1.05, 42, 170) * unit
    const steps = isAuto ? 6 : clamp(Math.ceil(speed / 15), 2, 5)
    const sizes = isAuto ? [10, 14, 20, 28, 38] : [8, 12, 16, 22, 30]
    const ttlBase = isAuto ? 620 : clamp(220 + speed * 4, 220, 560)

    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const size = pick(sizes) * unit * rand(0.78, 1.12)
      const wobble = rand(-24, 24) * unit * t
      const px = x - dirX * length * t - dirY * wobble
      const py = y - dirY * length * t + dirX * wobble
      addTile(px, py, size, ttlBase * rand(0.68, 1.05), i * rand(10, 24), true)
    }
  }

  function drawHelmetTile(tile, alpha, offsetX = 0, offsetY = 0) {
    if (!ctx || !helmetImage?.complete || !helmetImage.naturalWidth) return

    const padX = photoW * REVEAL_PAD_X
    const padY = photoH * REVEAL_PAD_TOP
    const helmetW = photoW * (helmetMobile ? HELMET_SCALE_MOBILE : HELMET_SCALE)
    const helmetH = helmetW * (helmetImage.naturalHeight / helmetImage.naturalWidth)
    const helmetX = padX + photoW * 0.5 - helmetW * 0.5
    const centerY = helmetMobile ? HELMET_CENTER_Y_MOBILE : HELMET_CENTER_Y
    const helmetY = padY + photoH * centerY - helmetH * 0.5

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.rect(tile.x + padX + offsetX, tile.y + padY + offsetY, tile.size, tile.size)
    ctx.clip()
    ctx.drawImage(helmetImage, helmetX, helmetY, helmetW, helmetH)
    ctx.restore()
  }

  function drawTiles(dt) {
    if (!ctx) return

    ctx.clearRect(0, 0, canvasW, canvasH)

    for (let i = tiles.length - 1; i >= 0; i--) {
      const tile = tiles[i]
      tile.age += dt
      if (tile.age < 0) continue

      const p = tile.age / tile.ttl
      if (p >= 1) {
        tiles.splice(i, 1)
        continue
      }

      const dying = clamp((p - TILE_FADE_START) / (1 - TILE_FADE_START), 0, 1)
      const fade = 1 - dying * dying * (3 - 2 * dying)
      drawHelmetTile(tile, (tile.isTrail ? 0.62 : 1) * fade)
    }
  }

  onMount(() => {
    isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
      || window.innerWidth < 768

    helmetImage = new Image()
    helmetImage.src = '/images/Casco_Landing.png'
    resizeCanvas()

    const resizeObserver = new ResizeObserver(resizeCanvas)
    if (wrap) resizeObserver.observe(wrap)

    const INITIAL_AUTOPLAY_DELAY = 500
    const initialAutoPlayTimeout = setTimeout(() => {
      lastMoveTime = Date.now() - IDLE_WAIT - 1
    }, INITIAL_AUTOPLAY_DELAY)

    // --- MASK LOGIC ---
    let raf
    let listenersActive = false
    let stopped = false

    let idleStep = 0
    let isPausing = false
    let pauseStartTime = 0
    const IDLE_WAIT = 500
    const PAUSE_BETWEEN = 2500
    const TARGET_TOLERANCE = 75
    const idlePoints = [
      { x: 0.24, y: 0.18 },
      { x: 0.78, y: 0.78 },
      { x: 0.22, y: 0.62 },
      { x: 0.78, y: 0.22 },
      { x: 0.24, y: 0.18 }
    ]

    const onMove = (e) => {
      if (!maskActive) return
      _hovering = true
      lastMoveTime = Date.now()
      const now = performance.now()
      const hr = wrap.getBoundingClientRect()
      const x = (e.clientX - hr.left - s3_dX) / _scale
      const y = (e.clientY - hr.top - s3_dY) / _scale
      _tCx = x
      _tCy = y
      _tR = RADIUS

      // Aggiorna i target per la spring 3D (applicata nel tick)
      const mouseX = (e.clientX - hr.left) / hr.width - 0.5
      const mouseY = (e.clientY - hr.top) / hr.height - 0.5
      s3_mouseInside = true
      s3_tRotX =  mouseY * S3_MAX_ROT
      s3_tRotY = -mouseX * S3_MAX_ROT
      s3_tDX   =  mouseX * S3_MAX_DRIFT
      s3_tDY   =  mouseY * S3_MAX_DRIFT * 0.6

      const dt = lastPointerTime ? Math.max(12, now - lastPointerTime) : 16
      const dx = lastPointerTime ? x - lastPointerX : 0
      const dy = lastPointerTime ? y - lastPointerY : 0
      const distance = Math.hypot(dx, dy)
      const speed = distance / (dt / 16.67)
      const steps = Math.max(1, Math.min(7, Math.ceil(distance / 46)))
      const dirLen = distance || 1
      const dirX = dx / dirLen
      const dirY = dy / dirLen

      for (let i = 0; i < steps; i++) {
        const t = steps === 1 ? 1 : i / (steps - 1)
        const px = lastPointerTime ? lastPointerX + dx * t : x
        const py = lastPointerTime ? lastPointerY + dy * t : y
        const amount = Math.ceil(clamp(2 + speed / 9, 3, 18) / steps)
        spawnTiles(px, py, amount, speed, dirX, dirY)
      }

      if (distance > 12) {
        spawnTrail(x, y, speed, dirX, dirY)
      }

      lastPointerX = x
      lastPointerY = y
      lastPointerTime = now
    }

    const onLeave = () => {
      if (!maskActive) return
      _hovering = false
      _tR = 0
      lastPointerTime = 0
      s3_mouseInside = false
      s3_tRotX = 0; s3_tRotY = 0
      s3_tDX   = 0; s3_tDY   = 0
    }

    function addListeners() {
      if (!listenersActive && wrap) {
        wrap.addEventListener('mousemove', onMove)
        wrap.addEventListener('mouseleave', onLeave)
        listenersActive = true
      }
    }
    function removeListeners() {
      if (listenersActive && wrap) {
        wrap.removeEventListener('mousemove', onMove)
        wrap.removeEventListener('mouseleave', onLeave)
        listenersActive = false
      }
    }

    function stopMask() {
      stopped = true
      removeListeners()
      tiles = []
      ctx?.clearRect(0, 0, canvasW, canvasH)
      cancelAnimationFrame(raf)
    }

    function startMask() {
      if (!stopped) return
      stopped = false
      lastFrameTime = 0
      tick()
      addListeners()
    }

    function tick() {
      if (!maskActive) return
      const now = performance.now()
      const dt = lastFrameTime ? Math.min(48, now - lastFrameTime) : 16
      lastFrameTime = now
      const wallNow = Date.now()
      const w = photoW || wrap?.offsetWidth || 0
      const h = photoH || wrap?.offsetHeight || 0

      if (!_hovering && (wallNow - lastMoveTime > IDLE_WAIT)) {
        if (isPausing) {
          _tR = 0
          if (wallNow - pauseStartTime > PAUSE_BETWEEN) {
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
              pauseStartTime = wallNow
              isAutoPlaying = false
            } else { idleStep++ }
          }
        }
      } else if (_hovering) {
        isAutoPlaying = false
        isPausing = false
      }

      const currentStiffness = isAutoPlaying ? 0.025 : STIFFNESS
      const currentDamping = isAutoPlaying ? 0.8 : DAMPING

      _vx += (_tCx - _cx) * currentStiffness; _vx *= currentDamping; _cx += _vx
      _vy += (_tCy - _cy) * currentStiffness; _vy *= currentDamping; _cy += _vy
      _vr += (_tR - _r) * 0.05; _vr *= 0.8; _r += _vr

      if (isAutoPlaying && now - lastTilePulse > 62) {
        const autoSpeed = Math.hypot(_vx, _vy) * 1.7
        const dirLen = Math.hypot(_vx, _vy) || 1
        spawnTiles(_cx, _cy, 5, autoSpeed, _vx / dirLen, _vy / dirLen, true)
        spawnTrail(_cx, _cy, autoSpeed, _vx / dirLen, _vy / dirLen, true)
        lastTilePulse = now
      }

      if (_hovering && !isAutoPlaying && wallNow - lastMoveTime > 120 && now - lastTilePulse > 145) {
        spawnTiles(_tCx, _tCy, 2, 0, 0, 0)
        lastTilePulse = now
      }

      // --- AGGIORNAMENTO SPRING 3D ---
      if (photoMotion) {
        // floating idle: oscillazione autonoma quando il mouse è fuori
        const floatY    = (s3_mouseInside || isTouch) ? 0 : Math.sin(now * 0.00052) * FLOAT_AMP
        const floatTilt = (s3_mouseInside || isTouch) ? 0 : Math.sin(now * 0.00037) * FLOAT_TILT

        // spring: vel += (target - cur) * stiff; vel *= damp; cur += vel
        s3_vRX += (s3_tRotX - s3_rX) * S3_STIFF; s3_vRX *= S3_DAMP; s3_rX += s3_vRX
        s3_vRY += (s3_tRotY - s3_rY) * S3_STIFF; s3_vRY *= S3_DAMP; s3_rY += s3_vRY
        s3_vDX += (s3_tDX   - s3_dX) * S3_STIFF; s3_vDX *= S3_DAMP; s3_dX += s3_vDX
        s3_vDY += (s3_tDY   - s3_dY) * S3_STIFF; s3_vDY *= S3_DAMP; s3_dY += s3_vDY

        const rx = s3_rX + floatTilt
        const ry = s3_rY
        // converti drift px in % rispetto alla dimensione del contenitore
        const dxPct = (s3_dX / (photoW || 1)) * 100
        const dyPct = (s3_dY / (photoH || 1)) * 100
        const floatPct = (floatY / (photoH || 1)) * 100

        photoMotion.style.transform =
          `perspective(2000px) translateX(${dxPct}%) translateY(${dyPct + floatPct}%) rotateX(${rx}deg) rotateY(${ry}deg)`
      }

      drawTiles(dt)
      raf = requestAnimationFrame(tick)
    }

    // --- SCROLL GSAP SCRUB ---
    const proxy = { v: 0 }
    const scrollTween = gsap.to(proxy, {
      v: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${SCROLL_RANGE}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      }
    })

    const progressTickerFn = () => {
      const p = proxy.v
      progress = p
      if (p > MASK_DISABLE_PROGRESS) {
        if (maskActive) { maskActive = false; stopMask() }
      } else {
        if (!maskActive) { maskActive = true; startMask() }
      }
    }
    gsap.ticker.add(progressTickerFn)

    maskActive = true
    tick()
    addListeners()

    // --- GIROSCOPIO (mobile) ---
    let gyroCalibrated = false
    let gyroBetaOrigin = 0, gyroGammaOrigin = 0

    function onGyro(e) {
      if (!maskActive) return
      const beta  = e.beta  ?? 0   // inclinazione avanti/indietro
      const gamma = e.gamma ?? 0   // inclinazione sinistra/destra

      if (!gyroCalibrated) {
        gyroBetaOrigin  = beta
        gyroGammaOrigin = gamma
        gyroCalibrated  = true
      }

      // delta rispetto alla posizione di riposo, clampato a ±30deg → mappato a ±MAX_ROT
      const clampedBeta  = Math.max(-30, Math.min(30, beta  - gyroBetaOrigin))
      const clampedGamma = Math.max(-30, Math.min(30, gamma - gyroGammaOrigin))

      s3_mouseInside = true
      s3_tRotX =  (clampedBeta  / 30) * S3_MAX_ROT
      s3_tRotY =  (clampedGamma / 30) * S3_MAX_ROT
      s3_tDX   =  (clampedGamma / 30) * S3_MAX_DRIFT
      s3_tDY   =  (clampedBeta  / 30) * S3_MAX_DRIFT
    }

    async function setupGyro() {
      if (!('DeviceOrientationEvent' in window)) return
      // iOS 13+ richiede permesso esplicito
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEvent.requestPermission()
          if (perm !== 'granted') return
        } catch { return }
      }
      window.addEventListener('deviceorientation', onGyro)
    }
    setupGyro()

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      clearTimeout(initialAutoPlayTimeout)
      scrollTween.scrollTrigger?.kill()
      scrollTween.kill()
      gsap.ticker.remove(progressTickerFn)
      removeListeners()
      window.removeEventListener('deviceorientation', onGyro)
    }
  })
</script>

<section id="athlete" class="landing" bind:this={section}>
  <div class="sticky-inner">
    <h1 class="title" style:opacity={titleOpacity}>Outcast<br />Champion</h1>

    <div
      class="photo-wrap"
      bind:this={wrap}
      style:transform="translateX(-50%)"
      style:opacity={photoOpacity}
    >
      <div class="photo-motion" bind:this={photoMotion}>
        <img 
          class="vlad" 
          src="/images/vlad-espanso-hd-nobg.png" 
          alt="Vlad" 
          draggable="false" 
        />
        <canvas class="helmet-reveal" bind:this={revealCanvas} aria-hidden="true"></canvas>
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
    height: calc(100vh + 250px);
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
    color: var(--hex-neutral-900);
    letter-spacing: -0.02em;
    z-index: 10;
    pointer-events: none;
    user-select: none;
    will-change: opacity;
  }

  .photo-wrap {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: min(130vh, 92vw);
    height: min(130vh, 92vw);
    cursor: crosshair;
    transform-origin: 50% 40%;
    will-change: transform, opacity;
    perspective: 1000px;
  }

  .photo-motion {
    position: absolute;
    inset: 0;
    transform: perspective(2000px) translateX(0%) translateY(0%) rotateX(0deg) rotateY(0deg);
    transform-style: preserve-3d;
    will-change: transform;
    pointer-events: none;
  }

  .vlad {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom center;
    /* Valori iniziali combinati con le rotazioni */
    transform: translateX(3%) translateY(13%) scale(1.1) rotateX(0deg) rotateY(0deg);
    transform-style: preserve-3d;
    user-select: none;
    -webkit-user-drag: none;
    z-index: 2;
    will-change: transform;
  }

  .helmet-reveal {
    position: absolute;
    top: -22%;
    left: -9%;
    width: 118%;
    height: 122%;
    display: block;
    z-index: 3;
    pointer-events: none;
  }

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
    white-space: nowrap;
  }

  .marquee-left {
    animation: marquee-l 50s linear infinite;
  }

  .marquee-right {
    animation: marquee-r 50s linear infinite;
  }

  @keyframes marquee-l {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes marquee-r {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    /* Container dimensionato sull'aspect ratio reale dell'immagine (1856×1666 ≈ 1.11:1)
       così l'immagine riempie il box esatto senza crop né spazi vuoti */
    .photo-wrap {
      width: 180vw;
      height: 162vw;
      bottom: 0vh;
    }

    .vlad {
      object-fit: contain;
      object-position: center center;
      transform: none;
    }

    .helmet-reveal {
      left: -11%;
    }

    .title {
      top: 24px;
      left: 24px;
      font-size: clamp(32px, 9vw, 52px);
      line-height: 0.95;
    }

    .name-row {
      font-size: clamp(52px, 13vw, 80px);
    }
  }
</style>
