<script>
  import { onMount, onDestroy } from 'svelte'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  
  import Lenis from '@studio-freight/lenis'
  import { helmetStore } from '$lib/helmetStore.svelte.js'
  import AthleteDetail from '$lib/components/sections/AthleteDetail.svelte'

  gsap.registerPlugin(ScrollTrigger)

  // ─── Athlete detail data ──────────────────────────────────────────────────
  const athleteDetails = {
    'Maksym Halinichev': {
      name: 'Maksym Halinichev',
      role: 'Boxer, 22 years old.',
      description: 'Considered an heir to the great Ukrainian boxing tradition, he won gold at the 2017 European Youth Championships and silver at the 2018 Youth Olympic Games in Buenos Aires, followed by a silver at the 2021 U22 European Championships. In the spring of 2022, he gave up his spot in the Senior European Championships to enlist as a volunteer in the airborne assault forces, serving in the 25th Sicheslav Brigade. Despite being wounded twice in combat, he chose to return to the front both times as soon as he was discharged from the hospital. He fell on March 10, 2023, in Chervonopopivka, Luhansk region, at the age of 22.',
    },
    'Dmytro Sharpar': {
      name: 'Dmytro Sharpar',
      role: 'Figure Skater, 25 years old.',
      description: 'A member of the Ukrainian national figure skating team, he competed in pairs with Anastasia Pobizhenko, representing the country at the 2016 Youth Olympic Games in Lillehammer, where he finished tenth. After retiring from competitive sports and winning a silver medal at the National Championships, he worked as a lead performer in the prestigious "Grand" circus show. At the outbreak of the Russian invasion, he interrupted his artistic career to enlist in the armed forces to defend Ukraine\'s territorial integrity. He died in action during combat in the Bakhmut sector at the age of 25.',
    },
    'Yevhen Malyshev': {
      name: 'Yevhen Malyshev',
      role: 'Biathlete, 19 years old.',
      description: 'A former member of the Ukrainian junior national biathlon team, he represented Ukraine at the Lausanne 2020 Winter Youth Olympic Games. After concluding his time with the junior national team, he began a military career, serving under a professional contract in the Ukrainian Armed Forces. He was actively deployed from the very first days of the 2022 Russian invasion to protect urban borders. He died on March 1, 2022, during the defense of Kharkiv, his hometown, while on operational duty at the age of 19.',
    },
    'Karyna Bakhur': {
      name: 'Karyna Bakhur',
      role: 'Kickboxer, 17 years old.',
      description: 'A Ukrainian and European kickboxing champion, at just 17 years old, she was already an esteemed instructor coaching children aged 6 and 7. In November 2025, while in the city of Berestyn the day before departing for a World Cup competition in Austria, she was caught in a Russian missile attack. According to reconstructions, she shielded her father with her own body during the explosion; her father survived, while Karyna died shortly after in the hospital due to the severe injuries sustained. She passed away just days before turning 18.',
    },
    'Taras Shpuk': {
      name: 'Taras Shpuk',
      role: 'Trainer, 34 years old.',
      description: 'A pioneer of the Invictus Games in Ukraine, he was a coach and sports manager dedicated to the recovery of veterans with disabilities, introducing disciplines such as wheelchair basketball and rugby. In 2022, he worked with the "Come Back Alive" foundation, delivering military equipment under fire and rescuing the national team\'s sports equipment from Irpin. In November 2023, he returned to active service in military intelligence, joining a special operations unit. He fell during a combat mission in September 2025 at the age of 34.',
    },
    'Pavlo Ishchenko': {
      name: 'Pavlo Ishchenko',
      role: 'Powerlifting Champion.',
      description: 'A world and European powerlifting champion, Pavlo dominated the national strongman scene by winning the Ukrainian title for four consecutive years, from 2022 to 2025. Originally from Hostomel, a city hit hard at the beginning of the occupation, he transformed his physical strength into a logistical resource for his comrades during military service. Despite his commitment at the front, he never stopped training or participating in strength competitions to represent his country. He died in October 2025 during a combat mission.',
    },
    'Oleksiy Loginov': {
      name: 'Oleksiy Loginov',
      role: 'Ice Hockey Goalkeeper, 23 years old.',
      description: 'Raised in the "Kryzhynka" youth system, he debuted in the senior league in 2017 with "Kryzhani Vovky" before moving to the "Bilyi Bars" club. With the latter, he won the 2018 Ukrainian Under-20 Championship, establishing himself as one of the most promising goalkeepers of his generation. Immediately after the start of the full-scale invasion, he decided to enlist as a volunteer in the armed forces to serve in the most intense conflict zones. He died on November 8, 2023, during combat in the Luhansk region at the age of 23.',
    },
    'Volodymyr Androshchuk': {
      name: 'Volodymyr Androshchuk',
      role: 'Decathlete, 22 years old.',
      description: 'An elite athlete of the Ukrainian national team, he became the Under-20 national champion in decathlon in 2019 and finished sixth in modern pentathlon at the European Championships in his category. He decided to suspend his preparation for future international competitions to enlist in the Ukrainian Armed Forces following the Russian invasion. He was sent to the eastern front, where he took part in some of the most grueling battles of the conflict. He was killed in January 2023 during fierce clashes near the city of Bakhmut at the age of 22.',
    },
    'Oleksiy Khabarov': {
      name: 'Oleksiy Khabarov',
      role: 'Sport Shooter, International Master of Sports.',
      description: 'An International Class Master of Sports, he represented Ukraine at major world shooting ranges, setting the national record in the 10m air rifle in 2017 with 248.5 points. After years of competing at the highest levels, he put his ballistic expertise at the service of the Ukrainian Armed Forces as an operational soldier. He was deployed to the front lines in the eastern sector, actively participating in the defense of national territory. He died in August 2025 during a battle in the Donetsk region.',
    },
    'Mykyta Kozubenko': {
      name: 'Mykyta Kozubenko',
      role: 'Diving Coach, 31 years old.',
      description: 'A Master of Sports in diving and a federal coach at the Mykolaiv sports school, he dedicated much of his life to the technical perfection of the athletic gesture from the springboards. Having entered the world of sports as a child, he became a reference figure for young divers in his region. At the outbreak of the conflict, he joined the National Guard of Ukraine, providing operational service in combat zones. He fell at the front in June 2025, at the age of 31, while carrying out his military duties.',
    },
    'Andriy Yaremenko': {
      name: 'Andriy Yaremenko',
      role: 'Greco-Roman Wrestler, 26 years old.',
      description: 'A national-level wrestler and multiple-time medalist at the Ukrainian championships, Andriy was a regular member of the national Greco-Roman wrestling team. During the conflict, he chose to specialize as an unmanned aerial vehicle (UAV) operator within the 115th Territorial Defense Brigade. He applied the discipline and concentration gained on the wrestling mat to the technological management of modern defense at the front. He died on December 4, 2025, during a combat mission, just a few days before his twenty-sixth birthday.',
    },
    'Fedor Epifanov': {
      name: 'Fedor Epifanov',
      role: 'Fencer, 18 years old.',
      description: 'An emerging talent in international fencing, Fedor was a Ukrainian national champion and represented his country at the 2021 Cadet World Championships. Despite a rapidly rising competitive career, he decided to suspend all sporting activities at just 18 years old to enlist as a volunteer in the Ukrainian Armed Forces. He was sent to the southern front to participate in defensive and counter-offensive operations. He fell on December 11, 2023, during violent clashes in the Zaporizhzhia region, shortly after reaching the age of majority.',
    },
    'Kateryna Troyan': {
      name: 'Kateryna Troyan',
      role: 'Runner and journalist, 32 years old.',
      description: 'A national-level middle-distance runner and professional journalist, she combined her sporting activities with a career in information for years. During the Russian invasion, she chose to undertake active military service to contribute to the defense of the Ukrainian state. She was assigned as a defender in operational units deployed in the difficult Pokrovsk sector on the eastern front. She was killed in June 2025, at the age of 32, while on an operational mission in one of the most contested areas of the conflict.',
    },
    'Nazar Zuy': {
      name: 'Nazar Zuy',
      role: 'Young athlete, 13 years old.',
      description: 'A young sports prospect from Mariupol, Nazar split his competitive activity between the boxing ring and local football pitches at only 13 years old. During the violent siege of the city of Mariupol in March 2022, he was with his family inside their apartment building. He was killed when a Russian aerial bomb struck the residential building, destroying it completely. Both of his parents also lost their lives in the attack, extinguishing the entire family unit under the rubble.',
    },
    'Mariia Lebid': {
      name: 'Mariia Lebid',
      role: 'Dance Sport athlete, 15 years old.',
      description: 'A competitive dance sport athlete in Dnipro, Mariia represented one of the young prospects of a sector in which Ukraine boasts a solid international tradition. Her career was abruptly cut short on January 14, 2023, when a Russian Kh-22 missile struck an entire residential block in her city. Mariia was at home alone at the time of impact, which caused the partial collapse of the apartment building. She died instantly at the age of 15, becoming one of the most well-known civilian victims of the bombing of Dnipro.',
    },
    'Alina Perehudova': {
      name: 'Alina Perehudova',
      role: 'Weightlifter, 14 years old.',
      description: 'A 14-year-old weightlifter, Alina was already the Under-17 national champion in 2021 and was part of the preparation program for the Ukrainian national team. She was killed in 2022 during the siege of Mariupol, a victim of the bombings that destroyed the residential neighborhood where she lived. Alina died under the rubble of her home along with her mother; in the same context, her brother was killed by a Russian sniper while attempting to rescue the two women trapped after the bombardment.',
    },
    'Roman Polishchuk': {
      name: 'Roman Polishchuk',
      role: 'High jump specialist, 29 years old.',
      description: 'A 29-year-old high jump specialist, he competed for years in Ukrainian athletics circuits, participating in numerous significant national competitions. He enlisted as a volunteer in the armed forces in the early days of the February 2022 invasion, serving in the 206th battalion of the 241st Territorial Defense Brigade. He took part in several defensive operations to counter the advance of Russian troops in the country. He was killed in action in March 2023 during a field combat, leaving his sports career behind to defend the homeland.',
    },
    'Kateryna Diachenko': {
      name: 'Kateryna Diachenko',
      role: 'Rhythmic Gymnast, 11 years old.',
      description: 'At only 11 years old, Kateryna was a rhythmic gymnast already known in local Mariupol sports circles for her technical skills and dedication to the discipline. She died instantly in March 2022 when an aerial bomb hit the home she was in with her father, who also perished in the impact. The tragedy affected the entire family: her mother and brother, who initially survived but were injured, died shortly after when the Mariupol hospital where they were admitted was also destroyed by a bombardment.',
    },
    'Viktoriia Ivashko': {
      name: 'Viktoriia Ivashko',
      role: 'Judoka, 9 years old.',
      description: 'A young 9-year-old judoka, Viktoriia competed for the "Judo Master" club in Kyiv and regularly attended competitive training courses in the capital. On June 1, 2023, during a massive night-time missile attack on Kyiv, she was trying to reach an air-raid shelter with her mother. Both were killed by the explosion of a Russian missile that fell near the entrance of the shelter. Her death occurred symbolically during International Children\'s Day, drawing global attention to the young civilian victims of the war.',
    },
    'Andriy Kutsenko': {
      name: 'Andriy Kutsenko',
      role: 'Track Cycling Champion, 34 years old.',
      description: 'A multiple-time Ukrainian track cycling champion and leading national team athlete, he represented Ukrainian colors in numerous international competitions. At the outbreak of the Russian invasion in 2022, he decided to suspend his sporting career to enlist in the army and defend national territory. He served actively in various combat operations for over two consecutive years. He died during a combat mission in the Donetsk region on July 3, 2024, and was commemorated by the cycling federation for his civil and military commitment.',
    },
    'Daria Kurdel': {
      name: 'Daria Kurdel',
      role: 'Dance Sport Champion, 20 years old.',
      description: 'A 20-year-old national dance sport champion, Daria was an established athlete who participated in the country\'s major competitive circuits. In July 2022, she was in the city of Kryvyi Rih conducting an outdoor training session with her father in a residential area. She fell victim to a Russian missile attack that struck the area, causing explosions and the spread of lethal metal fragments. She died from the severe injuries sustained, while her father survived although he was wounded in the attack.',
    },
    'Ivan Kononenko': {
      name: 'Ivan Kononenko',
      role: 'Actor, veterinarian and strongman, 42 years old.',
      description: 'An eclectic figure on the Ukrainian scene, Ivan was a veterinary surgeon, television actor (known for "Servant of the People"), and an athlete on Vasyl Virastiuk\'s strongman team. Having enlisted in the Territorial Defense on February 24, 2022, he returned to the front as a platoon commander after recovering from a serious leg injury. He disappeared in November 2024 during a military operation in the Kursk region; his death was officially confirmed in December 2025 at the age of 42. He leaves behind his wife and two sons, Arkhyp and Nikita.',
    },
  }

  const ATHLETE_WB_DIR = '/images/athletes-wb'
  const ATHLETE_WB_PHOTO_COUNT = 3

  const normalizeAthleteName = (name) => name.trim().replace(/\s+/g, '-')
  const buildAthleteWebpPhotos = (name) =>
    Array.from({ length: ATHLETE_WB_PHOTO_COUNT }, (_, i) =>
      `${ATHLETE_WB_DIR}/${normalizeAthleteName(name)}-${i + 1}.webp`
    )

  for (const [name, detail] of Object.entries(athleteDetails)) {
    detail.photos = buildAthleteWebpPhotos(name)
  }

  // ─── State ─────────────────────────────────────────────────────────────────
  let activeAthlete      = $state(null)
  let activeAthleteIndex = $state(-1)

  const faces = [
    { name: 'Maksym Halinichev',     rotation: { x: -0.3, y:  0,  z: 0 } },
    { name: 'Dmytro Sharpar',        rotation: { x: -0.3, y: 1.1, z: 0 } },
    { name: 'Yevhen Malyshev',       rotation: { x: -0.3, y: 3,   z: 0 } },
    { name: 'Karyna Bakhur',         rotation: { x: -0.3, y: 5.5,   z: 0 } },
    { name: 'Taras Shpuk',           rotation: { x: 0, y: 5.10,   z: 0 } },
    { name: 'Pavlo Ishchenko',       rotation: { x: -4.56, y: 2.81,   z: 0 } },
    { name: 'Oleksiy Loginov',       rotation: { x: -5.50, y: 4.77,  z: 0 } },
    { name: 'Volodymyr Androshchuk', label: 'V. Androshchuk', rotation: { x: -6.14, y: 0.73, z: 0 } },
    { name: 'Oleksiy Khabarov',      rotation: { x: -5.78, y: 0.85,   z: 0 } },
    { name: 'Mykyta Kozubenko',      rotation: { x: -5.46, y: 1.53,   z: 0 } },
    { name: 'Andriy Yaremenko',      rotation: { x: -0.54, y: 5.10,   z: 0 } },
    { name: 'Fedor Epifanov',        rotation: { x: 0, y: 5.60,   z: 0 } },
    { name: 'Kateryna Troyan',       rotation: { x: -0.35, y: 0.61,   z: 0 } },
    { name: 'Nazar Zuy',             rotation: { x: -0.50, y: 3.60,   z: 0 } },
    { name: 'Mariia Lebid',          rotation: { x: -0.50, y: 1.90,   z: 0 } },
    { name: 'Alina Perehudova',      rotation: { x: -5.14, y: 3.17,  z: 0 } },
    { name: 'Roman Polishchuk',      rotation: { x: -0.56, y: 4.29, z: 0 } },
    { name: 'Kateryna Diachenko',    rotation: { x: -0.44, y: 2.51,   z: 0 } },
    { name: 'Viktoriia Ivashko',     rotation: { x: 0.1, y: 0.17,   z: 0 } },
    { name: 'Andriy Kutsenko',       rotation: { x: -6.18, y: 1.35,   z: 0 } },
    { name: 'Daria Kurdel',          rotation: { x: -3.85, y: 3.24,    z: 0 } },
    { name: 'Ivan Kononenko',        rotation: { x: -5.76, y: 5.69,  z: 0 } },
  ]

  const PX_PER_STEP   = 400
  const SCROLL_HEIGHT = PX_PER_STEP * faces.length
  const INTRO_PX      = 1200
  const EXIT_PX       = 700
  const ROTATION_DELAY = 350

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp  = (a, b, t) => a + (b - a) * t
  const ease  = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // Snap easing: transizione nel 50% centrale dello step, piatto ai bordi
  function snapEase(t) {
    const s = clamp((t - 0.15) / 0.70, 0, 1)
    return s * s * (3 - 2 * s) // smoothstep
  }
  function applySnap(raw) {
    const n = faces.length - 1
    if (raw <= 0) return 0
    if (raw >= n) return n
    const step = Math.floor(raw)
    const frac = raw - step
    return Math.min(n, step + snapEase(frac))
  }

  const ATH_CAM_Y        = 0.35
  const ATH_CAM_Z        = 3.8
  const ATH_CAM_Z_MOBILE = 5.8   // più lontano su mobile: canvas full-width, altrimenti il casco è troppo grande
  const ATH_LOOK_Y       = 0.0
  const ATH_ROT_X        = 0.0

  let wrapper  = null
  let selected = $state(0)
  let smoothSelected = $state(0)
  let introP   = $state(0)
  let exitT    = $state(0)
  let rotationDelayId = null
  let isMobile = $state(false)

  function abbreviateName(name) {
    const parts = name.trim().split(/\s+/)
    return parts.length < 2 ? name : `${parts[0][0]}. ${parts.slice(1).join(' ')}`
  }

  // ─── Nastro continuo ────────────────────────────────────────────────────────
  // Altezza di ogni riga in vh — deve matchare gap + font-size effettivi.
  // Usiamo una costante che il CSS specchia con --name-row-vh.
  const ROW_VH = 17

  // Offset entry/exit del contenitore (in vh), indipendente dalla traslazione del nastro
  let entryOffsetVh = $derived(lerp(100, 0, ease(clamp((introP - 0.25) / 0.65, 0, 1))))
  let exitOffsetVh  = $derived(-ease(exitT) * 100)
  let namesOpacity  = $derived(ease(clamp((introP - 0.20) / 0.40, 0, 1)) * (1 - ease(exitT)))

  /**
   * Il nastro scorre: ogni nome i è posizionato a Y = (i - smoothSelected) * ROW_VH vh
   * dal centro dello schermo. smoothSelected è un float continuo → movimento fisico reale.
   * Calcoliamo solo i nomi visibili (±3 righe dal centro) per performance.
   */
  let visibleNames = $derived.by(() => {
    const center = smoothSelected
    const items = []
    // Renderizza tutti i nomi: la clip del contenitore li nasconde comunque
    const rowVh = isMobile ? 10 : ROW_VH
    for (let i = 0; i < faces.length; i++) {
      const offsetFromCenter = i - center          // in "steps" rispetto al centro
      const yVh = offsetFromCenter * rowVh         // posizione Y in vh dal centro
      const distAbs = Math.abs(offsetFromCenter)
      // Opacità: 1 al centro, decade verso i laterali
      const opacity = Math.max(0, 1 - distAbs * 0.35)
      // Scale: leggermente più grande al centro (calcolato in CSS via variabile)
      const isCurrent = Math.round(center) === i
      items.push({ face: faces[i], index: i, yVh, opacity, isCurrent })
    }
    return items
  })

  function updateRotation(index) {
    if (!faces[index]) return
    const rotation = faces[index].rotation ?? { x: 0, y: 0, z: 0 }
    helmetStore.rotX = rotation.x
    helmetStore.rotY = rotation.y
    helmetStore.rotZ = rotation.z
  }

  function scheduleRotation(index) {
    clearTimeout(rotationDelayId)
    rotationDelayId = setTimeout(() => updateRotation(index), ROTATION_DELAY)
  }

  function syncHelmetLayout(scrolledInside, skipVisibility = false) {
    if (helmetStore.frozen) return

    // Su mobile il casco è sempre centrato (padding 0) e visibile durante questa sezione
    const maxPadding = isMobile ? 0 : 38

    if (scrolledInside > INTRO_PX + SCROLL_HEIGHT) {
      const rawExitT = (scrolledInside - (INTRO_PX + SCROLL_HEIGHT)) / EXIT_PX
      exitT = clamp(rawExitT, 0, 1)
      helmetStore.exitY = lerp(0, -120, ease(exitT))
      helmetStore.floatWeight = lerp(1, 0, ease(exitT))
      helmetStore.visible = exitT < 1
      clearTimeout(rotationDelayId)
      return
    }

    exitT = 0
    helmetStore.exitY = 0
    if (!skipVisibility) helmetStore.visible = scrolledInside >= 0

    // Su mobile il visor section non attiva mai il casco: lo facciamo qui appena la sezione entra
    if (scrolledInside > 0) {
      helmetStore.entryTransformY = 0
      helmetStore.floatWeight = 1
    }
    const rawIntroP = clamp(scrolledInside / INTRO_PX, 0, 1)

    const activeFaceIndex = Math.max(0, Math.min(faces.length - 1, Math.round(smoothSelected)))
    const activeFaceRotation = faces[activeFaceIndex]?.rotation ?? { x: 0, y: 0, z: 0 }

    if (rawIntroP < 1) {
      helmetStore.smoothRotation = false
      const ei = ease(clamp(rawIntroP / 0.65, 0, 1))
      helmetStore.viewerPaddingLeft = `${lerp(0, maxPadding, ei)}%`
      helmetStore.lookAtX = lerp(0, isMobile ? 0 : -0.8, ei)
      helmetStore.cameraY = lerp(0.25,  ATH_CAM_Y,  ei)
      helmetStore.cameraZ = lerp(8.5, isMobile ? ATH_CAM_Z_MOBILE : ATH_CAM_Z, ei)
      helmetStore.lookAtY = lerp(0.20, ATH_LOOK_Y, ei)
      helmetStore.rotX    = lerp(0.25, activeFaceRotation.x, ei)
      helmetStore.rotY    = lerp(Math.PI - 0.35, activeFaceRotation.y, ei)
      helmetStore.rotZ    = lerp(0, activeFaceRotation.z, ei)
    } else {
      helmetStore.smoothRotation = true
      helmetStore.viewerPaddingLeft = isMobile ? '0%' : '38%'
      helmetStore.lookAtX = isMobile ? 0 : -0.8
      helmetStore.cameraY = ATH_CAM_Y
      helmetStore.cameraZ = isMobile ? ATH_CAM_Z_MOBILE : ATH_CAM_Z
      helmetStore.lookAtY = ATH_LOOK_Y
    }
  }

  function selectFace(index) {
    if (index === -1) return

    const currentCenter = Math.round(smoothSelected)
    if (index === currentCenter) {
      const name = faces[index]?.name
      if (name && athleteDetails[name]) {
        helmetStore.frozen = true
        activeAthlete      = athleteDetails[name]
        activeAthleteIndex = index
      }
      return
    }

    if (!wrapper || !lenis) return
    const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY
    const targetScroll = wrapperTop + INTRO_PX + index * PX_PER_STEP
    lenis.scrollTo(targetScroll)
  }

  // ─── Lenis + ScrollTrigger ─────────────────────────────────────────────────
  let lenis          = null
  let masterTimeline = null
  let rafId          = null

  /**
   * Calcola il moltiplicatore di velocità Lenis in base alla posizione di scroll
   * relativa alla sezione.
   *
   * Logica:
   *  - PRIMA della sezione (wrapper non ancora in vista): velocità normale (1.0)
   *  - Zona INTRO (0 → INTRO_PX): rallenta gradualmente fino a 0.55 per dare peso
   *    all'animazione del casco che entra
   *  - Zona GALLERY (INTRO_PX → INTRO_PX + SCROLL_HEIGHT): micro-pause tra ogni atleta
   *    (velocità scende a ~0.4 nei 60px centrali di ogni step, poi risale a 0.85)
   *    così ogni nome ha un momento di "respiro" al centro
   *  - Zona EXIT (fine gallery → fine wrapper): accelera progressivamente fino a 1.2
   *    per dare senso di sgancio e passaggio alla sezione successiva
   */
  function computeLenisMultiplier(wrapperTop, currentScroll) {
    const scrolledInside = currentScroll - wrapperTop
    const totalSection   = INTRO_PX + SCROLL_HEIGHT + EXIT_PX

    // Fuori dalla sezione: velocità piena
    if (scrolledInside < 0 || scrolledInside > totalSection) return 1.0

    // ── Zona EXIT: accelera ──────────────────────────────────────────────
    if (scrolledInside > INTRO_PX + SCROLL_HEIGHT) {
      const t = (scrolledInside - INTRO_PX - SCROLL_HEIGHT) / EXIT_PX
      return lerp(0.60, 1.25, ease(t))
    }

    // ── Zona GALLERY: pausa pronunciata al centro di ogni step ──────────
    if (scrolledInside > INTRO_PX) {
      const galleryScrolled = scrolledInside - INTRO_PX
      const stepFrac = (galleryScrolled % PX_PER_STEP) / PX_PER_STEP
      // distFromCenter: 0 = al centro dello step, 1 = ai bordi
      const distFromCenter = Math.abs(stepFrac - 0.5) * 2
      // Rallenta molto al centro (0.22), scatta veloce ai bordi (1.1)
      const pauseFactor = lerp(0.62, 1.1, ease(distFromCenter))
      return pauseFactor
    }

    // ── Zona INTRO: rallenta gradualmente ───────────────────────────────
    const introFrac = scrolledInside / INTRO_PX
    return lerp(1.0, 0.55, ease(introFrac))
  }

  onMount(() => {
    isMobile = window.innerWidth < 768
    window.addEventListener('resize', () => { isMobile = window.innerWidth < 768 })

    syncHelmetLayout(0, true)

    // ── 1. Inizializza Lenis ──────────────────────────────────────────────
    lenis = new Lenis({
      duration: 1.4,           // durata base dell'inerzia (secondi)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out: start rapido, fine morbida
      smooth: true,
      smoothTouch: false,      // su touch la fisica nativa è meglio
      touchMultiplier: 1.8,
    })

    // ── 2. Collega Lenis a ScrollTrigger ──────────────────────────────────
    // ScrollTrigger deve leggere la posizione virtuale di Lenis, non quella nativa
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // ── 3. Modulazione dinamica della velocità ─────────────────────────────
    // Ad ogni tick Lenis aggiorniamo il multiplier in base alla posizione
    lenis.on('scroll', ({ scroll }) => {
      if (!wrapper) return
      const wrapperTop = wrapper.getBoundingClientRect().top + scroll
      const mult = computeLenisMultiplier(wrapperTop, scroll)
      // Lenis espone il setter diretto per il multiplier (v1.x)
      lenis.options.multiplier = mult
    })

    // ── 4. ScrollTrigger master timeline ─────────────────────────────────
    masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: `+=${INTRO_PX + SCROLL_HEIGHT + EXIT_PX}`,
        scrub: 0.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const scrolled = self.scroll() - self.start

          introP = clamp(scrolled / INTRO_PX, 0, 1)

          if (scrolled >= INTRO_PX) {
            const galleryScrolled = scrolled - INTRO_PX
            const rawSmooth = Math.min(faces.length - 1, galleryScrolled / PX_PER_STEP)
            smoothSelected = applySnap(rawSmooth)
            const newSelected = Math.round(smoothSelected)
            if (newSelected !== selected) {
              selected = newSelected
              scheduleRotation(selected)
            }
          } else {
            smoothSelected = 0
            selected       = 0
          }

          syncHelmetLayout(scrolled)
        }
      }
    })
  })

  onDestroy(() => {
    if (masterTimeline) {
      masterTimeline.scrollTrigger?.kill()
      masterTimeline.kill()
    }
    if (lenis) {
      lenis.destroy()
    }
    // Rimuove il ticker GSAP di Lenis
    gsap.ticker.remove((time) => lenis?.raf(time * 1000))
    clearTimeout(rotationDelayId)
    helmetStore.exitY = 0
  })
