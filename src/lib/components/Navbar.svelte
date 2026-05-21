<script>
  import { fade, fly } from 'svelte/transition'

  const { dark = false, showLogo = true } = $props()

  let open = $state(false)

  // Blocca lo scroll del body quando overlay è aperto (runes mode)
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  const items = [
    { num: '01', label: 'Athlete',  href: '#athlete', grid: false },
    { num: '02', label: 'Helmet',   href: '#helmet-list', grid: false },
    { num: '03', label: 'Insight',  href: '#verdict', grid: false },
    { num: '',   label: 'About us', href: '/about',   grid: true  },
  ]

  function toggle() { open = !open }
  function close()  { open = false }
</script>

<!-- ── Header bar (sempre visibile) ──────────────────────────── -->
<header class="nav-bar" class:dark class:hidden={open}>
  {#if showLogo}
    <a class="logo" href="./">Outcast Champion</a>
  {:else}
    <a class="logo" href="./" style="opacity:0; pointer-events:none;">Outcast Champion</a>
  {/if}
  <button class="dots-btn" onclick={toggle} aria-label="Apri menu">
    <svg width="28" height="6" viewBox="0 0 28 6" fill="none" aria-hidden="true">
      <circle cx="3"  cy="3" r="2.5" fill="currentColor"/>
      <circle cx="14" cy="3" r="2.5" fill="currentColor"/>
      <circle cx="25" cy="3" r="2.5" fill="currentColor"/>
    </svg>
  </button>
</header>

<!-- ── Overlay a tutto schermo ────────────────────────────────── -->
{#if open}
  <div class="overlay" transition:fade={{ duration: 260 }}>

    <!-- Logo in alto a sinistra -->
    <a class="overlay-logo" href="./" onclick={close}>Outcast Champion</a>

    <!-- Tasto chiudi (×) in alto a destra -->
    <button class="close-btn" onclick={close} aria-label="Chiudi menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="21" y1="3" x2="3"  y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Click su sfondo chiude -->
    <button class="bg-close" onclick={close} aria-label="Chiudi"></button>

    <!-- Voci di menu -->
    <nav class="menu-nav">
      {#each items as item, i}
        <a
          class="menu-item"
          href={item.href}
          onclick={close}
          in:fly={{ y: 28, delay: i * 60, duration: 380 }}
          out:fade={{ duration: 110 }}
        >
          <span class="item-num">{item.num}</span>
          <span class="item-label" class:grid={item.grid}>{item.label}</span>
        </a>
      {/each}
    </nav>

    <!-- Footer -->
    <footer class="menu-footer">
      <span>@Politecnico di Milano</span>
      <span>Corso di Digital e Web Design</span>
    </footer>

  </div>
{/if}

<style>
  /* ── Header bar ───────────────────────────────────────────── */
  .nav-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px var(--padding-lateral);
    pointer-events: none;
    --ink: #030404;
    transition: opacity 0.2s;
  }
  .nav-bar.dark   { --ink: #fafafa; }
  .nav-bar.hidden { opacity: 0; pointer-events: none; }

  .logo {
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: var(--ink);
    letter-spacing: -0.01em;
    pointer-events: auto;
    user-select: none;
    text-decoration: none;
  }

  .dots-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 6px 4px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
  }
  .dots-btn:hover { opacity: 0.45; }

  /* ── Overlay ──────────────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 250;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(28px) saturate(0.75);
    -webkit-backdrop-filter: blur(28px) saturate(0.75);
  }

  /* Logo in overlay */
  .overlay-logo {
    position: absolute;
    top: 28px;
    left: var(--padding-lateral, 56px);
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: #030404;
    text-decoration: none;
    letter-spacing: -0.01em;
    z-index: 1;
    pointer-events: auto;
  }

  /* Tasto × */
  .close-btn {
    position: absolute;
    top: 22px;
    right: 44px;
    background: none;
    border: none;
    cursor: pointer;
    color: #030404;
    padding: 6px;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
    z-index: 1;
  }
  .close-btn:hover { opacity: 0.4; }

  /* Area cliccabile per chiudere lo sfondo */
  .bg-close {
    position: absolute;
    inset: 0;
    background: none;
    border: none;
    cursor: default;
    z-index: 0;
  }

  /* ── Menu nav ─────────────────────────────────────────────── */
  .menu-nav {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: clamp(28px, 5.5vh, 56px);
    z-index: 1;
  }

  .menu-item {
    display: flex;
    align-items: baseline;
    text-decoration: none;
    color: #030404;
    cursor: pointer;
  }

  /* Numero: fisso, non si sposta all'hover */
  .item-num {
    font-family: var(--font-secondary);
    font-size: 36px;
    font-weight: 400;
    line-height: 1.12;
    min-width: 64px;
    flex-shrink: 0;
    /* nessuna transition: rimane fermo */
  }

  /* Label: si sposta a destra all'hover */
  .item-label {
    font-family: 'GeistPixel-Square', monospace;
    font-size: clamp(52px, 5.3vw, 80px);
    font-weight: 400;
    line-height: 1.12;
    letter-spacing: 0;
    white-space: nowrap;
    transition: transform 0.32s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  /* About Us usa GeistPixel-Grid (font pixel outline) */
  .item-label.grid {
    font-family: var(--font-primary);
  }

  .menu-item:hover .item-label {
    transform: translateX(18px);
  }

  /* ── Footer overlay ───────────────────────────────────────── */
  .menu-footer {
    position: absolute;
    bottom: 28px;
    left: var(--padding-lateral, 56px);
    right: var(--padding-lateral, 56px);
    display: flex;
    justify-content: space-between;
    font-family: var(--font-secondary);
    font-size: 0.875rem;
    color: #030404;
    opacity: 0.5;
    z-index: 1;
    pointer-events: none;
  }
</style>
