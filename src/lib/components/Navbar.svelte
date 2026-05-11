<script>
  const { dark = false } = $props()
  const items = ['Athlete', 'Case', 'Helmet', 'Verdict', 'About Us']
</script>

<nav class:dark>
  <ul>
    {#each items as item}
      <li>
        <a href="#{item.toLowerCase().replace(' ', '-')}">{item}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 24px 48px;
    pointer-events: none;
    --ink: #030404;
  }

  nav.dark {
    --ink: #fafafa;
  }

  ul {
    list-style: none;
    display: flex;
    gap: 2.2rem;
    pointer-events: auto;
  }

  a {
    font-family: var(--font-secondary);
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--ink);
    text-decoration: none;
    transition: opacity 0.2s;
  }

  /* "About Us" più leggero, come nel design */
  li:last-child a {
    font-weight: 300;
  }

  a:hover {
    opacity: 0.5;
  }
</style>
