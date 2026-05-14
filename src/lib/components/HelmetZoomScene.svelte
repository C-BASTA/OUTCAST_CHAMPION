<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

  let { cameraZ = 8.5, bgColor = '#fafafa' } = $props()

  const { renderer, scene } = useThrelte()

  // Background colour driven by parent's scroll progress
  // 'transparent' → scene senza sfondo (pixel canvas visibile sotto via CSS)
  $effect(() => {
    if (!bgColor || bgColor === 'transparent') {
      scene.background = null
    } else {
      scene.background = new THREE.Color(bgColor)
    }
  })

  // Room environment for metallic reflections on the visor
  $effect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
  })

  let camera = $state(null)

  // Update camera position every frame (scroll-driven)
  // cameraZ interpolates between 8.5 (full helmet) and 1.8 (visor fills screen)
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

<T.PerspectiveCamera makeDefault fov={24} bind:ref={camera} />

<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" castShadow />
<T.AmbientLight intensity={0.5} />

<!--
  rotation y=0: visiera frontale rivolta verso la camera (+Z).
  Le Gallery entries usano y=1.0…10.5 per le facce sui lati/retro,
  quindi y=0 è la faccia liscia davanti (visiera verso il viewer).
-->
{#if $gltf}
  <T is={$gltf.scene} scale={2} position={[0, 0.1, 0]} rotation={[0.25, Math.PI, 0]} />
{/if}
