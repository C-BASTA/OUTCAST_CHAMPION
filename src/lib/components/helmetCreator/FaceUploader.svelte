<script>
  import * as THREE from 'three';
  
  let { onFaceSelected, viewerAPI } = $props();
  
  let customPosition = $state({ x: 0, y: 0.3, z: 0.8 });
  let customSize = $state({ x: 0.8, y: 0.8, z: 0.8 });
  let customRotation = $state(0);
  let selectedIndex = $state(0);
  let decalCount = $state(0);
  let selectedMeshIndex = $state(0);
  let meshList = $state([]);
  let isExporting = $state(false);
  
  const positionRange = { min: -3, max: 3, step: 0.01 };
  
  let fileInput;
  
  $effect(() => {
    const interval = setInterval(() => {
      if (viewerAPI) {
        const decals = viewerAPI.getDecals();
        decalCount = decals.length;
        meshList = viewerAPI.getMeshList() || [];
        
        const currentSelected = viewerAPI.selectedDecalIndex;
        if (currentSelected !== selectedIndex && currentSelected >= 0) {
          selectedIndex = currentSelected;
        }
        
        const decal = viewerAPI.getSelectedDecal();
        if (decal) {
          customPosition = { x: decal.position.x, y: decal.position.y, z: decal.position.z };
          customSize = { x: decal.size.x, y: decal.size.y, z: decal.size.z };
          customRotation = decal.rotation || 0;
          selectedMeshIndex = decal.meshIndex || 0;
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  });
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };
  
  const processFile = (file) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const position = new THREE.Vector3(customPosition.x, customPosition.y, customPosition.z);
      const size = new THREE.Vector3(customSize.x, customSize.y, customSize.z);
      onFaceSelected?.(url, position, size, customRotation, selectedMeshIndex);
    }
  };
  
  const selectDecal = (index) => {
    if (viewerAPI && index >= 0 && index < decalCount) {
      viewerAPI.selectedDecalIndex = index;
      selectedIndex = index;
    }
  };
  
  const updatePosition = (axis, value) => {
    customPosition[axis] = value;
    viewerAPI?.updateDecalPosition(selectedIndex, axis, value);
  };
  
  const updateSize = (axis, value) => {
    customSize[axis] = value;
    viewerAPI?.updateDecalSize(selectedIndex, axis, value);
  };
  
  const updateRotation = (value) => {
    customRotation = value;
    viewerAPI?.updateDecalRotation(selectedIndex, value);
  };
  
  const presets = [
    { name: 'Fronte', position: { x: 0, y: 0.3, z: 1 }, size: { x: 0.8, y: 0.8, z: 0.8 }, rotation: 0 },
    { name: 'Nuca', position: { x: 0, y: 0.2, z: -1 }, size: { x: 0.8, y: 0.8, z: 0.8 }, rotation: 0 },
    { name: 'Lato DX', position: { x: 1, y: 0.2, z: 0.2 }, size: { x: 0.7, y: 0.7, z: 0.7 }, rotation: 0 },
    { name: 'Lato SX', position: { x: -1, y: 0.2, z: 0.2 }, size: { x: 0.7, y: 0.7, z: 0.7 }, rotation: 0 },
    { name: 'Top', position: { x: 0, y: 1, z: 0.1 }, size: { x: 0.7, y: 0.7, z: 0.7 }, rotation: 0 },
  ];
  
  const applyPreset = (preset) => {
    customPosition = { ...preset.position };
    customSize = { ...preset.size };
    customRotation = preset.rotation || 0;
    
    if (viewerAPI && decalCount > 0) {
      Object.keys(preset.position).forEach(axis => {
        viewerAPI.updateDecalPosition(selectedIndex, axis, preset.position[axis]);
      });
      Object.keys(preset.size).forEach(axis => {
        viewerAPI.updateDecalSize(selectedIndex, axis, preset.size[axis]);
      });
      viewerAPI.updateDecalRotation(selectedIndex, preset.rotation || 0);
    }
  };
  
  // Esporta la configurazione
  const exportConfig = () => {
    if (!viewerAPI) return;
    const decals = viewerAPI.getDecals();
    
    const config = {
      version: '1.0',
      modelPath: '/models/CascoVlad13_compressed.glb',
      exportDate: new Date().toISOString(),
      decals: decals.map(d => ({
        imageUrl: d.userData.imageUrl,
        position: {
          x: d.userData.position.x,
          y: d.userData.position.y,
          z: d.userData.position.z
        },
        size: {
          x: d.userData.size.x,
          y: d.userData.size.y,
          z: d.userData.size.z
        },
        rotation: d.userData.rotation || 0,
        meshIndex: d.userData.meshIndex || 0,
        meshName: d.userData.meshName || ''
      }))
    };
    
    isExporting = true;
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casco-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => isExporting = false, 1000);
  };
  
  // Importa configurazione
  const importConfig = (event) => {
    const file = event.target.files[0];
    if (!file || !viewerAPI) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        
        // Pulisci decal esistenti
        viewerAPI.clearAll();
        
        // Ricarica le decal
        config.decals.forEach((decalConfig, index) => {
          setTimeout(() => {
            const position = new THREE.Vector3(
              decalConfig.position.x,
              decalConfig.position.y,
              decalConfig.position.z
            );
            const size = new THREE.Vector3(
              decalConfig.size.x,
              decalConfig.size.y,
              decalConfig.size.z
            );
            
            viewerAPI.addDecal(
              decalConfig.imageUrl,
              position,
              size,
              decalConfig.rotation || 0,
              decalConfig.meshIndex || 0
            );
          }, index * 200);
        });
        
        console.log('✅ Config imported:', config.decals.length, 'decals');
      } catch (err) {
        console.error('❌ Invalid config file:', err);
        alert('File di configurazione non valido');
      }
    };
    reader.readAsText(file);
  };