</script>

<div
  class="gallery-wrapper"
  bind:this={wrapper}
  id="helmet"
  style="height: calc(100vh + {INTRO_PX + SCROLL_HEIGHT + EXIT_PX}px)"
>
  <div
    id="helmet-list"
    style="position:absolute;top:{INTRO_PX}px;height:0;pointer-events:none;"
    aria-hidden="true"
  ></div>

  <div class="gallery-sticky">
    <!--
      .names-viewport: finestra fissa centrata verticalmente, overflow hidden.
      .names-tape: ogni nome è posizionato in assoluto con translateY continuo
      calcolato da smoothSelected → nessun salto, solo moto fisico reale.
    -->
    <div
      class="names-viewport"
      style:opacity={namesOpacity}
      style:transform="translateY({entryOffsetVh + exitOffsetVh}vh)"
    >
      <div class="names-tape">
        {#each visibleNames as item (item.index)}
          <div
            class="name"
            class:selected={item.isCurrent}
            class:has-detail={!!athleteDetails[item.face.name]}
            style:transform="translateY(calc({item.yVh}vh - 50%))"
            style:opacity={item.opacity}
            role="button"
            tabindex="0"
            onclick={() => selectFace(item.index)}
            onkeydown={(e) => e.key === 'Enter' && selectFace(item.index)}
          >
            <span>{@html isMobile ? abbreviateName(item.face.name) : (item.face.label ?? item.face.name)}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<AthleteDetail
  athlete={activeAthlete}
  athleteIndex={activeAthleteIndex}
  onClose={() => { activeAthlete = null; activeAthleteIndex = -1; helmetStore.frozen = false }}
/>

<style>
  .gallery-wrapper {
    position: relative;
    width: 100%;
    background: var(--color-canvas-dark);
  }

  .gallery-sticky {
    position: sticky;
    top: 0;
    width: 93%;
    height: 100vh;
    z-index: 10;
    background: transparent;
    overflow: hidden;
  }

  /* Finestra che maschera i nomi fuori campo */
  .names-viewport {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    /* Le transizioni di entry/exit sono gestite da JS via style:transform */
  }

  /* Il nastro: contiene TUTTI i nomi, ognuno posizionato in assoluto */
  .names-tape {
    position: absolute;
    /* Ancorato al centro verticale del viewport */
    top: 50%;
    left: 0;
    width: 83%;
    padding-left: var(--padding-lateral, 5rem);
    /* Non ha altezza propria: i figli escono fuori e vengono clippati dal viewport */
  }

  .name {
    position: absolute;
    top: 0;
    left: var(--padding-lateral, 5rem);
    /* translateY è gestito inline da JS: (i - smoothSelected) * ROW_VH vh */
    will-change: transform, opacity;

    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: var(--font-size-h1);
    font-weight: 500;
    color: neutral-50;
    /* opacity gestita da JS per il fade laterale */
    letter-spacing: -0.03em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 20px;
    white-space: nowrap;
    pointer-events: auto;
    cursor: pointer;
    transform-origin: left center;
    transition:
      scale 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .name:hover {
    margin-left: var(--gap-filter-options, 1rem);
  }

  .name.selected {
    scale: 1.18;
  }

  @media (max-width: 768px) {
    .gallery-sticky {
      width: 100%;
    }

    .names-tape {
      width: 100%;
    }

    .name {
      font-size: clamp(2rem, 10vw, 4.8rem);
    }

    .name.selected {
      scale: 1.12;
    }
  }
</style>