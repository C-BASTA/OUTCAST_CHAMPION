<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
  import { helmetStore } from '$lib/helmetStore.svelte.js'

  const { renderer, scene } = useThrelte()

  $effect(() => {
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture
    pmrem.dispose()
    // Sfondo gestito dalla div wrapper (trasparente per lasciare passare il colore CSS)
    scene.background = null
  })

  /** @type {import('three').PerspectiveCamera | null} */
  let camera   = $state(null)
  /** @type {import('three').Object3D | null} */
  let modelRef = $state(null)

  // Rotazione corrente interpolata (per il lerp in gallery mode)
  let curRotX = helmetStore.rotX
  let curRotY = helmetStore.rotY
  let curRotZ = helmetStore.rotZ

  useTask((delta) => {
    if (camera) {
      camera.position.set(0, helmetStore.cameraY, helmetStore.cameraZ)
      camera.lookAt(0, helmetStore.lookAtY, 0)
    }
    if (modelRef) {
      if (helmetStore.smoothRotation) {
        // Lerp esponenziale frame-rate independent: velocità 7 = ~400ms per transizione
        const f = 1 - Math.exp(-7 * delta)
        curRotX += (helmetStore.rotX - curRotX) * f
        curRotY += (helmetStore.rotY - curRotY) * f
        curRotZ += (helmetStore.rotZ - curRotZ) * f
      } else {
        // Scroll-driven: applica direttamente senza lag
        curRotX = helmetStore.rotX
        curRotY = helmetStore.rotY
        curRotZ = helmetStore.rotZ
      }
      modelRef.rotation.set(curRotX, curRotY, curRotZ)
    }
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

{#if $gltf}
  <T is={$gltf.scene} scale={2} position={[0, 0.1, 0]} bind:ref={modelRef} />
{/if}
