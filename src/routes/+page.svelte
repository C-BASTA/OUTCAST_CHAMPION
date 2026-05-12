<script>
  import { onMount } from 'svelte'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionTransition from '$lib/components/sections/SectionTransition.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import SectionAbout from '$lib/components/sections/SectionAbout.svelte'
  import Gallery from '$lib/components/Gallery.svelte'

  let scrollY = $state(0)
  let showQuadratini = $state(true)

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY
      // Nascondi i quadratini nelle sezioni scure (gallery in poi)
      const galleryEl = document.getElementById('helmet')
      if (galleryEl) {
        showQuadratini = window.scrollY < galleryEl.offsetTop - window.innerHeight * 0.3
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })

  // navDark=true solo nelle sezioni scure (Gallery in poi).
  // La landing è ora alta calc(100vh + 900px): bianco fino alla Gallery.
  let navDark = $derived.by(() => {
    if (typeof window === 'undefined') return false
    const galleryEl = typeof document !== 'undefined' ? document.getElementById('helmet') : null
    const galleryStart = galleryEl?.offsetTop ?? Infinity
    return scrollY >= galleryStart
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
</style>
