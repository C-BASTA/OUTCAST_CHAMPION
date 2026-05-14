<script>
  import { Canvas } from '@threlte/core'
  import HelmetGlobalScene from './HelmetGlobalScene.svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'
</script>

<!-- Sempre montato: il modello è precaricato, nessun flash al primo render -->
<div
  class="helmet-global"
  style:padding-left={helmetStore.viewerPaddingLeft}
  style:visibility={helmetStore.visible ? 'visible' : 'hidden'}
>
  <Canvas renderMode="always">
    <HelmetGlobalScene />
  </Canvas>
</div>

<style>
  .helmet-global {
    position: fixed;
    inset: 0;
    /*
      z-index 3: sopra pixel-bg bio (z:2) e cards (z:1),
      sotto bio-texts (z:4) e athletes names (z:10),
      molto sotto navbar (z:300)
    */
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none;
    background: #030404;
  }
</style>
