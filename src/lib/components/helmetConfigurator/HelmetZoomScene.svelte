<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

  let { cameraZ = 10, zoomP = 0 } = $props()

  const { renderer, scene } = useThrelte()

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

  const easeF = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2
  let floatGroup = $state(null)
  let elapsed = 0

  useTask((delta) => {
    elapsed += delta

    if (!camera) return
    camera.position.set(0, 0.25, cameraZ)
    camera.lookAt(0, 0.20, 0)
    // Aspect ratio from window directly: immune to CSS transforms on the canvas container
    const a = window.innerWidth / window.innerHeight
    if (Math.abs(camera.aspect - a) > 0.0001) {
      camera.aspect = a
      camera.updateProjectionMatrix()
    }

    if (floatGroup) {
      const w = easeF(Math.max(0, Math.min(1, 1 - zoomP / 0.18)))
      floatGroup.position.y = Math.sin(elapsed * 0.7) * 0.04 * w
      floatGroup.rotation.x = Math.sin(elapsed * 0.5 + 0.8) * 0.018 * w
      floatGroup.rotation.z = Math.sin(elapsed * 0.6 + 1.5) * 0.022 * w
    }
  })

  const gltf = useGltf('/models/CascoVlad13.glb', { dracoLoader: useDraco('/draco/') })

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

<T.Group bind:ref={floatGroup}>
  {#if $gltf}
    <T is={$gltf.scene} scale={1.5} position={[0, 0.1, 0]} rotation={[0.25, rotY + Math.PI, 0]} />
  {/if}
</T.Group>