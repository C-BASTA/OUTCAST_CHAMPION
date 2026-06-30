<script>
  import { TEAM, PARAS, QUESTIONS, ABOUT_STEP_PX } from '$lib/data/about.js'

  const MAX_STEP = QUESTIONS.length - 1
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

  // Scroll-locked overlay: body scroll is frozen by the menu, so we drive the
  // step from our own wheel handler instead of window.scrollY.
  let scrollPos = $state(0)
  let step      = $derived(Math.min(MAX_STEP, Math.floor(scrollPos / ABOUT_STEP_PX)))
  let question  = $derived(QUESTIONS[step] ?? 'The team')
  let showTeam  = $derived(step === MAX_STEP)
  let activeIdx = $derived(Math.min(PARAS.length - 1, step))

  // Su mobile non c'è il wheel: l'overlay diventa una pagina scrollabile come il
  // regolamento (tutti i paragrafi + team visibili, scroll nativo).
  let isMobile = $state(false)
  $effect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => (isMobile = mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  })

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
</script>

<div class="about-overlay">
  <div class="layout">

    <aside class="left-col">
      <h1 class="about-title">About<br/>us</h1>
      <p class="question-label">{question}</p>
    </aside>

    <main class="right-col">

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

      <!-- Team: appare all'ultimo step (sempre visibile e in flusso su mobile) -->
      <div class="team-block" class:visible={showTeam || isMobile}>
        <ul class="team-list">
          {#each TEAM as name}
            <li>{name}</li>
          {/each}
        </ul>
      
      </div>
  <!-- Footer -->
    <footer class="menu-footer">
      <span>@Politecnico di Milano</span>
      <span>Corso di Digital e Web Design</span>
    </footer>
    </main>

  </div>
</div>

<style>
  /* Opaco, copre il menu sottostante ma resta SOTTO l'header della navbar
     (z-index 300) così il bottone × resta cliccabile per chiudere. */
  .about-overlay {
    position: fixed;
    inset: 0;
    z-index: 280;
    background: #fafafa;
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
    font-family: var(--font-primary, monospace);
    font-size: clamp(17px, 1.1vw, 16px);
    color: #030404;
    
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
    font-family: var(--font-secondary);
    font-size: 0.875rem;
    color: inherit;
  opacity: 0.8;
    z-index: 1;
    pointer-events: none;
    position: fixed;
  
   

   
    
  }

  /* ── Mobile ──────────────────────────────────── */
  @media (max-width: 768px) {
    /* Pagina scrollabile come il regolamento: tutto il contenuto in flusso */
    .about-overlay {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }

    .layout {
      flex-direction: column;
      padding: 96px 24px 40px;
      flex: 0 0 auto;
      overflow: visible;
    }

    .left-col {
      width: 100%;
      padding-left: 0;
      padding-bottom: 24px;
      flex: 0 0 auto;
    }

    .about-title { font-size: clamp(64px, 18vw, 110px); }

    .right-col {
      padding-right: 0;
      padding-top: 32px;
      padding-bottom: 0;
      overflow: visible;
    }

    .text-stack { overflow: visible; }

    /* Il blocco team scorre dopo i paragrafi invece di essere sovrapposto */
    .team-block {
      position: static;
      inset: auto;
      opacity: 1;
      pointer-events: auto;
      padding: 40px 0 0;
      transition: none;
    }

    .team-list li { font-size: clamp(16px, 4.5vw, 20px); }

    /* Footer in flusso a fine pagina, non più fixed sopra il contenuto */
    .menu-footer {
      position: static;
      margin-top: 48px;
      flex-direction: column;
      gap: 4px;
      pointer-events: auto;
    }
  }
</style>
