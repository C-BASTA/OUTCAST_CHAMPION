<script>
  import { onMount } from 'svelte'

  let { athlete, onClose, athleteIndex = -1 } = $props()

  let overlayEl    = $state(null)
  let leftPanelEl  = $state(null)
  let scrollTop    = $state(0)
  let isMobile     = $state(false)

  onMount(() => {
    const check = () => { isMobile = window.innerWidth < 768 }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  })

  // ── Scroll constants ──────────────────────────────────────────────
  const TEXT_REVEAL_PX = 1800  // px of overlay-internal scroll to clear all text

  // ── Helpers ───────────────────────────────────────────────────────
  const clamp      = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp       = (a, b, t) => a + (b - a) * t
  const easeInOut  = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

  // ── Name split ───────────────────────────────────────────────────
  let nameParts = $derived.by(() => {
    if (!athlete) return ['', '']
    const p = athlete.name.split(' ')
    return [p[0], p.slice(1).join(' ')]
  })

  // ── Description → 2–4 paragraphs ─────────────────────────────────
  let paragraphs = $derived.by(() => {
    if (!athlete?.description) return []
    const sentences = athlete.description
      .trim()
      .match(/[^.!?]+[.!?]+\s*/g)
      ?.map(s => s.trim())
      .filter(Boolean) ?? [athlete.description]
    const n = sentences.length
    if (n <= 3) return sentences
    const count = n >= 6 ? 4 : 3
    return Array.from({ length: count }, (_, i) => {
      const s = Math.floor(i * n / count)
      const e = Math.floor((i + 1) * n / count)
      return sentences.slice(s, e).join(' ').trim()
    }).filter(Boolean)
  })

  // ── Per-paragraph blur/opacity driven by scroll ───────────────────
  // Paragraph 0: always clear
  // Paragraph 1: blur 2.5px → 0, opacity 0.64 → 1
  // Paragraph 2+: blur 5px → 0, opacity 0.12 → 1
  const INIT_BLURS     = [0, 2.5, 5, 5]
  const INIT_OPACITIES = [1, 0.64, 0.12, 0.08]

  let paraStyles = $derived.by(() => {
    return paragraphs.map((_, i) => {
      if (i === 0) return { blur: 0, opacity: 1 }
      const n          = paragraphs.length
      const clearStart = (i / n) * TEXT_REVEAL_PX * 0.4
      const clearEnd   = (i / n) * TEXT_REVEAL_PX
      const t          = easeInOut(clamp((scrollTop - clearStart) / Math.max(clearEnd - clearStart, 1), 0, 1))
      return {
        blur:    lerp(INIT_BLURS[i] ?? 5, 0, t),
        opacity: lerp(INIT_OPACITIES[i] ?? 0.08, 1, t)
      }
    })
  })

  // ── Gallery ───────────────────────────────────────────────────────
  const PHOTO_STEP_PX  = 1400  // scroll per ogni cambio foto dopo la prima
  const PHOTO_INIT_BLUR    = 50
  const PHOTO_INIT_OPACITY = 0.02

  // Foto 0: si schiarisce con il testo
  // Foto 1+: partono esattamente quando foto 0 ha completato (stesso trigger)
  let photoStyles = $derived.by(() => {
    if (!athlete?.photos) return []
    const n = paragraphs.length

    return athlete.photos.map((_, i) => {
      // Foto 0: sempre visibile all'apertura
      if (i === 0) return { opacity: 1, blur: 0 }

      // Foto i: stessa finestra di reveal del paragrafo i
      if (i < n) {
        const clearStart = (i / n) * TEXT_REVEAL_PX * 0.4
        const clearEnd   = (i / n) * TEXT_REVEAL_PX
        const t = easeInOut(clamp((scrollTop - clearStart) / Math.max(clearEnd - clearStart, 1), 0, 1))
        return {
          opacity: lerp(PHOTO_INIT_OPACITY, 1, t),
          blur:    lerp(PHOTO_INIT_BLUR, 0, t * t * t * t * t * t)
        }
      }

      // Foto extra oltre i paragrafi: appaiono dopo il testo
      const textEnd    = n > 1 ? ((n - 1) / n) * TEXT_REVEAL_PX : TEXT_REVEAL_PX
      const photoScroll = Math.max(0, scrollTop - textEnd)
      const start = (i - n) * PHOTO_STEP_PX
      const t     = easeInOut(clamp((photoScroll - start) / PHOTO_STEP_PX, 0, 1))
      return {
        opacity: lerp(PHOTO_INIT_OPACITY, 1, t),
        blur:    lerp(PHOTO_INIT_BLUR, 0, t * t * t * t * t * t)
      }
    })
  })

  let currentPhotoIndex = $derived.by(() => {
    let current = 0
    photoStyles.forEach((style, i) => {
      if (style.opacity > 0.5) current = i
    })
    return current
  })

  // ── Lock body scroll + cattura wheel per reveal testo e foto ─────────
  $effect(() => {
    if (!athlete) return
    // If body is already locked (athlete swap without going through null), derive the
    // saved position from the current top offset — window.scrollY may not have settled
    // yet after the outgoing effect's window.scrollTo() call.
    const savedScrollY = document.body.style.position === 'fixed'
      ? -parseInt(document.body.style.top || '0')
      : window.scrollY

    // Body lock: position:fixed blocca lo sfondo su tutti i browser/iOS.
    // Su mobile NON settiamo overflow:hidden su body/documentElement perché
    // su iOS/Safari impedisce lo scroll dei container figli (overflow-y:scroll).
    document.body.style.position = 'fixed'
    document.body.style.top      = `-${savedScrollY}px`
    document.body.style.left     = '0'
    document.body.style.right    = '0'
    if (!isMobile) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }

    let removeWheel = () => {}

    if (!isMobile) {
      const onWheel = (e) => {
        e.preventDefault()
        const extraPhotos = Math.max(0, (athlete?.photos?.length ?? 0) - paragraphs.length)
        const maxScroll = TEXT_REVEAL_PX + extraPhotos * PHOTO_STEP_PX + 300

        if (scrollTop >= TEXT_REVEAL_PX && leftPanelEl) {
          const panelMax = leftPanelEl.scrollHeight - leftPanelEl.clientHeight
          if (panelMax > 0) {
            const prev = leftPanelEl.scrollTop
            leftPanelEl.scrollTop = clamp(leftPanelEl.scrollTop + e.deltaY, 0, panelMax)
            if (leftPanelEl.scrollTop !== prev) return
          }
        }

        scrollTop = clamp(scrollTop + e.deltaY, 0, maxScroll)
      }
      window.addEventListener('wheel', onWheel, { passive: false })
      removeWheel = () => window.removeEventListener('wheel', onWheel)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.left     = ''
      document.body.style.right    = ''
      if (!isMobile) {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
        const blockMomentum = (e) => e.preventDefault()
        window.addEventListener('wheel', blockMomentum, { passive: false })
        setTimeout(() => window.removeEventListener('wheel', blockMomentum), 400)
      }
      removeWheel()
      scrollTop = 0
      if (leftPanelEl) leftPanelEl.scrollTop = 0
      window.scrollTo(0, savedScrollY)
    }
  })

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if athlete}
  <div class="overlay" role="dialog" aria-modal="true">

    <!-- Close button (condiviso tra i due layout) -->
    <button class="close-btn" onclick={onClose} aria-label="Close">
      <svg width="27" height="25" viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <rect x="0"  y="1"  width="2" height="2" fill="currentColor"/>
        <rect x="15" y="1"  width="2" height="2" fill="currentColor"/>
        <rect x="3"  y="4"  width="2" height="2" fill="currentColor"/>
        <rect x="12" y="4"  width="2" height="2" fill="currentColor"/>
        <rect x="6"  y="7"  width="2" height="2" fill="currentColor"/>
        <rect x="9"  y="7"  width="2" height="2" fill="currentColor"/>
        <rect x="6"  y="10" width="2" height="2" fill="currentColor"/>
        <rect x="9"  y="10" width="2" height="2" fill="currentColor"/>
        <rect x="3"  y="13" width="2" height="2" fill="currentColor"/>
        <rect x="12" y="13" width="2" height="2" fill="currentColor"/>
        <rect x="0"  y="16" width="2" height="2" fill="currentColor"/>
        <rect x="15" y="16" width="2" height="2" fill="currentColor"/>
      </svg>
    </button>

    {#if isMobile}
      <!-- ── Mobile: un unico container che scrolla nativamente ── -->
      <div class="mobile-scroll">
        <h1 class="athlete-name">
          <span>{nameParts[0]}</span>
          <span>{nameParts[1]}</span>
        </h1>
        <p class="role">{athlete.role}</p>
        <div class="para-group">
          {#each paragraphs as para}
            <p class="para">{para}</p>
          {/each}
        </div>
        {#if athlete.photos?.length}
          <div class="mobile-gallery">
            {#each athlete.photos as photo, i}
              <img class="mobile-photo" src={photo} alt="{athlete.name} {i + 1}" loading="lazy" />
            {/each}
          </div>
        {/if}
      </div>

    {:else}
      <!-- ── Desktop: sticky panel con foto a destra ── -->
      <div class="sticky-panel">
        <div class="glow" aria-hidden="true"></div>

        {#if athlete.photos?.length}
          <div class="photo-cover">
            {#each athlete.photos as photo, i}
              <img
                class="photo-img"
                src={photo}
                alt="{athlete.name} {i + 1}"
                style:opacity={photoStyles[i]?.opacity ?? 0}
                style:filter={photoStyles[i]?.blur > 0 ? `blur(${photoStyles[i].blur}px)` : 'none'}
                style:z-index={i}
              />
            {/each}
          </div>
          <span class="photo-counter">{currentPhotoIndex + 1}/{athlete.photos.length}</span>
        {/if}

        <div class="upper">
          <div class="left-panel" bind:this={leftPanelEl}>
            <h1 class="athlete-name">
              <span>{nameParts[0]}</span>
              <span>{nameParts[1]}</span>
            </h1>
            <p class="role">{athlete.role}</p>
            <div class="para-group">
              {#each paragraphs as para, i}
                <p
                  class="para"
                  style:filter={paraStyles[i]?.blur > 0 ? `blur(${paraStyles[i].blur}px)` : 'none'}
                  style:opacity={paraStyles[i]?.opacity ?? 1}
                >{para}</p>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

  </div>
{/if}

<style>
  /* ── Overlay container ── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: transparent;
    backdrop-filter: blur(56px) saturate(0.75);
    -webkit-backdrop-filter: blur(56px) saturate(0.75);
    overflow: hidden;
    animation: overlay-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  @keyframes overlay-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Scroll track ── */
  /* ── Panel ── */
  .sticky-panel {
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── Glow / spotlight ── */
  .glow {
    position: absolute;
    width: 900px;
    height: 800px;
    left: 36%;
    top: -60px;
    background: radial-gradient(
      ellipse at 40% 30%,
      rgba(255, 255, 255, 0.055) 0%,
      rgba(255, 255, 255, 0.018) 45%,
      transparent 70%
    );
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Close button ── */
  .close-btn {
    position: absolute;
    top: 24px;
    right: 32px;
    z-index: 10;
    background: transparent;
    border: none;
    color: var(--color-ink, #fafafa);
    cursor: pointer;
    padding: 8px;
    line-height: 0;
  }

  /* ── Upper section: name left, text right ── */
  .upper {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    z-index: 1;
  }

  /* ── Left panel ── */
  .left-panel {
    padding: 64px 0 40px 45px;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
    scrollbar-width: none;
    justify-content: flex-start;
    z-index: 1;
  }
  .left-panel::-webkit-scrollbar { display: none; }

  .para-group {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-top: auto;
    padding-bottom: 4px;
  }

  .athlete-name {
    font-family: var(--font-primary, 'GeistPixel');
    font-size: clamp(56px, 9vw, 140px);
    font-weight: 500;
    color: var(--color-ink, #fafafa);
    margin: 0 0 32px 0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .role {
    font-family: var(--font-secondary, 'Geist'), sans-serif;
    font-size: 18px;
    font-weight: 400;
    color: var(--color-ink, #fafafa);
    opacity: 0.45;
    letter-spacing: -0.01em;
    margin: 0 0 40px 0;
    flex-shrink: 0;
  }

  .para {
    font-family: var(--font-primary, 'GeistPixel');
    font-size: 20px;
    font-weight: 400;
    color: var(--color-ink, #fafafa);
    letter-spacing: -0.019em;
    max-width: 576px;
    flex-shrink: 0;
  }

  /* ── Photo cover ── */
  .photo-cover {
    position: absolute;
    right: 45px;
    width: 43%;
    max-width: 38vw;
    top: calc(64px + 2.5vw);
    bottom: 40px;
    will-change: transform;
    overflow: hidden;
    border-radius: 2px;
    z-index: 5;
    animation: photo-cover-in 1.4s cubic-bezier(0.08, 1, 0.2, 1) both;
  }

  @keyframes photo-cover-in {
    from { transform: translateY(100vh); }
    to   { transform: translateY(0); }
  }

  .photo-counter {
    position: absolute;
    bottom: 40px;
    right: calc(min(43%, 38vw) + 55px + 12px);
    z-index: 20;
    font-family: var(--font-primary, 'GeistPixel');
    font-size: 28px;
    color: var(--color-ink, #fafafa);
    opacity: 0.6;
    pointer-events: none;
    letter-spacing: 0.02em;

  }

  .photo-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transition: opacity 0.1s ease;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    /* .mobile-scroll è il container scrollabile — position:absolute inside
       position:fixed overlay crea un scroll context indipendente su iOS */
    .mobile-scroll {
      position: absolute;
      inset: 0;
      overflow-y: scroll;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding: 68px 24px max(40px, env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
    }

    .athlete-name {
      font-size: clamp(36px, 10vw, 60px);
      margin-bottom: 4px;
    }

    .role {
      margin: 0 0 24px;
    }

    .para-group {
      gap: 16px;
      margin-top: 0;
      padding-bottom: 0;
    }

    .para {
      font-size: 15px;
    }

    .mobile-gallery {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 36px;
      padding-bottom: 24px;
    }

    .mobile-photo {
      display: block;
      width: 100%;
      height: 58vw;
      object-fit: cover;
      border-radius: 0;
    }
  }
</style>
