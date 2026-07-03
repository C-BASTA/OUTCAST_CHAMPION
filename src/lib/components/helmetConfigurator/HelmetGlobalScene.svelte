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
    scene.background = null
    renderer.setClearColor(0x000000, 0)
  })

  /** @type {import('three').PerspectiveCamera | null} */
  let camera   = $state(null)
  /** @type {import('three').Object3D | null} */
  let modelRef = $state(null)

  let curRotX = helmetStore.rotX
  let curRotY = helmetStore.rotY
  let curRotZ = helmetStore.rotZ
  let curFloatWeight = 0

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

    const parked =
      !helmetStore.visible &&
      helmetStore.entryTransformY >= 100 &&
      !helmetStore.starsVisible
    if (floatGroup) floatGroup.visible = !parked

    if (camera) {
      camera.position.set(0, helmetStore.cameraY, helmetStore.cameraZ)
      camera.lookAt(helmetStore.lookAtX, helmetStore.lookAtY, 0)
    }
    if (modelRef) {
      if (helmetStore.smoothRotation) {
        const f = 1 - Math.exp(-3 * delta)
        curRotX += shortestAngleDelta(curRotX, helmetStore.rotX) * f
        curRotY += shortestAngleDelta(curRotY, helmetStore.rotY) * f
        curRotZ += shortestAngleDelta(curRotZ, helmetStore.rotZ) * f
      } else {
        curRotX = helmetStore.rotX
        curRotY = helmetStore.rotY
        curRotZ = helmetStore.rotZ
      }
      modelRef.scale.setScalar(1.25)
      modelRef.position.set(0, 0.1, 0)
      modelRef.rotation.set(curRotX, curRotY + Math.PI, curRotZ)
    }
    if (floatGroup) {
      const viewportHeightAtModel = 2 * helmetStore.cameraZ * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))
      const exitOffsetY = (-helmetStore.exitY / 100) * viewportHeightAtModel

      curFloatWeight += (helmetStore.floatWeight - curFloatWeight) * Math.min(1, delta * 1.2)
      floatGroup.position.y = exitOffsetY + Math.sin(elapsed * 0.7) * FLOAT_AMP_Y * curFloatWeight
      floatGroup.rotation.x = Math.sin(elapsed * 0.5 + 0.8) * FLOAT_AMP_ROTX * curFloatWeight
      floatGroup.rotation.z = Math.sin(elapsed * 0.6 + 1.5) * FLOAT_AMP_ROTZ * curFloatWeight
    }
  })

  const gltf = useGltf('/models/casco_0307.gltf', { dracoLoader: useDraco('/draco/') })

  $effect(() => {
    if (!$gltf) return
    $gltf.scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const mat = node.material
      console.log('Material name:', mat.name)
      if (!mat) return
      // if (mat.name === 'Material') {
      //   mat.roughness = 0.02
      //   mat.needsUpdate = true
      // }
      // // Material.001 = bordo visiera: roughness=1 nel GLB lo rende bianco piatto
      // if (mat.name === 'Material.001') {
      //   mat.roughness = 0.08
      //   mat.needsUpdate = true
      // }
      // // Material.017 = visiera
      // if (mat.name === 'Material.017') {
      //   mat.roughness = 0.08
      //   mat.needsUpdate = true
      // }
    })
  })
</script>

<T.PerspectiveCamera makeDefault fov={CAMERA_FOV} bind:ref={camera} />
<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
<T.AmbientLight intensity={0.5} />

<T.Group bind:ref={floatGroup}>
  {#if $gltf}
    <T is={$gltf.scene} bind:ref={modelRef} />
  {/if}
</T.Group>
