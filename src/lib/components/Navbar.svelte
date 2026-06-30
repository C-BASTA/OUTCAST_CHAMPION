<script>
  import { onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'
  import AboutOverlay from './AboutOverlay.svelte'
  import { getLenis } from '$lib/lenis.js'

  const { dark = false, overlayDark = false, showLogo = true } = $props()

  let open      = $state(false)
  let aboutOpen = $state(false)
  let hovered   = $state(null)

  // Congela la pagina sotto quando un overlay è aperto: blocca lo scroll nativo
  // e ferma Lenis (lo smooth-scroll che ignora overflow:hidden).
  let locked = $derived(open || aboutOpen)
  $effect(() => {
    if (locked) {
      document.body.style.overflow = 'hidden'
      getLenis()?.stop()
    } else {
      document.body.style.overflow = ''
      getLenis()?.start()
    }
  })

  // Sicurezza: se la navbar viene distrutta mentre è bloccata, ripristina.
  onDestroy(() => {
    document.body.style.overflow = ''
    getLenis()?.start()
  })

  // Blocco extra a livello di evento: con il solo menu aperto nessuno scroller
  // (Lenis incluso) deve ricevere wheel/touch. Quando l'About è aperto NON
  // blocchiamo, così l'overlay può gestire il proprio wheel per gli step.
  $effect(() => {
    if (!(open && !aboutOpen)) return
    const block = (e) => {
      if (e.cancelable) e.preventDefault()
      e.stopImmediatePropagation()
    }
    window.addEventListener('wheel', block, { passive: false, capture: true })
    window.addEventListener('touchmove', block, { passive: false, capture: true })
    return () => {
      window.removeEventListener('wheel', block, { capture: true })
      window.removeEventListener('touchmove', block, { capture: true })
    }
  })

  const items = [
    { num: '01', label: 'Athlete',  href: '#athlete',     grid: false, sub: 'What has he achieved?',    img: '/images/athlete.png' },
    { num: '02', label: 'Helmet',   href: '#helmet-list', grid: false, sub: 'Why those faces?',         img: '/images/helmet.png' },
    { num: '03', label: 'Insight',  href: '#verdict',     grid: false, sub: "What's the full story?",  img: '/images/insight.png' },
    { num: '',   label: 'About us', href: '/about',       grid: true,  sub: null,                       img: null, overlay: true },
  ]

  // Il bottone è uno solo: × chiude prima l'About (tornando al menu), poi il menu.
  function toggle() {
    if (aboutOpen) { aboutOpen = false; return }
    open = !open
  }
  function close()  { open = false; aboutOpen = false; hovered = null }

  // "About us" apre un overlay sopra al menu invece di navigare: il menu
  // sottostante resta nel suo stato.
  function onItemClick(e, item) {
    if (item.overlay) {
      e.preventDefault()
      aboutOpen = true
    } else {
      close()
    }
  }
</script>

<!--
  Un unico albero: l'header resta sempre montato; l'overlay compare/scompare
  tramite la classe .open su .nav-root (niente ricreazione di logo/bottone).
-->
<div class="nav-root" class:open class:about-open={aboutOpen} class:overlay-dark={overlayDark}>

  <!-- ── Header bar (sempre visibile) ──────────────────────────── -->
  <header class="nav-bar" class:dark>
    {#if showLogo}
      <a class="logo" href="./">Outcast Champion</a>
    {:else}
      <a class="logo" href="./" style="opacity:0; pointer-events:none;">Outcast Champion</a>
    {/if}

    <!-- Un solo bottone: l'icona passa da "punti" a "×" quando un overlay è aperto -->
    <button
      class="dots-btn"
      onclick={toggle}
      aria-label={open || aboutOpen ? 'Chiudi' : 'Apri menu'}
      aria-expanded={open || aboutOpen}
    >
      {#if open || aboutOpen}
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
      {:else}
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
      {/if}
    </button>
  </header>

  <!-- ── Overlay a tutto schermo (visibilità gestita da .nav-root.open) ── -->
  <div class="overlay">

    <!-- Click su sfondo chiude -->
    <button class="bg-close" onclick={close} aria-label="Chiudi" tabindex="-1"></button>

    <!-- Voci di menu -->
    <nav class="menu-nav">
      {#each items as item}
        <a
          class="menu-item"
          href={item.href}
          onclick={(e) => onItemClick(e, item)}
          onmouseenter={() => hovered = item.label}
          onmouseleave={() => hovered = null}
        >
          {#if item.img && hovered === item.label}
            <div class="hover-img" transition:fade={{ duration: 300 }}>
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

    

  </div>

  <!-- ── About: overlay extra sopra al menu (il menu resta nel suo stato) ── -->
  {#if aboutOpen}
    <AboutOverlay />
  {/if}
</div>

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
    transition: color 0.2s;
  }
  .nav-bar.dark { color: var(--hex-neutral-50); }

  /* Quando il menu è aperto l'header adotta il tema dell'overlay */
  .nav-root.open .nav-bar              { color: var(--hex-neutral-900); }
  .nav-root.open.overlay-dark .nav-bar { color: var(--hex-neutral-50); }
  /* About è sempre su sfondo chiaro: forza l'header scuro per restare leggibile.
     Stessa specificità di .open.overlay-dark ma dichiarata dopo → vince. */
  .nav-root.open.about-open .nav-bar   { color: var(--hex-neutral-900); }

  .logo {
    font-family: var(--font-primary);
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    pointer-events: auto;
    user-select: none;
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
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.26s ease, visibility 0.26s ease;
  }
  .nav-root.overlay-dark .overlay { color: var(--hex-neutral-50); }
  .nav-root.open .overlay {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
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
    cursor: pointer;
    /* Entrata staggerata, guidata dalla classe .open (sostituisce in:fly) */
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.38s ease, transform 0.38s ease;
  }
  .nav-root.open .menu-item { opacity: 1; transform: translateY(0); }
  .nav-root.open .menu-item:nth-child(1) { transition-delay: 0ms; }
  .nav-root.open .menu-item:nth-child(2) { transition-delay: 60ms; }
  .nav-root.open .menu-item:nth-child(3) { transition-delay: 120ms; }
  .nav-root.open .menu-item:nth-child(4) { transition-delay: 180ms; }

  /* Numero: fisso, non si sposta all'hover */
  .item-num {
    font-family: 'GeistPixel-Square';
    font-size: 36px;
    font-weight: 400;
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
    transform: translateX(10px);
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
    filter: grayscale(1);
  }

  /* Sub-testo a destra della label, stesso livello del numero */
  .item-sub {
    font-family: 'GeistPixel-Square';
    font-size: 0.88rem;
    white-space: nowrap;
    margin-left: 150px;

    transform: translateY(-20px);
    opacity: 0;
    transition: opacity 0.4s;
    flex-shrink: 0;
  }

  .item-sub.visible {
    opacity: 1;
  }

  /* ── Footer overlay ───────────────────────────────────────── */

  /* ── Mobile: menu a tutta larghezza, niente tagli a destra ──── */
  @media (max-width: 768px) {
    .menu-nav {
      left: 24px;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      gap: clamp(28px, 5vh, 52px);
    }

    .menu-item {
      align-items: flex-start;
    }

    .item-num {
      font-size: 20px;
      min-width: 40px;
      transform: translateY(-8px);
    }

    .item-label {
      font-size: clamp(38px, 13vw, 60px);
    }

    /* Niente hover su touch: sub e immagine non servono e causavano l'overflow */
    .item-sub { display: none; }
    .hover-img { display: none; }

    /* "About us" già a piena opacità; nessuno spostamento all'hover su mobile */
    .item-label.grid { opacity: 1; }
    .menu-item:hover .item-label,
    .menu-item:hover .item-label.grid {
      transform: none;
    }
  }

</style>
