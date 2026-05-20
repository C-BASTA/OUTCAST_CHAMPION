<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

  let { cameraZ = 8.5, zoomP = 0 } = $props()

  const { renderer, scene, size } = useThrelte()

  $effect(() => {
    scene.background = null
    renderer.setClearColor(0x000000, 0)
  })

  $effect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
  })

  let camera = $state(null)

  // Calcolo matematico pulito dell'aspetto: se size cambia, si aggiorna all'istante
  let aspect = $derived($size ? $size.width / $size.height : 1)

  // Ogni volta che l'aspect calcolato subisce variazioni, notifichiamo la matrice di Three.js
  $effect(() => {
    if (camera) {
      camera.aspect = aspect
      camera.updateProjectionMatrix()
    }
  })

  const SIDE = 0.35
  const clampZ = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerpZ  = (a, b, t) => a + (b - a) * t
  const easeZ  = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  let rotY = $derived.by(() => {
    if (zoomP <= 0.20) {
      return lerpZ(Math.PI + SIDE, Math.PI, easeZ(clampZ(zoomP / 0.20, 0, 1)))
    }
    if (zoomP <= 0.86) {
      return Math.PI
    }
    if (zoomP <= 0.98) {
      return lerpZ(Math.PI, Math.PI - SIDE, easeZ(clampZ((zoomP - 0.86) / 0.12, 0, 1)))
    }
    return Math.PI - SIDE
  })

  useTask(() => {
    if (!camera) return
    camera.position.set(0, 0.25, cameraZ)
    camera.lookAt(0, 0.20, 0)
  })

  const gltf = useGltf('/models/casco_con_facce.glb', { dracoLoader: useDraco('/draco/') })

  $effect(() => {
    if (!$gltf) return
    $gltf.scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      if (!(node.material instanceof THREE.MeshStandardMaterial)) return
      node.material.color.set('#ffffff')
      node.material.roughness = 0.4
      node.material.metalness = 0.8
    })
  })
</script>

<!-- Forziamo il montaggio solo quando l'aspect ratio è numericamente valido -->
{#if $size && !isNaN(aspect)}
  <T.PerspectiveCamera 
    makeDefault 
    fov={24} 
    {aspect}
    bind:ref={camera} 
  />
{/if}

<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" castShadow />
<T.AmbientLight intensity={0.5} />

{#if $gltf}
  <T is={$gltf.scene} scale={2} position={[0, 0.1, 0]} rotation={[0.25, rotY, 0]} />
{/if}