<script>
  let { athlete, onClose } = $props()

  let overlayEl = $state(null)
  let scrollTop  = $state(0)

  // ── Scroll constants ──────────────────────────────────────────────
  const TEXT_REVEAL_PX = 600   // px of overlay-internal scroll to clear all text
  const PHOTO_PAN_PX   = 400   // px for photo horizontal pan
  const TOTAL_EXTRA_PX = TEXT_REVEAL_PX + PHOTO_PAN_PX

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

  // ── Photos: start shifted right, slide to position on scroll ─────
  let photosTranslateX = $derived.by(() => {
    const start = TEXT_REVEAL_PX * 0.35
    const t     = easeInOut(clamp((scrollTop - start) / PHOTO_PAN_PX, 0, 1))
    return lerp(130, 0, t)
  })

  // ── Lock body scroll while overlay is open ────────────────────────
  $effect(() => {
    if (athlete) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  })

  // ── Scroll handler ────────────────────────────────────────────────
  function handleScroll() {
    scrollTop = overlayEl?.scrollTop ?? 0
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if athlete}
  <!-- Scrollable overlay -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    bind:this={overlayEl}
    on:scroll={handleScroll}
  >
    <!-- Scroll track: provides the extra scrollable height -->
    <div class="scroll-track" style="height: calc(100vh + {TOTAL_EXTRA_PX}px)">

      <!-- Sticky visual panel -->
      <div class="sticky-panel">

        <!-- Subtle spotlight behind the text -->
        <div class="glow" aria-hidden="true"></div>

        <!-- Close button -->
        <button class="close-btn" on:click={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" stroke-width="1.5"/>
            <line x1="17" y1="3" x2="3"  y2="17" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>

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

            <!-- Photos below paragraphs, in the right column -->
            <div class="photos-strip">
              <div
                class="photos-track"
                style:transform="translateX({photosTranslateX}px)"
              >
                {#each athlete.photos as photo, i}
                  <div class="photo-frame">
                    <img src={photo} alt="{athlete.name} {i + 1}" />
                  </div>
                {/each}
              </div>
            </div>
          </div>

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
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: none;
    animation: overlay-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .overlay::-webkit-scrollbar { display: none; }

  @keyframes overlay-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Scroll track ── */
  .scroll-track {
    position: relative;
    width: 100%;
    /* height set inline */
  }

  /* ── Sticky panel ── */
  .sticky-panel {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 100%;
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
    justify-content: space-between;
  }

  .athlete-name {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: clamp(72px, 13vw, 200px);
    font-weight: 500;
    color: var(--color-ink, #fafafa);
    line-height: 0.96;
    letter-spacing: -0.019em;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .role {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: 20px;
    font-weight: 400;
    color: #d3d5d8;
    letter-spacing: -0.019em;
    line-height: 1.5;
    margin: 0;
    padding-left: 13px;   /* 58px from edge - 45px panel padding */
  }

  /* ── Right panel ── */
  .right-panel {
    padding: calc(16.67vh) 60px 32px 10px;
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

  /* ── Photos strip (inside right panel, below paragraphs) ── */
  .photos-strip {
    flex-shrink: 0;
    height: 220px;
    overflow: hidden;
    margin-top: 8px;
  }

  .photos-track {
    display: flex;
    gap: 14px;
    height: 100%;
    will-change: transform;
  }

  .photo-frame {
    flex-shrink: 0;
    width: 175px;
    height: 100%;
    overflow: hidden;
    border-radius: 2px;
  }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    mix-blend-mode: luminosity;
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
      font-size: clamp(56px, 18vw, 100px);
    }
    .role {
      padding-left: 0;
      margin-top: 12px;
    }
    .right-panel {
      padding: 24px 24px 24px 24px;
    }
    .photos-strip { height: 180px; }
    .photo-frame  { width: 140px; }
  }
</style>
