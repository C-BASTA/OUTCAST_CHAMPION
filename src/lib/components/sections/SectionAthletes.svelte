<script>
  import { onMount } from 'svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  const faces = [
    { name: 'Maksym Halinichev',     rotation: { x: 0, y: 1.83,  z: 0 } },
    { name: 'Dmytro Sharpar',        rotation: { x: 0, y: 1.571, z: 0 } },
    { name: 'Yevhen Malyshev',       rotation: { x: 0, y: 1.0,   z: 0 } },
    { name: 'Karyna Bakhur',         rotation: { x: 0, y: 1.5,   z: 0 } },
    { name: 'Taras Shpuk',           rotation: { x: 0, y: 2.0,   z: 0 } },
    { name: 'Pavlo Ishchenko',       rotation: { x: 0, y: 2.5,   z: 0 } },
    { name: 'Oleksiy Loginov',       rotation: { x: 0, y: 10.5,  z: 0 } },
    { name: 'Volodymyr Androshchuk', rotation: { x: 0, y: 3.5,   z: 0 } },
    { name: 'Oleksiy Khabarov',      rotation: { x: 0, y: 1.0,   z: 0 } },
    { name: 'Mykyta Kozubenko',      rotation: { x: 0, y: 4.5,   z: 0 } },
    { name: 'Andriy Yaremenko',      rotation: { x: 0, y: 5.0,   z: 0 } },
    { name: 'Fedor Epifanov',        rotation: { x: 0, y: 8.0,   z: 0 } },
    { name: 'Kateryna Troyan',       rotation: { x: 0, y: 6.0,   z: 0 } },
    { name: 'Nazar Zuy',             rotation: { x: 0, y: 6.5,   z: 0 } },
    { name: 'Mariia Lebid',          rotation: { x: 0, y: 7.0,   z: 0 } },
    { name: 'Alina Perehudova',      rotation: { x: 0, y: 10.5,  z: 0 } },
    { name: 'Oleksandr Peleshenko',  rotation: { x: 0, y: 8.0,   z: 0 } },
    { name: 'Kateryna Diachenko',    rotation: { x: 0, y: 8.5,   z: 0 } },
    { name: 'Viktoriia Ivashko',     rotation: { x: 0, y: 9.0,   z: 0 } },
    { name: 'Andriy Kutsenko',       rotation: { x: 0, y: 9.5,   z: 0 } },
    { name: 'Daria Kurdel',          rotation: { x: 0, y: 10,    z: 0 } },
    { name: 'Ivan Kononenko',        rotation: { x: 0, y: 10.5,  z: 0 } },
  ]

  const PX_PER_STEP  = 300
  const SCROLL_HEIGHT = PX_PER_STEP * (faces.length - 1)
  const INTRO_PX     = 1200  // scroll per la transizione intro

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // Valori iniziali (bio end state)
  const BIO_CAM_Y   = 0.25
  const BIO_CAM_Z   = 8.5
  const BIO_LOOK_Y  = 0.20
  const BIO_ROT_X   = 0.25
  const BIO_ROT_Y   = Math.PI  // visiera frontale

  // Valori target gallery
  const ATH_CAM_Y  = -0.01
  const ATH_CAM_Z  =  6.0
  const ATH_LOOK_Y =  0.0
  const ATH_ROT_X  =  0.0

  let wrapper  = null
  let selected = $state(0)
  let introP   = $state(0)

  // Nomi: salgono dal basso durante intro
  let namesTranslateY = $derived(
    lerp(100, 0, ease(clamp((introP - 0.25) / 0.65, 0, 1))) + 'vh'
  )
  let namesOpacity = $derived(ease(clamp((introP - 0.20) / 0.40, 0, 1)))

  let displaySlots = $derived.by(() => {
    const slots = []
    for (let i = 2; i >= 1; i--) {
      const index = selected - i
      slots.push(index >= 0
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true })
    }
    slots.push({ name: faces[selected].name, index: selected, isEmpty: false })
    for (let i = 1; i <= 2; i++) {
      const index = selected + i
      slots.push(index < faces.length
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true })
    }
    return slots
  })

  function updateRotation(index) {
    // Aggiorna il target direttamente: il lerp in HelmetGlobalScene smootha la transizione
    helmetStore.rotX = 0
    helmetStore.rotY = faces[index].rotation.y
    helmetStore.rotZ = 0
  }

  function onScroll() {
    if (!wrapper) return
    const scrolledInside = -wrapper.getBoundingClientRect().top

    // Uscita dalla sezione: disattiva canvas globale
    if (scrolledInside > INTRO_PX + SCROLL_HEIGHT) {
      helmetStore.visible = false
      return
    }

    // Prima dell'ingresso nella sezione
    if (scrolledInside < 0) return

    // Attiva sempre il canvas globale quando siamo dentro questa sezione
    helmetStore.visible = true

    const newIntroP = clamp(scrolledInside / INTRO_PX, 0, 1)
    introP = newIntroP

    if (newIntroP < 1) {
      // ── Fase intro: scroll-driven, applica diretto (no lerp extra) ──
      helmetStore.smoothRotation = false
      const ei = ease(clamp(newIntroP / 0.65, 0, 1))
      helmetStore.viewerPaddingLeft = lerp(0, 45, ei) + '%'
      helmetStore.cameraY = lerp(BIO_CAM_Y,  ATH_CAM_Y,  ei)
      helmetStore.cameraZ = lerp(BIO_CAM_Z,  ATH_CAM_Z,  ei)
      helmetStore.lookAtY = lerp(BIO_LOOK_Y, ATH_LOOK_Y, ei)
      helmetStore.rotX    = lerp(BIO_ROT_X,  ATH_ROT_X,  ei)
      helmetStore.rotY    = lerp(BIO_ROT_Y,  faces[0].rotation.y, ei)
    } else {
      // ── Fase gallery: lerp fluido verso il volto selezionato ──
      helmetStore.smoothRotation = true
      helmetStore.viewerPaddingLeft = '45%'
      helmetStore.cameraY = ATH_CAM_Y
      helmetStore.cameraZ = ATH_CAM_Z
      helmetStore.lookAtY = ATH_LOOK_Y
      helmetStore.rotX    = ATH_ROT_X

      const galleryScrolled = Math.max(0, scrolledInside - INTRO_PX)
      const newSelected = Math.min(faces.length - 1, Math.floor(galleryScrolled / PX_PER_STEP))
      if (newSelected !== selected) {
        selected = newSelected
        updateRotation(selected)
      }
    }
  }

  function selectFace(index) {
    if (index === -1) return
    selected = index
    updateRotation(selected)
    const target = wrapper.offsetTop + INTRO_PX + index * PX_PER_STEP
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  onMount(() => {
    let rafId
    const handler = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(onScroll)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      cancelAnimationFrame(rafId)
    }
  })
