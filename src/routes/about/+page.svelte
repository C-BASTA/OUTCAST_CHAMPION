<script>
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { cubicOut } from 'svelte/easing'

  const TEAM = [
    'Alice Augusti',
    'Tommaso Barazzetta',
    'Beatrice Bellettini',
    'Alice Calabrese',
    'Stefano Lorini',
    'Chiara Mazzoni',
  ]

  const PARAS = [
    'We are a team of six Undergraduate Communication Design students from Politecnico di Milano.',
    "We believe design is more than just making things look good—it's a way to give a voice to stories that actually matter. By decoding the Milano Cortina 2026 events, we aimed to create an immersive digital experience to make sure that crucial details aren't lost in the media noise.",
    "This platform is an analytical tool. After uncovering the Heraskevych case, we've created a digital archive that balances data and human emotion. We've reconstructed the biography, the legal battle, and the silenced stories into a cohesive digital journey. No fluff, no filters.",
    "Through a clean, user-centric experience, we challenge you to look past the scoreboard and think critically about the role of the athlete in a world that often demands their silence.",
  ]

  // 4 step: 0=nomi, 1=who text, 2=+what, 3=+how, 4=+why
  const STEP_PX   = 700
  const QUESTIONS = ['Who?', 'Who?', 'What?', 'How?', 'Why?']

  let step = $state(0)
  let question  = $derived(QUESTIONS[step] ?? 'Why?')
  // Para 1 visibile da subito (step 0), poi uno per uno
  let visibleParas = $derived(PARAS.slice(0, Math.max(1, step)))

  onMount(() => {
    const onScroll = () => {
      step = Math.min(4, Math.floor(window.scrollY / STEP_PX))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<!-- Spacer: rende la pagina scrollabile senza spostare il contenuto -->
<div class="scroll-spacer"></div>

<!-- Contenuto fisso a tutto schermo -->
<div class="page-root">

  <header class="about-header">
    <span></span>
    <span class="polimi-label">@Politecnico di Milano</span>
    <a href="/" class="back-dots" aria-label="Torna alla home">
      <svg width="28" height="6" viewBox="0 0 28 6" fill="none">
        <circle cx="3"  cy="3" r="2.5" fill="#030404"/>
        <circle cx="14" cy="3" r="2.5" fill="#030404"/>
        <circle cx="25" cy="3" r="2.5" fill="#030404"/>
      </svg>
    </a>
  </header>

  <div class="layout">

    <!-- Sinistra: About Us + domanda corrente -->
    <aside class="left-col">
      <h1 class="about-title">About<br/>Us</h1>
      <p class="question-label">{question}</p>
    </aside>

    <!-- Destra: contenuto che si accumula -->
    <main class="right-col">

      <!-- Nomi: visibili solo allo step 0, poi scompaiono -->
      <div class="names-block" class:gone={step > 0}>
        <ul class="names-list">
          {#each TEAM as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>

      <!-- Testi che si accumulano: flip anima lo spostamento dei paragrafi esistenti -->
      <div class="text-stack">
        {#each visibleParas as para, i (i)}
          <p class="body-text"
             animate:flip={{ duration: 700, easing: cubicOut }}
             in:fly={{ y: 50, duration: 850, easing: cubicOut }}
             out:fly={{ y: 50, duration: 500, easing: cubicOut }}>
            {para}
          </p>
        {/each}
      </div>

    </main>

  </div>
</div>

<style>
  /* Spacer che abilita lo scroll: 4 step × 700px + 100vh per raggiungere l'ultimo step */
  .scroll-spacer {
    height: calc(4 * 700px + 100vh);
    pointer-events: none;
  }

  /* Contenuto fisso che non si sposta mai */
  .page-root {
    position: fixed;
    inset: 0;
    background: #fafafa;
    color: #030404;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ──────────────────────────────────── */
  .about-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 44px 0;
    flex-shrink: 0;
  }

  .polimi-label {
    font-family: var(--font-primary, monospace);
    font-size: 0.85rem;
    color: #030404;
    opacity: 0.55;
  }

  .back-dots {
    display: flex;
    align-items: center;
    opacity: 0.65;
    transition: opacity 0.18s;
  }
  .back-dots:hover { opacity: 0.3; }

  /* ── Layout due colonne ──────────────────────── */
  .layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 0 44px;
    gap: 0;
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
    line-height: 1.0;
    color: #030404;
    flex: 1;
  }

  .question-label {
    font-family: var(--font-primary, monospace);
    font-size: clamp(13px, 1.1vw, 16px);
    color: #030404;
    opacity: 0.65;
    letter-spacing: 0.02em;
    transition: opacity 0.2s ease;
    padding-bottom: 8px;
  }

  /* ── Destra ──────────────────────────────────── */
  .right-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-top: 32px;
    padding-right: calc(10% - 44px);
    padding-bottom: 160px;
    overflow: hidden;
    position: relative;
  }

  /* Nomi: assoluti in alto, escono verso l'alto */
  .names-block {
    position: absolute;
    top: 68px;
    left: 0;
    right: calc(10% - 44px);
    opacity: 1;
    transform: translateY(0);
    transition: transform 0.55s ease, opacity 0.45s ease;
  }

  .names-block.gone {
    transform: translateY(-40px);
    opacity: 0;
    pointer-events: none;
  }

  .names-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .names-list li {
    font-family: var(--font-primary, monospace);
    font-size: clamp(15px, 1.5vw, 20px);
    color: #030404;
    line-height: 1.75;
  }

  /* Stack di testi: ancorato al fondo, cresce verso l'alto */
  .text-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: hidden;
    padding-bottom: 8px;
  }

  /* Scrollbar invisibile */
  .text-stack::-webkit-scrollbar { display: none; }
  .text-stack { scrollbar-width: none; }

  .body-text {
    font-family: var(--font-primary, monospace);
    font-size: clamp(13px, 1.25vw, 17px);
    color: #030404;
    line-height: 1.8;
    max-width: 500px;
    margin: 0;
  }

  /* ── Mobile ──────────────────────────────────── */
  @media (max-width: 768px) {
    .scroll-spacer { height: calc(4 * 500px + 100vh); }
    .layout { flex-direction: column; padding: 0 24px 40px; }
    .left-col { width: 100%; padding-left: 0; padding-bottom: 24px; flex: 0 0 auto; }
    .about-title { font-size: clamp(64px, 18vw, 110px); }
    .right-col { padding-right: 0; padding-bottom: 40px; }
    .names-block { position: relative; top: 0; margin-bottom: 24px; }
  }
</style>
