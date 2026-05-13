<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

  let { cameraZ = 8.5, cameraTargetY = 0.15 } = $props()

  const { renderer, scene } = useThrelte()

  $effect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
  })

  let camera = $state(null)

  // Update camera position/orientation every frame based on scroll-driven props
  useTask(() => {
    if (!camera) return
    camera.position.set(0, cameraTargetY + 0.05, cameraZ)
    camera.lookAt(0, cameraTargetY, 0)
  })

  const gltf = useGltf('/models/casco_con_facce.glb', { dracoLoader: useDraco('/draco/') })

  $effect(() => {
    if (!$gltf) return
    $gltf.scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      if (!(node.material instanceof THREE.MeshStandardMaterial)) return
      // Clone to avoid sharing state with the Gallery canvas
      node.material = node.material.clone()
      node.material.color.set('#ffffff')
      node.material.roughness = 0.4
      node.material.metalness = 0.8
    })
  })
</script>

<!-- Camera: position updated every frame via useTask -->
<T.PerspectiveCamera makeDefault fov={24} bind:ref={camera} position={[0, 0.2, 8.5]} />

<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" castShadow />
<T.AmbientLight intensity={0.5} />

<!-- Front view of helmet: y = Math.PI rotates the model to face the camera -->
{#if $gltf}
  <T is={$gltf.scene} scale={2} position={[0, 0.1, 0]} rotation={[0, Math.PI, 0]} />
{/if}
