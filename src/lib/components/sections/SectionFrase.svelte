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
    <span class="line">
      For me, the <strong class="accent accent-sacrifice">sacrifice</strong>
    </span>
    <span class="line">of the people depicted on this helmet</span>
    <span class="line">
      weighs more than any <strong class="accent accent-medal">medal</strong>
    </span>
    <span class="line">because they gave the most precious thing</span>
    <span class="line">
      they had: <strong class="accent accent-lives">their lives.</strong>
    </span>
  </blockquote>
</section>

<style>
  .frase-section {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 1;
    padding: clamp(28px, 6vw, 76px);
  }

  blockquote {
    text-align: center;
    quotes: none;
    display: flex;
    flex-direction: column;
    gap: clamp(3px, 0.45vw, 8px);
    max-width: min(1180px, 92vw);
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 0.2s steps(2, end),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  blockquote.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .line {
    display: block;
    font-family: var(--font-primary);
    font-size: clamp(30px, 4.85vw, 76px);
    font-weight: 400;
    color: var(--color-dark);
    line-height: 1.02;
    letter-spacing: 0;
    opacity: 0;
    transform: translateY(0.22em);
  }

  blockquote.visible .line {
    opacity: 1;
    transform: translateY(0);
    animation: glitch-reveal 0.66s steps(1, end) both;
  }

  blockquote.visible .line:nth-child(1) { transition-delay: 0.04s; }
  blockquote.visible .line:nth-child(2) { transition-delay: 0.12s; }
  blockquote.visible .line:nth-child(3) { transition-delay: 0.2s; }
  blockquote.visible .line:nth-child(4) { transition-delay: 0.28s; }
  blockquote.visible .line:nth-child(5) { transition-delay: 0.36s; }

  .accent {
    display: inline-block;
    font-family: var(--font-third);
    font-weight: 900;
    font-style: normal;
    line-height: 0.86;
    transform: translateY(-0.035em);
  }

  .accent-sacrifice {
    color: var(--hex-brand-blue-700);
  }

  .accent-medal {
    color: var(--hex-brand-blue-500);
  }

  .accent-lives {
    color: var(--hex-brand-blue-300);
  }

  @media (max-width: 760px) {
    .frase-section {
      align-items: center;
      padding: 28px 20px;
    }

    blockquote {
      max-width: 100%;
      text-align: left;
    }

    .line {
      font-size: clamp(30px, 10.8vw, 58px);
      line-height: 1.03;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    blockquote,
    .line {
      animation: none;
      transition: none;
      transform: none;
    }
  }

  @keyframes glitch-reveal {
    0% {
      opacity: 0;
      clip-path: inset(0 0 82% 0);
      transform: translate(-0.16em, 0.2em) skewX(8deg);
    }

    12% {
      opacity: 1;
      clip-path: inset(72% 0 9% 0);
      transform: translate(0.12em, -0.04em) skewX(-7deg);
    }

    22% {
      clip-path: inset(18% 0 55% 0);
      color: var(--hex-brand-blue-600);
      transform: translate(-0.08em, 0.02em) skewX(5deg);
    }

    34% {
      clip-path: inset(48% 0 30% 0);
      transform: translate(0.06em, 0) skewX(-4deg);
    }

    47% {
      clip-path: inset(8% 0 78% 0);
      color: var(--color-dark);
      transform: translate(-0.04em, -0.02em) skewX(3deg);
    }

    61% {
      clip-path: inset(62% 0 14% 0);
      transform: translate(0.03em, 0.02em) skewX(-2deg);
    }

    74% {
      clip-path: inset(0 0 0 0);
      transform: translate(0, 0) skewX(0);
    }

    100% {
      opacity: 1;
      clip-path: inset(0 0 0 0);
      color: var(--color-dark);
      transform: translate(0, 0) skewX(0);
    }
  }
</style>
