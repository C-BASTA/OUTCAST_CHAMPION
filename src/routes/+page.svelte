<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import Intro from '$lib/components/Intro.svelte'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionTransition from '$lib/components/sections/SectionTransition.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import SectionAbout from '$lib/components/sections/SectionAbout.svelte'
  import Gallery from '$lib/components/Gallery.svelte'

  let phase = $state('intro')

  // Blocca lo scroll del body mentre l'intro è attiva
  $effect(() => {
    document.body.style.overflow = phase === 'intro' ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  })

  let scrollY = $state(0)
  let showQuadratini = $state(true)

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY
      // Nascondi i quadratini quando la traccia orizzontale sta per finire (progress ~0.54)
      const bioEl = document.getElementById('athlete-bio')
      if (bioEl) {
        const hideAt = bioEl.offsetTop + (bioEl.offsetHeight - window.innerHeight) * 0.54
        showQuadratini = window.scrollY < hideAt
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

{#if phase === 'intro'}
  <div class="intro-layer" out:fade={{ duration: 900 }}>
    <Intro onDone={() => (phase = 'main')} />
  </div>
{/if}

<!-- Layer fisso: quadratini su sfondo bianco, svanisce prima della gallery -->
{#if showQuadratini}
  <Quadratini />
{/if}

<!-- Navbar globale -->
<Navbar dark={navDark} showLogo={navShowLogo} />

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
  .intro-layer {
    position: fixed;
    inset: 0;
    z-index: 9999;
  }

  main { width: 100%; }

  .gallery-wrapper {
    width: 100%;
    height: 100vh;
    background: #030404;
    overflow: hidden;
  }
</style>
