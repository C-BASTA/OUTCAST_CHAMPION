/*
  config.svelte.js — stato globale reattivo

  In Svelte 5, i file .svelte.js supportano le runes ($state, $derived, ecc.).
  Esportando un oggetto $state(), tutti i componenti che importano
  questo file condividono lo stesso stato reattivo.
*/

// Impostazioni statiche per ciascuna atmosfera (lookup table, non reattivo)
export const atmosphereSettings = {
  studio:   { bg: '#16161e', ambientIntensity: 0.4, lightColor: '#ffffff', lightIntensity: 2.0 },
  tramonto: { bg: '#1f0d06', ambientIntensity: 0.3, lightColor: '#ff6030', lightIntensity: 3.0 },
  notte:    { bg: '#04040e', ambientIntensity: 0.1, lightColor: '#6688ff', lightIntensity: 1.5 },
  artico:   { bg: '#b8cfde', ambientIntensity: 0.9, lightColor: '#daeeff', lightIntensity: 1.5 },
}

// Stato globale: ogni componente che importa `config` legge e scrive qui
export const config = $state({
  color:      '#ffffff',   // tinta sul materiale (bianco = texture originale)
  roughness:  0.4,         // 0 = specchio, 1 = completamente opaco
  metalness:  0.8,         // 0 = plastica, 1 = metallo
  atmosphere: 'studio',
})
