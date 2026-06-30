<script>
  import { slide } from 'svelte/transition'
  import { onMount } from 'svelte'

  // Su mobile il pannello aperto scrolla internamente: serve a Lenis per cederne lo scroll
  let isMobile = $state(false)
  onMount(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => (isMobile = mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  })

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
        >
          <button class="folder-header" onclick={() => toggle(item.key)}>
            <span class="folder-title" class:is-active={active === item.key}>
              {item.title}
            </span>
            <span class="folder-sub" class:visible={active === item.key}>
              {item.sub}
            </span>
          </button>

          {#if active === item.key}
            <div class="folder-body" transition:slide={{ duration: 400 }} data-lenis-prevent={isMobile ? '' : undefined}>
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
    background: transparent;
    position: relative;
    z-index: 4;
    min-height: 130vh;
  }

  /* Il wrapper sticky rimane attaccato al top finché la section è visibile */
  .sticky-wrapper {
    position: sticky;
    top: 0;
    min-height: 100vh;
    height: auto;
    overflow: visible;
    padding: 0 80px 60px 80px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .folders {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    height: auto;
    min-height: 0;
    max-width: 1400px;
    margin: 0 auto;
  }

  .folder {
    border-top: 1px solid rgba(250, 250, 250, 0.14);
    flex: 0 0 auto;
    min-height: 0;
  }

  .folder.is-open {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    overflow: visible;
  }

  .folder-header {
    width: 100%;
    background: none;
    border: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    cursor: pointer;
    text-align: left;
    overflow: visible;
  }

  .folder.is-open .folder-header {
    flex: 0 0 auto;
    padding-bottom: 20px;
    overflow: visible;
    height: auto;
  }

  .folder-title {
    font-family: var(--font-primary);
    font-size: clamp(52px, 8.5vw, 126px);
    font-weight: 400;
    padding-top: 14px;
    color: rgba(250, 250, 250, 0.38);
    transition: color 0.25s;
    flex-shrink: 0;
  }

  .folder-header:hover .folder-title:not(.is-active) {
    color: rgba(250, 250, 250, 0.85);
  }

  .folder-title.is-active {
    color: var(--color-ink);
  }

  .folder-header:hover .folder-title:not(.is-active) {
    color: rgba(250, 250, 250, 0.75);
  }

  .folder-title:hover + .folder-sub,
  .folder-header:focus-visible .folder-sub {
    opacity: 1;
  }

  .folder-sub {
    font-family: var(--font-primary);
    font-size: 0.88rem;
    color: neutral-50;
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
    flex: 0 0 auto;
    min-height: 0;
    padding-bottom: 20px;
    overflow: visible;
  }

  .body-sep {
    height: 1px;
    background: rgba(250, 250, 250, 0.14);
    margin-bottom: 40px;
  }

  .body-grid {
    display: grid;
    grid-template-columns: 1fr clamp(240px, 34vw, 470px);
    gap: 40px;
    align-items: start;
    min-height: 0;
  }

  .body-text {
    column-count: 2;
    column-gap: 2.5rem;
  }

  .body-text p {
    font-family: var(--font-primary);
    font-size: 1.05rem;
    color: neutral-50;
    margin-bottom: 0.6rem;
  }

  .body-img-wrap img {
    width: 100%;
    height: auto;
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

    .folder-title {
      font-size: clamp(36px, 11.5vw, 80px);
      flex-shrink: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  /* ── Mobile: accordion a tutto schermo, niente overflow di pagina ─────── */
  @media (max-width: 768px) {
    .regolamento-section {
      min-height: 100svh;
      height: 100svh;
    }

    .sticky-wrapper {
      position: static;
      min-height: 0;
      height: 100svh;
      padding: 24px 20px;
      justify-content: stretch;
    }

    .folders {
      flex: 1 1 auto;
      height: 100%;
      min-height: 0;
      justify-content: stretch;
    }

    /* Chiuse: le cartelle si dividono lo schermo → target più grandi */
    .folder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1 1 0;
      min-height: 0;
    }

    /* Con una aperta, le altre si riducono al solo titolo */
    .folders.has-active .folder:not(.is-open) {
      flex: 0 0 auto;
      justify-content: flex-start;
    }

    .folder.is-open {
      flex: 1 1 auto;
      justify-content: flex-start;
    }

    /* Il corpo aperto riempie lo spazio e scrolla internamente se serve */
    .folder.is-open .folder-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    .body-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .body-text {
      column-count: 1;
    }

    .body-text p {
      font-size: 0.95rem;
    }

    /* Titolo sempre su una riga: header impilato, sub sotto e solo se aperto */
    .folder-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .folder-title {
      white-space: nowrap;
      overflow-wrap: normal;
    }

    .folder-sub {
      text-align: left;
      max-width: none;
      padding-top: 0;
    }

    .folder-sub:not(.visible) {
      display: none;
    }

    /* Niente hover su mobile: i titoli sono già alla massima opacità */
    .folder-title:not(.is-active),
    .folder-header:hover .folder-title:not(.is-active) {
      color: rgba(250, 250, 250, 1);
    }
  }
</style>
