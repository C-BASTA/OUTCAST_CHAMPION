<script>
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import Navbar from '$lib/components/Navbar.svelte'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionAthletesIntro from '$lib/components/sections/SectionAthletesIntro.svelte'
  import SectionAthletes from '$lib/components/sections/SectionAthletes.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'
  import SectionAbout from '$lib/components/sections/SectionAbout.svelte'
  import Intro from '$lib/components/Intro.svelte'
  import { introState } from '$lib/introState.svelte.js'

  let scrollY        = $state(0)
  let navDark        = $state(false)
  let navShowLogo    = $state(false)
  let showQuadratini = $state(true)
  let showIntro      = $state(false)
  let introDone      = false

  // Blocca lo scroll mentre il pixel effect è attivo
  $effect(() => {
    document.body.style.overflow = showIntro ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  })

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY

      const bioEl      = document.getElementById('athlete-bio')
      const athletesEl = document.getElementById('athletes-section')

      if (bioEl) {
        const bioScrollable = bioEl.offsetHeight - window.innerHeight
        const bioProg = (window.scrollY - bioEl.offsetTop) / bioScrollable

        // Quadratini svaniscono a ~54% della bio (prima che arrivi lo zoom)
        showQuadratini = window.scrollY < bioEl.offsetTop + bioScrollable * 0.54

        // Reset flag se l'utente torna indietro
        if (bioProg < 0.5) introDone = false

        // Attiva il pixel effect quando la bio (e il dezoom) è quasi finita
        if (bioProg >= 0.995 && !showIntro && !introDone) {
          introDone = true
          introState.scrolled = 0
          showIntro = true
        }

        // navDark: scuro dalla fase zoom della bio in poi
        const bioDarkStart = bioEl.offsetTop + bioScrollable * 0.63
        const athletesStart = athletesEl?.offsetTop ?? Infinity
        navDark = scrollY >= Math.min(bioDarkStart, athletesStart)
      } else {
        navDark = !!(athletesEl && scrollY >= athletesEl.offsetTop)
      }

      navShowLogo = scrollY >= window.innerHeight * 0.2
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  })
</script>

<!-- Quadratini bandiera ucraina (fissi, svaniscono con la bio) -->
{#if showQuadratini}
  <Quadratini />
{/if}

<Navbar dark={navDark} showLogo={navShowLogo} />

<!-- Pixel effect: overlay fisso tra la fine della bio e la sezione atleti -->
{#if showIntro}
  <div
    class="intro-overlay"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 600 }}
  >
    <Intro onDone={() => {
      showIntro = false
      setTimeout(() => {
        document.getElementById('athletes-section')?.scrollIntoView({ behavior: 'instant' })
      }, 650)
    }} />
  </div>
{/if}

<main>
  <SectionLanding />
  <SectionFrase />
  <SectionBiography />

  <div id="athletes-section">
    <SectionAthletesIntro />
    <SectionAthletes />
  </div>

  <SectionRegolamento />
  <SectionAbout />
</main>

<style>
  main { width: 100%; }

  .intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
  }
</style>
