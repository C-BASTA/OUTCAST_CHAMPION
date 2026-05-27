<script>
  import { onMount } from 'svelte'
  import { getLenis } from '$lib/lenis.js'

  let { ondone = undefined } = $props()

  let canvas
  let visible = $state(true)

  const T_TOTAL = 3000

  onMount(async () => {
    await document.fonts.load("48px 'GeistPixel'").catch(() => {})
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()

    const ctx    = canvas.getContext('2d')
    const loader = canvas.parentElement
    let w, h, dpr
    let animId
    let clicked   = false
    let clickTime = 0

    const ease    = t => 1 - Math.pow(1 - t, 3)
    const easeIO  = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

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
      ctx.clearRect(0, 0, w, h)  // canvas rimane trasparente: lo sfondo è nel div

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
        animId = requestAnimationFrame(frame)
        return
      }

      const p = Math.min(1, (now - clickTime) / T_TOTAL)

      if (p < 1) {
        // blur cresce fino a 120px nel primo 60%
        const blurPx = easeIO(Math.min(1, p / 0.60)) * 120
        // fade parte al 50%
        const fadeP  = easeIO(Math.max(0, (p - 0.50) / 0.50))
        // background: neutro-50 (#FAFAFA) → neutro-900 (#030404) durante il fade
        // così quando il loader sparisce, il colore già coincide con il sito
        const r = Math.round(250 - fadeP * (250 - 3))
        const g = Math.round(250 - fadeP * (250 - 4))
        const b = Math.round(250 - fadeP * (250 - 4))

        loader.style.background = `rgb(${r},${g},${b})`
        loader.style.filter     = `blur(${blurPx}px)`
        loader.style.opacity    = String(1 - fadeP)

        animId = requestAnimationFrame(frame)
      } else {
        // 1. Reset nativo mentre il blocco è ancora attivo
        window.scrollTo(0, 0)
        // 2. Rimuovi il loader (Svelte aggiorna il DOM come microtask)
        visible = false
        // 3. Aspetta che il DOM sia aggiornato + un frame di rendering,
        //    poi sblocca lo scroll: a quel punto la pagina è già a 0
        //    e l'utente vede subito la SectionLanding
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          const lenis = getLenis()
          lenis?.start()
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
      loader.style.filter  = ''
      loader.style.opacity = ''
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
    background: #FAFAFA; /* --hex-neutral-50 */
    cursor: default;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
