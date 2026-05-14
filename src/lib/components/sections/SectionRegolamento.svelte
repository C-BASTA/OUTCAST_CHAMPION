<script>
  import { slide } from 'svelte/transition'

  const ITEMS = [
    {
      key: 'case',
      title: 'Case',
      sub: 'What really happened?',
      body: [
        'On February 12, 2026, Vladyslav Heraskevych was disqualified just before his Olympic race over a dispute about symbolic memorial equipment.',
        'The conflict started when Vladyslav Heraskevych used a "Helmet of Memory" to honor fallen Ukrainian athletes and refused to remove it despite officials\' warnings, saying it was a tribute, not political propaganda.',
        'Shortly before the race, Kirsty Coventry urged Vladyslav Heraskevych to change his message, but he refused, saying neutrality shouldn\'t mean losing humanity, leading to his disqualification under Olympic rules.',
        'The helmet by Iryna Prots depicted 24 fallen athletes to honor them; Heraskevych saw it as a moral duty, but officials judged it political and against Olympic rules.',
        'The Court of Arbitration for Sport rejected the appeal, upholding the rules; Heraskevych only regained accreditation to remain in the Olympic Village as a guest.',
      ],
      img: '/images/regolamento/case.png',
    },
    {
      key: 'decision',
      title: 'Decision',
      sub: 'What were the rules?',
      body: [
        'The core of the controversy lies in the problematic relationship between an athlete\'s individual freedom of expression and the principle of Olympic neutrality, which ultimately led to the athlete\'s exclusion from the competition.',
        'The decision is based on the application of two crucial and broadly interpretable rules of the Olympic Charter: Rule 50.2, which prohibits any form of political propaganda at Olympic sites, and Rule 40.2, which protects expression only if it conforms to the values established by the IOC. Although the IOC initially challenged the use of the helmet on the grounds of political propaganda, the subsequent proceedings before the CAS revealed that the final ruling was formally based on Rule 40.2 instead. This shift raised significant questions regarding procedural fairness and the athlete\'s right to defense, as he was forced to build a case against a different accusation than the one finally used for his sanction. The lowering of the legal threshold by the CAS remains a widely debated critical point.',
      ],
      img: '/images/regolamento/decision.png',
    },
    {
      key: 'legal',
      title: 'Legal Reckoning',
      sub: "What's next?",
      body: [
        'Following the Milano Cortina disqualification, Vladyslav Heraskevych received a $200,000 donation from Rinat Akhmetov, president of Shakhtar Donetsk, in recognition of his courage.',
        'The athlete announced that the entire sum would be allocated to his foundation for the purchase of generators and humanitarian aid, demonstrating that his civic mission far outweighs personal success.',
        'President Volodymyr Zelenskyy awarded him the Order of Freedom, Ukraine\'s highest civilian honor, for his steadfast moral stance.',
        'Zelenskyy praised Heraskevych for reminding the world that sport cannot ignore aggression and that Olympic principles must be rooted in justice and the support of peace. The athlete has become a symbol of how personal dignity can shine brighter than a gold medal, taking his message to the United Nations stage in New York to speak about the power of sport to provide hope. Looking ahead, Vladyslav has confirmed his intention to return to the track; he plans to continue competing at the highest level, proving that his voice and his athletic career are both essential tools in his fight for his country\'s future.',
      ],
      img: '/images/regolamento/legal.png',
    },
  ]

  let active  = $state(null)
  let hovered = $state(null)

  function toggle(key) {
    active = active === key ? null : key
  }
</script>

