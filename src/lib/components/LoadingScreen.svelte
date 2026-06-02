<script>
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { getLenis } from '$lib/lenis.js'

  let { ondone = undefined } = $props()

  let canvas
  let visible = $state(true)

  const T_TOTAL = 1000

  onMount(async () => {
    await document.fonts.load("48px 'GeistPixel'").catch(() => {})
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    getLenis()?.stop()

    await document.fonts.load("48px 'GeistPixel'").catch(() => {})

    const ctx    = canvas.getContext('2d')
    const loader = canvas.parentElement
    let w, h, dpr
    let animId
    let clicked     = false
    let clickTime   = 0
    let arrowBounce = 0

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

      // Pixel down-arrow — stessa griglia 2×2 della X
      const smallSz = Math.max(11, Math.min(h * 0.022, w * 0.014))
      const dotSz   = Math.max(2, Math.round(smallSz * 0.28))
      const step    = dotSz + Math.max(2, Math.round(dotSz * 0.55))
      const arrowY  = h * 0.58 + sz * 1.1 + arrowBounce
      const rows    = [[-2, -1, 0, 1, 2], [-1, 0, 1], [0]]
      rows.forEach((row, ri) => {
        row.forEach(ci => {
          ctx.fillRect(
            Math.round(w / 2 + ci * step - dotSz / 2),
            Math.round(arrowY + ri * step - dotSz / 2),
            dotSz,
            dotSz
          )
        })
      })
    }

    function frame(now) {
      if (!clicked) {
        window.scrollTo(0, 0)
        arrowBounce = Math.sin(now * 0.0025) * 5
        drawBase()
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
          
          // Rimuove i blocchi sull'overflow solo ORA che siamo pronti a partire
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
      if (!clicked) { 
        clicked = true
        clickTime = performance.now() 
      }
    }

    // Funzione per neutralizzare l'evento ed evitare che il touchpad muova la pagina sotto
    const preventDefaultScroll = (e) => {
      if (visible) {
        if (e.cancelable) e.preventDefault()
      }
    }

    let touchStartY = 0

    // IMPORTANTE: passiamo { passive: false } per permettere al preventDefault di funzionare
    window.addEventListener('wheel', (e) => {
      preventDefaultScroll(e)
      trigger()
    }, { passive: false })

    window.addEventListener('touchstart', e => { 
      touchStartY = e.touches[0].clientY 
    }, { passive: true })

    window.addEventListener('touchmove',  e => {
      // Se l'utente sta scrollando verso l'alto (es. swipe giù col dito), blocca il rimbalzo mobile
      preventDefaultScroll(e)
      if (e.touches[0].clientY < touchStartY - 10) {
        trigger()
      }
    }, { passive: false })

    animId = requestAnimationFrame(frame)

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      cancelAnimationFrame(animId)
      loader.style.filter  = ''
      loader.style.opacity = ''
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
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
    /* Impedisce interazioni di touch native o rimbalzi elastici su mobile */
    touch-action: none; 
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>