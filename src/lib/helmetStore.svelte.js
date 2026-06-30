// Stato condiviso per il Canvas 3D globale del casco.
// SectionBiography e SectionAthletes scrivono qui; HelmetGlobal legge.
export const helmetStore = $state({
  visible: false,
  // Parametri camera
  cameraY:  0.25,
  cameraZ:  8.5,
  lookAtX:  0,
  lookAtY:  0.20,
  // Rotazione modello (applicata frame-by-frame in useTask)
  rotX: 0.25,
  rotY: Math.PI,
  rotZ: 0,
  // Posizione viewer: padding-left 0% = centrato, 45% = destra
  viewerPaddingLeft: '0%',
  // true = lerp fluido verso target (gallery), false = applica diretto (intro scroll-driven)
  smoothRotation: false,
  // Transizione di uscita: 0 = in posizione, -100 = completamente fuori sopra
  exitY: 0,
  // true = blocca aggiornamenti camera (es. overlay atleta aperto)
  frozen: false,
  // Animazione di entrata: translateY in vh (100 = fuori schermo sotto, 0 = in posizione)
  entryTransformY: 100,
  // Peso animazione fluttuazione: 0 = ferma, 1 = piena (usato durante SectionHelmetVisor)
  floatWeight: 0,
  // true = disegna le stelle grigie anche quando visible è false
  // (es. durante la dissolvenza a pixel di SectionHelmetVisor)
  starsVisible: false,
})
