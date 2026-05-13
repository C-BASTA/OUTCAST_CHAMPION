<script>
  import { fade, fly } from 'svelte/transition'

  const { dark = false, showLogo = true } = $props()

  let open = $state(false)

  const items = [
    { num: '01', label: 'Athlete',  href: '#athlete' },
    { num: '02', label: 'Helmet',   href: '#helmet' },
    { num: '03', label: 'Insight',  href: '#verdict' },
    { num: '',   label: 'About Us', href: '#about-us' },
  ]

  function toggle() { open = !open }
  function close()  { open = false }
</script>

<!-- ── Header bar (sempre visibile) ──────────────────────────── -->
<header class="nav-bar" class:dark class:hidden={open}>
  {#if showLogo}
    <span class="logo">Outcast Champion</span>
  {:else}
    <span class="logo" style="opacity:0; pointer-events:none;">Outcast Champion</span>
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

    <!-- Tasto chiudi (×) in alto a destra -->
    <button class="close-btn" onclick={close} aria-label="Chiudi menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
          in:fly={{ y: 32, delay: i * 55, duration: 360 }}
          out:fade={{ duration: 120 }}
        >
          {#if item.num}
            <span class="item-num">{item.num}</span>
          {/if}
          <span class="item-label">{item.label}</span>
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
    padding: 28px 48px;
    pointer-events: none;
    --ink: #030404;
    transition: opacity 0.2s;
  }
  .nav-bar.dark  { --ink: #fafafa; }
  .nav-bar.hidden { opacity: 0; pointer-events: none; }

  .logo {
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: var(--ink);
    letter-spacing: -0.01em;
    pointer-events: auto;
    user-select: none;
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
    /* Il backdrop blur sfoca il contenuto dietro */
    backdrop-filter: blur(36px) saturate(0.7);
    -webkit-backdrop-filter: blur(36px) saturate(0.7);
    background: rgba(250, 250, 250, 0.22);
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Tutto il contenuto spinto a destra */
    padding: 0 10vw 0 46vw;
  }

  /* tasto × */
  .close-btn {
    position: absolute;
    top: 28px;
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

  /* area cliccabile per chiudere toccando lo sfondo */
  .bg-close {
    position: absolute;
    inset: 0;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 0;
  }

  /* ── Voci menu ────────────────────────────────────────────── */
  .menu-nav {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .menu-item {
    display: flex;
    align-items: baseline;
    gap: 1.4rem;
    text-decoration: none;
    color: #030404;
    line-height: 1.05;
    cursor: pointer;
  }

  .item-num {
    font-family: var(--font-primary);     /* GeistPixel */
    font-size: clamp(13px, 1.3vw, 18px);
    font-weight: 400;
    opacity: 0.45;
    min-width: 2.4rem;
    padding-bottom: 0.1em;
  }

  .item-label {
    font-family: 'GeistPixel', monospace;
    font-size: clamp(52px, 8.5vw, 124px);
    font-weight: 400;
    letter-spacing: 0;
    transition: opacity 0.18s;
  }

  .menu-item:hover .item-label { opacity: 0.35; }

  /* "About Us" senza numero → nessun indent extra */
  .menu-item:last-child {
    padding-left: 0;
  }

  /* ── Footer overlay ───────────────────────────────────────── */
  .menu-footer {
    position: absolute;
    bottom: 28px;
    left: 48px;
    right: 48px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-secondary);
    font-size: 0.85rem;
    color: #030404;
    opacity: 0.5;
  }
</style>
