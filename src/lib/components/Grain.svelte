<script>
  // Nessuna logica necessaria, è puro CSS
</script>

<div class="grain" aria-hidden="true"></div>

<style>
  .grain {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.035;

    /* SVG noise inline come data URI — nessuna dipendenza esterna */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px 128px;

    animation: grain 0.5s steps(1) infinite;
  }

  @keyframes grain {
    0%   { background-position:   0%   0%; }
    10%  { background-position: -10%  -5%; }
    20%  { background-position:  15%  10%; }
    30%  { background-position: -20%   5%; }
    40%  { background-position:  25% -10%; }
    50%  { background-position: -15%  15%; }
    60%  { background-position:  10% -20%; }
    70%  { background-position: -25%  10%; }
    80%  { background-position:  20%  -5%; }
    90%  { background-position:  -5%  20%; }
    100% { background-position:  15%  -15%; }
  }
</style>