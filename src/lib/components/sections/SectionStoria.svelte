<script>
  import { onMount } from 'svelte'

  const MESSAGES = [
    { side: 'left',  text: 'On February 12, 2026, Vladyslav Heraskevych was disqualified just before his Olympic race.' },
    { side: 'right', text: 'The conflict started when he used a "Helmet of Memory" to honor 24 fallen Ukrainian athletes.' },
    { side: 'left',  text: 'The helmet was created by artist Iryna Prots — it depicted the faces of 24 individuals.' },
    { side: 'right', text: 'Shortly before the race, IOC President Kirsty Coventry urged him to change his helmet. He refused.' },
    { side: 'left',  text: 'The emergency appeal filed with CAS in Milan was rejected. The disqualification stood.' },
    { side: 'right', text: 'Heraskevych denounced a double standard, citing other unsanctioned cases.' },
  ]

  let scrollY = $state(0)
  let sectionTop = $state(0)
  let sectionHeight = $state(0)
  let section

  onMount(() => {
    const update = () => {
      scrollY = window.scrollY
      if (section) {
        const rect = section.getBoundingClientRect()
        sectionTop = rect.top + window.scrollY
        sectionHeight = section.offsetHeight
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  })

  let progress = $derived.by(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900
    const scrollInSection = scrollY - sectionTop
    const scrollable = sectionHeight - vh
    return Math.max(0, Math.min(1, scrollInSection / scrollable))
  })

  let visibleUpTo = $derived(Math.floor(progress * (MESSAGES.length + 1)))
</script>

<section bind:this={section} class="storia-section">
  <div class="sticky-inner">
    <div class="chat">
      {#each MESSAGES as msg, i}
        <div class="bubble {msg.side}" class:shown={i < visibleUpTo}>
          {msg.text}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .storia-section {
    height: 400vh;
    background: #fafafa;
  }

  .sticky-inner {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px;
  }

  .chat {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 760px;
    width: 100%;
  }

  .bubble {
    max-width: 72%;
    padding: 16px 22px;
    font-family: var(--font-secondary);
    font-size: 1.15rem;
    line-height: 1.6;
    color: #fafafa;
    border-radius: 20px;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .bubble.shown {
    opacity: 1;
    transform: translateY(0);
  }

  .bubble.left {
    background: #030404;
    align-self: flex-start;
    border-top-left-radius: 4px;
  }

  .bubble.right {
    background: #0057b7;
    align-self: flex-end;
    border-top-right-radius: 4px;
  }
</style>
