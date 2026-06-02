<script>
  import { onMount } from 'svelte'
  import { Canvas } from '@threlte/core'
  import HelmetGlobalScene from './HelmetGlobalScene.svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  let pixelCanvas
  let ctx
  let w, h
  let dpr = 1
  let animId
  let stars = []

  const MAX_STARS = 15
  const STAR_SIZE = 18

  function spawnStar() {
    const greys = ['245,245,245', '210,210,210', '175,175,175']
    const rgb    = greys[Math.floor(Math.random() * greys.length)]
    const phase  = Math.random() * Math.PI * 2
    const period = 280 + Math.random() * 200
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      rgb, phase, period,
      age: 0,
      maxAge: period * (2 + Math.random() * 2),
    })
  }

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, w, h)
      while (stars.length < MAX_STARS) spawnStar()

      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i]
        s.age++
        const alpha = Math.max(0, Math.sin(s.phase + (s.age / s.period) * Math.PI * 2))
        if (alpha > 0.01) {
          ctx.globalAlpha = alpha * 0.65
          ctx.fillStyle   = `rgb(${s.rgb})`
          ctx.fillRect(s.x, s.y, STAR_SIZE, STAR_SIZE)
        }
        if (s.age >= s.maxAge) stars.splice(i, 1)
      }
      ctx.globalAlpha = 1
    }
    animId = requestAnimationFrame(draw)
  }

  function init() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = window.innerWidth
    h = window.innerHeight
    if (pixelCanvas) {
      pixelCanvas.width  = Math.round(w * dpr)
      pixelCanvas.height = Math.round(h * dpr)
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  onMount(() => {
    ctx = pixelCanvas.getContext('2d')
    init()
    draw()
    window.addEventListener('resize', init)
    return () => {
      window.removeEventListener('resize', init)
      cancelAnimationFrame(animId)
    }
  })
</script>

<div
  class="helmet-global"
  style:padding-left={helmetStore.viewerPaddingLeft}
  style:visibility={helmetStore.visible ? 'visible' : 'hidden'}
>
  <!-- Pixel grigi: sempre fissi, non traslati -->
  <canvas bind:this={pixelCanvas} class="pixel-bg"></canvas>

  <!-- Canvas 3D: riceve la traslazione di uscita -->
  <div
    class="scene-wrap"
    style:transform="translateY({helmetStore.exitY}vh)"
  >
    <Canvas renderMode="always">
      <HelmetGlobalScene />
    </Canvas>
  </div>
</div>

<style>
  .helmet-global {
    position: fixed;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none;
    background: #030404;
  }

  .pixel-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .scene-wrap {
    position: relative;
    z-index: 1;
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
