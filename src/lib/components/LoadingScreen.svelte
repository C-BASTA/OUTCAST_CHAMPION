<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { getLenis } from '$lib/lenis.js'

  let { ondone = undefined } = $props()

  let canvas
  let visible = $state(true)

  const T_TOTAL = 3000

  onMount(async () => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    getLenis()?.stop()

    await document.fonts.load("48px 'GeistPixel'").catch(() => {})

    const ctx    = canvas.getContext('2d')
    const loader = canvas.parentElement
    let w, h, dpr
    let animId
    let clicked   = false
    let clickTime = 0

    const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBase()
    }

    function drawBase() {
      ctx.clearRect(0, 0, w, h)

      const sz = Math.min(h * 0.2, w * 0.12)
      ctx.font         = `${sz}px 'GeistPixel', monospace`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle    = '#030404'
      ctx.fillText('Outcast',  w / 2, h * 0.38)
      ctx.fillText('Champion', w / 2, h * 0.58)

      const smallSz = Math.max(11, Math.min(h * 0.022, w * 0.014))
      ctx.font      = `${smallSz}px 'GeistPixel', monospace`
      ctx.fillText('scroll', w / 2, h * 0.58 + sz * 1.1)
    }

    function frame(now) {
      if (!clicked) {
        window.scrollTo(0, 0)
        animId = requestAnimationFrame(frame)
        return
      }

      const p = Math.min(1, (now - clickTime) / T_TOTAL)

      if (p < 1) {
        window.scrollTo(0, 0)

        // Fase 1 (0→30%): sfondo bianco sparisce, testo svanisce, blur cresce
        const phase1 = Math.min(1, p / 0.30)
        // Fase 2 (30%→100%): blur si risolve rivelando l'atleta nitido
        const phase2 = Math.max(0, (p - 0.30) / 0.70)

        // Sfondo: bianco → trasparente
        const bgAlpha = 1 - easeIO(phase1)
        loader.style.background = `rgba(250,250,250,${bgAlpha})`

        // Testo: svanisce
        canvas.style.opacity = String(1 - easeIO(phase1))

        // backdrop-filter sfoca la pagina SOTTO il loader: 0 → 80px → 0
        const blurPx = phase2 > 0
          ? (1 - easeIO(phase2)) * 80
          : easeIO(phase1) * 80
        loader.style.backdropFilter       = `blur(${blurPx}px)`
        loader.style.webkitBackdropFilter = `blur(${blurPx}px)`

        animId = requestAnimationFrame(frame)
      } else {
        // Fine: loader trasparente, pagina nitida
        loader.style.background           = 'transparent'
        loader.style.backdropFilter       = ''
        loader.style.webkitBackdropFilter = ''
        canvas.style.opacity              = '0'

        window.scrollTo(0, 0)
        visible = false
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          const lenis = getLenis()
          lenis?.start()
          lenis?.scrollTo(0, { immediate: true })
          ScrollTrigger.refresh()
          ondone?.()
        })
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const trigger = () => {
      if (!clicked) { clicked = true; clickTime = performance.now() }
    }
    let touchStartY = 0
    window.addEventListener('wheel',      trigger, { passive: true })
    window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY }, { passive: true })
    window.addEventListener('touchmove',  e => {
      if (e.touches[0].clientY < touchStartY - 10) trigger()
    }, { passive: true })

    animId = requestAnimationFrame(frame)

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      cancelAnimationFrame(animId)
      loader.style.backdropFilter       = ''
      loader.style.webkitBackdropFilter = ''
      canvas.style.opacity              = ''
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
    background: #FAFAFA;
    cursor: default;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
