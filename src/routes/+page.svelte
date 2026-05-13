<script>
  import { onMount } from 'svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionTransition from '$lib/components/sections/SectionTransition.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import SectionAbout from '$lib/components/sections/SectionAbout.svelte'
  import Gallery from '$lib/components/Gallery.svelte'
  import Intro from '$lib/components/Intro.svelte'

  let scrollY = $state(0)

  let navDark = $state(false)
  let navShowLogo = $state(false)

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY
      const galleryEl = document.getElementById('helmet')
      navDark = galleryEl ? window.scrollY >= galleryEl.offsetTop : false
      navShowLogo = window.scrollY >= window.innerHeight * 0.2
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })
</script>

<Navbar dark={navDark} showLogo={navShowLogo} />

<main>
  <SectionLanding />
  <SectionTransition />
  <SectionFrase />
  <SectionBiography />
  <Intro />
  <Gallery />
  <SectionRegolamento />
  <SectionAbout />
</main>

<style>
  main { width: 100%; }
</style>