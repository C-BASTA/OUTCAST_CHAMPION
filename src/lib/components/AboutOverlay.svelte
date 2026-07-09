<script>
  import { TEAM, PARAS, QUESTIONS, ABOUT_STEP_PX } from '$lib/data/about.js'

  const MAX_STEP = QUESTIONS.length +6
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

  // Desktop: lo step è pilotato dal wheel (lo scroll del body è bloccato dal menu).
  // Mobile: titolo + label restano fissi e i paragrafi scrollano in .right-col;
  // uno scroll-spy aggiorna lo step (e quindi la domanda) quando un paragrafo appare.
  let isMobile = $state(false)
  let scrollEl = $state()

  let scrollPos   = $state(0)
  let mobileStep  = $state(0)
  let desktopStep = $derived(Math.min(MAX_STEP, Math.floor(scrollPos / ABOUT_STEP_PX)))
  let step      = $derived(isMobile ? mobileStep : desktopStep)
  let question  = $derived(QUESTIONS[step] ?? 'The team')
  let showTeam  = $derived(step === MAX_STEP)
  let activeIdx = $derived(Math.min(PARAS.length - 1, step))

  $effect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => (isMobile = mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  })

  // Desktop: wheel → step
  $effect(() => {
    if (isMobile) return
    const max = MAX_STEP * ABOUT_STEP_PX + 200
    const onWheel = (e) => {
      e.preventDefault()
      scrollPos = clamp(scrollPos + e.deltaY, 0, max)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  })

  // Mobile: scroll-spy → la label cambia quando il paragrafo corrispondente
  // (o il blocco team, ultimo step) supera la linea di riferimento.
  $effect(() => {
    if (!isMobile || !scrollEl) return
    // Ogni paragrafo = altezza esatta del pannello → se ne vede uno per volta
    const setSlideH = () => scrollEl.style.setProperty('--slide-h', scrollEl.clientHeight + 'px')
    const onScroll = () => {
      const max = scrollEl.scrollHeight - scrollEl.clientHeight
      // Estremi netti: in cima "Who?", in fondo "The team"
      if (scrollEl.scrollTop <= 2) { mobileStep = 0; return }
      if (max > 0 && scrollEl.scrollTop >= max - 2) { mobileStep = MAX_STEP; return }

      const items = [
        ...scrollEl.querySelectorAll('.body-text'),
        scrollEl.querySelector('.team-block'),
      ].filter(Boolean)
      const refY = scrollEl.getBoundingClientRect().top + scrollEl.clientHeight * 0.3
      let active = 0
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= refY) active = i
      })
      mobileStep = active
    }
    setSlideH()
    onScroll()
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', setSlideH)
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', setSlideH)
    }
  })
</script>

