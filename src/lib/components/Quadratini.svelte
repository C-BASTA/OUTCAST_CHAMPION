<script>
  // Posizioni assolute (vw/vh) ricavate dagli screenshot del Figma
  // Ogni elemento: { x: vw, y: vh, w: px, h: px, color }
  const SQUARES = [
    // Colonna sinistra
    { x: 27.0, y: 26, w: 42, h: 42, color: '#ffd700' },
    { x: 27.0, y: 32, w: 42, h: 44, color: '#0057b7' },
    { x:  4.0, y: 43, w: 52, h: 52, color: '#0057b7' },
    { x:  7.8, y: 43, w: 50, h: 52, color: '#ffd700' },
    { x: 24.0, y: 60, w: 44, h: 44, color: '#ffd700' },
    { x:  3.5, y: 74, w: 42, h: 42, color: '#ffd700' },
    { x:  7.2, y: 75, w: 50, h: 50, color: '#0057b7' },
    { x: 18.5, y: 92, w: 36, h: 36, color: '#0057b7' },
    // Colonna destra
    { x: 76.0, y: 30, w: 56, h: 56, color: '#ffd700' },
    { x: 68.5, y: 44, w: 54, h: 54, color: '#0057b7' },
    { x: 73.5, y: 50, w: 50, h: 50, color: '#ffd700' },
    { x: 88.0, y: 30, w: 50, h: 50, color: '#0057b7' },
    { x: 93.5, y: 24, w: 44, h: 44, color: '#ffd700' },
    { x: 93.5, y: 29, w: 44, h: 44, color: '#0057b7' },
    { x: 87.0, y: 75, w: 64, h: 64, color: '#0057b7' },
    { x: 86.2, y: 88, w: 52, h: 52, color: '#ffd700' },
    { x: 91.0, y: 88, w: 52, h: 52, color: '#0057b7' },
  ]
</script>

<div class="quadratini" aria-hidden="true">
  {#each SQUARES as sq}
    <div
      class="sq"
      style:left="{sq.x}vw"
      style:top="{sq.y}vh"
      style:width="{sq.w}px"
      style:height="{sq.h}px"
      style:background={sq.color}
    ></div>
  {/each}
</div>

<style>
  .quadratini {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -999;
  }
  .sq {
    position: absolute;
  }
</style>
