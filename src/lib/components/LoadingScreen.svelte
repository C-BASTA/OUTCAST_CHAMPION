<script>
  import { onMount } from 'svelte'
  import { getLenis } from '$lib/lenis.js'

  let { ondone = undefined } = $props()

  let canvas
  let visible = $state(true)

  const T_TOTAL = 1000

  onMount(async () => {
    await document.fonts.load("48px 'GeistPixel'").catch(() => {})
    
    // Blocca lo scroll nativo fin da subito
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
        animId = requestAnimationFrame(frame)
        return
      }

      const p = Math.min(1, (now - clickTime) / T_TOTAL)

      if (p < 1) {
        const blurPx = easeIO(Math.min(1, p / 0.60)) * 120
        const fadeP  = easeIO(Math.max(0, (p - 0.50) / 0.50))
        
        const r = Math.round(250 - fadeP * (250 - 3))
        const g = Math.round(250 - fadeP * (250 - 4))
        const b = Math.round(250 - fadeP * (250 - 4))

        loader.style.background = `rgb(${r},${g},${b})`
        loader.style.filter     = `blur(${blurPx}px)`
        loader.style.opacity    = String(1 - fadeP)

        animId = requestAnimationFrame(frame)
      } else {
        // Il loader ha finito l'animazione
        visible = false
        
        // Forza il posizionamento all'inizio esatto del sito prima di sbloccare
        window.scrollTo(0, 0)
        
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          
          // Rimuove i blocchi sull'overflow solo ORA che siamo pronti a partire
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
      // Il cleanup ripristina lo stato originale solo se la transizione non è andata a buon fine
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