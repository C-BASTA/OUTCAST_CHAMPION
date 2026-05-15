<script>
  import { onMount } from 'svelte'
  import { helmetStore } from '$lib/helmetStore.svelte.js'
  import AthleteDetail from '$lib/components/sections/AthleteDetail.svelte'

  // Athlete detail data
  const athleteDetails = {
    'Maksym Halinichev': {
      name: 'Maksym Halinichev',
      role: 'Boxer, 22 years old.',
      description: 'Considered an heir to the great Ukrainian boxing tradition, he won gold at the 2017 European Youth Championships and silver at the 2018 Youth Olympic Games in Buenos Aires, followed by a silver at the 2021 U22 European Championships. In the spring of 2022, he gave up his spot in the Senior European Championships to enlist as a volunteer in the airborne assault forces, serving in the 25th Sicheslav Brigade. Despite being wounded twice in combat, he chose to return to the front both times as soon as he was discharged from the hospital. He fell on March 10, 2023, in Chervonopopivka, Luhansk region, at the age of 22.',
      photos: [
        '/images/atleti/Boxing_at_the_2018_Summer_Youth_Olympics_–_Boys\'_bantamweight_Victory_Ceremony_58_(cropped).jpg',
        '/images/atleti/01000000-0aff-0242-6c2b-08dca01305ae_cx0_cy10_cw100_w1080_h608_s.jpg',
        '/images/atleti/Screenshot_7.jpg',
      ],
    },
    'Dmytro Sharpar': {
      name: 'Dmytro Sharpar',
      role: 'Figure Skater, 25 years old.',
      description: 'A member of the Ukrainian national figure skating team, he competed in pairs with Anastasia Pobizhenko, representing the country at the 2016 Youth Olympic Games in Lillehammer, where he finished tenth. After retiring from competitive sports and winning a silver medal at the National Championships, he worked as a lead performer in the prestigious "Grand" circus show. At the outbreak of the Russian invasion, he interrupted his artistic career to enlist in the armed forces to defend Ukraine\'s territorial integrity. He died in action during combat in the Bakhmut sector at the age of 25.',
      photos: [
        '/images/atleti/2184279-dmytro-sharpar-headshot.jpg',
        '/images/atleti/FoS6iHcWcAMJTK5.jpg',
      ],
    },
    'Yevhen Malyshev': {
      name: 'Yevhen Malyshev',
      role: 'Biathlete, 19 years old.',
      description: 'A former member of the Ukrainian junior national biathlon team, he represented Ukraine at the Lausanne 2020 Winter Youth Olympic Games. After concluding his time with the junior national team, he began a military career, serving under a professional contract in the Ukrainian Armed Forces. He was actively deployed from the very first days of the 2022 Russian invasion to protect urban borders. He died on March 1, 2022, during the defense of Kharkiv, his hometown, while on operational duty at the age of 19.',
      photos: [
        '/images/atleti/333737527_741095914300905_3789372257865248200_n-e1678720499400.jpeg',
        '/images/atleti/HA1LJGJaAAcImAA.jpg',
      ],
    },
    'Karyna Bakhur': {
      name: 'Karyna Bakhur',
      role: 'Kickboxer, 17 years old.',
      description: 'A Ukrainian and European kickboxing champion, at just 17 years old, she was already an esteemed instructor coaching children aged 6 and 7. In November 2025, while in the city of Berestyn the day before departing for a World Cup competition in Austria, she was caught in a Russian missile attack. According to reconstructions, she shielded her father with her own body during the explosion; her father survived, while Karyna died shortly after in the hospital due to the severe injuries sustained. She passed away just days before turning 18.',
      photos: [
        '/images/atleti/FxnGftlWcAEsKrs.jpg',
        '/images/atleti/5DBBCD63-4174-4C26-A6EE-CC82F66EDEE6.jpeg',
        '/images/atleti/FxoYkdFXgAIaWuw.jpg',
        '/images/atleti/HAx2BcoaAAMlbeQ.jpg',
      ],
    },
    'Taras Shpuk': {
      name: 'Taras Shpuk',
      role: 'Trainer, 34 years old.',
      description: 'A pioneer of the Invictus Games in Ukraine, he was a coach and sports manager dedicated to the recovery of veterans with disabilities, introducing disciplines such as wheelchair basketball and rugby. In 2022, he worked with the "Come Back Alive" foundation, delivering military equipment under fire and rescuing the national team\'s sports equipment from Irpin. In November 2023, he returned to active service in military intelligence, joining a special operations unit. He fell during a combat mission in September 2025 at the age of 34.',
      photos: [
        '/images/atleti/taras-shpuk-1.jpg',
        '/images/atleti/taras-shpuk-2.jpg',
      ],
    },
    'Pavlo Ishchenko': {
      name: 'Pavlo Ishchenko',
      role: 'Powerlifting Champion.',
      description: 'A world and European powerlifting champion, Pavlo dominated the national strongman scene by winning the Ukrainian title for four consecutive years, from 2022 to 2025. Originally from Hostomel, a city hit hard at the beginning of the occupation, he transformed his physical strength into a logistical resource for his comrades during military service. Despite his commitment at the front, he never stopped training or participating in strength competitions to represent his country. He died in October 2025 during a combat mission.',
      photos: [
        '/images/atleti/GTY9CXLWIAA7Yk_.jpg',
        '/images/atleti/Fmk4xm2WQAA4I2u.jpg',
        '/images/atleti/Fmk4xy-XwAEvvvu.jpg',
      ],
    },
    'Oleksiy Loginov': {
      name: 'Oleksiy Loginov',
      role: 'Ice Hockey Goalkeeper, 23 years old.',
      description: 'Raised in the "Kryzhynka" youth system, he debuted in the senior league in 2017 with "Kryzhani Vovky" before moving to the "Bilyi Bars" club. With the latter, he won the 2018 Ukrainian Under-20 Championship, establishing himself as one of the most promising goalkeepers of his generation. Immediately after the start of the full-scale invasion, he decided to enlist as a volunteer in the armed forces to serve in the most intense conflict zones. He died on November 8, 2023, during combat in the Luhansk region at the age of 23.',
      photos: [
        '/images/atleti/333_3921271641028059662_n1-scaled-e1674052179374.jpg',
        '/images/atleti/images.jpeg',
        '/images/atleti/G6CB9L8XkAEWsXl.jpg',
      ],
    },
    'Volodymyr Androshchuk': {
      name: 'Volodymyr Androshchuk',
      role: 'Decathlete, 22 years old.',
      description: 'An elite athlete of the Ukrainian national team, he became the Under-20 national champion in decathlon in 2019 and finished sixth in modern pentathlon at the European Championships in his category. He decided to suspend his preparation for future international competitions to enlist in the Ukrainian Armed Forces following the Russian invasion. He was sent to the eastern front, where he took part in some of the most grueling battles of the conflict. He was killed in January 2023 during fierce clashes near the city of Bakhmut at the age of 22.',
      photos: [
        '/images/atleti/274207605_249662700687642_7747352295095232732_n1-e1765827287281.jpg',
        '/images/atleti/3478.jpg',
        '/images/atleti/81345.jpg',
      ],
    },
    'Oleksiy Khabarov': {
      name: 'Oleksiy Khabarov',
      role: 'Sport Shooter, International Master of Sports.',
      description: 'An International Class Master of Sports, he represented Ukraine at major world shooting ranges, setting the national record in the 10m air rifle in 2017 with 248.5 points. After years of competing at the highest levels, he put his ballistic expertise at the service of the Ukrainian Armed Forces as an operational soldier. He was deployed to the front lines in the eastern sector, actively participating in the defense of national territory. He died in August 2025 during a battle in the Donetsk region.',
      photos: [
        '/images/atleti/figma-img-69.jpg',
        '/images/atleti/figma-img-70.jpg',
        '/images/atleti/475028494_1425865278695054_43363222566775823_n.jpg',
        '/images/atleti/HA1LFD_W0AA9N5j.jpg',
      ],
    },
    'Mykyta Kozubenko': {
      name: 'Mykyta Kozubenko',
      role: 'Diving Coach, 31 years old.',
      description: 'A Master of Sports in diving and a federal coach at the Mykolaiv sports school, he dedicated much of his life to the technical perfection of the athletic gesture from the springboards. Having entered the world of sports as a child, he became a reference figure for young divers in his region. At the outbreak of the conflict, he joined the National Guard of Ukraine, providing operational service in combat zones. He fell at the front in June 2025, at the age of 31, while carrying out his military duties.',
      photos: [
        '/images/atleti/Mykyta_Kozubenko-2.jpg',
        '/images/atleti/GToqxw6XgAAaa21.jpg',
        '/images/atleti/figma-screenshot110.jpg',
      ],
    },
    'Andriy Yaremenko': {
      name: 'Andriy Yaremenko',
      role: 'Greco-Roman Wrestler, 26 years old.',
      description: 'A national-level wrestler and multiple-time medalist at the Ukrainian championships, Andriy was a regular member of the national Greco-Roman wrestling team. During the conflict, he chose to specialize as an unmanned aerial vehicle (UAV) operator within the 115th Territorial Defense Brigade. He applied the discipline and concentration gained on the wrestling mat to the technological management of modern defense at the front. He died on December 4, 2025, during a combat mission, just a few days before his twenty-sixth birthday.',
      photos: [
        '/images/atleti/figma-img-92.jpg',
        '/images/atleti/410459057_936141854736959_4256978697660536273_n-e1706216710523.jpg',
      ],
    },
    'Fedor Epifanov': {
      name: 'Fedor Epifanov',
      role: 'Fencer, 18 years old.',
      description: 'An emerging talent in international fencing, Fedor was a Ukrainian national champion and represented his country at the 2021 Cadet World Championships. Despite a rapidly rising competitive career, he decided to suspend all sporting activities at just 18 years old to enlist as a volunteer in the Ukrainian Armed Forces. He was sent to the southern front to participate in defensive and counter-offensive operations. He fell on December 11, 2023, during violent clashes in the Zaporizhzhia region, shortly after reaching the age of majority.',
      photos: [
        '/images/atleti/Fedir-Yepifanov.webp.jpeg',
        '/images/atleti/figma-img-86.jpg',
        '/images/atleti/figma-img-87.jpg',
      ],
    },
    'Kateryna Troyan': {
      name: 'Kateryna Troyan',
      role: 'Runner and journalist, 32 years old.',
      description: 'A national-level middle-distance runner and professional journalist, she combined her sporting activities with a career in information for years. During the Russian invasion, she chose to undertake active military service to contribute to the defense of the Ukrainian state. She was assigned as a defender in operational units deployed in the difficult Pokrovsk sector on the eastern front. She was killed in June 2025, at the age of 32, while on an operational mission in one of the most contested areas of the conflict.',
      photos: [
        '/images/atleti/ukrainian-fpv-drone-operator-32-year-old-kateryna-troyan-v0-6c7mp863zq5f1.jpg',
        '/images/atleti/GtGAa82XAAA44KX.jpg',
        '/images/atleti/ukrainian-fpv-drone-operator-32-year-old-kateryna-troyan-v0-4wwvh863zq5f1.jpg',
      ],
    },
    'Nazar Zuy': {
      name: 'Nazar Zuy',
      role: 'Young athlete, 13 years old.',
      description: 'A young sports prospect from Mariupol, Nazar split his competitive activity between the boxing ring and local football pitches at only 13 years old. During the violent siege of the city of Mariupol in March 2022, he was with his family inside their apartment building. He was killed when a Russian aerial bomb struck the residential building, destroying it completely. Both of his parents also lost their lives in the attack, extinguishing the entire family unit under the rubble.',
      photos: [
        '/images/atleti/figma-img-73.jpg',
        '/images/atleti/figma-img-74.jpg',
      ],
    },
    'Mariia Lebid': {
      name: 'Mariia Lebid',
      role: 'Dance Sport athlete, 15 years old.',
      description: 'A competitive dance sport athlete in Dnipro, Mariia represented one of the young prospects of a sector in which Ukraine boasts a solid international tradition. Her career was abruptly cut short on January 14, 2023, when a Russian Kh-22 missile struck an entire residential block in her city. Mariia was at home alone at the time of impact, which caused the partial collapse of the apartment building. She died instantly at the age of 15, becoming one of the most well-known civilian victims of the bombing of Dnipro.',
      photos: [
        '/images/atleti/figma-img-63.jpg',
        '/images/atleti/figma-img-64.jpg',
        '/images/atleti/figma-img-65.jpg',
      ],
    },
    'Alina Perehudova': {
      name: 'Alina Perehudova',
      role: 'Weightlifter, 14 years old.',
      description: 'A 14-year-old weightlifter, Alina was already the Under-17 national champion in 2021 and was part of the preparation program for the Ukrainian national team. She was killed in 2022 during the siege of Mariupol, a victim of the bombings that destroyed the residential neighborhood where she lived. Alina died under the rubble of her home along with her mother; in the same context, her brother was killed by a Russian sniper while attempting to rescue the two women trapped after the bombardment.',
      photos: [
        '/images/atleti/figma-img-84.jpg',
        '/images/atleti/figma-img-85.jpg',
      ],
    },
    'Oleksandr Peleshenko': {
      name: 'Oleksandr Peleshenko',
      role: 'Two-time European Weightlifting Champion, 30 years old.',
      description: 'A two-time European weightlifting champion (2016 and 2017), he represented Ukraine at the Rio 2016 Olympic Games, finishing fourth in the 85 kg category. He joined the Ukrainian Armed Forces in February 2022, putting his remarkable physical strength at the service of combat units and heavy military logistics at the front. He operated in conflict zones for over two consecutive years before his final mission. He fell in combat in May 2024 at the age of 30, leaving behind a significant sporting legacy on the world stage.',
      photos: [
        '/images/atleti/figma-img-88.jpg',
        '/images/atleti/figma-img-89.jpg',
        '/images/atleti/00olympics-ukraine-lost-mzql-videoSixteenByNineJumbo1600-v2.jpg',
        '/images/atleti/743dcc75a0f2490a.jpg',
      ],
    },
    'Kateryna Diachenko': {
      name: 'Kateryna Diachenko',
      role: 'Rhythmic Gymnast, 11 years old.',
      description: 'At only 11 years old, Kateryna was a rhythmic gymnast already known in local Mariupol sports circles for her technical skills and dedication to the discipline. She died instantly in March 2022 when an aerial bomb hit the home she was in with her father, who also perished in the impact. The tragedy affected the entire family: her mother and brother, who initially survived but were injured, died shortly after when the Mariupol hospital where they were admitted was also destroyed by a bombardment.',
      photos: [
        '/images/atleti/figma-ss-102714.jpg',
        '/images/atleti/figma-ss-102728.jpg',
        '/images/atleti/figma-ss-102738.jpg',
      ],
    },
    'Viktoriia Ivashko': {
      name: 'Viktoriia Ivashko',
      role: 'Judoka, 9 years old.',
      description: 'A young 9-year-old judoka, Viktoriia competed for the "Judo Master" club in Kyiv and regularly attended competitive training courses in the capital. On June 1, 2023, during a massive night-time missile attack on Kyiv, she was trying to reach an air-raid shelter with her mother. Both were killed by the explosion of a Russian missile that fell near the entrance of the shelter. Her death occurred symbolically during International Children\'s Day, drawing global attention to the young civilian victims of the war.',
      photos: [
        '/images/atleti/figma-ss-102944.jpg',
        '/images/atleti/figma-ss-103425.jpg',
      ],
    },
    'Andriy Kutsenko': {
      name: 'Andriy Kutsenko',
      role: 'Track Cycling Champion.',
      description: 'A multiple-time Ukrainian track cycling champion and leading national team athlete, he represented Ukrainian colors in numerous international competitions. At the outbreak of the Russian invasion in 2022, he decided to suspend his sporting career to enlist in the army and defend national territory. He served actively in various combat operations for over two consecutive years. He died during a combat mission in the Donetsk region on July 3, 2024, and was commemorated by the cycling federation for his civil and military commitment.',
      photos: [
        '/images/atleti/2017_UEC_Track_Elite_European_Championships_407.jpg',
        '/images/atleti/HA1LF4BaQAAWWrq.jpg',
        '/images/atleti/hq720.jpg',
        '/images/atleti/HAx1_uDXgAAkUkl.jpg',
      ],
    },
    'Daria Kurdel': {
      name: 'Daria Kurdel',
      role: 'Dance Sport Champion, 20 years old.',
      description: 'A 20-year-old national dance sport champion, Daria was an established athlete who participated in the country\'s major competitive circuits. In July 2022, she was in the city of Kryvyi Rih conducting an outdoor training session with her father in a residential area. She fell victim to a Russian missile attack that struck the area, causing explosions and the spread of lethal metal fragments. She died from the severe injuries sustained, while her father survived although he was wounded in the attack.',
      photos: [
        '/images/atleti/figma-img-66.jpg',
        '/images/atleti/figma-img-67.jpg',
        '/images/atleti/figma-ss-103435.jpg',
      ],
    },
    'Ivan Kononenko': {
      name: 'Ivan Kononenko',
      role: 'Actor, veterinarian and strongman, 42 years old.',
      description: 'An eclectic figure on the Ukrainian scene, Ivan was a veterinary surgeon, television actor (known for "Servant of the People"), and an athlete on Vasyl Virastiuk\'s strongman team. Having enlisted in the Territorial Defense on February 24, 2022, he returned to the front as a platoon commander after recovering from a serious leg injury. He disappeared in November 2024 during a military operation in the Kursk region; his death was officially confirmed in December 2025 at the age of 42. He leaves behind his wife and two sons, Arkhyp and Nikita.',
      photos: [
        '/images/atleti/figma-img-60.jpg',
        '/images/atleti/figma-img-61.jpg',
        '/images/atleti/figma-ss-103442.jpg',
        '/images/atleti/figma-ss-103500.jpg',
      ],
    },
  }

  let activeAthlete = $state(null)

  const faces = [
    { name: 'Maksym Halinichev',     rotation: { x: 0, y: 1.83,  z: 0 } },
    { name: 'Dmytro Sharpar',        rotation: { x: 0, y: 1.571, z: 0 } },
    { name: 'Yevhen Malyshev',       rotation: { x: 0, y: 1.0,   z: 0 } },
    { name: 'Karyna Bakhur',         rotation: { x: 0, y: 1.5,   z: 0 } },
    { name: 'Taras Shpuk',           rotation: { x: 0, y: 2.0,   z: 0 } },
    { name: 'Pavlo Ishchenko',       rotation: { x: 0, y: 2.5,   z: 0 } },
    { name: 'Oleksiy Loginov',       rotation: { x: 0, y: 10.5,  z: 0 } },
    { name: 'Volodymyr Androshchuk', rotation: { x: 0, y: 3.5,   z: 0 } },
    { name: 'Oleksiy Khabarov',      rotation: { x: 0, y: 1.0,   z: 0 } },
    { name: 'Mykyta Kozubenko',      rotation: { x: 0, y: 4.5,   z: 0 } },
    { name: 'Andriy Yaremenko',      rotation: { x: 0, y: 5.0,   z: 0 } },
    { name: 'Fedor Epifanov',        rotation: { x: 0, y: 8.0,   z: 0 } },
    { name: 'Kateryna Troyan',       rotation: { x: 0, y: 6.0,   z: 0 } },
    { name: 'Nazar Zuy',             rotation: { x: 0, y: 6.5,   z: 0 } },
    { name: 'Mariia Lebid',          rotation: { x: 0, y: 7.0,   z: 0 } },
    { name: 'Alina Perehudova',      rotation: { x: 0, y: 10.5,  z: 0 } },
    { name: 'Oleksandr Peleshenko',  rotation: { x: 0, y: 8.0,   z: 0 } },
    { name: 'Kateryna Diachenko',    rotation: { x: 0, y: 8.5,   z: 0 } },
    { name: 'Viktoriia Ivashko',     rotation: { x: 0, y: 9.0,   z: 0 } },
    { name: 'Andriy Kutsenko',       rotation: { x: 0, y: 9.5,   z: 0 } },
    { name: 'Daria Kurdel',          rotation: { x: 0, y: 10,    z: 0 } },
    { name: 'Ivan Kononenko',        rotation: { x: 0, y: 10.5,  z: 0 } },
  ]

  const PX_PER_STEP  = 300
  const SCROLL_HEIGHT = PX_PER_STEP * (faces.length - 1)
  const INTRO_PX     = 1200  // scroll per la transizione intro

  const clamp   = (x, a, b) => Math.max(a, Math.min(b, x))
  const lerp    = (a, b, t) => a + (b - a) * t
  const ease    = (t) => t < 0.5 ? 4*t*t*t : 1 - ((-2*t+2)**3)/2

  // Valori iniziali (bio end state)
  const BIO_CAM_Y   = 0.25
  const BIO_CAM_Z   = 8.5
  const BIO_LOOK_Y  = 0.20
  const BIO_ROT_X   = 0.25
  const BIO_ROT_Y   = Math.PI  // visiera frontale

  // Valori target gallery
  const ATH_CAM_Y  = -0.01
  const ATH_CAM_Z  =  6.0
  const ATH_LOOK_Y =  0.0
  const ATH_ROT_X  =  0.0

  let wrapper  = null
  let selected = $state(0)
  let introP   = $state(0)

  // Nomi: salgono dal basso durante intro
  let namesTranslateY = $derived(
    lerp(100, 0, ease(clamp((introP - 0.25) / 0.65, 0, 1))) + 'vh'
  )
  let namesOpacity = $derived(ease(clamp((introP - 0.20) / 0.40, 0, 1)))

  let displaySlots = $derived.by(() => {
    const slots = []
    for (let i = 2; i >= 1; i--) {
      const index = selected - i
      slots.push(index >= 0
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true })
    }
    slots.push({ name: faces[selected].name, index: selected, isEmpty: false })
    for (let i = 1; i <= 2; i++) {
      const index = selected + i
      slots.push(index < faces.length
        ? { name: faces[index].name, index, isEmpty: false }
        : { name: '', index: -1, isEmpty: true })
    }
    return slots
  })

  function updateRotation(index) {
    // Aggiorna il target direttamente: il lerp in HelmetGlobalScene smootha la transizione
    helmetStore.rotX = 0
    helmetStore.rotY = faces[index].rotation.y
    helmetStore.rotZ = 0
  }

  function onScroll() {
    if (!wrapper) return
    const scrolledInside = -wrapper.getBoundingClientRect().top

    // Uscita dalla sezione: disattiva canvas globale
    if (scrolledInside > INTRO_PX + SCROLL_HEIGHT) {
      helmetStore.visible = false
      return
    }

    // Prima dell'ingresso nella sezione
    if (scrolledInside < 0) return

    // Attiva sempre il canvas globale quando siamo dentro questa sezione
    helmetStore.visible = true

    const newIntroP = clamp(scrolledInside / INTRO_PX, 0, 1)
    introP = newIntroP

    if (newIntroP < 1) {
      // ── Fase intro: scroll-driven, applica diretto (no lerp extra) ──
      helmetStore.smoothRotation = false
      const ei = ease(clamp(newIntroP / 0.65, 0, 1))
      helmetStore.viewerPaddingLeft = lerp(0, 45, ei) + '%'
      helmetStore.cameraY = lerp(BIO_CAM_Y,  ATH_CAM_Y,  ei)
      helmetStore.cameraZ = lerp(BIO_CAM_Z,  ATH_CAM_Z,  ei)
      helmetStore.lookAtY = lerp(BIO_LOOK_Y, ATH_LOOK_Y, ei)
      helmetStore.rotX    = lerp(BIO_ROT_X,  ATH_ROT_X,  ei)
      helmetStore.rotY    = lerp(BIO_ROT_Y,  faces[0].rotation.y, ei)
    } else {
      // ── Fase gallery: lerp fluido verso il volto selezionato ──
      helmetStore.smoothRotation = true
      helmetStore.viewerPaddingLeft = '45%'
      helmetStore.cameraY = ATH_CAM_Y
      helmetStore.cameraZ = ATH_CAM_Z
      helmetStore.lookAtY = ATH_LOOK_Y
      helmetStore.rotX    = ATH_ROT_X

      const galleryScrolled = Math.max(0, scrolledInside - INTRO_PX)
      const newSelected = Math.min(faces.length - 1, Math.floor(galleryScrolled / PX_PER_STEP))
      if (newSelected !== selected) {
        selected = newSelected
        updateRotation(selected)
      }
    }
  }

  function selectFace(index) {
    if (index === -1) return

    // If this athlete has detail data, open the overlay instead of scrolling
    const name = faces[index].name
    if (athleteDetails[name]) {
      activeAthlete = athleteDetails[name]
      return
    }

    selected = index
    updateRotation(selected)
    const target = wrapper.offsetTop + INTRO_PX + index * PX_PER_STEP
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  onMount(() => {
    let rafId
    const handler = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(onScroll)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      cancelAnimationFrame(rafId)
    }
  })
