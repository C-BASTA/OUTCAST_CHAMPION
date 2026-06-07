<section class="frase-section">
  <blockquote>
    <span class="quotes">&ldquo;</span>
    <span class="line">Sport demands <strong class="accent">neutrality</strong></span>
    <span class="line">from the people it cannot</span>
    <span class="line">afford to <strong class="accent">silence</strong>.</span>
    <span class="line">He refused to be neutral.</span>
    <span class="line">The institution called it</span>
    <span class="line">a <strong class="accent">violation</strong>.</span>
    <span class="line"><strong class="accent">History</strong> might call it</span>
    <span class="line">the only honest thing</span>
    <span class="line">that happened that year.</span>
  </blockquote>
</section>

<style>
  .frase-section {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(28px, 6vw, 76px);
    background: #030404;
  }

  blockquote {
    text-align: center;
    quotes: none;
    display: flex;
    flex-direction: column;
    gap: clamp(1px, 0.2vw, 3px);
    max-width: min(1180px, 92vw);
  }

  .quotes {
    display: block;
    font-family: 'GeistPixel-Square', monospace;
    font-size: clamp(60px, 11vw, 200px);
    color: #fafafa;
    line-height: 1.2;
    letter-spacing: 0.05em;
    margin-bottom: clamp(-48px, -3.5vw, -24px);
  }

  .line {
    display: block;
    font-family: var(--font-primary);
    font-size: clamp(30px, 4.85vw, 76px);
    font-weight: 400;
    color: #fafafa;
    line-height: 1.2;
    letter-spacing: 0;
  }

  .accent {
    display: inline-block;
    font-family: 'GeistPixel-Square';
    font-weight: 400;
    font-style: normal;
    line-height: 1.2;
    transform: translateY(-0.035em);
    color: var(--hex-brand-blue-500);
  }

  @media (max-width: 760px) {
    .frase-section {
      padding: 28px 20px;
    }
    blockquote {
      max-width: 100%;
      text-align: left;
    }
    .line {
      font-size: clamp(30px, 10.8vw, 58px);
      line-height: 1.2;
    }
  }
</style>
