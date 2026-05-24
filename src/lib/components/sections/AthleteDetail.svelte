<script>
  let { athlete, onClose, athleteIndex = -1 } = $props()

  let overlayEl = $state(null)
  let scrollTop  = $state(0)

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

  // ── Gallery: un solo cover che sale, poi le foto si dissolvono ────────
  const SLIDE_IN_PX  = 500   // scroll per portare il cover a schermo
  const PHOTO_STEP_PX = 800  // scroll per ogni cambio foto

  // coverT: 0 → 1 mentre il cover sale
  let coverT = $derived(easeInOut(clamp((scrollTop - TEXT_REVEAL_PX) / SLIDE_IN_PX, 0, 1)))

  // translateY del cover: 100vh → 0vh
  let coverY = $derived(lerp(100, 0, coverT))

  // Stili foto: foto 0 agganciata a coverT (non a scrollTop),
  // foto 1+ guidate dallo scroll dopo che il cover è arrivato
  let photoStyles = $derived.by(() => {
    if (!athlete?.photos) return []
    const photoScroll = Math.max(0, scrollTop - (TEXT_REVEAL_PX + SLIDE_IN_PX))
    const FADE        = PHOTO_STEP_PX * 0.4

    return athlete.photos.map((_, i) => {
      let t
      if (i === 0) {
        // Prima foto: compare man mano che il cover sale (20%→100% del cover)
        t = easeInOut(clamp((coverT - 0.2) / 0.8, 0, 1))
      } else {
        // Foto successive: scroll-driven dopo che il cover è arrivato
        const start = (i - 1) * PHOTO_STEP_PX + PHOTO_STEP_PX
        t = easeInOut(clamp((photoScroll - start) / FADE, 0, 1))
      }
      return { opacity: t, blur: lerp(12, 0, t) }
    })
  })

  // ── Lock body scroll + cattura wheel per reveal testo e foto ─────────
  $effect(() => {
    if (!athlete) return
    document.body.style.overflow = 'hidden'

    const onWheel = (e) => {
      e.preventDefault()
      const maxScroll = TEXT_REVEAL_PX + SLIDE_IN_PX + (athlete?.photos?.length ?? 0) * PHOTO_STEP_PX + 300
      scrollTop = clamp(scrollTop + e.deltaY, 0, maxScroll)
    }
    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('wheel', onWheel)
      scrollTop = 0
    }
  })

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if athlete}
  <!-- Overlay -->
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
  >
      <!-- Visual panel -->
      <div class="sticky-panel">

        <!-- Subtle spotlight behind the text -->
        <div class="glow" aria-hidden="true"></div>

        <!-- Close button -->
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

        <!-- Cover unico che sale dal basso, poi le foto si dissolvono dentro -->
        {#if athlete.photos?.length}
          <div class="photo-cover" style:transform="translateY({coverY}vh)">
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
        {/if}

        <!-- Upper: name (left) + paragraphs (right) -->
        <div class="upper">

          <div class="left-panel">
            <h1 class="athlete-name">
              <span>{nameParts[0]}</span>
              <span>{nameParts[1]}</span>
            </h1>
            <p class="role">{athlete.role}</p>
          </div>

          <div class="right-panel">
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

<style>
  /* ── Overlay container ── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 500;
    background: var(--color-bg, #030404);
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
    opacity: 0.5;
    transition: opacity 0.2s;
    line-height: 0;
  }
  .close-btn:hover { opacity: 1; }

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
    padding: 120px 0 48px 45px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .athlete-name {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: clamp(56px, 9vw, 140px);
    font-weight: 500;
    color: var(--color-ink, #fafafa);
    line-height: 0.96;
    
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .role {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: 20px;
    font-weight: 400;
    color: #d3d5d8;
    
    line-height: 1.5;
    margin: 20px 0 0 0;
    padding-left: 4px;
  }

  /* ── Right panel ── */
  .right-panel {
    padding: calc(16.67vh) 70px 32px 0px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .para {
    font-family: var(--font-secondary, 'Geist'), sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: var(--color-ink, #fafafa);
    line-height: 1.5;
    letter-spacing: -0.019em;
    margin: 0;
    max-width: 576px;
    flex-shrink: 0;
  }

  /* ── Photo cover ── */
  .photo-cover {
    position: absolute;
    left: 50%;
    right: 60px;
    top: 16.67vh;
    bottom: 40px;
    max-width: 576px;
    will-change: transform;
    overflow: hidden;
    border-radius: 2px;
    z-index: 5;
  }

  .photo-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
    transition: opacity 0.1s ease;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .upper {
      grid-template-columns: 1fr;
    }
    .left-panel {
      padding: 90px 24px 0 24px;
    }
    .athlete-name {
      font-size: clamp(44px, 13vw, 90px);
    }
    .role {
      padding-left: 0;
      margin-top: 16px;
    }
    .right-panel {
      padding: 24px 24px 24px 24px;
    }
    .photo-item { height: 180px; }
  }
</style>
