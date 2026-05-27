<script>
  import { onMount } from 'svelte'

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

  const STEP_PX   = 700
  const QUESTIONS = ['Who?', 'What?', 'How?', 'Why?', 'The team']
  const MAX_STEP  = QUESTIONS.length - 1

  let step      = $state(0)
  let question  = $derived(QUESTIONS[step] ?? 'The team')
  let showTeam  = $derived(step === MAX_STEP)
  let activeIdx = $derived(Math.min(PARAS.length - 1, step))

  onMount(() => {
    document.documentElement.classList.add('about-no-scrollbar')

    const onScroll = () => {
      step = Math.min(MAX_STEP, Math.floor(window.scrollY / STEP_PX))
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.documentElement.classList.remove('about-no-scrollbar')
      window.removeEventListener('scroll', onScroll)
    }
  })
</script>

<div class="scroll-spacer"></div>

<div class="page-root">

  <header class="about-header">
    <span></span>
    <span class="polimi-label">@Politecnico di Milano</span>
    <button class="back-dots" onclick={() => history.back()} aria-label="Chiudi">
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
  </header>

  <div class="layout">

    <aside class="left-col">
      <h1 class="about-title">About<br/>us</h1>
      <p class="question-label">{question}</p>
    </aside>

    <main class="right-col">

      <!-- Paragrafi: si nascondono quando appare il team -->
      <div class="text-stack" class:hidden={showTeam}>
        {#each PARAS as para, i}
          {@const dist    = i - activeIdx}
          {@const blurPx  = showTeam ? 48 : (dist > 0 ? dist * 6 : 0)}
          {@const opacity = showTeam ? 0  : (dist === 0 ? 1 : dist > 0 ? Math.max(0.15, 1 - dist * 0.32) : 1)}
          <p class="body-text" style="filter: blur({blurPx}px); opacity: {opacity};">
            {para}
          </p>
        {/each}
      </div>

      <!-- Team: appare all'ultimo step -->
      <div class="team-block" class:visible={showTeam}>
        <ul class="team-list">
          {#each TEAM as name}
            <li>{name}</li>
          {/each}
        </ul>
      </div>

    </main>

  </div>
</div>

<style>
  .scroll-spacer {
    height: calc(4 * 700px + 100vh);
    pointer-events: none;
  }

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
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 4px;
    color: #030404;
  }

  /* ── Layout ──────────────────────────────────── */
  .layout {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 0 44px;
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
    line-height: 0.78;
    color: #030404;
  }

  .question-label {
    font-family: var(--font-primary, monospace);
    font-size: clamp(13px, 1.1vw, 16px);
    color: #030404;
    opacity: 0.65;
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
    padding: 0;
    margin: 0;
  }
  .team-list li {
    font-family: var(--font-primary, monospace);
    font-size: clamp(15px, 1.5vw, 20px);
    color: #030404;
    line-height: 1.75;
  }

  .body-text {
    font-family: var(--font-primary, monospace);
    font-size: clamp(13px, 1.25vw, 17px);
    color: #030404;
    line-height: 1.8;
    max-width: 500px;
    margin: 0;
    transition: filter 1.6s ease, opacity 0.35s ease;
  }

  /* ── Mobile ──────────────────────────────────── */
  @media (max-width: 768px) {
    .scroll-spacer { height: calc(4 * 500px + 100vh); }
    .layout { flex-direction: column; padding: 0 24px 40px; }
    .left-col { width: 100%; padding-left: 0; padding-bottom: 24px; flex: 0 0 auto; }
    .about-title { font-size: clamp(64px, 18vw, 110px); }
    .right-col { padding-right: 0; padding-top: 32px; }
  }

  /* Nasconde la scrollbar del browser solo su questa pagina */
  :global(html.about-no-scrollbar) {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  :global(html.about-no-scrollbar::-webkit-scrollbar) {
    display: none; /* Chrome/Safari */
  }
</style>
