<footer class="site-footer">
  <span>@Politecnico di Milano</span>
  <span>Corso di Digital e Web Design</span>
</footer>

<style>
  .site-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px var(--padding-lateral, 56px) calc(28px + env(safe-area-inset-bottom, 0px));
    font-family: 'GeistPixel-Square', monospace;
    font-size: 0.875rem;
    color: #fafafa;
    opacity: 1;
    pointer-events: none;
    position: relative;
    z-index: 5;
    background: #030404;
  }

  @media (max-width: 768px) {
    .site-footer {
      padding: 20px 24px calc(16px + env(safe-area-inset-bottom, 0px));
      font-size: clamp(0.64rem, 2.9vw, 0.88rem);
      white-space: nowrap;
      gap: 10px;
    }
  }
</style>
