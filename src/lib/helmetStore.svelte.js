// Stato condiviso per il Canvas 3D globale del casco.
// SectionBiography e SectionAthletes scrivono qui; HelmetGlobal legge.
export const helmetStore = $state({
  visible: false,
  // Parametri camera
  cameraY:  0.25,
  cameraZ:  8.5,
  lookAtY:  0.20,
  // Rotazione modello (applicata frame-by-frame in useTask)
  rotX: 0.25,
  rotY: Math.PI,
  rotZ: 0,
  // Posizione viewer: padding-left 0% = centrato, 45% = destra
  viewerPaddingLeft: '0%',
  // true = lerp fluido verso target (gallery), false = applica diretto (intro scroll-driven)
  smoothRotation: false,
})
