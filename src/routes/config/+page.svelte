<!--
  +page.svelte — pagina principale

  Struttura:
    <Canvas>         — crea il renderer WebGL di Three.js
      <Scene />      — tutti gli oggetti 3D (camera, luci, modello)
    <Configurator /> — pannello UI sovrapposto (position: fixed)
    <div.brand>      — branding in alto a sinistra

  ──────────────────────────────────────────────────────
  THRELTE STUDIO (debug)
  Per abilitarlo, decommenta le righe marcate con [STUDIO]:
    1. Importa Studio e dev (già pronte sotto)
    2. Sostituisci <Canvas>...</Canvas> con <Studio><Canvas>...</Canvas></Studio>

  Studio aggiunge un pannello di debug sovrapposto alla scena con:
    • gerarchia degli oggetti 3D
    • ispezione e modifica live di transform e materiali
    • performance monitor
  ──────────────────────────────────────────────────────
-->
<script>
  import { Canvas } from '@threlte/core'
  // import { dev } from '$app/environment'
  import { Studio } from '@threlte/studio'
  import Scene from '$lib/components/helmetConfigurator/Scene.svelte'
  import Configurator from '$lib/components/helmetConfigurator/Configurator.svelte'
  const dev = true 
</script>

<div class="viewport">

  <!--
    Canvas: inizializza Three.js WebGLRenderer.
    Tutto ciò che è figlio di Canvas è codice Threlte (scena 3D),
    non HTML normale.

    STUDIO: deve essere figlio di Canvas (non il contrario!).
    Le sue estensioni usano useThrelte() che richiede il contesto Canvas.
    La UI HTML di Studio (toolbar, pannelli) usa position:fixed e appare
    sopra la scena anche se il componente è dentro il div del Canvas.
  -->
    
  {#if dev}
    <!--
      renderMode="always": ri-renderizza ogni frame.
      Di default Threlte usa "on-demand" (solo quando invalidato),
      ma Studio ha bisogno di always per mostrare i suoi overlay.
    -->
    <Canvas renderMode="always">
      <Studio>
        <Scene />
      </Studio>
    </Canvas>
  {:else}
    <!--
      renderMode="always": garantisce che le modifiche ai materiali
      (colore, roughness, metalness) siano visibili immediatamente,
      senza dover spostare la camera per forzare un re-render.
    -->
    <Canvas renderMode="always">
      <Scene />
    </Canvas>
  {/if}


  <!-- UI sovrapposta alla scena 3D -->
  <Configurator />

  <!-- Branding -->
  <div class="brand">
    <span class="brand-title">Web Design DDC · 3D Configurator</span>
    <span class="brand-sub">Threlte · SvelteKit · Three.js</span>
  </div>

</div>

<style>
  .viewport {
    position: fixed;
    inset: 0;
  }

  /* ── Branding ────────────────────────────────────────────── */
  .brand {
    position: absolute;
    top: 2rem;
    left: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    pointer-events: none;
  }

  .brand-title {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mc-white);
  }

  .brand-sub {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: var(--mc-muted);
  }
</style>
