<script>
  import { T, useThrelte, useTask } from '@threlte/core'
  import { useGltf, useDraco, useTexture } from '@threlte/extras'
  import * as THREE from 'three'
  import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
  import { helmetStore } from '$lib/helmetStore.svelte.js'
  import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

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
  let curFloatWeight = 0  // lerp interno: evita salti bruschi quando floatWeight cambia

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

    // Il canvas del casco è fisso e sempre montato: quando il casco è
    // completamente fuori schermo nascondiamo l'intero gruppo così three.js
    // non disegna la calotta + i 22 decal ogni frame (grosso risparmio GPU
    // fuori dalla sezione casco). Il render loop continua, nessun rischio di
    // "congelamento": appena rientra torna visibile.
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
      // Scala e posizione gestite qui (non via prop su <T>) così non vanno in
      // conflitto con l'azzeramento temporaneo della matrice usato per
      // costruire i decal nello spazio locale del modello.
      modelRef.scale.setScalar(1.25)
      modelRef.position.set(0, 0.1, 0)
      modelRef.rotation.set(curRotX, curRotY + Math.PI, curRotZ)
    }
    if (floatGroup) {
      const viewportHeightAtModel = 2 * helmetStore.cameraZ * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))
      const exitOffsetY = (-helmetStore.exitY / 100) * viewportHeightAtModel

      // Lerp graduale del peso fluttuazione: evita il salto brusco tra visor e athletes
      curFloatWeight += (helmetStore.floatWeight - curFloatWeight) * Math.min(1, delta * 1.2)
      floatGroup.position.y = exitOffsetY + Math.sin(elapsed * 0.7) * FLOAT_AMP_Y * curFloatWeight
      floatGroup.rotation.x = Math.sin(elapsed * 0.5 + 0.8) * FLOAT_AMP_ROTX * curFloatWeight
      floatGroup.rotation.z = Math.sin(elapsed * 0.6 + 1.5) * FLOAT_AMP_ROTZ * curFloatWeight
    }
  })

  const gltf = useGltf('/models/casco_senza_facce_compressed.glb', { dracoLoader: useDraco('/draco/') })

  // Posizionamento delle foto come sul casco reale di Heraskevych: gruppo
  // frontale (attorno/sopra il visore, che guarda verso -z) e gruppo
  // posteriore (sulla calotta, +z). `dir` è la direzione dal centro verso
  // l'esterno; il punto reale sulla superficie viene trovato con un ray.
  const BIG = new THREE.Vector3(0.28, 0.28, 0.4)
  const MED = new THREE.Vector3(0.22, 0.22, 0.4)

  // Vista frontale (camera dal lato -z): +x appare a SINISTRA nell'immagine.
  // Vista posteriore (camera dal lato +z): +x appare a DESTRA (specchiato).
  // Le direzioni seguono la disposizione reale nelle due foto di riferimento.
  const decalsData = [
    // ── Fronte: ventaglio sopra il visore come nel diagramma BBC.
    // Fila alta 1-2-3, fila media 4-5-6-7, 8 appena sopra il visore, 9-10 mento.
    // (+x = sinistra nell'immagine frontale). Il centro del visore resta libero. ──
    { url: 'ivan',       dir: new THREE.Vector3(0.6, 0.72, -0.5),   size: MED }, // 1  alto-sx
    { url: 'daria',      dir: new THREE.Vector3(0, 0.92, -0.35),    size: MED }, // 2  alto-centro
    { url: 'oleksiy k',  dir: new THREE.Vector3(-0.6, 0.72, -0.5),  size: MED }, // 3  alto-dx
    { url: 'taras',      dir: new THREE.Vector3(0.95, 0.4, -0.3),   size: MED }, // 4  medio far-sx
    { url: 'oleksiy',    dir: new THREE.Vector3(0.48, 0.6, -0.62),  size: MED }, // 5  medio centro-sx
    { url: 'pavlo',      dir: new THREE.Vector3(0, 0.72, -0.55),    size: BIG }, // 6  medio centro
    { url: 'mikyta',     dir: new THREE.Vector3(-0.95, 0.4, -0.3),  size: MED }, // 7  medio far-dx
    { url: 'alina',      dir: new THREE.Vector3(0, 2, 0),    size: BIG }, // 8  appena sopra il visore
    { url: 'nazar',      dir: new THREE.Vector3(0.35, -0.55, -0.78), size: MED }, // 9  mento-sx
    { url: 'yevhen',     dir: new THREE.Vector3(-0.35, -0.55, -0.78), size: MED }, // 10 mento-dx

    // ── Retro (calotta, +z) — sinistra dell'immagine = -x ──
    { url: 'andriy_k',   dir: new THREE.Vector3(-0.6, 0.5, 0.6),    size: MED }, // 1  alto-sx
    { url: 'volodymyr',  dir: new THREE.Vector3(-0.85, 0.1, 0.5),   size: MED }, // 2  medio-sx
    { url: 'viktoriia',  dir: new THREE.Vector3(0, 0.15, 1.0),      size: BIG }, // 3  centro
    { url: 'fedor',      dir: new THREE.Vector3(0.85, 0.1, 0.5),    size: MED }, // 4  medio-dx
    { url: 'dmytro s',   dir: new THREE.Vector3(-0.5, -0.4, 0.75),  size: MED }, // 5  basso-sx
    { url: 'kateryna t', dir: new THREE.Vector3(-0.2, -0.5, 0.85),  size: MED }, // 6  basso-centro-sx
    { url: 'maksym',     dir: new THREE.Vector3(0.2, -0.5, 0.85),   size: MED }, // 7  basso-centro-dx
    { url: 'karyna',     dir: new THREE.Vector3(0.55, -0.4, 0.7),   size: MED }, // 8  basso-dx

    // ── Restanti: corona retro e fianchi (orecchie) per riempire ──
    { url: 'andriy',     dir: new THREE.Vector3(0, 0.9, 0.4),       size: MED }, // corona retro
    { url: 'roman',      dir: new THREE.Vector3(0.5, 0.72, 0.45),   size: MED }, // alto-retro-sx
    { url: 'kateryna',   dir: new THREE.Vector3(0.95, -0.1, 0.15),  size: MED }, // fianco sx (orecchio)
    { url: 'mariia',     dir: new THREE.Vector3(-0.95, -0.1, 0.15), size: MED }  // fianco dx (orecchio)
  ].map((d) => ({ ...d, url: `/images/athletes-helmet/${d.url}.png` }))

  const raycaster = new THREE.Raycaster()

  // Trova il punto reale sulla superficie del mesh lungo `direction` e orienta
  // il decal: il suo +z locale segue la normale (necessario su mesh curva,
  // altrimenti il box non è tangente e DecalGeometry ne ritaglia una scheggia)
  // e il suo +y locale segue l'alto del mondo, così le foto restano dritte.
  function placeDecalOnSurface(mesh, direction, size) {
    const dir = direction.clone().normalize()
    const origin = dir.clone().multiplyScalar(5)
    raycaster.set(origin, dir.clone().negate())

    const hit = raycaster.intersectObject(mesh, false)[0]
    if (!hit) return null

    const normal = hit.face.normal.clone().transformDirection(mesh.matrixWorld).normalize()
    const z = normal
    let up = new THREE.Vector3(0, 1, 0)
    if (Math.abs(z.dot(up)) > 0.99) up = new THREE.Vector3(0, 0, 1)
    const x = new THREE.Vector3().crossVectors(up, z).normalize()
    const y = new THREE.Vector3().crossVectors(z, x).normalize()
    const rot = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))

    return new DecalGeometry(mesh, hit.point, rot, size)
  }

  const textures = useTexture(decalsData.map(d => d.url))

  let decalGeometries = $state([])

  $effect(() => {
    if (!$gltf) return
    $gltf.scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      if (!(node.material instanceof THREE.MeshStandardMaterial)) return
      node.material.color.set('#ffffff')
      node.material.roughness = 0.4
      node.material.metalness = 0.8
    })

    // I decal vengono costruiti nello spazio LOCALE del modello (matrice
    // identità) e renderizzati come FIGLI del modello: così ereditano scala,
    // posizione e soprattutto la rotazione applicata frame-by-frame in useTask
    // e ruotano insieme al casco. DecalGeometry legge matrixWorld alla
    // costruzione, quindi la azzeriamo prima di calcolare i decal.
    $gltf.scene.scale.set(1, 1, 1)
    $gltf.scene.position.set(0, 0, 0)
    $gltf.scene.rotation.set(0, 0, 0)
    $gltf.scene.updateMatrixWorld(true)

    const targetNode = $gltf.nodes['tripo_node_26ea525f-a321-412f-bf5c-b1d284a51c92']
    decalGeometries = decalsData.map((decal) => placeDecalOnSurface(targetNode, decal.dir, decal.size))
  })
</script>

<T.PerspectiveCamera makeDefault fov={CAMERA_FOV} bind:ref={camera} />
<T.DirectionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
<T.AmbientLight intensity={0.5} />

<T.Group bind:ref={floatGroup}>
  {#if $gltf}
    <T is={$gltf.scene} bind:ref={modelRef}>
      {#each decalsData as decal, index}
        {#if decalGeometries[index]}
          <T.Mesh geometry={decalGeometries[index]}>
            <T.MeshStandardMaterial
              map={$textures[index]}
              transparent={true}
              depthTest={true}
              depthWrite={false}
              polygonOffset={true}
              polygonOffsetFactor={-4}
            />
          </T.Mesh>
        {/if}
      {/each}
    </T>
  {/if}
</T.Group>
