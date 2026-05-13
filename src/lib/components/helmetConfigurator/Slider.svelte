<!--
  Slider.svelte — range input riutilizzabile

  Props:
    label   — testo descrittivo
    value   — valore corrente (con $bindable per il two-way binding)
    min/max — intervallo
    step    — incremento minimo
-->
<script>
  let { label, value = $bindable(), min, max, step } = $props()

  // Percentuale di riempimento per la traccia colorata
  let fill = $derived(((value - min) / (max - min)) * 100)
</script>

<div class="slider">
  <div class="header">
    <span class="label">{label}</span>
    <span class="val">{value.toFixed(2)}</span>
  </div>
  <input
    type="range"
    {min} {max} {step}
    bind:value
    style="--fill: {fill}%"
  />
</div>

<style>
  .slider { display: flex; flex-direction: column; gap: 0.5rem; }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .label {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mc-muted);
  }

  .val {
    font-size: 0.75rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--mc-copper);
  }

  /* ── Range input ────────────────────────────────────────── */
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 2px;
    border-radius: 1px;
    outline: none;
    cursor: pointer;
    /* Traccia bipartita: rame fino al valore, grigio dopo */
    background: linear-gradient(
      to right,
      var(--mc-copper) 0%,
      var(--mc-copper) var(--fill),
      var(--mc-border) var(--fill),
      var(--mc-border) 100%
    );
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--mc-copper);
    cursor: pointer;
    border: 2px solid var(--mc-bg);
    transition: transform 0.15s;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.25);
  }

  input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--mc-copper);
    cursor: pointer;
    border: 2px solid var(--mc-bg);
  }
</style>
