<script>
  import { Canvas } from '@threlte/core';
  import Scene from './Scene.svelte';

  let { onBack } = $props()

  const faces = [
    { name: 'Maksym Halinichev', rotation: { x: 0, y:  1.83, z: 0 }, position: { x: 0.0, y: 0.0, z: 0 } },
    { name: 'Dmytro Sharpar', rotation: { x: 0, y: 1.571, z: 0 }, position: { x: 0, y: 0.0, z: 0 } },
    { name: 'Yevhen Malyshev', rotation: { x: 0, y: 1.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Karyna Bakhur', rotation: { x: 0, y: 1.5, z: 0 }, position: { x: 0, y: 0, z: 0} },
    { name: 'Taras Shpuk', rotation: { x: 0, y: 2.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Pavlo Ishchenko', rotation: { x: 0, y: 2.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksiy Loginov', rotation: { x: 0, y: 3.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Volodymyr Androshchuk', rotation: { x: 0, y: 3.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksiy Khabarov', rotation: { x: 0, y: 4.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Mykyta Kozubenko', rotation: { x: 0, y: 4.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Andriy Yaremenko', rotation: { x: 0, y: 5.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Fedor Epifanov', rotation: { x: 0, y: 5.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Kateryna Troyan', rotation: { x: 0, y: 6.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Nazar Zuy', rotation: { x: 0, y: 6.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Mariia Lebid', rotation: { x: 0, y: 7.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Alina Perehudova', rotation: { x: 0, y: 7.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Oleksandr Peleshenko', rotation: { x: 0, y: 8.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Kateryna Diachenko', rotation: { x: 0, y: 8.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Viktoriia Ivashko', rotation: { x: 0, y: 9.0, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Andriy Kutsenko', rotation: { x: 0, y: 9.5, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Daria Kurdel', rotation: { x: 0, y: 10, z: 0 }, position: { x: 0, y: 0, z: 0 } },
    { name: 'Ivan Kononenko', rotation: { x: 0, y: 10.5, z: 0 }, position: { x: 0, y: 0, z: 0 } }
  ];

  let selected = $state(0);
  let activeRotation = $state(faces[0].rotation);
  let activePosition = $state(faces[0].position);
  let timeoutId = null;
  let lastScroll = 0;
  const SCROLL_COOLDOWN = 250;

  function updateRotationWithDelay(index) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      activeRotation = faces[index].rotation;
      activePosition = faces[index].position;
    }, 400);
  }

  let displaySlots = $derived.by(() => {
    const slots = [];
    for (let i = 2; i >= 1; i--) {
      const index = selected - i;
      if (index >= 0) {
        slots.push({ name: faces[index].name, index: index, isEmpty: false });
      } else {
        slots.push({ name: '', index: -1, isEmpty: true });
      }
    }
    slots.push({ name: faces[selected].name, index: selected, isEmpty: false });
    for (let i = 1; i <= 2; i++) {
      const index = selected + i;
      if (index < faces.length) {
        slots.push({ name: faces[index].name, index: index, isEmpty: false });
      } else {
        slots.push({ name: '', index: -1, isEmpty: true });
      }
    }
    return slots;
  });

  function onwheel(e) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastScroll < SCROLL_COOLDOWN) return;
    lastScroll = now;

    // Scroll su dal primo elemento → torna all'intro
    if (e.deltaY < 0 && selected === 0) {
      onBack?.();
      return;
    }

    if (e.deltaY > 0 && selected < faces.length - 1) {
      selected++;
    } else if (e.deltaY < 0 && selected > 0) {
      selected--;
    }
    updateRotationWithDelay(selected);
  }

  function selectFace(index) {
    if (index !== -1) {
      selected = index;
      updateRotationWithDelay(selected);
    }
  }

  let touchStartY = 0;
  function ontouchstart(e) {
    touchStartY = e.touches[0].clientY;
  }
  function ontouchend(e) {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 10) return;
    if (delta > 0 && selected < faces.length - 1) {
      selected++;
    } else if (delta < 0 && selected > 0) {
      selected--;
    } else if (delta < 0 && selected === 0) {
      onBack?.();
    }
    updateRotationWithDelay(selected);
  }
</script>

<div class="gallery-layout" role="application" on:wheel={onwheel} on:touchstart={ontouchstart} on:touchend={ontouchend}>
  <div class="names">
    {#each displaySlots as slot}
      {#if slot.isEmpty}
        <div class="name empty"></div>
      {:else}
        <div 
          class="name {slot.index === selected ? 'selected' : ''}"
          on:click={() => selectFace(slot.index)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && selectFace(slot.index)}
        >
          {slot.name}
        </div>
      {/if}
    {/each}
  </div>
  <div class="viewer">
    <div class="canvas-fill">
      <Canvas renderMode="always">
        <Scene
          rotation={activeRotation}
          position={activePosition}
          orbitControlVal={false}
        />
      </Canvas>
    </div>
  </div>
</div>

<style>
  .gallery-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    background: var(--color-canvas, #000);
    position: relative;
  }
  .names {
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100%;
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
  .name.empty {
    pointer-events: none;
  }
  .name.selected {
    color: var(--color-ink, #fff);
    -webkit-text-stroke: 0;
    transform: scale(1.30);
    transform-origin: left center;
  }
  .name:hover:not(.empty) {
    margin-left: var(--gap-filter-options, 1rem);
  }
  .name.selected:hover {
    transform: scale(1.30);
    text-shadow: 0 0 20px var(--color-ink, #fff), 0 0 40px var(--color-ink, #fff3), 0 0 80px var(--color-ink, #fff2);
  }
  .viewer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--color-canvas, #000);
  }

  /* canvas-fill: dimensioni esplicite note → Threlte può dimensionare il Canvas correttamente.
     Con display:flex e align-items:center sul parent, height:100% collassava a ~0. */
  .canvas-fill {
    position: absolute;
    inset: 0;
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
    .name.selected:hover {
      transform: scale(1.50);
    }
    .name:hover:not(.empty) {
      margin-left: 0;
    }
    .viewer {
      padding-left: 0;
      justify-content: center;
      opacity: 0.4;
    }
  }
</style>