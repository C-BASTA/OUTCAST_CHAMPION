<!--
  +layout.svelte — layout principale dell'applicazione

  In SvelteKit ogni file +layout.svelte avvolge le pagine figlie.
  Qui importiamo i CSS globali e, opzionalmente, Threlte Studio.

  ──────────────────────────────────────────────────────
  THRELTE STUDIO
  Strumento di debug visuale per la scena 3D. Consente di:
    • ispezionare la gerarchia degli oggetti 3D
    • modificare transform, materiali e luci in tempo reale
    • monitorare le performance del renderer

  NOTA: Studio v0.4 deve essere usato all'interno del componente <Canvas>
  (vedi +page.svelte). Per attivarlo, decommentare il blocco in +page.svelte.
  ──────────────────────────────────────────────────────
-->
<script>
  import '../app.css'
  import BackgroundGrid from '$lib/components/BackgroundGrid.svelte';

  let { children } = $props()
</script>

<!-- Il componente dello sfondo -->
<BackgroundGrid />

{@render children()}