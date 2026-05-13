<script>
  import { onMount } from 'svelte'

  let wrap
  let helmetLayer

  let _cx = 0, _cy = 0, _r  = 0, _vx = 0, _vy = 0, _vr = 0
  let _t1x = 0, _t1y = 0, _t1r = 0, _t1vx = 0, _t1vy = 0, _t1vr = 0
  let _t2x = 0, _t2y = 0, _t2r = 0, _t2vx = 0, _t2vy = 0, _t2vr = 0
  let _tCx = 0, _tCy = 0, _tR  = 0
  let _hovering = false  // <-- nuovo

  const RADIUS    = 200
  const STIFFNESS = 0.62
  const DAMPING   = 0.70

  const SCROLL_RANGE = 900
  const UNIT  = 'Vladyslav Heraskevyč  '
  const TEXT  = UNIT.repeat(6)
  const ROWS  = [
    { color: '#ffd700', dir: -1 },
    { color: '#0057b7', dir:  1 },
    { color: '#ffd700', dir: -1 },
  ]
  const TRAVEL = 520

  let progress = $state(0)
  let _scale   = 1

  let photoScale   = $derived(1 - progress * 0.78)
  let photoOpacity = $derived(Math.max(0, 1 - progress * 1.2))
  let titleOpacity = $derived(Math.max(0, 1 - progress * 6))
  let textOpacity  = $derived(Math.min(1, progress * 2.5))

  onMount(() => {
    const onScroll = () => {
      const p = Math.max(0, Math.min(1, window.scrollY / SCROLL_RANGE))
      progress = p
      _scale   = 1 - p * 0.78
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    let raf
    const tick = () => {
      _vx += (_tCx - _cx) * STIFFNESS;  _vx *= DAMPING;  _cx += _vx
      _vy += (_tCy - _cy) * STIFFNESS;  _vy *= DAMPING;  _cy += _vy
      _vr += (_tR  - _r ) * 0.55;       _vr *= 0.72;     _r  += _vr

      _t1vx += (_cx - _t1x) * 0.13;  _t1vx *= 0.85;  _t1x += _t1vx
      _t1vy += (_cy - _t1y) * 0.13;  _t1vy *= 0.85;  _t1y += _t1vy
      _t1vr += (Math.max(0, _r) * 0.70 - _t1r) * 0.20;  _t1vr *= 0.82;  _t1r += _t1vr

      _t2vx += (_t1x - _t2x) * 0.07;  _t2vx *= 0.87;  _t2x += _t2vx
      _t2vy += (_t1y - _t2y) * 0.07;  _t2vy *= 0.87;  _t2y += _t2vy
      _t2vr += (Math.max(0, _t1r) * 0.55 - _t2r) * 0.13;  _t2vr *= 0.84;  _t2r += _t2vr

      if (_tR === 0 && _r < 2)   { _r = 0;   _vr = 0   }
      if (_tR === 0 && _t1r < 2) { _t1r = 0; _t1vr = 0 }
      if (_tR === 0 && _t2r < 2) { _t2r = 0; _t2vr = 0 }

      // Se non è mai stato in hover, o il raggio è zero, nascondi
      if (!_hovering || _r <= 1) {
        helmetLayer.style.opacity = "0";
      } else {
        helmetLayer.style.opacity = "1";
        
        const w = helmetLayer.offsetWidth  || 1
        const h = helmetLayer.offsetHeight || 1

        const pct = (v, max) => ((v / max) * 100).toFixed(2) + '%'
        const g = (x, y, r) =>
          `radial-gradient(circle ${r}px at ${pct(x,w)} ${pct(y,h)}, black ${(r * 0.4).toFixed(0)}px, transparent ${r}px)`

        const masks = [g(_cx, _cy, _r)]
        if (_t1r > 1) masks.push(g(_t1x, _t1y, _t1r))
        if (_t2r > 1) masks.push(g(_t2x, _t2y, _t2r))

        const maskVal = masks.join(', ')
        helmetLayer.style.webkitMaskImage     = maskVal
        helmetLayer.style.maskImage           = maskVal
        helmetLayer.style.webkitMaskComposite = 'source-over'
        helmetLayer.style.maskComposite       = 'add'
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e) => {
      _hovering = true
      const hr = helmetLayer.getBoundingClientRect()
      _tCx = (e.clientX - hr.left) / _scale
      _tCy = (e.clientY - hr.top)  / _scale
      _tR  = RADIUS
    }
    const onLeave = () => {
      _hovering = false
      _tR = 0
    }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
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
      <img
        class="vlad"
        src="/images/vlad-face-hd-transparent.png"
        alt="Vladyslav Heraskevych"
        draggable="false"
      />
      <img
        class="helmet"
        src="/images/vlad-hover.png"
        alt=""
        bind:this={helmetLayer}
        draggable="false"
      />
    </div>

    <div class="name-wrap" style:opacity={textOpacity}>
      {#each ROWS as row}
        <div
          class="name-row"
          style:color={row.color}
          style:transform="translateX({row.dir * (1 - Math.min(progress * 1.5, 1)) * TRAVEL}px)"
        >
          {TEXT}
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
    background: var(--hex-neutral-50, #fafafa);
    z-index: 1;
  }

  .sticky-inner {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: var(--hex-neutral-50, #fafafa);
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
    transform-origin: 50% 40%;
    will-change: transform, opacity;
  }

  .vlad {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: top center;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }

  .helmet {
    position: absolute;
    top: -14%;
    left: 50%;
    transform: translateX(-50%) translateZ(0);
    width: 118%;
    height: auto;
    display: block;
    user-select: none;
    -webkit-user-drag: none;

    /* AGGIUNGI QUESTO: */
    mask-image: radial-gradient(circle 0px at 0% 0%, black 0%, transparent 0%);
    -webkit-mask-image: radial-gradient(circle 0px at 0% 0%, black 0%, transparent 0%);
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

  .name-row {
    font-family: var(--font-primary);
    font-size: clamp(72px, 8.5vw, 128px);
    font-weight: 400;
    line-height: 1.05;
    white-space: nowrap;
    will-change: transform;
  }
</style>