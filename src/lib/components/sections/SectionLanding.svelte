<script>
  import { onMount } from 'svelte'

  /*
   * LIQUID BLOB MASK  — approccio inline SVG
   * ─────────────────────────────────────────────────────────────
   * Il filtro gooey (feGaussianBlur + feColorMatrix) e la <mask>
   * sono definiti UNA SOLA VOLTA nel DOM come SVG nascosto.
   * Il loop rAF aggiorna direttamente gli attributi cx/cy/r dei
   * tre cerchi → nessuna stringa SVG, nessun encodeURIComponent,
   * nessun problema di parsing del data-URL.
   * ─────────────────────────────────────────────────────────────
   */

  let wrap
  let helmetLayer

  // ── Main blob ──────────────────────────────────────────────
  let _cx = 0, _cy = 0, _r = 0
  let _vx = 0, _vy = 0, _vr = 0

  // ── Trail 1 ───────────────────────────────────────────────
  let _t1x = 0, _t1y = 0, _t1r = 0
  let _t1vx = 0, _t1vy = 0, _t1vr = 0

  // ── Trail 2 ───────────────────────────────────────────────
  let _t2x = 0, _t2y = 0, _t2r = 0
  let _t2vx = 0, _t2vy = 0, _t2vr = 0

  // ── Targets ────────────────────────────────────────────────
  let _tCx = 0, _tCy = 0, _tR = 0

  // ── Costanti spring ────────────────────────────────────────
  const RADIUS    = 320
  const STIFFNESS = 0.30
  const DAMPING   = 0.82

  onMount(() => {
    // Riferimenti ai cerchi SVG inline
    const c0 = document.getElementById('blob-c0')
    const c1 = document.getElementById('blob-c1')
    const c2 = document.getElementById('blob-c2')

    // Applica la maschera al layer casco
    helmetLayer.style.mask         = 'url(#blob-mask)'
    helmetLayer.style.webkitMask   = 'url(#blob-mask)'
    helmetLayer.style.maskMode     = 'luminance'

    // ── rAF loop ─────────────────────────────────────────────
    let raf
    const tick = () => {
      // Main blob — spring verso il cursore
      _vx += (_tCx - _cx) * STIFFNESS
      _vy += (_tCy - _cy) * STIFFNESS
      _vr += (_tR  - _r)  * 0.35       // radius spring più reattivo
      _vx *= DAMPING; _vy *= DAMPING; _vr *= 0.82
      _cx += _vx; _cy += _vy; _r  += _vr

      // Trail 1
      _t1vx += (_cx  - _t1x) * 0.22
      _t1vy += (_cy  - _t1y) * 0.22
      _t1vr += (Math.max(0, _r) * 0.72 - _t1r) * 0.18
      _t1vx *= 0.78; _t1vy *= 0.78; _t1vr *= 0.82
      _t1x += _t1vx; _t1y += _t1vy; _t1r += _t1vr

      // Trail 2
      _t2vx += (_t1x - _t2x) * 0.16
      _t2vy += (_t1y - _t2y) * 0.16
      _t2vr += (Math.max(0, _t1r) * 0.74 - _t2r) * 0.13
      _t2vx *= 0.75; _t2vy *= 0.75; _t2vr *= 0.80
      _t2x += _t2vx; _t2y += _t2vy; _t2r += _t2vr

      const r0 = Math.max(0, _r)
      const r1 = Math.max(0, _t1r)
      const r2 = Math.max(0, _t2r)

      // Aggiorna i cerchi SVG direttamente nel DOM
      c0.setAttribute('cx', _cx);  c0.setAttribute('cy', _cy);  c0.setAttribute('r', r0)
      c1.setAttribute('cx', _t1x); c1.setAttribute('cy', _t1y); c1.setAttribute('r', r1)
      c2.setAttribute('cx', _t2x); c2.setAttribute('cy', _t2y); c2.setAttribute('r', r2)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // ── Mouse handlers ────────────────────────────────────────
    const onMove = (e) => {
      const hr = helmetLayer.getBoundingClientRect()
      _tCx = e.clientX - hr.left
      _tCy = e.clientY - hr.top
      _tR  = RADIUS
    }
    const onLeave = () => { _tR = 0 }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  })
</script>

<!--
  SVG nascosto: definisce il filtro gooey e la <mask> inline nel DOM.
  maskUnits="userSpaceOnUse" → le coordinate cx/cy/r sono in pixel
  relativi al top-left dell'elemento mascherato (helmetLayer).
  Il rettangolo della mask copre un'area ampia per includere i blob
  anche a cavallo dei bordi dell'elemento.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"
  aria-hidden="true"
>
  <defs>
    <filter id="blob-gooey" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 26 -13"/>
    </filter>

    <!-- maskUnits=userSpaceOnUse → coordinate pixel rispetto all'elemento -->
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

<section id="athlete" class="landing">
  <h1 class="title">Outcast<br />Champion</h1>

  <div class="photo-wrap" bind:this={wrap}>

    <!-- Layer base: Vlad senza casco -->
    <img
      class="vlad"
      src="/images/vlad-face-hd-transparent.png"
      alt="Vladyslav Heraskevych"
      draggable="false"
    />

    <!--
      Layer hover: casco PNG con liquid blob mask.
      La mask viene applicata via JS in onMount.

      ⚙ Calibrazione:
        top   → più negativo = casco sale (visore si alza)
        width → più grande   = casco ingrandisce
    -->
    <img
      class="helmet"
      src="/images/vlad-hover.png"
      alt=""
      bind:this={helmetLayer}
      draggable="false"
    />
  </div>
</section>

<style>
  .landing {
    position: relative;
    width: 100%;
    height: 100vh;
    background: var(--hex-neutral-50, #fafafa);
    overflow: hidden;
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
  }

  /* Contenitore centrato, ancorato al basso.
     bottom negativo → le spalle escono sotto l'overflow:hidden */
  .photo-wrap {
    position: absolute;
    bottom: -8%;
    left: 50%;
    transform: translateX(-50%);
    width: min(105vh, 74vw);
    height: min(105vh, 74vw);
    cursor: crosshair;
  }

  /* Atleta — PNG 2000×2000 trasparente */
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
   * Casco — posizionato sopra la foto base.
   * La mask SVG lo rivela solo dove passa il cursore.
   *
   * ⚙ Calibrazione top:
   *   -14% → visore ~allineato agli occhi/naso
   *   Se il casco appare troppo in alto → aumenta (es. -10%)
   *   Se troppo in basso → diminuisci (es. -18%)
   */
  .helmet {
    position: absolute;
    top: -14%;
    left: 50%;
    transform: translateX(-50%);
    width: 118%;
    height: auto;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }
</style>