</script>

<div
  class="gallery-wrapper"
  bind:this={wrapper}
  id="helmet"
  style="height: calc(100vh + {INTRO_PX + SCROLL_HEIGHT}px)"
>
  <div class="gallery-sticky">
    <!-- I nomi salgono dal basso durante la fase intro -->
    <div
      class="names"
      style:transform="translateY({namesTranslateY})"
      style:opacity={namesOpacity}
    >
      {#each displaySlots as slot}
        {#if slot.isEmpty}
          <div class="name empty"></div>
        {:else}
          <div
            class="name"
            class:selected={slot.index === selected}
            class:has-detail={!!athleteDetails[faces[slot.index]?.name]}
            role="button"
            tabindex="0"
            on:click={() => selectFace(slot.index)}
            on:keydown={(e) => e.key === 'Enter' && selectFace(slot.index)}
          >
            {slot.name}
          </div>
        {/if}
      {/each}
    </div>
    <!-- Il casco 3D è renderizzato dal canvas globale fisso (HelmetGlobal) -->
  </div>
</div>

<!-- Athlete detail overlay -->
<AthleteDetail athlete={activeAthlete} onClose={() => (activeAthlete = null)} />

<style>
  .gallery-wrapper {
    position: relative;
    width: 100%;
  }

  .gallery-sticky {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    /* z-index > canvas globale (z:3): crea stacking context sopra il canvas */
    z-index: 10;
    /* Trasparente: il canvas globale fisso fornisce lo sfondo scuro */
    background: transparent;
    overflow: hidden;
  }

  .names {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: var(--gap-header-links, 3rem);
    padding: 0 var(--padding-lateral, 5rem);
    user-select: none;
    z-index: 10;
    pointer-events: none;
  }

  .name {
    font-family: var(--font-primary, 'GeistPixel'), monospace;
    font-size: var(--font-size-h1);
    font-weight: 500;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--color-ink);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    letter-spacing: -0.03em;
    line-height: 1;
    pointer-events: auto;
    text-transform: uppercase;
  }

  .name.empty { pointer-events: none; }

  .name.selected {
    color: var(--color-ink, #fff);
    -webkit-text-stroke: 0;
    transform: scale(1.30);
    transform-origin: left center;
  }

  .name:hover:not(.empty) { margin-left: var(--gap-filter-options, 1rem); }

  .name.selected:hover { transform: scale(1.30); }

  /* Names with detail panel get a subtle cursor cue */
  .name.has-detail { cursor: pointer; }

  @media (max-width: 768px) {
    .names {
      align-items: center;
      padding: 0 var(--padding-lateral, 2rem);
      gap: var(--gap-filter-options, 2.5rem);
    }
    .name {
      font-size: var(--font-size-h2, 2rem);
      text-align: center;
      -webkit-text-stroke: 1px var(--color-ink, #fff6);
      letter-spacing: 0.01em;
    }
    .name.selected {
      transform: scale(1.50);
      transform-origin: center center;
      margin-left: 0;
    }
    .name.selected:hover { transform: scale(1.50); }
    .name:hover:not(.empty) { margin-left: 0; }
  }
</style>
