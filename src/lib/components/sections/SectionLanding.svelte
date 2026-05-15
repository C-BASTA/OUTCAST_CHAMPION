<script>
  import { onMount } from 'svelte'

  let wrap, helmetLayer

  const SCROLL_RANGE = 900
  const UNIT = 'Vladyslav Heraskevyč  '
  const TEXT = UNIT.repeat(6)
  const ROWS = [{ color: '#ffd700', dir: -1 }, { color: '#0057b7', dir: 1 }, { color: '#ffd700', dir: -1 }]
  const TRAVEL = 520

  let progress = $state(0)
  let _scale = 1
  let photoScale = $derived(1 - progress * 0.78)
  let photoOpacity = $derived(Math.max(0, 1 - progress * 1.2))
  let titleOpacity = $derived(Math.max(0, 1 - progress * 6))
  let textOpacity = $derived(Math.min(1, progress * 2.5))

  // Trail settings
  const MAX_POINTS = 22
  const MAX_AGE    = 55
  const HEAD_R     = 170
  const TAIL_R     = 35

  onMount(() => {
    const onScroll = () => {
      const p = Math.max(0, Math.min(1, window.scrollY / SCROLL_RANGE))
      progress = p
      _scale = 1 - p * 0.78
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let trail = []
    let raf

    const tick = () => {
      // Invecchia e rimuovi punti scaduti
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age++
        if (trail[i].age > MAX_AGE) trail.splice(i, 1)
      }

      if (!helmetLayer) { raf = requestAnimationFrame(tick); return }

      if (trail.length === 0) {
        helmetLayer.style.opacity = '0'
      } else {
        helmetLayer.style.opacity = '1'
        const w = wrap?.offsetWidth  || 1
        const h = wrap?.offsetHeight || 1
        const N = trail.length

        const gradients = trail.map((p, i) => {
          const byPos = N > 1 ? i / (N - 1) : 0
          const byAge = p.age / MAX_AGE
          const t = Math.max(byPos, byAge)
          const r = TAIL_R + (HEAD_R - TAIL_R) * (1 - t)
          const px = (p.x / w) * 100
          const py = (p.y / h) * 100
          return `radial-gradient(${r}px at ${px}% ${py}%, black 40%, transparent 100%)`
        })

        const maskVal = gradients.join(', ')
        helmetLayer.style.webkitMaskImage = maskVal
        helmetLayer.style.maskImage = maskVal
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      const x = (e.clientX - rect.left) / _scale
      const y = (e.clientY - rect.top)  / _scale
      // Campiona solo se ci siamo mossi abbastanza
      const last = trail[0]
      if (!last || Math.hypot(x - last.x, y - last.y) > 6) {
        trail.unshift({ x, y, age: 0 })
        if (trail.length > MAX_POINTS) trail.pop()
      }
    }

    const onLeave = () => { /* i punti invecchiano e scompaiono da soli */ }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      wrap?.removeEventListener('mousemove', onMove)
      wrap?.removeEventListener('mouseleave', onLeave)
    }
  })
</script>

<section id="athlete" class="landing">
  <div class="sticky-inner">
    <h1 class="title" style:opacity={titleOpacity}>Outcast<br />Champion</h1>

    <div
      class="photo-wrap"
      bind:this={wrap}
      style:transform="translateX(-50%) scale({photoScale})"
      style:opacity={photoOpacity}
    >
      <img class="vlad" src="/images/vladislav-contrastato.png" alt="Vlad" draggable="false" />

      <div class="gooey-container">
        <img
          class="helmet"
          src="/images/vlad-hover-black.png"
          alt=""
          bind:this={helmetLayer}
          draggable="false"
        />
      </div>
    </div>

    <div class="name-wrap" style:opacity={textOpacity}>
      {#each ROWS as row, i}
        <div class="row-container" style:transform="translateX({row.dir * (1 - Math.min(progress * 1.5, 1)) * TRAVEL}px)">
          <div class="name-row {i % 2 === 0 ? 'marquee-left' : 'marquee-right'}" style:color={row.color}>
            {TEXT} {TEXT}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .landing {
    position: relative;
    width: 100%;
    height: calc(100vh + 900px);
  }

  .sticky-inner {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    z-index: 1;
  }

  .title {
    position: absolute;
    top: 32px;
    left: 48px;
    font-family: var(--font-primary);
    font-size: clamp(40px, 4.5vw, 72px);
    font-weight: 400;
    color: #030404;
    line-height: 1.05;
    letter-spacing: -0.02em;
    z-index: 10;
    pointer-events: none;
    user-select: none;
    will-change: opacity;
  }

  .photo-wrap {
    position: absolute;
    bottom: -8%;
    left: 50%;
    width: min(105vh, 74vw);
    height: min(105vh, 74vw);
    cursor: crosshair;
    transform-origin: 50% 50%;
    will-change: transform, opacity;
  }

  .vlad {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom center;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    z-index: 2;
    filter: none;
  }

  .gooey-container {
    position: absolute;
    inset: 0;
    z-index: 3;
    filter: none;
    pointer-events: none;
  }

  .helmet {
    position: absolute;
    top: -22%;
    left: 47%;
    transform: translateX(-50%) scale(0.9);
    transform-origin: center center;
    width: 118%;
    height: auto;
    display: block;
    z-index: 3;
    transition: opacity 0.6s ease;
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
    will-change: opacity;
  }

  .row-container {
    width: 100%;
    will-change: transform;
  }

  .name-row {
    display: inline-block;
    font-family: var(--font-primary);
    font-size: clamp(72px, 8.5vw, 128px);
    font-weight: 400;
    line-height: 1.05;
    white-space: nowrap;
  }

  .marquee-left {
    animation: marquee-l 25s linear infinite;
  }

  .marquee-right {
    animation: marquee-r 25s linear infinite;
  }

  @keyframes marquee-l {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes marquee-r {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }
</style>
