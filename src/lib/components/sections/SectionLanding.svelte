<script>
  // Nessuna logica — la landing è statica
</script>

<section id="athlete" class="landing">
  <!-- Foto atleta centrata -->
  <img class="vlad" src="/images/vlad-front.png" alt="Vladyslav Heraskevych" />
  <!-- Casco sovrapposto sulla faccia -->
  <img class="casco" src="/images/casco.png" alt="Helmet of Memory" />

  <h1 class="title">Outcast<br />Champion</h1>
</section>

<style>
  .landing {
    position: relative;
    width: 100%;
    height: 100vh;
    background: #fafafa;
    overflow: hidden;
    z-index: 1;
  }

  /* Atleta centrato orizzontalmente, ancorato al basso */
  .vlad {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    height: 100vh;
    width: auto;
    object-fit: contain;
    object-position: bottom center;
    z-index: 2;
  }

  /* Casco sovrapposto: leggermente in alto rispetto alla faccia */
  .casco {
    position: absolute;
    left: 50%;
    top: 28%;
    transform: translateX(-50%);
    height: 42vh;
    width: auto;
    z-index: 3;
    opacity: 0.82;
    mix-blend-mode: multiply;
  }

  .title {
    position: absolute;
    top: 32px;
    left: 48px;
    font-family: var(--font-primary);
    font-size: clamp(40px, 4.5vw, 72px);
    font-weight: 400;
    color: #030404;
    line-height: 1.05;
    letter-spacing: -0.02em;
    z-index: 10;
  }
</style>
