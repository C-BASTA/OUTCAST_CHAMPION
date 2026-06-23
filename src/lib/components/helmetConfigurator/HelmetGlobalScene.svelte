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
    // Sfondo trasparente: il CSS background (#030404) di HelmetGlobal mostra sotto,
    // e il pixel canvas (z-0) è visibile nelle aree senza helmet.
    scene.background = null
    renderer.setClearColor(0x000000, 0)
  })

  /** @type {import('three').PerspectiveCamera | null} */
  let camera   = $state(null)
  /** @type {import('three').Object3D | null} */
  let modelRef = $state(null)

  // Rotazione corrente interpolata (per il lerp in gallery mode)
  let curRotX = helmetStore.rotX
  let curRotY = helmetStore.rotY
  let curRotZ = helmetStore.rotZ

  const FLOAT_AMP_Y    = 0.04
  const FLOAT_AMP_ROTX = 0.018
  const FLOAT_AMP_ROTZ = 0.022
  const CAMERA_FOV = 24
  const TAU = Math.PI * 2
  let elapsed    = 0
  let floatGroup = $state(null)

  function shortestAngleDelta(from, to) {
    return ((to - from + Math.PI) % TAU + TAU) % TAU - Math.PI
  }

  useTask((delta) => {
    elapsed += delta

    if (camera) {
      camera.position.set(0, helmetStore.cameraY, helmetStore.cameraZ)
      camera.lookAt(helmetStore.lookAtX, helmetStore.lookAtY, 0)
    }
    if (modelRef) {
      if (helmetStore.smoothRotation) {
        // Lerp esponenziale frame-rate independent: velocità 7 = ~400ms per transizione
        const f = 1 - Math.exp(-3 * delta)
        curRotX += shortestAngleDelta(curRotX, helmetStore.rotX) * f
        curRotY += shortestAngleDelta(curRotY, helmetStore.rotY) * f
        curRotZ += shortestAngleDelta(curRotZ, helmetStore.rotZ) * f
      } else {
        // Scroll-driven: applica direttamente senza lag
        curRotX = helmetStore.rotX
        curRotY = helmetStore.rotY
        curRotZ = helmetStore.rotZ
      }
      modelRef.rotation.set(curRotX, curRotY, curRotZ)
    }
    if (floatGroup) {
      const viewportHeightAtModel = 2 * helmetStore.cameraZ * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))
      const exitOffsetY = (-helmetStore.exitY / 100) * viewportHeightAtModel

      floatGroup.position.y = exitOffsetY + Math.sin(elapsed * 0.7) * FLOAT_AMP_Y
      floatGroup.rotation.x = Math.sin(elapsed * 0.5 + 0.8) * FLOAT_AMP_ROTX
      floatGroup.rotation.z = Math.sin(elapsed * 0.6 + 1.5) * FLOAT_AMP_ROTZ
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

<T.PerspectiveCamera makeDefault fov={CAMERA_FOV} bind:ref={camera} />
<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" castShadow />
<T.AmbientLight intensity={0.5} />

<T.Group bind:ref={floatGroup}>
  {#if $gltf}
    <T is={$gltf.scene} scale={2} position={[0, 0.1, 0]} bind:ref={modelRef} />
  {/if}
</T.Group>
