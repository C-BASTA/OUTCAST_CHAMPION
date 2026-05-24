<script>
  import { fade, fly } from 'svelte/transition'

  const { dark = false, overlayDark = false, showLogo = true } = $props()

  let open    = $state(false)
  let hovered = $state(null)

  // Blocca lo scroll del body quando overlay è aperto (runes mode)
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  const items = [
    { num: '01', label: 'Athlete',  href: '#athlete',     grid: false, sub: 'What has he achieved?',    img: '/images/athlete.png' },
    { num: '02', label: 'Helmet',   href: '#helmet-list', grid: false, sub: 'Why those faces?',         img: '/images/helmet.png' },
    { num: '03', label: 'Insight',  href: '#verdict',     grid: false, sub: "What's the full story?",  img: '/images/insight.png' },
    { num: '',   label: 'About us', href: '/about',       grid: true,  sub: null,                       img: null },
  ]

  function toggle() { open = !open }
  function close()  { open = false; hovered = null }
</script>

<!-- ── Header bar (sempre visibile) ──────────────────────────── -->
<header class="nav-bar" class:dark class:hidden={open}>
  {#if showLogo}
    <a class="logo" href="./">Outcast Champion</a>
  {:else}
    <a class="logo" href="./" style="opacity:0; pointer-events:none;">Outcast Champion</a>
  {/if}
  <button class="dots-btn" onclick={toggle} aria-label="Apri menu">
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden="true">
      <!-- riga 1 -->
      <rect x="0"  y="0"  width="2" height="2" fill="currentColor"/>
      <rect x="4"  y="0"  width="2" height="2" fill="currentColor"/>
      <rect x="8"  y="0"  width="2" height="2" fill="currentColor"/>
      <rect x="12" y="0"  width="2" height="2" fill="currentColor"/>
      <rect x="16" y="0"  width="2" height="2" fill="currentColor"/>
      <rect x="20" y="0"  width="2" height="2" fill="currentColor"/>
      <!-- riga 2 -->
      <rect x="0"  y="9"  width="2" height="2" fill="currentColor"/>
      <rect x="4"  y="9"  width="2" height="2" fill="currentColor"/>
      <rect x="8"  y="9"  width="2" height="2" fill="currentColor"/>
      <rect x="12" y="9"  width="2" height="2" fill="currentColor"/>
      <rect x="16" y="9"  width="2" height="2" fill="currentColor"/>
      <rect x="20" y="9"  width="2" height="2" fill="currentColor"/>
      <!-- riga 3 -->
      <rect x="0"  y="18" width="2" height="2" fill="currentColor"/>
      <rect x="4"  y="18" width="2" height="2" fill="currentColor"/>
      <rect x="8"  y="18" width="2" height="2" fill="currentColor"/>
      <rect x="12" y="18" width="2" height="2" fill="currentColor"/>
      <rect x="16" y="18" width="2" height="2" fill="currentColor"/>
      <rect x="20" y="18" width="2" height="2" fill="currentColor"/>
    </svg>
  </button>
</header>

<!-- ── Overlay a tutto schermo ────────────────────────────────── -->
{#if open}
  <div class="overlay" class:dark={overlayDark} transition:fade={{ duration: 260 }}>

    <!-- Logo in alto a sinistra -->
    <a class="overlay-logo" href="./" onclick={close}>Outcast Champion</a>

    <!-- Tasto chiudi (×) in alto a destra -->
    <button class="close-btn" onclick={close} aria-label="Chiudi menu">
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

    <!-- Click su sfondo chiude -->
    <button class="bg-close" onclick={close} aria-label="Chiudi"></button>

    <!-- Voci di menu -->
    <nav class="menu-nav">
      {#each items as item, i}
        <a
          class="menu-item"
          href={item.href}
          onclick={close}
          onmouseenter={() => hovered = item.label}
          onmouseleave={() => hovered = null}
          in:fly={{ y: 28, delay: i * 60, duration: 380 }}
          out:fade={{ duration: 110 }}
        >
          {#if item.img && hovered === item.label}
            <div class="hover-img" transition:fade={{ duration: 180 }}>
              <img src={item.img} alt={item.label} />
            </div>
          {/if}
          <span class="item-num">{item.num}</span>
          <span class="item-label" class:grid={item.grid}>{item.label}</span>
          {#if item.sub}
            <span class="item-sub" class:visible={hovered === item.label}>{item.sub}</span>
          {/if}
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
    color: var(--hex-neutral-900);
    transition: opacity 0.2s;
  }
  .nav-bar.dark   { color: var(--hex-neutral-50); }
  .nav-bar.hidden { opacity: 0; pointer-events: none; }

  .logo {
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: inherit;
    letter-spacing: -0.01em;
    pointer-events: auto;
    user-select: none;
    text-decoration: none;
  }

  .dots-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 0 4px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
  }

  /* ── Overlay ──────────────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 250;
    background: transparent;
    backdrop-filter: blur(28px) saturate(0.75);
    -webkit-backdrop-filter: blur(28px) saturate(0.75);
    color: var(--hex-neutral-900);
  }

  .overlay.dark {
    color: var(--hex-neutral-50);
  }

  /* Logo in overlay */
  .overlay-logo {
    position: absolute;
    top: 28px;
    left: var(--padding-lateral, 56px);
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: inherit;
    text-decoration: none;
    letter-spacing: -0.01em;
    z-index: 1;
    pointer-events: auto;
  }

  /* Tasto × */
  .close-btn {
    position: absolute;
    top: 28px;
    right: var(--padding-lateral);
    transform: translateX(4px);
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 0 4px;
    display: flex;
    align-items: center;
    z-index: 1;
  }

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
    gap: clamp(36px, 7vh, 72px);
    z-index: 1;
  }

  .menu-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  /* Numero: fisso, non si sposta all'hover */
  .item-num {
    font-family: var(--font-secondary);
    font-size: 36px;
    font-weight: 400;
    line-height: 1;
    min-width: 80px;
    flex-shrink: 0;
    transform: translateY(-20px);
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
    opacity: 0.6;
    transition: opacity 0.32s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .menu-item:hover .item-label {
    transform: translateX(18px);
  }

  .menu-item:hover .item-label.grid {
    transform: none;
    opacity: 1;
  }

  /* ── Hover image (left side) ─────────────────────────────── */
  .hover-img {
    position: absolute;
    left: -30vw;
    top: -20px;
    width: clamp(130px, 15vw, 210px);
    aspect-ratio: 3 / 4;
    overflow: hidden;
    z-index: 1;
    pointer-events: none;
  }

  .hover-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    filter: grayscale(1);
  }

  /* Sub-testo a destra della label, stesso livello del numero */
  .item-sub {
    font-family: var(--font-secondary);
    font-size: 0.88rem;
    white-space: nowrap;
    margin-left: 150px;
    
    transform: translateY(-20px);
    opacity: 0;
    transition: opacity 0.22s;
    flex-shrink: 0;
  }

  .item-sub.visible {
    opacity: 1;
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
    color: inherit;
    opacity: 0.5;
    z-index: 1;
    pointer-events: none;
  }
</style>
