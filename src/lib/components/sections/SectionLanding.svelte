<script>
  import { onMount } from 'svelte'

  let wrap, revealCanvas
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

  const RADIUS = 190
  const STIFFNESS = 0.15
  const DAMPING = 0.85
  const MAX_TILES = 280
  const REVEAL_PAD_X = 0.09
  const REVEAL_PAD_TOP = 0.22
  const HELMET_SCALE = 1.18
  const HELMET_OFFSET_Y = -0.17

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

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  const rand = (min, max) => min + Math.random() * (max - min)
  const pick = (items) => items[Math.floor(Math.random() * items.length)]

  function resizeCanvas() {
    if (!wrap || !revealCanvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
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
      isTrail,
      flickerSeed: rand(0, Math.PI * 2),
      glitchX: rand(-10, 10),
      glitchY: rand(-6, 6)
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
    const ttlBase = isAuto ? 760 : clamp(300 + speed * 9, 240, 940)

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
    const helmetW = photoW * HELMET_SCALE
    const helmetH = helmetW * (helmetImage.naturalHeight / helmetImage.naturalWidth) 
    const helmetX = padX + photoW * 0.5 - helmetW * 0.5
    const helmetY = padY + photoH * HELMET_OFFSET_Y

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

      const dying = clamp((p - 0.58) / 0.42, 0, 1)
      const flicker = Math.sin(tile.age * 0.13 + tile.flickerSeed) + Math.sin(tile.age * 0.047 + tile.flickerSeed * 2)
      const isBlinkingOff = dying > 0 && flicker < -0.18 - dying * 0.42

      if (isBlinkingOff) continue

      const shouldGlitch = dying > 0.18 && flicker > 0.74
      const offsetX = shouldGlitch ? Math.round(tile.glitchX * dying) : 0
      const offsetY = shouldGlitch ? Math.round(tile.glitchY * dying) : 0
      drawHelmetTile(tile, tile.isTrail ? 0.62 : 1, offsetX, offsetY)
    }
  }

  onMount(() => {
    helmetImage = new Image()
    helmetImage.src = '/images/vlad-hover-black2.png'
    resizeCanvas()

    const resizeObserver = new ResizeObserver(resizeCanvas)
    if (wrap) resizeObserver.observe(wrap)

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
      { x: 0.24, y: 0.18 },
      { x: 0.78, y: 0.78 },
      { x: 0.22, y: 0.62 },
      { x: 0.78, y: 0.22 },
      { x: 0.24, y: 0.18 }
    ]

    let raf
    const tick = () => {
      const now = performance.now()
      const dt = lastFrameTime ? Math.min(48, now - lastFrameTime) : 16
      lastFrameTime = now
      const wallNow = Date.now()
      const w = photoW || wrap?.offsetWidth || 0
      const h = photoH || wrap?.offsetHeight || 0

      // Gestione Idle Animation (Tua logica originale)
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

      // Fisica Fluida
      const currentStiffness = isAutoPlaying ? 0.015 : STIFFNESS
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

      drawTiles(dt)
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onMove = (e) => {
      _hovering = true
      lastMoveTime = Date.now()
      const now = performance.now()
      const hr = wrap.getBoundingClientRect()
      const x = (e.clientX - hr.left) / _scale
      const y = (e.clientY - hr.top) / _scale
      _tCx = x
      _tCy = y
      _tR = RADIUS

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
      _hovering = false
      _tR = 0
      lastPointerTime = 0
    }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      wrap?.removeEventListener('mousemove', onMove)
      wrap?.removeEventListener('mouseleave', onLeave)
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
      <img class="vlad" src="/images/vlad-espanso-hd-nobg.png" alt="Vlad" draggable="false" />
      <canvas class="helmet-reveal" bind:this={revealCanvas} aria-hidden="true"></canvas>
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
