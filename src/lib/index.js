// place files you want to import through the `$lib` alias in this folder.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// 1. Registra ScrollTrigger come fai di solito
gsap.registerPlugin(ScrollTrigger);

// 2. Inizializza Lenis
const lenis = new Lenis({
  duration: 1.2,           // Durata dell'effetto smooth (più alto = più lento/morbido)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Funzione di easing
  orientation: 'vertical', // 'vertical' o 'horizontal'
  gestureOrientation: 'vertical',
  smoothWheel: true,       // Smooth scroll per la rotellina del mouse
  wheelMultiplier: 1,      // Velocità dello scroll con la rotellina
});

// 3. Collega lo scroll di Lenis a ScrollTrigger di GSAP
// Questo passaggio è FONDAMENTALE per far sì che le animazioni GSAP e lo scroll siano sincronizzati al millisecondo
lenis.on('scroll', ScrollTrigger.update);

// 4. Crea un loop di animazione (RequestAnimationFrame) per dire a Lenis e GSAP di aggiornarsi ad ogni frame grafico
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Sincronizza il tempo di Lenis con il ticker di GSAP
});

// Disabilita il lag del ticker di GSAP per rendere tutto ancora più fluido
gsap.ticker.lagSmoothing(0);import { gsap } from "gsap";