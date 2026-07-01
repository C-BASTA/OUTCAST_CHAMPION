<script>
  import { Canvas } from '@threlte/core'
  import HelmetGlobalScene from '$lib/components/helmetConfigurator/HelmetGlobalScene.svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  helmetStore.cameraZ = 5
  helmetStore.cameraY = 0.15
  helmetStore.lookAtY = 0.0
  helmetStore.entryTransformY = 0

  let rotY = $state(0)
  $effect(() => { helmetStore.rotY = rotY })
</script>

<div style="position:fixed;inset:0;background:#111;">
  <Canvas renderMode="always">
    <HelmetGlobalScene />
  </Canvas>
</div>

<input type="range" min="0" max="6.28" step="0.01" bind:value={rotY}
  style="position:fixed;bottom:20px;left:20px;width:300px;z-index:10;" />
