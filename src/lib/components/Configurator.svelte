<!--
  Configurator.svelte — pannello UI flottante

  Legge e scrive direttamente su `config` (stato globale).
  Scene.svelte e Model.svelte reagiscono automaticamente ai cambiamenti.
-->
<script>
  import { config } from '$lib/config.svelte.js'
  import Slider from './Slider.svelte'

  // Palette di colori preset
  const colorPresets = [
    { name: 'Bianco',    value: '#ffffff' },
    { name: 'Rame',      value: '#c47822' },
    { name: 'Blu',       value: '#002b7f' },
    { name: 'Argento',   value: '#a8a9ad' },
    { name: 'Oro',       value: '#d4af37' },
    { name: 'Antracite', value: '#363945' },
  ]

  // Atmosfere disponibili (le impostazioni dettagliate sono in config.svelte.js)
  const atmospheres = [
    { id: 'studio',   label: 'Studio'   },
    { id: 'tramonto', label: 'Tramonto' },
    { id: 'notte',    label: 'Notte'    },
    { id: 'artico',   label: 'Artico'   },
  ]
</script>

<aside class="card">

  <header class="card-header">
    <span class="eyebrow">Threlte · SvelteKit</span>
    <p class="model-name">DamagedHelmet</p>
  </header>

  <!-- ── COLORE ─────────────────────────────────── -->
  <section>
    <p class="section-label">Colore</p>
    <div class="swatches">
      {#each colorPresets as preset}
        <!--
          class:active aggiunge la classe CSS "active" quando la condizione è vera
          onclick: aggiorna config.color → Model.svelte reagisce tramite $effect
        -->
        <button
          class="swatch"
          class:active={config.color === preset.value}
          style:background={preset.value}
          title={preset.name}
          onclick={() => (config.color = preset.value)}
        ></button>
      {/each}

      <!-- Colore personalizzato: nasconde l'input nativo sotto un bottone custom -->
      <label class="swatch swatch-custom" title="Personalizza">
        <span>+</span>
        <input type="color" bind:value={config.color} />
      </label>
    </div>
  </section>

  <!-- ── MATERIALE ──────────────────────────────── -->
  <section>
    <p class="section-label">Materiale</p>
    <!--
      bind:value crea un two-way binding con la prop $bindable di Slider
      Ogni modifica allo slider aggiorna config.roughness/metalness
    -->
    <Slider label="Roughness" bind:value={config.roughness} min={0} max={1} step={0.01} />
    <Slider label="Metalness" bind:value={config.metalness} min={0} max={1} step={0.01} />
  </section>

  <!-- ── ATMOSFERA ──────────────────────────────── -->
  <section>
    <p class="section-label">Atmosfera</p>
    <div class="atm-grid">
      {#each atmospheres as atm}
        <button
          class="atm-btn"
          class:active={config.atmosphere === atm.id}
          onclick={() => (config.atmosphere = atm.id)}
        >
          {atm.label}
        </button>
      {/each}
    </div>
  </section>

  <footer class="hint">Trascina · Scroll per zoom</footer>

</aside>

<style>
  /* ── Card ───────────────────────────────────────────────── */
  .card {
    position: fixed;
    right: 2rem;
    top: 50%;
    translate: 0 -50%;
    width: 268px;

    background: rgba(10, 10, 18, 0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);

    border: 1px solid var(--mc-border);
    border-top: 2px solid var(--mc-copper); /* linea rame caratteristica */
    border-radius: 3px;

    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  /* ── Header ─────────────────────────────────────────────── */
  .card-header { display: flex; flex-direction: column; gap: 0.3rem; }

  .eyebrow {
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--mc-copper);
    font-weight: 500;
  }

  .model-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--mc-white);
    letter-spacing: 0.02em;
  }

  /* ── Sezioni ────────────────────────────────────────────── */
  section { display: flex; flex-direction: column; gap: 0.75rem; }

  .section-label {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--mc-muted);
  }

  /* ── Swatches ───────────────────────────────────────────── */
  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .swatch {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;
    flex-shrink: 0;
    outline: none;
  }

  .swatch:hover   { transform: scale(1.15); }
  .swatch.active  { border-color: var(--mc-copper); }

  /* Swatch con color picker nascosto */
  .swatch-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--mc-surface);
    border-color: var(--mc-border);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: var(--mc-muted);
    font-size: 1rem;
    line-height: 1;
  }

  .swatch-custom input[type="color"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border: none;
    padding: 0;
  }

  /* ── Atmosfera ──────────────────────────────────────────── */
  .atm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
  }

  .atm-btn {
    padding: 0.45rem 0;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mc-muted);
    background: var(--mc-surface);
    border: 1px solid var(--mc-border);
    border-radius: 2px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }

  .atm-btn:hover {
    color: var(--mc-white);
    border-color: rgba(196, 120, 34, 0.4);
  }

  .atm-btn.active {
    color: var(--mc-copper);
    border-color: var(--mc-copper);
    background: rgba(196, 120, 34, 0.08);
  }

  /* ── Hint ───────────────────────────────────────────────── */
  .hint {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    color: var(--mc-muted);
    text-align: center;
    text-transform: uppercase;
    padding-top: 0.25rem;
    border-top: 1px solid var(--mc-border);
  }
</style>
