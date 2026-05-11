<script>
  import { onMount } from 'svelte'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionTransition from '$lib/components/sections/SectionTransition.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionStoria from '$lib/components/sections/SectionStoria.svelte'
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

  // Navbar scura solo nelle sezioni chiare (landing + bio)
  let navDark = $derived.by(() => {
    if (typeof window === 'undefined') return false
    const vh = window.innerHeight
    const bioEl = typeof document !== 'undefined' ? document.getElementById('athlete-bio') : null
    const bioStart = bioEl?.offsetTop ?? 0
    const bioEnd = bioStart + (bioEl?.offsetHeight ?? 0)
    const inLight = scrollY < vh || (scrollY >= bioStart && scrollY < bioEnd)
    return !inLight
  })
</script>

<!-- Layer fisso: quadratini su sfondo bianco, svanisce prima della gallery -->
{#if showQuadratini}
  <Quadratini />
{/if}

<!-- Navbar globale -->
<Navbar dark={navDark} />

<main>
  <SectionLanding />
  <SectionTransition />
  <SectionFrase />
  <SectionBiography />

  <section id="helmet" class="gallery-wrapper">
    <Gallery />
  </section>

  <SectionStoria />
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
