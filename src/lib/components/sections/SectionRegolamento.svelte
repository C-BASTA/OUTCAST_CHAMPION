<script>
  import { slide } from 'svelte/transition'

  const ITEMS = [
    {
      key: 'case',
      title: 'Case',
      sub: 'What really happened?',
      body: 'On February 12, 2026, Vladyslav Heraskevych was disqualified just before his Olympic race for wearing the "Helmet of Memory" — a tribute to 24 fallen Ukrainian athletes created by artist Iryna Prots.',
    },
    {
      key: 'decision',
      title: 'Decision',
      sub: 'What were the rules?',
      body: "The core of the controversy lies in the problematic relationship between an athlete's right to expression and Rule 50 of the Olympic Charter, which prohibits political demonstrations during the Games.",
    },
    {
      key: 'legal',
      title: 'Legal Reckoning',
      sub: "What's next?",
      body: "Following the Milano-Cortina disqualification, Vladyslav Heraskevych received a formal sanction. The CAS emergency appeal was rejected, upholding the IOC's strict enforcement of neutrality rules.",
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
          <span class="item-title" class:active={active === item.key}>{item.title}</span>
          <span class="item-sub">{item.sub}</span>
        </button>
        {#if active === item.key}
          <div class="accordion-body" transition:slide={{ duration: 350 }}>
            <p>{item.body}</p>
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
    display: flex;
    align-items: center;
    padding: 120px 80px 80px;
  }

  .inner {
    width: 100%;
  }

  .accordion-item {
    border-top: 1px solid rgba(250, 250, 250, 0.15);
  }

  .divider {
    border-top: 1px solid rgba(250, 250, 250, 0.15);
  }

  .accordion-header {
    width: 100%;
    background: none;
    border: none;
    padding: 28px 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    gap: 32px;
  }

  .item-title {
    font-family: var(--font-primary);
    font-size: clamp(40px, 6vw, 100px);
    font-weight: 400;
    color: rgba(250, 250, 250, 0.2);
    transition: color 0.3s ease;
    line-height: 1;
  }

  .item-title.active {
    color: #fafafa;
  }

  .accordion-header:hover .item-title {
    color: rgba(250, 250, 250, 0.6);
  }

  .item-sub {
    font-family: var(--font-secondary);
    font-size: 1rem;
    color: rgba(250, 250, 250, 0.5);
    white-space: nowrap;
  }

  .accordion-body {
    overflow: hidden;
    padding-bottom: 32px;
  }

  .accordion-body p {
    font-family: var(--font-secondary);
    font-size: 1.25rem;
    color: #fafafa;
    line-height: 1.7;
    max-width: 760px;
  }
</style>
