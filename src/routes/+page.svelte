<script>
  import { onMount } from 'svelte'
  import Navbar from '$lib/components/Navbar.svelte'
  import Quadratini from '$lib/components/Quadratini.svelte'
  import SectionLanding from '$lib/components/sections/SectionLanding.svelte'
  import SectionFrase from '$lib/components/sections/SectionFrase.svelte'
  import SectionBiography from '$lib/components/sections/SectionBiography.svelte'
  import SectionAthletesIntro from '$lib/components/sections/SectionAthletesIntro.svelte'
  import SectionAthletes from '$lib/components/sections/SectionAthletes.svelte'
  import SectionRegolamento from '$lib/components/sections/SectionRegolamento.svelte'

  let scrollY        = $state(0)
  let navDark        = $state(false)
  let navShowLogo    = $state(false)
  let showQuadratini = $state(true)

  onMount(() => {
    const handler = () => {
      scrollY = window.scrollY

      const bioEl      = document.getElementById('athlete-bio')
      const athletesEl = document.getElementById('athletes-section')

      if (bioEl) {
        const bioScrollable = bioEl.offsetHeight - window.innerHeight

        showQuadratini = window.scrollY < bioEl.offsetTop + bioScrollable * 0.54

        const bioDarkStart  = bioEl.offsetTop + bioScrollable * 0.63
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

<main>
  <SectionLanding />
  <SectionFrase />
  <SectionBiography />

  <div id="athletes-section">
    <SectionAthletesIntro />
    <SectionAthletes />
  </div>

  <SectionRegolamento />
</main>

<style>
  main { width: 100%; }
</style>
