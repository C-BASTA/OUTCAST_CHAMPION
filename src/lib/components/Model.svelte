<!--
  Model.svelte — carica il modello GLTF e aggiorna il materiale in modo reattivo

  Concetti chiave:
    useGltf()  — hook che carica un file .glb/gltf in modo asincrono
                 ritorna un AsyncWritable (store Svelte): $gltf è null finché non è caricato
    $effect()  — viene eseguito ogni volta che una dipendenza reattiva cambia
    traverse() — scorre tutta la gerarchia di nodi della scena Three.js

  Alternativa a useGltf: npx @threlte/gltf DamagedHelmet.glb
    Genera un componente Svelte con tutti i nodi e materiali già nominati,
    utile quando si vuole controllare singole parti del modello.
-->
<script>
  import { T } from '@threlte/core'
  import { useGltf, useDraco } from '@threlte/extras'
  import * as THREE from 'three'
  import { config } from '$lib/config.svelte.js'

  const gltf = useGltf('/models/casco_con_facce.glb', { dracoLoader: useDraco('/draco/') })

  /*
    $effect: si ri-esegue automaticamente ogni volta che
    una delle sue dipendenze reattive cambia.

    Dipendenze tracciate qui:
      - $gltf         (il modello, quando finisce di caricare)
      - config.color, config.roughness, config.metalness
  */
  $effect(() => {
    if (!$gltf) return

    // Attraversa tutti i nodi della scena GLTF
    $gltf.scene.traverse((node) => {
      // Ci interessa solo i Mesh con MeshStandardMaterial
      if (!(node instanceof THREE.Mesh)) return
      if (!(node.material instanceof THREE.MeshStandardMaterial)) return

      // color si moltiplica con la texture esistente:
      // bianco (#ffffff) = texture originale, altri colori = tinta
      node.material.color.set(config.color)
      node.material.roughness = config.roughness
      node.material.metalness = config.metalness

      node.rotation.x = config.rotationX
      node.rotation.y = config.rotationY
      node.rotation.z = config.rotationZ
    })
  })
</script>

<!--
  {#if $gltf}: il modello è visibile solo dopo il caricamento
  <T is={...}>: inserisce qualsiasi oggetto Three.js nella scena
-->
{#if $gltf}
  <T is={$gltf.scene} scale={2} position={[ 0, 0.1, 0 ]} visible />
{/if}
