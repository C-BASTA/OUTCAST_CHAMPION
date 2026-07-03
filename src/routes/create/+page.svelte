<script>
  //serve per creare il casco con le decalche l'utente carica, per ora non utilizzato in realtà
  //Il casco in 3d viene fatto con blender e poi esportato in glb
  import CascoViewer from '$lib/components/helmetCreator/CascoViewer.svelte';
  import FaceUploader from '$lib/components/helmetCreator/FaceUploader.svelte';
  
  let viewerAPI = $state(null);
  
  const handleViewerReady = (api) => {
    viewerAPI = api;
  };
  
  const handleFaceSelected = (url, position, size, rotation, meshIndex) => {
    viewerAPI?.addDecal(url, position, size, rotation, meshIndex);
  };
</script>

<div class="layout">
  <div class="sidebar">
    <h1>🎨 Casco Customizer</h1>
    
    <FaceUploader 
      onFaceSelected={handleFaceSelected}
      viewerAPI={viewerAPI}
    />
    
    <button class="clear-btn" onclick={() => viewerAPI?.clearAll()}>
      🗑️ Rimuovi tutte
    </button>
    <button class="remove-btn" onclick={() => viewerAPI?.removeSelectedDecal()}>
      ❌ Rimuovi selezionata
    </button>
  </div>
  
  <div class="viewer">
    <CascoViewer 
      modelPath="/models/casco_0307.gltf"
      onApplyFace={handleViewerReady}
    />
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: 100vh;
  }
  
  .sidebar {
    background: #1a1a1a;
    color: white;
    padding: 16px;
    overflow-y: auto;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .sidebar h1 {
    font-size: 22px;
    margin-bottom: 4px;
  }
  
  .clear-btn, .remove-btn {
    width: 100%;
    padding: 10px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }
  
  .clear-btn { background: #ff4444; }
  .remove-btn { background: #ff8800; }
  
  .viewer { height: 100vh; }
</style>