<script>
  import { onMount } from 'svelte'

  let { ondone } = $props()

  let canvas
  let visible = $state(true)

  const YELLOW = '#FFD700'
  const BLUE   = '#0057B7'
  const TILE   = 18

  const T_STATIC = 1000
  const T_GLITCH = 800
  const T_IN     = 900
  const T_HOLD   = 400
  const T_OUT    = 700

  onMount(async () => {
    await document.fonts.load("48px 'GeistPixel'").catch(() => {})

    document.body.style.overflow = 'hidden'

    const ctx = canvas.getContext('2d')
    const off = document.createElement('canvas')
    let offCtx
    let w, h, dpr
    let tiles = []
    let glitchSlices = []
    let lastGlitch = 0
    let animId
    const t0 = performance.now()

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      off.width  = canvas.width
      off.height = canvas.height
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      offCtx = off.getContext('2d')
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildTiles()
    }

    function buildTiles() {
      const cols = Math.ceil(w / TILE) + 1
      const rows = Math.ceil(h / TILE) + 1
      tiles = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.push({
            x: c * TILE,
            y: r * TILE,
            color: Math.random() < 0.5 ? YELLOW : BLUE,
            active: Math.random() < 0.78,
            delay: Math.random() * 0.25,
            seed: Math.random() * Math.PI * 2
          })
        }
      }
    }

    function drawBase(c) {
      c.fillStyle = YELLOW
      c.fillRect(0, 0, w, h / 2)
      c.fillStyle = BLUE
      c.fillRect(0, h / 2, w, h / 2)

      const sz = Math.min(h * 0.2, w * 0.12)
      c.font = `${sz}px 'GeistPixel', monospace`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillStyle = '#ffffff'
      c.fillText('Outcast',  w / 2, h * 0.27)
      c.fillText('Champion', w / 2, h * 0.73)
    }

    function rebuildGlitch() {
      glitchSlices = []
      let y = 0
      while (y < h) {
        const sh = 3 + Math.random() * 38
        glitchSlices.push({
          y,
          h: Math.min(sh, h - y),
          ox: Math.random() < 0.28 ? (Math.random() - 0.5) * 70 : 0
        })
        y += sh
      }
    }

    function renderStatic() {
      drawBase(ctx)
    }

    function renderGlitch(gp, now) {
      offCtx.clearRect(0, 0, w, h)
      drawBase(offCtx)

      ctx.clearRect(0, 0, w, h)
      for (const s of glitchSlices) {
        const sy = Math.round(s.y * dpr)
        const sh = Math.round(s.h * dpr)
        if (sh <= 0) continue
        ctx.drawImage(off, 0, sy, off.width, sh, s.ox * gp, s.y, w, s.h)
      }

      ctx.save()
      ctx.globalAlpha = 0.22 * gp
      for (let i = 0; i < 6; i++) {
        if (Math.random() > 0.4) continue
        ctx.fillStyle = Math.random() < 0.5 ? YELLOW : BLUE
        ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 5)
      }
      ctx.restore()
    }

    function renderTilesIn(p, now) {
      // Dark background
      ctx.globalAlpha = 1
      ctx.fillStyle = '#030404'
      ctx.fillRect(0, 0, w, h)

      // Yellow/blue base fades out fast
      const baseA = Math.max(0, 1 - p * 3.5)
      if (baseA > 0.01) {
        ctx.globalAlpha = baseA
        drawBase(ctx)
      }

      // Tiles snap in almost simultaneously (tight delay 0-0.25)
      for (const t of tiles) {
        if (!t.active) continue
        const tp = Math.min(1, Math.max(0, (p - t.delay) / 0.18))
        if (tp <= 0) continue
        const flk = (Math.sin(now * 0.013 + t.seed) + 1) / 2
        ctx.globalAlpha = tp * (0.88 + flk * 0.12)
        ctx.fillStyle = t.color
        ctx.fillRect(t.x, t.y, TILE, TILE)
      }
      ctx.globalAlpha = 1
    }

    function renderTilesHold(p, now) {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#030404'
      ctx.fillRect(0, 0, w, h)

      for (const t of tiles) {
        if (!t.active) continue
        const flk = (Math.sin(now * 0.016 + t.seed) + 1) / 2
        ctx.globalAlpha = 0.82 + flk * 0.18
        ctx.fillStyle = t.color
        ctx.fillRect(t.x, t.y, TILE, TILE)
      }
      ctx.globalAlpha = 1
    }

    function renderTilesOut(p, now) {
      ctx.globalAlpha = 1
      ctx.fillStyle = '#030404'
      ctx.fillRect(0, 0, w, h)

      for (const t of tiles) {
        if (!t.active) continue
        const flk = (Math.sin(now * 0.02 + t.seed + p * 8) + 1) / 2
        const alpha = Math.max(0, (1 - p) * (0.4 + flk * 0.6))
        if (alpha < 0.01) continue
        ctx.globalAlpha = alpha
        ctx.fillStyle = t.color
        ctx.fillRect(t.x, t.y, TILE, TILE)
      }
      ctx.globalAlpha = 1
    }

    function frame(now) {
      const el = now - t0
      ctx.clearRect(0, 0, w, h)

      if (el < T_STATIC) {
        renderStatic()
      } else if (el < T_STATIC + T_GLITCH) {
        const gp = (el - T_STATIC) / T_GLITCH
        if (now - lastGlitch > 55) { rebuildGlitch(); lastGlitch = now }
        renderGlitch(gp, now)
      } else if (el < T_STATIC + T_GLITCH + T_IN) {
        renderTilesIn((el - T_STATIC - T_GLITCH) / T_IN, now)
      } else if (el < T_STATIC + T_GLITCH + T_IN + T_HOLD) {
        renderTilesHold((el - T_STATIC - T_GLITCH - T_IN) / T_HOLD, now)
      } else if (el < T_STATIC + T_GLITCH + T_IN + T_HOLD + T_OUT) {
        renderTilesOut((el - T_STATIC - T_GLITCH - T_IN - T_HOLD) / T_OUT, now)
      } else {
        document.body.style.overflow = ''
        visible = false
        ondone?.()
        return
      }

      animId = requestAnimationFrame(frame)
    }

    resize()
    rebuildGlitch()
    window.addEventListener('resize', () => { resize(); rebuildGlitch() })
    animId = requestAnimationFrame(frame)

    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  })
</script>

{#if visible}
<div class="loader">
  <canvas bind:this={canvas}></canvas>
</div>
{/if}

<style>
  .loader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #030404;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