<div class="about-overlay">
  <div class="layout">

    <aside class="left-col">
      <h1 class="about-title">About<br/>us</h1>
      <p class="question-label">{question}</p>
    </aside>

    <main class="right-col" bind:this={scrollEl} data-lenis-prevent>

      <!-- Paragrafi: si nascondono quando appare il team (solo desktop) -->
      <div class="text-stack" class:hidden={showTeam && !isMobile}>
        {#each PARAS as para, i}
          {@const dist    = i - activeIdx}
          {@const blurPx  = showTeam ? 48 : (dist > 0 ? dist * 6 : 0)}
          {@const opacity = showTeam ? 0  : (dist === 0 ? 1 : dist > 0 ? Math.max(0.15, 1 - dist * 0.32) : 1)}
          <p class="body-text" style="filter: blur({isMobile ? 0 : blurPx}px); opacity: {isMobile ? 1 : opacity};">
            {para}
          </p>
        {/each}
      </div>

      <!-- Ultima schermata su mobile: team (il footer è fuori, sempre fisso) -->
      <div class="last-screen">
        <!-- Team: appare all'ultimo step (sempre visibile e in flusso su mobile) -->
        <div class="team-block" class:visible={showTeam || isMobile}>
          <ul class="team-list">
            {#each TEAM as name}
              <li>{name}</li>
            {/each}
          </ul>
        </div>
      </div>
    </main>

  </div>

  <!-- Footer: figlio diretto dell'overlay fisso → sempre visibile e ancorato in
       fondo, sia desktop che mobile (robusto anche su iOS, fuori dallo scroll) -->
  <footer class="menu-footer">
    <span>@Politecnico di Milano</span>
    <span>Corso di Digital e Web Design</span>
  </footer>
</div>

<style>
  /* Opaco, copre il menu sottostante ma resta SOTTO l'header della navbar
     (z-index 300) così il bottone × resta cliccabile per chiudere. */
  .about-overlay {
    position: fixed;
    inset: 0;
    z-index: 280;
    background: rgba(250, 250, 250, 0.96);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    color: #030404;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Layout ──────────────────────────────────── */
  .layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 96px 44px 0;   /* top spazio per logo/× della navbar */
  }

  /* ── Sinistra ────────────────────────────────── */
  .left-col {
    width: 50%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding-left: calc(10% - 44px);
    padding-top: 32px;
    padding-bottom: 200px;
  }

  .about-title {
    font-family: var(--font-primary, monospace);
    font-size: clamp(80px, 11vw, 150px);
    font-weight: 400;
    color: neutral-900;
  }

  .question-label {
    font-family: 'GeistPixel-Square';
    font-size: clamp(17px, 1.1vw, 16px);
    color: neutral-900;
    
    letter-spacing: 0.02em;
    padding-bottom: 8px;
    margin-top: 80px;
    transition: opacity 0.3s ease;
  }

  /* ── Destra ──────────────────────────────────── */
  .right-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 72px;
    padding-right: calc(10% - 44px);
    padding-bottom: 60px;
    overflow: hidden;
    position: relative;
  }

  /* Stack testi */
  .text-stack {
    display: flex;
    flex-direction: column;
    gap: 28px;
    overflow: hidden;
  }

  .text-stack.hidden {
    pointer-events: none;
  }

  .team-block {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-top: 72px;
    padding-right: calc(10% - 44px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease 0s;
  }
  .team-block.visible {
    opacity: 1;
    pointer-events: auto;
    transition: opacity 0.5s ease 0.3s;
  }

  .team-list {
    list-style: none;
  }
  .team-list li {
    font-family: var(--font-primary, monospace);
    font-size: clamp(15px, 1.5vw, 20px);
    color: neutral-900;
  }

  .body-text {
    font-family: var(--font-primary, monospace);
    font-size: clamp(13px, 1.25vw, 17px);
    color: #030404;
    max-width: 500px;
    transition: filter 1.6s ease, opacity 0.35s ease;
  }

   .menu-footer {
   
    bottom: 28px;
    left: var(--padding-lateral, 56px);
    right: var(--padding-lateral,32px);
    display: flex;
    justify-content: space-between;
    font-family: 'GeistPixel-Square';
    font-size: 0.875rem;
    color: inherit;
  opacity: 0.8;
    z-index: 1;
    pointer-events: none;
    position: fixed;
  
   

   
    
  }

  /* ── Mobile ──────────────────────────────────── */
  @media (max-width: 768px) {
    /* Titolo + label fissi in alto; scrolla solo .right-col */
    .about-overlay { overflow: hidden; }

    .layout {
      flex-direction: column;
      padding: 92px 24px 0;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .left-col {
      width: 100%;
      flex: 0 0 auto;
      padding-left: 0;
      padding-top: 0;
      padding-bottom: 12px;
    }

    .about-title { font-size: clamp(58px, 16.5vw, 104px); }

    .question-label {
      margin-top: 28px;
      font-size: clamp(16px, 4.6vw, 22px);
    }

    /* Area scrollabile dei paragrafi + team, uno per schermata */
    .right-col {
      flex: 1 1 auto;
      min-height: 0;
      padding: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: y mandatory;
    }

    .text-stack {
      overflow: visible;
      gap: 0;
    }

    /* Ogni paragrafo riempie il pannello: se ne vede uno per volta, spaziatura uniforme */
    .body-text {
      font-size: clamp(15px, 4.3vw, 18px);
      line-height: 1.5;
      max-width: none;
      min-height: var(--slide-h, 72vh);
      display: flex;
      /* Prima riga allineata in alto: tutti i paragrafi iniziano alla stessa
         altezza, a prescindere dalla loro lunghezza. */
      align-items: flex-start;
      padding-top: 4vh;
      /* Spazio in fondo per il footer fisso */
      padding-bottom: 9vh;
      scroll-snap-align: center;
    }

    /* Ultima schermata: team + footer, una sola scermata come i paragrafi */
    .last-screen {
      min-height: var(--slide-h, 72vh);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 32px;
      /* Come i paragrafi: alzato e con spazio per il footer fisso */
      padding-bottom: 9vh;
      scroll-snap-align: center;
    }

    /* Il blocco team scorre dopo i paragrafi invece di essere sovrapposto */
    .team-block {
      position: static;
      inset: auto;
      opacity: 1;
      pointer-events: auto;
      padding: 0;
      transition: none;
    }

    .team-list li { font-size: clamp(16px, 4.5vw, 20px); }

    /* Footer sempre visibile, fisso in fondo: una frase a sinistra, una a destra.
       Banda a tutta larghezza dello stesso colore dello sfondo (#fafafa): invisibile
       ma maschera i paragrafi che scorrono dietro; padding-bottom lo stacca dal
       bordo inferiore del telefono (+ safe-area per il notch/home bar). */
    .menu-footer {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      margin-top: 0;
      background: #fafafa;
      padding: 16px 24px calc(8px + env(safe-area-inset-bottom, 0px));
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
      gap: 10px;
      /* Su una riga ciascuna, così stanno affiancate anche su schermi stretti.
         Leggermente più grandi. Se su schermi molto stretti si sovrappongono,
         abbassa il fattore vw (es. 2.4vw). */
      font-size: clamp(0.64rem, 2.9vw, 0.88rem);
      white-space: nowrap;
      color: rgba(3, 4, 4, 0.8);
      opacity: 1;
      pointer-events: none;
    }
  }
</style>
