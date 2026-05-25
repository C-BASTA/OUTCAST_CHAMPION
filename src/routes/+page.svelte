<script>
  import { onMount } from 'svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import BackgroundGrid from '$lib/components/BackgroundGrid.svelte'
  import HelmetGlobal from '$lib/components/helmetConfigurator/HelmetGlobal.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionHelmetVisor from '$lib/components/sections/SectionHelmetVisor.svelte'
  import SectionAthletesIntro from '$lib/components/sections/SectionAthletesIntro.svelte'
  import SectionAthletes from '$lib/components/sections/SectionAthletes.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'

  let scrollY     = $state(0)
  let navDark     = $state(false)  // inizia scuro (landing ha sfondo chiaro)
  let navShowLogo = $state(false)
  let inBio       = $state(false)
  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY

      const bioEl     = document.getElementById('athlete-bio')
      const visorEl   = document.getElementById('helmet-visor')

      // navDark = true (testo bianco) dall'inizio di helmet-visor in poi
      navDark = scrollY >= (visorEl?.offsetTop ?? Infinity)
      inBio   = !!(bioEl && scrollY >= bioEl.offsetTop)

      navShowLogo = scrollY >= window.innerHeight * 0.2
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })
</script>

<!-- Pixel twinkling background (fisso, sempre visibile) -->
<BackgroundGrid hideColored={inBio} />

<!-- Canvas 3D globale fisso: persiste dalla fine della bio a fine athletes -->
<HelmetGlobal />

<Navbar dark={navDark} overlayDark={navDark} showLogo={navShowLogo} />

<main>
  <SectionLanding />
  <SectionFrase />
  <SectionBiography />
  <SectionHelmetVisor />

  <div id="athletes-section">
    <SectionAthletesIntro />
    <SectionAthletes />
  </div>

  <SectionRegolamento />
</main>

<style>
  main { width: 100%; }

  #athletes-section {
    background: #030404;
  }
</style>
