<script>
  import { onMount } from 'svelte'

  let canvas

  onMount(() => {
    const ctx = canvas.getContext('2d')
    let rafId

    function resize() {
      // Usiamo dimensioni ridotte e scaliamo via CSS per performance
      canvas.width  = Math.ceil(window.innerWidth  / 2)
      canvas.height = Math.ceil(window.innerHeight / 2)
    }

    function drawGrain() {
      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i]     = value  // R
        data[i + 1] = value  // G
        data[i + 2] = value  // B
        data[i + 3] = 255    // A
      }

      ctx.putImageData(imageData, 0, 0)
    }

    function loop() {
      drawGrain()
      rafId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.04;
    mix-blend-mode: screen;
  }
</style>