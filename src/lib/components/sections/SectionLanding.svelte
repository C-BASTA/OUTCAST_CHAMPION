<script>
  import { onMount } from 'svelte'

  // ─── Liquid blob mask ────────────────────────────────────────────────────
  let wrap
  let helmetLayer

  let _cx = 0, _cy = 0, _r  = 0, _vx = 0, _vy = 0, _vr = 0
  let _t1x = 0, _t1y = 0, _t1r = 0, _t1vx = 0, _t1vy = 0, _t1vr = 0
  let _t2x = 0, _t2y = 0, _t2r = 0, _t2vx = 0, _t2vy = 0, _t2vr = 0
  let _tCx = 0, _tCy = 0, _tR  = 0

  // Raggio piccolo + trail molto lento → la separazione crea la striscia naturalmente
  const RADIUS    = 110
  const STIFFNESS = 0.62
  const DAMPING   = 0.70

  // ─── Scroll-driven shrink (ex-SectionTransition) ─────────────────────────
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
  let _scale   = 1   // mirror non-reattivo per i listener

  let photoScale   = $derived(1 - progress * 0.78)
  let photoOpacity = $derived(Math.max(0, 1 - progress * 1.2))
  let titleOpacity = $derived(Math.max(0, 1 - progress * 6))
  let textOpacity  = $derived(Math.min(1, progress * 2.5))

  onMount(() => {
    // ── Scroll ───────────────────────────────────────────────────────────
    const onScroll = () => {
      const p  = Math.max(0, Math.min(1, window.scrollY / SCROLL_RANGE))
      progress = p
      _scale   = 1 - p * 0.78
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // ── Blob mask ────────────────────────────────────────────────────────
    const c0 = document.getElementById('blob-c0')
    const c1 = document.getElementById('blob-c1')
    const c2 = document.getElementById('blob-c2')

    helmetLayer.style.mask       = 'url(#blob-mask)'
    helmetLayer.style.webkitMask = 'url(#blob-mask)'

    let raf
    const tick = () => {
      // Main — veloce, segue il cursore
      _vx += (_tCx - _cx) * STIFFNESS;  _vx *= DAMPING;  _cx += _vx
      _vy += (_tCy - _cy) * STIFFNESS;  _vy *= DAMPING;  _cy += _vy
      _vr += (_tR  - _r ) * 0.55;       _vr *= 0.72;     _r  += _vr

      // Trail 1 — molto più lento: la separazione dal main crea la striscia via gooey
      _t1vx += (_cx - _t1x) * 0.13;  _t1vx *= 0.85;  _t1x += _t1vx
      _t1vy += (_cy - _t1y) * 0.13;  _t1vy *= 0.85;  _t1y += _t1vy
      _t1vr += (Math.max(0, _r) * 0.70 - _t1r) * 0.20;  _t1vr *= 0.82;  _t1r += _t1vr

      // Trail 2 — coda
      _t2vx += (_t1x - _t2x) * 0.07;  _t2vx *= 0.87;  _t2x += _t2vx
      _t2vy += (_t1y - _t2y) * 0.07;  _t2vy *= 0.87;  _t2y += _t2vy
      _t2vr += (Math.max(0, _t1r) * 0.55 - _t2r) * 0.13;  _t2vr *= 0.84;  _t2r += _t2vr

      c0.setAttribute('cx', _cx);  c0.setAttribute('cy', _cy);  c0.setAttribute('r', Math.max(0, _r))
      c1.setAttribute('cx', _t1x); c1.setAttribute('cy', _t1y); c1.setAttribute('r', Math.max(0, _t1r))
      c2.setAttribute('cx', _t2x); c2.setAttribute('cy', _t2y); c2.setAttribute('r', Math.max(0, _t2r))

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e) => {
      const hr = helmetLayer.getBoundingClientRect()
      // Divide per _scale: converte coordinate visive → spazio maschera (non scalato)
      _tCx = (e.clientX - hr.left) / _scale
      _tCy = (e.clientY - hr.top)  / _scale
      _tR  = RADIUS
    }
    const onLeave = () => { _tR = 0 }

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

<!--
  SVG hidden: filter gooey + mask inline.
  I cerchi sono separati dal movimento → gooey li fonde in una striscia.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"
  aria-hidden="true"
>
  <defs>
    <filter id="blob-gooey" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 28 -13"/>
    </filter>
    <mask id="blob-mask" maskUnits="userSpaceOnUse"
          x="-600" y="-600" width="3000" height="3000">
      <g filter="url(#blob-gooey)" fill="white">
        <circle id="blob-c0" cx="-999" cy="-999" r="0"/>
        <circle id="blob-c1" cx="-999" cy="-999" r="0"/>
        <circle id="blob-c2" cx="-999" cy="-999" r="0"/>
      </g>
    </mask>
  </defs>
</svg>

<!--
  La sezione è alta calc(100vh + 900px).
  Lo sticky-inner rimane fisso mentre l'utente scrolla i 900px extra →
  la foto si rimpicciolisce verso il centro, poi arrivano le scritte.
  Niente sezione duplicata.
-->
<section id="athlete" class="landing">
  <div class="sticky-inner">

    <!-- Titolo: scompare appena si inizia a scrollare -->
    <h1 class="title" style:opacity={titleOpacity}>Outcast<br />Champion</h1>

    <!-- Foto + maschera casco: scala verso il centro e sfuma con lo scroll -->
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

    <!-- Righe nome: scivolano dai lati mentre la foto scompare -->
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
  /* Sezione estesa: i 900px extra sono il tempo di scroll per l'animazione */
  .landing {
    position: relative;
    width: 100%;
    height: calc(100vh + 900px);
    background: var(--hex-neutral-50, #fafafa);
    z-index: 1;
  }

  /* Sticky: rimane a top:0 mentre la sezione scorre */
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

  /*
   * photo-wrap: stessa posizione della landing originale.
   * transform-origin: 50% 40% → il punto di scala è vicino al centro
   * visivo del viewport (la testa di Vlad), creando il rimpicciolimento
   * verso il centro della pagina.
   * Il transform inline sovrascrive 'transform' CSS con translateX(-50%) scale(…).
   */
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

  /*
   * Casco: top -14% → visore copre gli occhi.
   * Mask applicata via JS in onMount.
   */
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
  }

  /* Righe nome (gold/blue/gold) */
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
