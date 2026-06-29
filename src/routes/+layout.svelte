<!--
  +layout.svelte — layout principale dell'applicazione

  In SvelteKit ogni file +layout.svelte avvolge le pagine figlie.
  Qui importiamo i CSS globali e, opzionalmente, Threlte Studio.

  ──────────────────────────────────────────────────────
  THRELTE STUDIO
  Strumento di debug visuale per la scena 3D. Consente di:
    • ispezionare la gerarchia degli oggetti 3D
    • modificare transform, materiali e luci in tempo reale
    • monitorare le performance del renderer

  NOTA: Studio v0.4 deve essere usato all'interno del componente <Canvas>
  (vedi +page.svelte). Per attivarlo, decommentare il blocco in +page.svelte.
  ──────────────────────────────────────────────────────
-->
<script>
  import 'virtual:design-tokens'
  import '../app.css'
  import { onMount } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  
  import Lenis from '@studio-freight/lenis'
  import BackgroundGrid from '$lib/components/BackgroundGrid.svelte'
  import { setLenis } from '$lib/lenis.js'

  gsap.registerPlugin(ScrollTrigger)

  let { children } = $props()

  onMount(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    setLenis(lenis)

    lenis.on('scroll', () => ScrollTrigger.update())
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => { setLenis(null); lenis.destroy() }
  })
</script>

<!-- Il componente dello sfondo -->
<BackgroundGrid />

{@render children()}