</script>

<div
  class="gallery-wrapper"
  bind:this={wrapper}
  id="helmet"
  style="height: calc(100vh + {INTRO_PX + SCROLL_HEIGHT}px)"
>
  <div class="gallery-sticky">
    <!-- I nomi salgono dal basso durante la fase intro -->
    <div
      class="names"
      style:transform="translateY({namesTranslateY})"
      style:opacity={namesOpacity}
    >
      {#each displaySlots as slot}
        {#if slot.isEmpty}
          <div class="name empty"></div>
        {:else}
          <div
            class="name"
            class:selected={slot.index === selected}
            role="button"
            tabindex="0"
            on:click={() => selectFace(slot.index)}
            on:keydown={(e) => e.key === 'Enter' && selectFace(slot.index)}
          >
            {slot.name}
          </div>
        {/if}
      {/each}
    </div>
    <!-- Il casco 3D è renderizzato dal canvas globale fisso (HelmetGlobal) -->
  </div>
</div>

<style>
  .gallery-wrapper {
    position: relative;
    width: 100%;
  }

  .gallery-sticky {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    /* z-index > canvas globale (z:3): crea stacking context sopra il canvas */
    z-index: 10;
    /* Trasparente: il canvas globale fisso fornisce lo sfondo scuro */
    background: transparent;
    overflow: hidden;
  }

  .names {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: var(--gap-header-links, 3rem);
    padding: 0 var(--padding-lateral, 5rem);
    user-select: none;
    z-index: 10;
    pointer-events: none;
  }

  .name {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: var(--font-size-h1);
    font-weight: 500;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--color-ink);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    letter-spacing: -0.03em;
    line-height: 1;
    pointer-events: auto;
    text-transform: uppercase;
  }

  .name.empty { pointer-events: none; }

  .name.selected {
    color: var(--color-ink, #fff);
    -webkit-text-stroke: 0;
    transform: scale(1.30);
    transform-origin: left center;
  }

  .name:hover:not(.empty) { margin-left: var(--gap-filter-options, 1rem); }

  .name.selected:hover { transform: scale(1.30); }

  @media (max-width: 768px) {
    .names {
      align-items: center;
      padding: 0 var(--padding-lateral, 2rem);
      gap: var(--gap-filter-options, 2.5rem);
    }
    .name {
      font-size: var(--font-size-h2, 2rem);
      text-align: center;
      -webkit-text-stroke: 1px var(--color-ink, #fff6);
      letter-spacing: 0.01em;
    }
    .name.selected {
      transform: scale(1.50);
      transform-origin: center center;
      margin-left: 0;
    }
    .name.selected:hover { transform: scale(1.50); }
    .name:hover:not(.empty) { margin-left: 0; }
  }
</style>
