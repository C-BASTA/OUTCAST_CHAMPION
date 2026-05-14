<script>
  import { onMount } from 'svelte'

  let visible = $state(false)
  let section

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) visible = true },
      { threshold: 0.4 }
    )
    if (section) observer.observe(section)
    return () => observer.disconnect()
  })
</script>

<section bind:this={section} class="frase-section">
  <blockquote class:visible>
    <span class="line">For me, the sacrifice of the people</span>
    <span class="line">depicted on the helmet</span>
    <span class="line">means more than any medal</span>
    <span class="line">because they gave</span>
    <span class="line">the most precious thing they had,</span>
    <span class="line"><em>their lives.</em></span>
  </blockquote>
</section>

<style>
  .frase-section {
    position: relative;
    width: 100%;
    height: 100vh;
    background: var(--color-canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 1;
  }

  blockquote {
    text-align: center;
    quotes: none;
    display: flex;
    flex-direction: column;
    gap: 0.1em;
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }

  blockquote.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .line {
    display: block;
    font-family: var(--font-secondary);
    font-size: clamp(28px, 3.8vw, 58px);
    font-weight: 400;
    color: #030404;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  /* "RESULTS," e "COUNTRY" in gold */
  em {
    font-family: var(--font-primary);
    font-style: normal;
    color: #0914f1;
  }
</style>
