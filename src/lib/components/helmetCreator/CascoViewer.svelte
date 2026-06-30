<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
  
  let { modelPath, onApplyFace } = $props();
  
  let canvas = $state();
  let error = $state(null);
  
  let scene, camera, renderer, orbitControls;
  let model;
  let meshList = []; // Lista dei mesh disponibili
  let decalObjects = [];
  let selectedDecalIndex = $state(-1);
  
  onMount(() => {
    init();
  });
  
  const init = async () => {
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color('#2a2a2a');
      
      camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.set(2, 0.5, 3);
      
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;
      orbitControls.target.set(0, 0.2, 0);
      
      scene.add(new THREE.AmbientLight('#ffffff', 0.6));
      const dirLight = new THREE.DirectionalLight('#ffffff', 2);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);
      
      const grid = new THREE.GridHelper(10, 10, '#444', '#222');
      scene.add(grid);
      
      const loader = new GLTFLoader();
      console.log('📦 Loading model:', modelPath);
      
      const gltf = await loader.loadAsync(modelPath);
      model = gltf.scene;
      
      // Raccogli tutti i mesh
      meshList = [];
      model.traverse((child) => {
        if (child.isMesh) {
          console.log('🔍 Found mesh:', child.name);
          child.castShadow = true;
          child.receiveShadow = true;
          meshList.push({
            name: child.name || 'Unnamed',
            mesh: child
          });
        }
      });
      
      scene.add(model);
      console.log('✅ Model loaded. Meshes:', meshList.length);
      
      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', onKeyDown);
      
      onApplyFace?.({
        addDecal: addDecal,
        removeSelectedDecal: removeSelectedDecal,
        clearAll: clearAllDecals,
        updateDecalPosition: updateDecalPosition,
        updateDecalSize: updateDecalSize,
        updateDecalRotation: updateDecalRotation,
        selectedDecalIndex: selectedDecalIndex,
        getSelectedDecal: getSelectedDecal,
        getDecals: () => decalObjects,
        getMeshList: () => meshList
      });
      
      animate();
      
    } catch (err) {
      console.error('❌ Error:', err);
      error = err.message;
    }
  };
  
  const addDecal = (imageUrl, position = null, size = null, rotation = 0, meshIndex = 0) => {
    console.log('🎨 Adding decal. Mesh index:', meshIndex);
    
    if (meshIndex < 0 || meshIndex >= meshList.length) {
      console.error('❌ Invalid mesh index');
      return;
    }
    
    const targetMesh = meshList[meshIndex].mesh;
    
    if (!position) {
      position = new THREE.Vector3(0, 0.3, 0.8);
    }
    if (!size) {
      size = new THREE.Vector3(0.8, 0.8, 0.8);
    }
    
    console.log('🎯 Target mesh:', meshList[meshIndex].name);
    console.log('📍 Position:', position);
    console.log('📏 Size:', size);
    console.log('🔄 Rotation:', rotation);
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        
        const decalMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          depthTest: true,
          depthWrite: true,
          polygonOffset: true,
          polygonOffsetFactor: -10,
          side: THREE.DoubleSide,
        });
        
        try {
          const eulerRotation = new THREE.Euler(0, 0, rotation);
          
          const decalGeom = new DecalGeometry(
            targetMesh,
            position,
            eulerRotation,
            size
          );
          
          const decalMesh = new THREE.Mesh(decalGeom, decalMaterial);
          decalMesh.renderOrder = 999;
          decalMesh.userData = {
            id: Date.now(),
            imageUrl,
            position: position.clone(),
            size: size.clone(),
            rotation: rotation,
            meshIndex: meshIndex,
            meshName: meshList[meshIndex].name
          };
          
          scene.add(decalMesh);
          decalObjects.push(decalMesh);
          selectedDecalIndex = decalObjects.length - 1;
          
          console.log('✅ Decal added on:', meshList[meshIndex].name);
        } catch (err) {
          console.error('❌ Decal creation failed:', err);
        }
      },
      undefined,
      (err) => console.error('❌ Texture load error:', err)
    );
  };
  
  const updateDecalPosition = (index, axis, value) => {
    if (index < 0 || index >= decalObjects.length) return;
    const decal = decalObjects[index];
    decal.userData.position[axis] = value;
    recreateDecal(decal);
  };
  
  const updateDecalSize = (index, axis, value) => {
    if (index < 0 || index >= decalObjects.length) return;
    const decal = decalObjects[index];
    decal.userData.size[axis] = value;
    recreateDecal(decal);
  };
  
  const updateDecalRotation = (index, value) => {
    if (index < 0 || index >= decalObjects.length) return;
    const decal = decalObjects[index];
    decal.userData.rotation = value;
    recreateDecal(decal);
  };
  
  const recreateDecal = (decal) => {
    const meshIndex = decal.userData.meshIndex || 0;
    if (meshIndex < 0 || meshIndex >= meshList.length) return;
    
    const targetMesh = meshList[meshIndex].mesh;
    const texture = decal.material.map;
    const position = decal.userData.position;
    const size = decal.userData.size;
    const rotation = decal.userData.rotation || 0;
    
    decal.geometry.dispose();
    
    try {
      const eulerRotation = new THREE.Euler(0, 0, rotation);
      const newGeom = new DecalGeometry(targetMesh, position, eulerRotation, size);
      decal.geometry = newGeom;
    } catch (err) {
      console.error('❌ Decal update failed:', err);
    }
  };
  
  const removeSelectedDecal = () => {
    if (selectedDecalIndex >= 0 && selectedDecalIndex < decalObjects.length) {
      const decal = decalObjects[selectedDecalIndex];
      scene.remove(decal);
      decal.geometry?.dispose();
      decal.material?.dispose();
      decalObjects.splice(selectedDecalIndex, 1);
      selectedDecalIndex = decalObjects.length > 0 ? 0 : -1;
      console.log('🗑️ Decal removed');
    }
  };
  
  const getSelectedDecal = () => {
    if (selectedDecalIndex >= 0 && selectedDecalIndex < decalObjects.length) {
      return decalObjects[selectedDecalIndex].userData;
    }
    return null;
  };
  
  const clearAllDecals = () => {
    decalObjects.forEach(decal => {
      scene.remove(decal);
      decal.geometry?.dispose();
      decal.material?.dispose();
    });
    decalObjects = [];
    selectedDecalIndex = -1;
  };
  
  const onKeyDown = (event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      removeSelectedDecal();
    }
  };
  
  const onResize = () => {
    if (!camera || !renderer || !canvas) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };
  
  const animate = () => {
    requestAnimationFrame(animate);
    orbitControls?.update();
    renderer?.render(scene, camera);
  };
  
  onDestroy(() => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    clearAllDecals();
    renderer?.dispose();
    scene?.clear();
  });
</script>

<div class="viewer-container">
  <canvas bind:this={canvas}></canvas>
  
  {#if error}
    <div class="error">❌ {error}</div>
  {/if}
  
  <div class="instructions">
    Usa i controlli per posizionare le decal | Canc per rimuovere
  </div>
</div>

<style>
  .viewer-container {
    width: 100%;
    height: 100%;
    position: relative;
    background: #2a2a2a;
  }
  
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  .error {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff4444;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    z-index: 10;
  }
  
  .instructions {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: #aaa;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    pointer-events: none;
  }
</style>