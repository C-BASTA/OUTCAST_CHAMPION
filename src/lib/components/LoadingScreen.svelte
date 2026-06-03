<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { getLenis } from '$lib/lenis.js'

  let { ondone = undefined } = $props()

  let canvas
  let btn
  let visible   = $state(true)
  let triggered = $state(false)

  const T_TOTAL = 1800

  onMount(async () => {
    await document.fonts.load("48px 'GeistPixel'").catch(() => {})
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    getLenis()?.stop()

    const ctx    = canvas.getContext('2d')
    const loader = canvas.parentElement
    let w, h, dpr
    let animId
    let clickTime = 0

    const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    function getArrowY() {
      const sz = Math.min(h * 0.2, w * 0.12)
      return h * 0.58 + sz * 1.42
    }

    function positionBtn() {
      if (!btn) return
      const smallSz = Math.max(11, Math.min(h * 0.022, w * 0.014))
      const dotSz   = Math.max(2, Math.round(smallSz * 0.28))
      const step    = dotSz + Math.max(2, Math.round(dotSz * 0.55))
      const arrowH  = 2 * step + dotSz
      const arrowW  = 4 * step + dotSz
      const hitPad  = 28
      btn.style.left   = `${w / 2 - arrowW / 2 - hitPad}px`
      btn.style.top    = `${getArrowY() - hitPad}px`
      btn.style.width  = `${arrowW + hitPad * 2}px`
      btn.style.height = `${arrowH + hitPad * 2}px`
    }

    const ARROW_REST   = 0.55
    const ARROW_HOVER  = 1.0
    const ARROW_EASE_MS = 250
    let arrowOpacity   = ARROW_REST
    let arrowFrom      = ARROW_REST
    let arrowTo        = ARROW_REST
    let arrowAnimStart = null
    let arrowAnimId    = null
    const easeArrow    = t => t < 0.5 ? 2*t*t : 1 - (-2*t+2)**2/2

    function tickArrow(now) {
      const t = Math.min(1, (now - arrowAnimStart) / ARROW_EASE_MS)
      arrowOpacity = arrowFrom + (arrowTo - arrowFrom) * easeArrow(t)
      redraw()
      if (t < 1) arrowAnimId = requestAnimationFrame(tickArrow)
      else { arrowOpacity = arrowTo; arrowAnimId = null }
    }

    function startArrowAnim(to) {
      arrowFrom = arrowOpacity
      arrowTo   = to
      arrowAnimStart = performance.now()
      cancelAnimationFrame(arrowAnimId)
      arrowAnimId = requestAnimationFrame(tickArrow)
    }

    function drawArrow() {
      const smallSz = Math.max(11, Math.min(h * 0.022, w * 0.014))
      const dotSz   = Math.max(2, Math.round(smallSz * 0.28))
      const step    = dotSz + Math.max(2, Math.round(dotSz * 0.55))
      const arrowY  = getArrowY()
      ctx.globalAlpha = arrowOpacity
      ctx.fillStyle = '#030404'
      const rows = [[-2, -1, 0, 1, 2], [-1, 0, 1], [0]]
      rows.forEach((row, ri) => {
        row.forEach(ci => {
          ctx.fillRect(
            Math.round(w / 2 + ci * step - dotSz / 2),
            Math.round(arrowY + ri * step - dotSz / 2),
            dotSz, dotSz
          )
        })
      })
      ctx.globalAlpha = 1
    }

    function redraw() {
      ctx.clearRect(0, 0, w, h)
      drawFullText()
      drawArrow()
    }

    function drawFullText() {
      const sz = Math.min(h * 0.2, w * 0.12)
      ctx.font         = `${sz}px 'GeistPixel', monospace`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle    = '#030404'
      ctx.fillText('Outcast',  w / 2, h * 0.38)
      ctx.fillText('Champion', w / 2, h * 0.58)
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w   = window.innerWidth
      h   = window.innerHeight
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      drawFullText()
      drawArrow()
      positionBtn()
    }

    function frame(now) {
      // ── Fase 1: attesa click ─────────────────────────────────────────────
      if (!triggered) {
        animId = requestAnimationFrame(frame)
        return
      }

      // ── Fase 2: exit animation ───────────────────────────────────────────
      if (clickTime === 0) clickTime = now

      const p = Math.min(1, (now - clickTime) / T_TOTAL)

      if (p < 1) {
        window.scrollTo(0, 0)
        const blurPx = easeIO(Math.min(1, p / 0.60)) * 120
        const fadeP  = easeIO(Math.max(0, (p - 0.50) / 0.50))
        // Mantieni sfondo bianco durante tutto il fade (non scurire)
        loader.style.filter  = `blur(${blurPx}px)`
        loader.style.opacity = String(1 - fadeP)
        animId = requestAnimationFrame(frame)
      } else {
        // Prima ripristina scroll e stato, poi rimuovi il loader
        window.scrollTo(0, 0)
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        window.scrollTo(0, 0)
        const lenis = getLenis()
        if (lenis) {
          lenis.scrollTo(0, { immediate: true })
          lenis.start()
        }
        ScrollTrigger.refresh()
        window.scrollTo(0, 0)
        // Solo dopo che tutto è sistemato, rimuovi il loader
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          visible = false
          ondone?.()
        })
      }
    }

    const preventScroll = (e) => { if (visible && e.cancelable) e.preventDefault() }
    window.addEventListener('wheel',     preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    const onArrowEnter = () => startArrowAnim(ARROW_HOVER)
    const onArrowLeave = () => startArrowAnim(ARROW_REST)
    btn?.addEventListener('mouseenter', onArrowEnter)
    btn?.addEventListener('mouseleave', onArrowLeave)

    resize()
    window.addEventListener('resize', resize)
    animId = requestAnimationFrame(frame)

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      cancelAnimationFrame(animId)
      loader.style.filter  = ''
      loader.style.opacity = ''
      window.removeEventListener('resize', resize)
      window.removeEventListener('wheel',     preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      btn?.removeEventListener('mouseenter', onArrowEnter)
      btn?.removeEventListener('mouseleave', onArrowLeave)
      cancelAnimationFrame(arrowAnimId)
    }
  })
</script>

{#if visible}
<div class="loader">
  <canvas bind:this={canvas}></canvas>
  <button
    bind:this={btn}
    class="arrow-btn"
    onclick={() => { triggered = true }}
    aria-label="Entra nel sito"
  ></button>
</div>
{/if}

<style>
  .loader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #FAFAFA;
    touch-action: none;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .arrow-btn {
    position: absolute;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }
</style>
