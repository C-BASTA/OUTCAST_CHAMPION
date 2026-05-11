<script>
  import { onMount } from 'svelte'

  // Il nome ripetuto abbastanza volte da riempire lo schermo su entrambi i lati
  const UNIT = 'Vladyslav Heraskevyč  '
  const TEXT = UNIT.repeat(6)

  // Le 3 righe hanno offset iniziali diversi: mostrano parti diverse del nome
  // dir: -1 = si sposta a sinistra sullo scroll, +1 = destra
  const ROWS = [
    { color: '#ffd700', initialOffset: 0,              dir: -1 },
    { color: '#0057b7', initialOffset: -UNIT.length * 4, dir:  1 },
    { color: '#ffd700', initialOffset: -UNIT.length * 8, dir: -1 },
  ]

  let progress = $state(0)
  let section

  onMount(() => {
    const update = () => {
      if (!section) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      // progress: 0 quando la sezione è in cima, 1 quando esce
      const raw = 1 - rect.top / vh
      progress = Math.max(0, Math.min(1, raw))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  })

  // Movimento orizzontale proporzionale allo scroll: max ±400px
  const TRAVEL = 420
</script>

<section bind:this={section} class="transition-section">
  <!-- Atleta rimpicciolito, centrato -->
  <img
    class="vlad"
    src="/images/vlad-front.png"
    alt="Vladyslav"
    style:opacity={0.5 + progress * 0.2}
  />

  <!-- Testo nome su 3 righe -->
  <div class="name-wrap">
    {#each ROWS as row, i}
      <div
        class="name-row"
        style:color={row.color}
        style:transform="translateX({row.dir * progress * TRAVEL}px)"
      >
        {TEXT}
      </div>
    {/each}
  </div>
</section>

<style>
  .transition-section {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #fafafa;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .vlad {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    height: 72vh;
    width: auto;
    object-fit: contain;
    z-index: 2;
    pointer-events: none;
  }

  .name-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
    overflow: hidden;
    z-index: 3;
    pointer-events: none;
  }

  .name-row {
    font-family: var(--font-primary);
    font-size: clamp(72px, 8.5vw, 128px);
    font-weight: 400;
    line-height: 1.05;
    white-space: nowrap;
    will-change: transform;
    /* Centrato: partiamo centrati e scrolliamo da lì */
    transform-origin: center center;
  }
</style>
