<!--
  Scene.svelte — contenuto 3D: camera, luci, ambiente, modello

  Tutto ciò che è figlio di <Canvas> (in +page.svelte) è una scena Three.js.
  <T.XYZ> è la sintassi Threlte per creare oggetti Three.js:
    <T.PerspectiveCamera> → new THREE.PerspectiveCamera(...)
    <T.DirectionalLight>  → new THREE.DirectionalLight(...)
  I props corrispondono alle proprietà Three.js dell'oggetto.
-->
<script>
  import { T, useThrelte } from '@threlte/core'
  import { OrbitControls } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
  import { config, atmosphereSettings } from '$lib/config.svelte.js'
  import Model from './Model.svelte'

  // Prop per la rotazione del casco
  const { 
    rotation = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    orbitControlVal = true
  } = $props();

  // useThrelte() espone il renderer WebGL e la scena Three.js
  const { renderer, scene } = useThrelte()

  // Imposta RoomEnvironment come mappa di riflessione/illuminazione
  $effect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
  })

  // Aggiorna il colore dello sfondo al cambio di atmosfera
  // Togliamo lo sfondo
  /*$effect(() => {
    scene.background = new THREE.Color(atmosphereSettings[config.atmosphere].bg)
  })*/

  // Valori derivati dall'atmosfera selezionata
  let lightColor     = $derived(atmosphereSettings[config.atmosphere].lightColor)
  let lightIntensity = $derived(atmosphereSettings[config.atmosphere].lightIntensity)
  let ambientIntensity = $derived(atmosphereSettings[config.atmosphere].ambientIntensity)
</script>

<!--
  makeDefault: rende questa la camera attiva per il Canvas
  I figli di <T.PerspectiveCamera> ricevono la camera come contesto
-->
<T.PerspectiveCamera makeDefault position={[ 0, -0.01, 6.0 ]} fov={24} scale={[ 1, 1, 1 ]} rotation={[ -2.5662, -0.9536, -2.6535 ]} visible={false}>
  <!--
    OrbitControls: ruota con il mouse, zoom con la rotella
    enableDamping: inerzia fluida (aggiornato ogni frame automaticamente da Threlte)
  -->
  <OrbitControls
    dampingFactor={0.05}
    minDistance={6}
    maxDistance={10}
    maxPolarAngle={Math.PI / 1.8}
    enableRotate={orbitControlVal}
    enableZoom={orbitControlVal}
    enablePan={orbitControlVal}
    enableDamping={orbitControlVal}
  />
</T.PerspectiveCamera>

<!-- Luce principale: simula il sole o una fonte luminosa direzionale -->
<T.DirectionalLight
  position={[ 10, 10, 5 ]}
  intensity={lightIntensity}
  color={lightColor}
  castShadow
/>

<!-- Luce ambientale: illumina uniformemente tutta la scena -->
<T.AmbientLight intensity={ambientIntensity} position={[ -0.1, 0, 0 ]} />

<!-- Il modello 3D ruotato secondo la prop -->
<T.Group rotation={[rotation.x, rotation.y, rotation.z]} position={[position.x, position.y, position.z]}>
  <Model />
</T.Group>