<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'

  const faces = [
    { name: 'Maksym Halinichev',     rotation: { x: 0, y: 1.83,  z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Dmytro Sharpar',        rotation: { x: 0, y: 1.571, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Yevhen Malyshev',       rotation: { x: 0, y: 1.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Karyna Bakhur',         rotation: { x: 0, y: 1.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Taras Shpuk',           rotation: { x: 0, y: 2.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Pavlo Ishchenko',       rotation: { x: 0, y: 2.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksiy Loginov',       rotation: { x: 0, y: 3.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Volodymyr Androshchuk', rotation: { x: 0, y: 3.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksiy Khabarov',      rotation: { x: 0, y: 4.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Mykyta Kozubenko',      rotation: { x: 0, y: 4.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Andriy Yaremenko',      rotation: { x: 0, y: 5.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Fedor Epifanov',        rotation: { x: 0, y: 5.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Kateryna Troyan',       rotation: { x: 0, y: 6.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Nazar Zuy',             rotation: { x: 0, y: 6.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Mariia Lebid',          rotation: { x: 0, y: 7.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Alina Perehudova',      rotation: { x: 0, y: 7.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksandr Peleshenko',  rotation: { x: 0, y: 8.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Kateryna Diachenko',    rotation: { x: 0, y: 8.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Viktoriia Ivashko',     rotation: { x: 0, y: 9.0,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Andriy Kutsenko',       rotation: { x: 0, y: 9.5,   z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Daria Kurdel',          rotation: { x: 0, y: 10,    z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Ivan Kononenko',        rotation: { x: 0, y: 10.5,  z: 0 }, position: { x: 0, y: 0, z: 0 } },
  ]

  // Quanti px di scroll per ogni step (più alto = più lento)
  const PX_PER_STEP = 300

  // Spazio totale di scroll = un passo per ogni atleta
  // Il primo atleta è visibile a scroll 0, quindi servono (faces.length - 1) passi
  const SCROLL_HEIGHT = PX_PER_STEP * (faces.length - 1)

  let wrapper
  let selected = $state(0)
  let activeRotation = $state(faces[0].rotation)
  let activePosition = $state(faces[0].position)
  let timeoutId = null

  function updateRotation(index) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      activeRotation = faces[index].rotation
      activePosition = faces[index].position
    }, 400)
  }

  let displaySlots = $derived.by(() => {
    const slots = []
    for (let i = 2; i >= 1; i--) {
      const index = selected - i
      slots.push(index >= 0
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true }
      )
    }
    slots.push({ name: faces[selected].name, index: selected, isEmpty: false })
    for (let i = 1; i <= 2; i++) {
      const index = selected + i
      slots.push(index < faces.length
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true }
      )
    }
    return slots
  })

  function onScroll() {
    if (!wrapper) return
    // Quanto scrollato dentro il wrapper (0 = gallery appena entrata, SCROLL_HEIGHT = finita)
    const scrolledInside = -wrapper.getBoundingClientRect().top
    if (scrolledInside < 0 || scrolledInside > SCROLL_HEIGHT) return

    const newSelected = Math.min(
      faces.length - 1,
      Math.floor(scrolledInside / PX_PER_STEP)
    )
    if (newSelected !== selected) {
      selected = newSelected
      updateRotation(selected)
    }
  }

  function selectFace(index) {
    if (index === -1) return
    selected = index
    updateRotation(selected)
    // Scrolla la pagina al punto corrispondente dentro il wrapper
    const target = wrapper.offsetTop + index * PX_PER_STEP
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

<!--
  Il wrapper è alto 100vh (la parte sticky visibile) + SCROLL_HEIGHT px
  così la gallery è a schermo per tutto il tempo che ci vuole a scorrere tutti gli atleti.
-->
<div
  class="gallery-wrapper"
  bind:this={wrapper}
  id="helmet"
  style="height: calc(100vh + {SCROLL_HEIGHT}px)"
>
  <div class="gallery-sticky">
    <div class="names">
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

    <div class="viewer">
      <Canvas renderMode="always">
        <Scene rotation={activeRotation} position={activePosition} orbitControlVal={false} />
      </Canvas>
    </div>
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
    background: var(--color-canvas, #000);
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

  .name.selected:hover {
    transform: scale(1.30);
    text-shadow:
      0 0 20px var(--color-ink, #fff),
      0 0 40px var(--color-ink, #fff3),
      0 0 80px var(--color-ink, #fff2);
  }

  .viewer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-left: 45%;
  }

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
      font-size: var(--font-size-links, 2.4rem);
    }
    .name.selected:hover { transform: scale(1.50); }
    .name:hover:not(.empty) { margin-left: 0; }
    .viewer {
      padding-left: 0;
      justify-content: center;
      opacity: 0.4;
    }
  }
</style>