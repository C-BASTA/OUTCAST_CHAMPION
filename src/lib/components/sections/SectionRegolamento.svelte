<script>
  import { slide } from 'svelte/transition'

  const ITEMS = [
    {
      key: 'case',
      title: 'Case',
      sub: 'What really happened?',
      body: 'On February 12, 2026, Vladyslav Heraskevych was disqualified just before his Olympic race over a dispute about symbolic memorial equipment. The conflict started when Vladyslav Heraskevych used a "Helmet of Memory" to honor fallen Ukrainian athletes and refused to remove it despite officials\' warnings, saying it was a tribute, not political propaganda.\nShortly before the race, Kirsty Coventry urged Heraskevych to change his message, but he refused, saying neutrality shouldn\'t mean losing humanity, leading to his disqualification under Olympic rules.\nThe helmet by Iryna Prots depicted 24 fallen athletes to honor them; Heraskevych saw it as a duty, but officials judged it political propaganda against Olympic rules.\nThe Court of Arbitration for Sport rejected the appeal, upholding the rules; Heraskevych only regained accreditation to remain in the Olympic Village as a guest.',
      img: '/images/atleti/bio-portrait-helmet.png',
    },
    {
      key: 'decision',
      title: 'Decision',
      sub: 'What were the rules?',
      body: "The core of the controversy lies in the problematic relationship between an athlete's individual freedom of expression and the principle of Olympic neutrality, which ultimately led to the athlete's exclusion from the competition.\nThe decision is based on the application of two crucial and broadly interpretable rules of the Olympic Charter. Rule 50.2, which prohibits any form of political propaganda at Olympic sites, and Rule 40.2, which protects expression only if it conforms to the values established by the IOC.",
      img: '/images/atleti/bio-2018-pyeongchang.png',
    },
    {
      key: 'legal',
      title: 'Legal Reckoning',
      sub: "What's next?",
      body: "Following the Milano Cortina disqualification, Vladyslav Heraskevych received a $250,000 donation from Rinat Akhmetov, president of Shakhtar Donetsk, in recognition of his courage. The athlete announced that the entire sum would be allocated to his foundation for the purchase of generators and humanitarian aid, demonstrating that his civic mission far outweighs personal success.\nPresident Volodymyr Zelensky awarded him the Order of Freedom, Ukraine's highest civilian honor, for his steadfast moral stance.",
      img: '/images/atleti/bio-2024-worlds.png',
    },
  ]

  let active = $state(null)

  function toggle(key) {
    active = active === key ? null : key
  }
</script>

<section class="regolamento-section" id="verdict">
  <div class="inner">
    {#each ITEMS as item}
      <div class="accordion-item">
        <button class="accordion-header" onclick={() => toggle(item.key)}>
          <span class="item-title" class:is-active={active === item.key}>{item.title}</span>
          <span class="item-sub">{item.sub}</span>
        </button>

        {#if active === item.key}
          <div class="accordion-body" transition:slide={{ duration: 380 }}>
            <div class="body-content">
              <div class="body-text">
                {#each item.body.split('\n') as para}
                  <p>{para}</p>
                {/each}
              </div>
              {#if item.img}
                <div class="body-image">
                  <img src={item.img} alt={item.title} />
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
    <div class="divider"></div>
  </div>
</section>

<style>
  .regolamento-section {
    background: #030404;
    min-height: 100vh;
    padding: 80px 80px 80px;
  }

  .inner {
    width: 100%;
  }

  .accordion-item {
    border-top: 1px solid rgba(250, 250, 250, 0.18);
  }

  .divider {
    border-top: 1px solid rgba(250, 250, 250, 0.18);
  }

  .accordion-header {
    width: 100%;
    background: none;
    border: none;
    padding: 20px 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    gap: 32px;
  }

  /*
   * Titolo: di default outlined (solo stroke, no fill).
   * Quando attivo → testo pieno bianco.
   */
  .item-title {
    font-family: var(--font-primary);
    font-size: clamp(48px, 8vw, 130px);
    font-weight: 400;
    line-height: 1;
    /* Outlined */
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(250, 250, 250, 0.45);
    paint-order: stroke fill;
    transition: color 0.25s, -webkit-text-stroke-color 0.25s;
  }

  .item-title.is-active {
    color: #fafafa;
    -webkit-text-stroke: 0px transparent;
  }

  .accordion-header:hover .item-title:not(.is-active) {
    -webkit-text-stroke-color: rgba(250, 250, 250, 0.8);
  }

  .item-sub {
    font-family: var(--font-secondary);
    font-size: 0.95rem;
    color: rgba(250, 250, 250, 0.45);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Body espanso ──────────────────────────────────────── */
  .accordion-body {
    overflow: hidden;
    padding-bottom: 48px;
  }

  .body-content {
    display: flex;
    gap: 80px;
    align-items: flex-start;
  }

  .body-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .body-text p {
    font-family: var(--font-secondary);
    font-size: 1.1rem;
    color: rgba(250, 250, 250, 0.85);
    line-height: 1.72;
    max-width: 680px;
  }

  .body-image {
    flex-shrink: 0;
    width: clamp(200px, 28vw, 420px);
  }

  .body-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    filter: grayscale(30%);
  }
</style>
