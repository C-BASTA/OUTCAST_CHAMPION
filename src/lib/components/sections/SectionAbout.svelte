<script>
  const TEAM = [
    'Alice Calabrese',
    'Beatrice Bellettini',
    'Alice Augusti',
    'Tommaso Barazzetta',
    'Chiara Mazzoni',
    'Stefano Lorini',
  ]
</script>

<section class="about-section" id="about-us">
  <h2 class="team-title">The team</h2>

  <ul class="team-list">
    {#each TEAM as name}
      <li>{name}</li>
    {/each}
  </ul>

  <p class="desc">
    We are a team of six Undergraduate Communication Design students from Politecnico di Milano.
  </p>

  <div class="credits">
    <span>@Politecnico di Milano</span>
    <span>Corso di Digital e Web Design</span>
  </div>
</section>

<style>
  .about-section {
    background: #030404;
    min-height: 100vh;
    padding: 120px 80px 80px;
    border-top: 1px solid rgba(250, 250, 250, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .team-title {
    font-family: var(--font-primary);
    font-size: clamp(56px, 8vw, 120px);
    font-weight: 400;
    color: #fafafa;
    line-height: 1;
    margin-bottom: 56px;
  }

  .team-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0 80px;
    margin-bottom: 56px;
  }

  .team-list li {
    font-family: var(--font-primary);
    font-size: clamp(20px, 2.5vw, 48px);
    font-weight: 400;
    color: #fafafa;
    padding: 12px 0;
    border-bottom: 1px solid rgba(250, 250, 250, 0.12);
    line-height: 1;
  }

  .desc {
    font-family: var(--font-secondary);
    font-size: 1.25rem;
    color: rgba(250, 250, 250, 0.65);
    max-width: 560px;
    line-height: 1.65;
    margin-bottom: 32px;
  }

  .credits {
    display: flex;
    gap: 32px;
    font-family: var(--font-secondary);
    font-size: 0.9rem;
    color: rgba(250, 250, 250, 0.35);
  }
</style>
