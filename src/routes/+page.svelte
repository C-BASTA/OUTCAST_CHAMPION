<script>
  import { fade } from 'svelte/transition'
  import Intro   from '$lib/components/Intro.svelte'
  import Gallery from '$lib/components/Gallery.svelte'
 
  let phase = $state('intro')
</script>
 
{#if phase === 'intro'}
  <div class="layer" out:fade={{ duration: 900 }}>
    <Intro onDone={() => (phase = 'gallery')} />
  </div>
{:else}
  <div class="layer" in:fade={{ duration: 800, delay: 100 }} out:fade={{ duration: 600 }}>
    <Gallery onBack={() => (phase = 'intro')} />
  </div>
{/if}
 
<style>
  .layer { position: fixed; inset: 0; }
</style>