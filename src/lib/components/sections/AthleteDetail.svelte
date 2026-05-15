<script>
  let { athlete, onClose } = $props()

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose()
  }

  // Split name into two parts for the large display
  let nameParts = $derived.by(() => {
    if (!athlete) return ['', '']
    const parts = athlete.name.split(' ')
    return [parts[0], parts.slice(1).join(' ')]
  })
</script>

<svelte:window on:keydown={handleKeydown} />

{#if athlete}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={onClose}>
    <!-- Content: stop propagation to avoid closing on content click -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="content" onclick={(e) => e.stopPropagation()}>

      <!-- Left: large name + role -->
      <div class="left-panel">
        <h1 class="athlete-name">
          <span>{nameParts[0]}</span>
          <span>{nameParts[1]}</span>
        </h1>
        <p class="role">{athlete.role}</p>
      </div>

      <!-- Right: description + scrolling photo gallery -->
      <div class="right-panel">
        <p class="description">{athlete.description}</p>
        <div class="photo-gallery">
          {#each athlete.photos as photo, i}
            <div class="photo-frame">
              <img src={photo} alt="{athlete.name} {i + 1}" />
            </div>
          {/each}
        </div>
      </div>

      <!-- Close button -->
      <button class="close-btn" onclick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/>
          <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: rgba(3, 4, 4, 0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    animation: overlay-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .content {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 45% 55%;
    height: 100%;
    animation: content-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both;
  }

  @keyframes content-in {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  /* ── Left Panel ── */
  .left-panel {
    position: relative;
    padding: 160px 0 80px 45px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .athlete-name {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: clamp(100px, 13vw, 200px);
    font-weight: 500;
    color: var(--color-ink, #fafafa);
    line-height: 0.96;
    letter-spacing: -0.019em;
    margin: 0;
    display: flex;
    flex-direction: column;
    text-transform: none;
  }

  .role {
    font-family: var(--font-secondary, 'Geist'), sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: var(--color-ink, #fafafa);
    letter-spacing: -0.019em;
    line-height: 1.5;
    margin: 0;
  }

  /* ── Right Panel ── */
  .right-panel {
    padding: 160px 60px 80px 20px;
    display: flex;
    flex-direction: column;
    gap: 48px;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .right-panel::-webkit-scrollbar { display: none; }

  .description {
    font-family: var(--font-secondary, 'Geist'), sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: var(--color-ink, #fafafa);
    line-height: 1.5;
    letter-spacing: -0.019em;
    margin: 0;
    max-width: 576px;
  }

  .photo-gallery {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .photo-frame {
    flex: 1 1 260px;
    max-width: 320px;
    height: 354px;
    overflow: hidden;
    border-radius: 2px;
  }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  /* ── Close Button ── */
  .close-btn {
    position: absolute;
    top: 24px;
    right: 32px;
    background: transparent;
    border: none;
    color: var(--color-ink, #fafafa);
    cursor: pointer;
    padding: 8px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .close-btn:hover { opacity: 1; }

  /* ── Navbar area fix ── */
  @media (max-width: 768px) {
    .content {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    .left-panel {
      padding: 100px 24px 24px 24px;
    }
    .athlete-name {
      font-size: clamp(64px, 18vw, 120px);
    }
    .right-panel {
      padding: 32px 24px 80px 24px;
    }
  }
</style>