</script>

<div class="uploader-container">
  <!-- Input nascosto per le immagini -->
  <input type="file" accept="image/*" onchange={handleFileSelect} class="hidden" bind:this={fileInput} />
  
  <!-- Input nascosto per import configurazione -->
  <input type="file" accept=".json" onchange={importConfig} class="hidden" id="importConfigInput" />
  
  <!-- Selezione Mesh Target -->
  <div class="section">
    <span class="label">🎯 Applica su:</span>
    <select 
      value={selectedMeshIndex} 
      onchange={(e) => selectedMeshIndex = parseInt(e.target.value)}
      class="mesh-select"
    >
      {#each meshList as mesh, i}
        <option value={i}>{mesh.name || `Parte ${i + 1}`}</option>
      {/each}
    </select>
  </div>
  
  <!-- Selezione Decal -->
  {#if decalCount > 0}
    <div class="section">
      <span class="label">Decal attiva: <strong>{selectedIndex + 1} / {decalCount}</strong></span>
      <div class="decal-buttons">
        <button class="nav-btn" onclick={() => selectDecal(selectedIndex - 1)} disabled={selectedIndex === 0}>◀</button>
        <select value={selectedIndex} onchange={(e) => selectDecal(parseInt(e.target.value))}>
          {#each Array(decalCount) as _, i}
            <option value={i}>Decal {i + 1}</option>
          {/each}
        </select>
        <button class="nav-btn" onclick={() => selectDecal(selectedIndex + 1)} disabled={selectedIndex === decalCount - 1}>▶</button>
      </div>
    </div>
  {/if}
  
  <!-- Presets -->
  <div class="section">
    <span class="label">Posizioni rapide:</span>
    <div class="preset-grid">
      {#each presets as preset}
        <button class="preset-btn" onclick={() => applyPreset(preset)}>
          {preset.name}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Controlli -->
  <div class="section controls">
    <h3>📍 Posizione</h3>
    <label>X: <span class="value">{customPosition.x.toFixed(2)}</span></label>
    <input type="range" min={positionRange.min} max={positionRange.max} step={positionRange.step}
           value={customPosition.x} oninput={(e) => updatePosition('x', parseFloat(e.target.value))} />
    
    <label>Y: <span class="value">{customPosition.y.toFixed(2)}</span></label>
    <input type="range" min={positionRange.min} max={positionRange.max} step={positionRange.step}
           value={customPosition.y} oninput={(e) => updatePosition('y', parseFloat(e.target.value))} />
    
    <label>Z: <span class="value">{customPosition.z.toFixed(2)}</span></label>
    <input type="range" min="-2" max="2" step="0.01"
           value={customPosition.z} oninput={(e) => updatePosition('z', parseFloat(e.target.value))} />
    
    <h3>📏 Dimensione</h3>
    <label>Larghezza: <span class="value">{customSize.x.toFixed(2)}</span></label>
    <input type="range" min="0.1" max="4" step="0.01"
           value={customSize.x} oninput={(e) => updateSize('x', parseFloat(e.target.value))} />
    
    <label>Altezza: <span class="value">{customSize.y.toFixed(2)}</span></label>
    <input type="range" min="0.1" max="4" step="0.01"
           value={customSize.y} oninput={(e) => updateSize('y', parseFloat(e.target.value))} />
    
    <h3>🔄 Rotazione</h3>
    <label>Angolo: <span class="value">{customRotation.toFixed(1)}°</span></label>
    <input type="range" min="-180" max="180" step="1"
           value={customRotation} oninput={(e) => updateRotation(parseFloat(e.target.value))} />
  </div>
  
  <!-- Bottoni azione -->
  <div class="actions">
    <button class="add-btn" onclick={() => fileInput?.click()}>
      ➕ Aggiungi decal
    </button>
    
    {#if decalCount > 0}
      <button class="remove-btn" onclick={() => viewerAPI?.removeSelectedDecal()}>
        ❌ Rimuovi selezionata
      </button>
      
      <button class="clear-btn" onclick={() => viewerAPI?.clearAll()}>
        🗑️ Rimuovi tutte
      </button>
    {/if}
    
    <div class="export-group">
      <button class="export-btn" onclick={exportConfig} disabled={isExporting || decalCount === 0}>
        💾 {isExporting ? 'Salvando...' : 'Esporta configurazione'}
      </button>
      
      <button class="import-btn" onclick={() => document.getElementById('importConfigInput')?.click()}>
        📂 Importa configurazione
      </button>
    </div>
    
    {#if decalCount > 0}
      <div class="info">
        <p>{decalCount} decal sul casco</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .uploader-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .hidden { display: none; }
  
  .section {
    background: #222;
    padding: 12px;
    border-radius: 8px;
  }
  
  .label {
    font-size: 11px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 6px;
  }
  
  .label strong {
    color: #00ff88;
  }
  
  .mesh-select {
    width: 100%;
    padding: 8px;
    background: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 6px;
    font-size: 13px;
  }
  
  .decal-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .decal-buttons select {
    flex: 1;
    padding: 6px;
    background: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 6px;
    font-size: 13px;
  }
  
  .nav-btn {
    width: 28px;
    height: 28px;
    background: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-top: 6px;
  }
  
  .preset-btn {
    padding: 6px 4px;
    background: #333;
    color: #ccc;
    border: 1px solid #555;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
  }
  
  .preset-btn:hover {
    background: #444;
    border-color: #00ff88;
    color: white;
  }
  
  .controls h3 {
    margin: 10px 0 4px;
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
  }
  
  .controls h3:first-child {
    margin-top: 0;
  }
  
  .controls label {
    display: block;
    margin: 6px 0 2px;
    font-size: 11px;
    color: #ccc;
  }
  
  .controls input[type="range"] {
    width: 100%;
    accent-color: #00ff88;
  }
  
  .value {
    font-size: 11px;
    color: #00ff88;
    font-weight: bold;
    float: right;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .add-btn {
    width: 100%;
    padding: 12px;
    background: #00aa55;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .add-btn:hover {
    background: #00cc66;
  }
  
  .remove-btn, .clear-btn {
    width: 100%;
    padding: 10px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }
  
  .remove-btn {
    background: #ff8800;
  }
  
  .remove-btn:hover {
    background: #ffaa00;
  }
  
  .clear-btn {
    background: #ff4444;
  }
  
  .clear-btn:hover {
    background: #ff6666;
  }
  
  .export-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 4px;
  }
  
  .export-btn, .import-btn {
    padding: 10px 8px;
    color: white;
    border: 1px solid #555;
    border-radius: 8px;
    font-size: 11px;
    cursor: pointer;
    background: #2a2a4a;
    text-align: center;
  }
  
  .export-btn:hover, .import-btn:hover {
    background: #3a3a6a;
    border-color: #8888ff;
  }
  
  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .info {
    text-align: center;
    padding: 8px;
    background: #1a3a1a;
    border-radius: 6px;
  }
  
  .info p {
    margin: 0;
    font-size: 12px;
    color: #00ff88;
  }
</style>