<!-- La section padre ha solo lo sfondo, niente padding -->
<section class="regolamento-section" id="verdict">
  <!-- Questo contenitore è sticky e contiene tutto l'interfaccia delle cartelle -->
  <div class="sticky-wrapper">
    <div class="folders" class:has-active={active !== null}>
      {#each ITEMS as item}
        <div
          class="folder"
          class:is-open={active === item.key}
          onmouseenter={() => hovered = item.key}
          onmouseleave={() => hovered = null}
        >
          <button class="folder-header" onclick={() => toggle(item.key)}>
            <span class="folder-title" class:is-active={active === item.key}>
              {item.title}
            </span>
            <span class="folder-sub" class:visible={hovered === item.key || active === item.key}>
              {item.sub}
            </span>
          </button>

          {#if active === item.key}
            <div class="folder-body" transition:slide={{ duration: 400 }}>
              <div class="body-sep"></div>
              <div class="body-grid">
                <div class="body-text">
                  {#each item.body as para}
                    <p>{para}</p>
                  {/each}
                </div>
                {#if item.img}
                  <div class="body-img-wrap">
                    <img src={item.img} alt={item.title} />
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  /* La section è solo un contenitore che occupa tutto lo spazio disponibile */
  .regolamento-section {
    background: #030404;
    position: relative;
    /* Altezza: la viewport + spazio extra per far sì che lo sticky abbia senso */
    /* Se vuoi che la sezione "passi" dopo un po', aumenta questo valore */
    height: 200vh; /* 100vh di sticky + 50vh di scroll extra per uscire */
  }

  /* Il wrapper sticky rimane attaccato al top finché la section è visibile */
  .sticky-wrapper {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    padding: 80px 80px 0 80px;
    
    /* Scrollbar personalizzata */
    scrollbar-width: thin;
    scrollbar-color: rgba(250, 250, 250, 0.3) rgba(250, 250, 250, 0.05);
  }
  
  .sticky-wrapper::-webkit-scrollbar {
    width: 6px;
  }
  .sticky-wrapper::-webkit-scrollbar-track {
    background: rgba(250, 250, 250, 0.05);
  }
  .sticky-wrapper::-webkit-scrollbar-thumb {
    background: rgba(250, 250, 250, 0.3);
    border-radius: 3px;
  }

  /* Folders - uguale a prima */
  .folders {
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
  }

  .folder {
    border-top: 1px solid rgba(250, 250, 250, 0.14);
  }
  .folder:last-child {
    border-bottom: 1px solid rgba(250, 250, 250, 0.14);
  }

  .folder-header {
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    overflow: visible;
  }

  .has-active .folder:not(.is-open) .folder-header {
    height: clamp(56px, 7.5vh, 80px);
    overflow: hidden;
  }

  .folder.is-open .folder-header {
    padding-bottom: 20px;
    overflow: visible;
    height: auto;
  }

  .folder-title {
    font-family: var(--font-primary);
    font-size: clamp(52px, 8.5vw, 126px);
    font-weight: 400;
    line-height: 0.92;
    padding-top: 14px;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(250, 250, 250, 0.38);
    paint-order: stroke fill;
    transition: color 0.25s, -webkit-text-stroke-color 0.25s;
    flex-shrink: 0;
  }

  .folder-title.is-active {
    color: #fafafa;
    -webkit-text-stroke: 0px transparent;
  }

  .folder-header:hover .folder-title:not(.is-active) {
    -webkit-text-stroke-color: rgba(250, 250, 250, 0.75);
  }

  .folder-sub {
    font-family: var(--font-secondary);
    font-size: 0.88rem;
    color: rgba(250, 250, 250, 0.45);
    white-space: nowrap;
    padding-top: 20px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.22s;
  }

  .folder-sub.visible {
    opacity: 1;
  }

  .folder-body {
    padding-bottom: 60px;
    overflow: hidden;
  }

  .body-sep {
    height: 1px;
    background: rgba(250, 250, 250, 0.14);
    margin-bottom: 40px;
  }

  .body-grid {
    display: grid;
    grid-template-columns: 1fr clamp(240px, 34vw, 470px);
    gap: 64px;
    align-items: start;
  }

  .body-text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .body-text p {
    font-family: var(--font-secondary);
    font-size: 1.05rem;
    color: rgba(250, 250, 250, 0.80);
    line-height: 1.75;
  }

  .body-img-wrap img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  @media (max-width: 900px) {
    .sticky-wrapper {
      padding: 40px 24px 0 24px;
    }
    
    .body-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    
    .folder-sub {
      white-space: normal;
      max-width: 30%;
      text-align: right;
    }
  }
</style>
