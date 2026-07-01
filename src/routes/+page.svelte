<script>
  import { onMount } from 'svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import BackgroundGrid from '$lib/components/BackgroundGrid.svelte'
  import HelmetGlobal from '$lib/components/helmetConfigurator/HelmetGlobal.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionHelmetVisor from '$lib/components/sections/SectionHelmetVisor.svelte'
  import SectionFrase2 from '$lib/components/sections/SectionFrase2.svelte'
  import SectionAthletesIntro from '$lib/components/sections/SectionAthletesIntro.svelte'
  import SectionAthletes from '$lib/components/sections/SectionAthletes.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import LoadingScreen from '$lib/components/LoadingScreen.svelte'

  let scrollY     = $state(0)
  let loaderDone  = $state(false)
  let navDark     = $state(false)  // inizia scuro (landing ha sfondo chiaro)
  let navShowLogo = $state(false)
  let inBio       = $state(false)
  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY

      const bioEl     = document.getElementById('athlete-bio')
      const visorEl   = document.getElementById('helmet-visor')

      // navDark = true (testo bianco) dall'inizio di helmet-visor in poi
      navDark = scrollY >= (visorEl?.offsetTop ?? Infinity) + 1550

      // I pixel colorati di sfondo sono nascosti durante la biografia (layout fitto).
      // Su mobile però tutta la sezione visor (casco che sale, zoom e de-zoom) resta
      // trasparente: i pixel restano visibili dietro al casco per l'intera sezione,
      // niente sfondo bianco/scuro piatto. Lo scuro arriva solo nella sezione atleti.
      const isMobile  = window.innerWidth < 768
      const visorTop  = visorEl?.offsetTop ?? Infinity
      const visorBottom = visorTop + (visorEl ? visorEl.offsetHeight - window.innerHeight : 0)
      const inBioRange = !!(bioEl && scrollY >= bioEl.offsetTop)
      const inVisor   = isMobile && scrollY >= visorTop && scrollY < visorBottom
      inBio = inBioRange && !inVisor

      navShowLogo = scrollY >= window.innerHeight * 0.2
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })
</script>

<svelte:head>
  <link rel="preload" as="image" href="/images/vlad-espanso-hd-nobg.webp" fetchpriority="high" />
</svelte:head>

<LoadingScreen ondone={() => { loaderDone = true }} />

<div class="page-shell" class:page-shell--ready={loaderDone}>
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

    <SectionFrase2 />
    <SectionRegolamento />
  </main>
</div>

<style>
  main { width: 100%; }

  .page-shell {
    visibility: hidden;
    opacity: 0;
    background: #FAFAFA;
  }

  .page-shell--ready {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.55s ease 0.05s;
  }

  #athletes-section {
    background: #030404;
  }
</style>
