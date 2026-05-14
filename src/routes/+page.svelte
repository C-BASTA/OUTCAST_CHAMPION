<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionTransition from '$lib/components/sections/SectionTransition.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import SectionAbout from '$lib/components/sections/SectionAbout.svelte'
  import Gallery from '$lib/components/Gallery.svelte'
  import Intro from '$lib/components/Intro.svelte'
  import { introState } from '$lib/introState.svelte.js'

  let scrollY = $state(0)
  let showQuadratini = $state(true)
  let showIntro = $state(false)
  // Impedisce re-trigger: si resetta solo se l'utente torna indietro fino a metà bio
  let introDone = false

  // Blocca lo scroll della pagina mentre l'intro è attivo
  $effect(() => {
    document.body.style.overflow = showIntro ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  })

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY
      const bioEl = document.getElementById('athlete-bio')
      if (bioEl) {
        const hideAt = bioEl.offsetTop + (bioEl.offsetHeight - window.innerHeight) * 0.54
        showQuadratini = window.scrollY < hideAt

        const bioProg = (window.scrollY - bioEl.offsetTop) / (bioEl.offsetHeight - window.innerHeight)

        // Resetta il flag se l'utente torna indietro abbastanza nella bio
        if (bioProg < 0.5) introDone = false

        // Attiva l'intro quando la bio (e il dezoom) è quasi finita
        if (bioProg >= 0.995 && !showIntro && !introDone) {
          introDone = true
          introState.scrolled = 0
          showIntro = true
        }
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })

  // navDark=true quando lo sfondo diventa scuro:
  // - nella fase helmet della bio (progress ~0.63, quando zoom-in inizia a scurire)
  // - nella Gallery e nelle sezioni successive
  let navDark = $derived.by(() => {
    if (typeof window === 'undefined') return false
    const bioEl     = typeof document !== 'undefined' ? document.getElementById('athlete-bio') : null
    const galleryEl = typeof document !== 'undefined' ? document.getElementById('helmet')       : null
    // 0.63 ≈ P_STOP(0.59) + 0.10*(1-P_STOP) — start of colour transition in helmet phase
    const bioDarkStart  = bioEl
      ? bioEl.offsetTop + (bioEl.offsetHeight - window.innerHeight) * 0.63
      : Infinity
    const galleryStart  = galleryEl?.offsetTop ?? Infinity
    return scrollY >= Math.min(bioDarkStart, galleryStart)
  })

  // Nascondi il logo del nav sulla landing (ha già il suo <h1> grande)
  let navShowLogo = $derived(typeof window === 'undefined' ? true : scrollY >= window.innerHeight * 0.2)
</script>

<!-- Layer fisso: quadratini su sfondo bianco, svanisce prima della gallery -->
{#if showQuadratini}
  <Quadratini />
{/if}

<!-- Navbar globale -->
<Navbar dark={navDark} showLogo={navShowLogo} />

<!-- Pixel effect: overlay fisso che si attiva alla fine della bio, prima della gallery -->
{#if showIntro}
  <div
    class="intro-overlay"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 600 }}
  >
    <Intro onDone={() => {
      showIntro = false
      // Dopo il fade-out, porta la gallery in cima allo schermo
      setTimeout(() => {
        document.getElementById('helmet')?.scrollIntoView({ behavior: 'instant' })
      }, 650)
    }} />
  </div>
{/if}

<main>
  <SectionLanding />
  <SectionTransition />
  <SectionFrase />
  <SectionBiography />

  <section id="helmet" class="gallery-wrapper">
    <Gallery />
  </section>

  <SectionRegolamento />
  <SectionAbout />
</main>

<style>
  main { width: 100%; }

  .gallery-wrapper {
    width: 100%;
    height: 100vh;
    background: #030404;
    overflow: hidden;
  }

  .intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
  }
</style>
