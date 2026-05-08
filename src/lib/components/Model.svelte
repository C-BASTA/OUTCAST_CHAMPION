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
  import { useGltf } from '@threlte/extras'
  import * as THREE from 'three'
  import { config } from '$lib/config.svelte.js'

  // Carica il file .glb dalla cartella /static/models/
  // $gltf è undefined mentre carica, poi diventa l'oggetto GLTF
  const gltf = useGltf('/models/EmpyInParts.glb')

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
