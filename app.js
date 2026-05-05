'use strict';

// ===================== ANIME DATA (65 titles, 1963–2024) =====================
const ANIME = [
  // ── 1960s ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🤖", bg:"linear-gradient(135deg,#001a1a,#003333)",
    title:"Astro Boy", year:1963, rating:7.8,
    tags:["scifi","action","drama"],
    desc:"The birth of anime as a global medium. Osamu Tezuka's robot boy with a human heart fights for peace in a futuristic world. The series that started it all — 193 episodes of timeless storytelling.",
    info:"193 Episodes", studio:"Mushi Production" },

  // ── 1970s ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🎩", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Lupin III Part I", year:1971, rating:8.1,
    tags:["action","comedy","adventure"],
    desc:"The world's greatest thief and his eccentric crew pull off impossible capers. A stylish blend of James Bond cool and slapstick comedy that became one of the most enduring anime franchises ever.",
    info:"23 Episodes", studio:"TMS Entertainment" },

  { rank:"A", emoji:"🚀", bg:"linear-gradient(135deg,#001020,#002040)",
    title:"Space Battleship Yamato", year:1974, rating:7.9,
    tags:["scifi","action","drama"],
    desc:"Earth is dying from alien bombardment. The crew of the ancient battleship Yamato races across the galaxy for humanity's last hope. The grandfather of all space opera anime.",
    info:"26 Episodes", studio:"Aeolus Production" },

  // ── 1979 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🤖", bg:"linear-gradient(135deg,#0a0a14,#1a1a2e)",
    title:"Mobile Suit Gundam", year:1979, rating:8.3,
    tags:["mecha","scifi","action","drama"],
    desc:"The original Gundam revolutionized the mecha genre by treating war with moral complexity. Follows teenage pilot Amuro Ray through the One Year War — grim, realistic, and politically layered.",
    info:"43 Episodes", studio:"Sunrise" },

  // ── 1980s ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"💥", bg:"linear-gradient(135deg,#1a0500,#330a00)",
    title:"Fist of the North Star", year:1984, rating:7.8,
    tags:["action","drama","thriller"],
    desc:"In a post-apocalyptic wasteland, the legendary martial artist Kenshiro avenges the weak. Iconic for its over-the-top violence and surprisingly deep themes of love and sacrifice.",
    info:"109 Episodes", studio:"Toei Animation" },

  { rank:"S", emoji:"🐉", bg:"linear-gradient(135deg,#1a0800,#331500)",
    title:"Dragon Ball", year:1986, rating:8.0,
    tags:["action","comedy","adventure","fantasy"],
    desc:"Goku's origin story — a boy with a tail searches for Dragon Balls across a wild, humorous world. Akira Toriyama's masterwork set the template for all battle shonen that followed.",
    info:"153 Episodes", studio:"Toei Animation" },

  { rank:"A", emoji:"⭐", bg:"linear-gradient(135deg,#0a0a00,#1a1a00)",
    title:"Saint Seiya", year:1986, rating:7.9,
    tags:["action","fantasy","drama"],
    desc:"Young Bronze Saints clad in mythical armor fight to protect Athena. A defining series of the late 80s that blended Greek mythology with tournament-style battles in spectacular fashion.",
    info:"114 Episodes", studio:"Toei Animation" },

  { rank:"S", emoji:"🌆", bg:"linear-gradient(135deg,#0d001a,#200033)",
    title:"Akira", year:1988, rating:8.6,
    tags:["scifi","action","psychological","thriller"],
    desc:"Neo-Tokyo 2019 — a biker gang member gains terrifying psychic powers after a government experiment. The film that introduced anime to Western audiences and redefined animated storytelling.",
    info:"Film", studio:"TMS Entertainment", awards:[{cls:'critics', text:'🎬 Cannes Film Festival'}] },

  // ── 1989 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🔴", bg:"linear-gradient(135deg,#1a0000,#330000)",
    title:"Dragon Ball Z", year:1989, rating:8.8,
    tags:["action","fantasy","drama","adventure"],
    desc:"Goku and his friends defend Earth against ever-more-powerful extraterrestrial threats. The series that defined a generation's understanding of what anime could be — power levels and all.",
    info:"291 Episodes", studio:"Toei Animation" },

  // ── 1990s ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🌙", bg:"linear-gradient(135deg,#1a0015,#30002a)",
    title:"Sailor Moon", year:1992, rating:7.7,
    tags:["fantasy","romance","action","drama"],
    desc:"A clumsy schoolgirl transforms into a cosmic guardian of love and justice. The anime that launched a thousand magical girl series and broke barriers for female-led action storytelling worldwide.",
    info:"200 Episodes", studio:"Toei Animation" },

  { rank:"S", emoji:"🔥", bg:"linear-gradient(135deg,#001a00,#003300)",
    title:"Yu Yu Hakusho", year:1992, rating:8.5,
    tags:["action","fantasy","comedy","thriller"],
    desc:"A delinquent teenager dies saving a child and is hired as an Underworld Detective. One of the greatest tournament arcs in anime history, with surprisingly nuanced characters.",
    info:"112 Episodes", studio:"Pierrot" },

  { rank:"S", emoji:"👁️", bg:"linear-gradient(135deg,#001520,#003040)",
    title:"Ghost in the Shell", year:1995, rating:8.0,
    tags:["scifi","action","psychological","thriller"],
    desc:"In a cyberpunk future, cyborg Major Kusanagi hunts a mysterious hacker called the Puppet Master. A philosophical landmark that influenced The Matrix, Blade Runner 2049, and AI discourse forever.",
    info:"Film", studio:"Production I.G" },

  { rank:"S", emoji:"🌌", bg:"linear-gradient(135deg,#1a0000,#330a00)",
    title:"Neon Genesis Evangelion", year:1995, rating:8.5,
    tags:["mecha","scifi","psychological","drama"],
    desc:"Teenagers pilot bio-mechanical giants against cosmic Angels threatening humanity. The anime that deconstructed the mecha genre with crushing psychological depth and a divisive, unforgettable ending.",
    info:"26 Episodes", studio:"Gainax", awards:[{cls:'special', text:'🌟 Cultural Phenomenon'}] },

  { rank:"A", emoji:"⚔️", bg:"linear-gradient(135deg,#001500,#002800)",
    title:"Rurouni Kenshin", year:1996, rating:8.3,
    tags:["action","historical","drama"],
    desc:"A legendary assassin wanders Meiji-era Japan, having vowed never to kill again. Beautifully drawn swordfight choreography meets genuine philosophical questions about sin and redemption.",
    info:"94 Episodes", studio:"Gallop" },

  { rank:"S", emoji:"🐺", bg:"linear-gradient(135deg,#0a001a,#1a0033)",
    title:"Berserk", year:1997, rating:8.6,
    tags:["action","fantasy","drama","horror"],
    desc:"Mercenary Guts joins the Band of the Hawk under the charismatic Griffith. Dark medieval fantasy at its most brutal and beautiful — the Eclipse arc remains the most devastating in anime history.",
    info:"25 Episodes", studio:"OLM" },

  { rank:"S", emoji:"🚀", bg:"linear-gradient(135deg,#001820,#003040)",
    title:"Cowboy Bebop", year:1998, rating:8.9,
    tags:["scifi","action","drama","thriller"],
    desc:"Bounty hunters drift through the solar system in 2071. A jazz-soaked, genre-defying masterpiece blending noir, blues, and existential longing. The most stylistically perfect anime ever made.",
    info:"26 Episodes", studio:"Sunrise", awards:[{cls:'critics', text:'🏆 Critics\' Icon'}] },

  { rank:"A", emoji:"🌵", bg:"linear-gradient(135deg,#1a1000,#2a1a00)",
    title:"Trigun", year:1998, rating:8.3,
    tags:["action","scifi","comedy","drama"],
    desc:"Vash the Stampede — the humanoid typhoon with a $$60 billion bounty — is actually the most pacifistic man alive. A masterful balance of humor and genuine tragedy in a post-apocalyptic desert world.",
    info:"26 Episodes", studio:"Madhouse" },

  { rank:"A", emoji:"💻", bg:"linear-gradient(135deg,#001020,#001830)",
    title:"Serial Experiments Lain", year:1998, rating:8.1,
    tags:["scifi","psychological","thriller","mystery"],
    desc:"A quiet girl discovers the Wired — a vast network eerily like the internet — and begins to lose the boundary between reality and digital existence. Eerily prescient about online identity.",
    info:"13 Episodes", studio:"Triangle Staff" },

  { rank:"A", emoji:"🌸", bg:"linear-gradient(135deg,#200020,#350035)",
    title:"Cardcaptor Sakura", year:1998, rating:8.1,
    tags:["fantasy","romance","comedy","adventure"],
    desc:"A fourth-grader accidentally releases magical cards and must capture them all. A beautifully animated magical girl series with emotional depth and characters that feel genuinely real.",
    info:"70 Episodes", studio:"Madhouse" },

  { rank:"S", emoji:"🏴‍☠️", bg:"linear-gradient(135deg,#1a0800,#331500)",
    title:"One Piece", year:1999, rating:9.0,
    tags:["action","adventure","fantasy","comedy"],
    desc:"Luffy and his crew sail the Grand Line to reach the One Piece. The greatest long-running adventure in anime — over 1000 episodes of consistently escalating world-building and emotional storytelling.",
    info:"1100+ Episodes", studio:"Toei Animation" },

  // ── 2000s ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🥊", bg:"linear-gradient(135deg,#001a08,#003015)",
    title:"Hajime no Ippo", year:2000, rating:8.8,
    tags:["sports","action","comedy","drama"],
    desc:"A bullied, timid boy discovers boxing and dedicates his life to the pursuit of the strongest punch. The definitive sports anime — every fight is a cinematic masterpiece of tension and heart.",
    info:"75 Episodes", studio:"Madhouse" },

  { rank:"A", emoji:"🌿", bg:"linear-gradient(135deg,#001a05,#003010)",
    title:"Fruits Basket", year:2001, rating:8.0,
    tags:["romance","drama","comedy","fantasy"],
    desc:"An orphan girl lives with the enigmatic Sohma clan — cursed to transform into Chinese zodiac animals. A surprisingly emotional exploration of trauma, family, and unconditional love.",
    info:"26 Episodes", studio:"Studio DEEN" },

  { rank:"S", emoji:"🍃", bg:"linear-gradient(135deg,#001800,#002d00)",
    title:"Naruto", year:2002, rating:8.4,
    tags:["action","fantasy","drama","adventure"],
    desc:"An outcast ninja dreams of becoming Hokage. Nearly 500 episodes of growing up, loss, and finding your place — with some of the most beloved characters and iconic moments in shonen history.",
    info:"220 Episodes", studio:"Pierrot" },

  { rank:"A", emoji:"⚗️", bg:"linear-gradient(135deg,#1a0a00,#2e1500)",
    title:"Fullmetal Alchemist (2003)", year:2003, rating:8.3,
    tags:["action","fantasy","drama","thriller"],
    desc:"The Elric brothers' quest to restore their bodies — this original adaptation diverges from the manga into darker, more surrealist territory with a uniquely bleak ending that divides fans.",
    info:"51 Episodes", studio:"Bones" },

  { rank:"A", emoji:"🌊", bg:"linear-gradient(135deg,#001020,#001a38)",
    title:"Planetes", year:2003, rating:8.1,
    tags:["scifi","drama","romance"],
    desc:"Near-future garbage collectors in orbit. One of anime's most realistic and humanistic takes on space exploration — about the unglamorous, essential work that makes dreams possible.",
    info:"26 Episodes", studio:"Sunrise" },

  { rank:"A", emoji:"⚔️", bg:"linear-gradient(135deg,#000d1a,#001533)",
    title:"Bleach", year:2004, rating:8.1,
    tags:["action","fantasy","adventure"],
    desc:"A teenager becomes a Soul Reaper and defends the living world from evil spirits. The Soul Society arc remains one of the most thrilling extended story arcs in shonen history.",
    info:"366 Episodes", studio:"Pierrot" },

  { rank:"S", emoji:"🔍", bg:"linear-gradient(135deg,#001a10,#003320)",
    title:"Monster", year:2004, rating:9.0,
    tags:["thriller","psychological","mystery","drama"],
    desc:"A brilliant surgeon saves a boy's life against orders — and that boy grows into a serial killer. A slow-burn masterpiece of moral ambiguity and European noir spanning 74 immaculate episodes.",
    info:"74 Episodes", studio:"Madhouse" },

  { rank:"S", emoji:"🎵", bg:"linear-gradient(135deg,#1a0f00,#2e1c00)",
    title:"Samurai Champloo", year:2004, rating:8.5,
    tags:["action","historical","comedy","adventure"],
    desc:"Two incompatible swordsmen and a girl search feudal Japan for a 'sunflower-scented samurai.' Shinichiro Watanabe infuses hip-hop culture into Edo Japan with breathtaking fight choreography.",
    info:"26 Episodes", studio:"Manglobe" },

  { rank:"A", emoji:"🧬", bg:"linear-gradient(135deg,#0d0000,#200000)",
    title:"Elfen Lied", year:2004, rating:7.8,
    tags:["scifi","horror","drama","action"],
    desc:"A mutant girl with invisible telekinetic arms escapes a research facility. Brutal, visceral, and surprisingly heartbreaking — a deeply uncomfortable story about what society does to the different.",
    info:"13 Episodes", studio:"Arms" },

  // ── 2006 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"💀", bg:"linear-gradient(135deg,#0a0a1a,#1a1a3a)",
    title:"Death Note", year:2006, rating:8.6,
    tags:["thriller","psychological","mystery","drama"],
    desc:"A high school genius finds a notebook that kills anyone whose name is written in it. The most compelling cat-and-mouse battle in anime — L vs Light is one of fiction's greatest rivalries.",
    info:"37 Episodes", studio:"Madhouse" },

  { rank:"A", emoji:"🎭", bg:"linear-gradient(135deg,#1a001a,#330033)",
    title:"Code Geass", year:2006, rating:8.7,
    tags:["mecha","action","thriller","drama"],
    desc:"An exiled prince gains the power of absolute command and wages war to liberate Japan from an empire. Chess-meets-mecha political thriller with one of anime's most debated final episodes.",
    info:"50 Episodes", studio:"Sunrise" },

  // ── 2007 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌀", bg:"linear-gradient(135deg,#001533,#002a60)",
    title:"Gurren Lagann", year:2007, rating:8.7,
    tags:["mecha","action","adventure","drama"],
    desc:"A boy who has never seen the sky drills through the earth — and eventually through the universe. The most purely triumphant anime ever made; every episode escalates beyond comprehension.",
    info:"27 Episodes", studio:"Gainax" },

  { rank:"S", emoji:"❄️", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Clannad", year:2007, rating:8.9,
    tags:["drama","romance","comedy"],
    desc:"A delinquent meets a girl repeating her senior year alone. Clannad and its sequel After Story constitute anime's most devastating exploration of family, loss, and what makes a life meaningful.",
    info:"23 + 24 Episodes", studio:"Kyoto Animation" },

  { rank:"A", emoji:"🗡️", bg:"linear-gradient(135deg,#0d0d00,#1a1a00)",
    title:"Claymore", year:2007, rating:8.0,
    tags:["action","fantasy","horror","drama"],
    desc:"Half-human, half-monster warriors hunt Yoma in medieval-like lands. Underrated dark fantasy with a strong female protagonist and body-horror transformations that rival modern titles.",
    info:"26 Episodes", studio:"Madhouse" },

  // ── 2008 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"💖", bg:"linear-gradient(135deg,#1a0015,#300025)",
    title:"Toradora", year:2008, rating:8.4,
    tags:["romance","comedy","drama"],
    desc:"A delinquent-looking softie and a tiny, fierce girl help each other pursue their crushes — until feelings redirect. The gold standard of high school romance anime with a genuinely earned ending.",
    info:"25 Episodes", studio:"J.C.Staff" },

  { rank:"A", emoji:"💀", bg:"linear-gradient(135deg,#0d001a,#1a0033)",
    title:"Soul Eater", year:2008, rating:7.9,
    tags:["action","fantasy","comedy","horror"],
    desc:"Students at a Grim Reaper's school train to turn their weapon-partners into Death Scythes by collecting corrupted souls. Unique art direction and memorable characters in a wonderfully weird world.",
    info:"51 Episodes", studio:"Bones" },

  // ── 2009 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#1a0533,#2d1b69)",
    title:"Fullmetal Alchemist: Brotherhood", year:2009, rating:9.1,
    tags:["action","fantasy","drama","thriller"],
    desc:"Two brothers sacrifice their bodies in a forbidden alchemy ritual and race to restore what was lost. The gold standard of shonen storytelling — flawless pacing, unforgettable characters, perfect ending.",
    info:"64 Episodes", studio:"Bones", awards:[{cls:'special', text:'🌟 #1 All-Time on MAL'}] },

  // ── 2011 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"⏳", bg:"linear-gradient(135deg,#0d1a00,#1a3300)",
    title:"Steins;Gate", year:2011, rating:9.1,
    tags:["scifi","thriller","drama","psychological"],
    desc:"A self-proclaimed mad scientist accidentally invents time travel via microwave. The most gripping time-loop narrative in anime — starts glacially slow, then becomes impossible to stop watching.",
    info:"24 Episodes", studio:"White Fox" },

  { rank:"S", emoji:"🎯", bg:"linear-gradient(135deg,#001a0d,#003320)",
    title:"Hunter x Hunter (2011)", year:2011, rating:9.0,
    tags:["action","fantasy","adventure","thriller"],
    desc:"A boy sets out to become a Hunter and find his missing father. The most intricately crafted power system and character arcs in shonen — Chimera Ant arc alone is a career-defining achievement.",
    info:"148 Episodes", studio:"Madhouse" },

  { rank:"S", emoji:"💜", bg:"linear-gradient(135deg,#0d001a,#200030)",
    title:"Puella Magi Madoka Magica", year:2011, rating:8.4,
    tags:["psychological","fantasy","drama","horror"],
    desc:"A girl is offered a wish in exchange for becoming a magical girl. A beautifully animated deconstruction of the magical girl genre that turns into a devastating meditation on hope and sacrifice.",
    info:"12 Episodes", studio:"Shaft" },

  // ── 2012 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"⚔️", bg:"linear-gradient(135deg,#001a20,#002d33)",
    title:"Sword Art Online", year:2012, rating:7.8,
    tags:["action","fantasy","scifi","romance","adventure"],
    desc:"Players are trapped inside a VR MMO where death in-game means death in real life. The Aincrad arc is anime's definitive 'trapped in a game' narrative — despite later uneven storytelling.",
    info:"25 Episodes", studio:"A-1 Pictures" },

  { rank:"S", emoji:"👁️", bg:"linear-gradient(135deg,#0a001a,#15002d)",
    title:"Psycho-Pass", year:2012, rating:8.4,
    tags:["scifi","thriller","psychological","mystery"],
    desc:"In a future where a system quantifies the likelihood of committing crimes, a detective discovers the system's fatal flaw. Dystopian sci-fi that channels Philip K. Dick through anime's lens.",
    info:"22 Episodes", studio:"Production I.G" },

  // ── 2013 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🔥", bg:"linear-gradient(135deg,#1a0a00,#4a1500)",
    title:"Attack on Titan", year:2013, rating:9.0,
    tags:["action","thriller","drama","mystery"],
    desc:"Humanity survives inside massive walls from man-eating giants. An epic of war, betrayal, and the terrifying cost of freedom that evolved from monster horror into one of fiction's most complex political dramas.",
    info:"87 Episodes", studio:"WIT / MAPPA", awards:[{cls:'special', text:'🌟 Generation-Defining Series'}] },

  { rank:"S", emoji:"✂️", bg:"linear-gradient(135deg,#1a0000,#3a0015)",
    title:"Kill la Kill", year:2013, rating:8.2,
    tags:["action","comedy","fantasy"],
    desc:"A girl arrives at a school ruled by a student council president with supernatural uniforms, seeking her father's killer. Trigger's anarchic debut — gloriously over-the-top and completely self-aware.",
    info:"24 Episodes", studio:"Trigger" },

  { rank:"A", emoji:"🧬", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"Parasyte: The Maxim", year:2014, rating:8.3,
    tags:["scifi","horror","thriller","action"],
    desc:"Alien parasites invade Earth's brains — except one that only takes over a teenager's right hand. A visceral body-horror that uses its premise to ask fundamental questions about what makes us human.",
    info:"24 Episodes", studio:"Madhouse" },

  // ── 2014 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🏐", bg:"linear-gradient(135deg,#001a05,#003010)",
    title:"Haikyuu!!", year:2014, rating:8.7,
    tags:["sports","drama","comedy"],
    desc:"A short boy obsessed with volleyball joins a team and meets his polar opposite rival. The best sports anime ever made — turns every single volleyball match into an emotional, cinematic event.",
    info:"85 Episodes", studio:"Production I.G" },

  { rank:"A", emoji:"🏓", bg:"linear-gradient(135deg,#001a1a,#003333)",
    title:"Ping Pong the Animation", year:2014, rating:8.6,
    tags:["sports","drama","psychological"],
    desc:"Five table tennis players and their contrasting philosophies on talent, effort, and what sport means. Masaaki Yuasa's unconventional art style makes this the most artistic sports anime ever.",
    info:"11 Episodes", studio:"Tatsunoko Production" },

  // ── 2015 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"👊", bg:"linear-gradient(135deg,#001020,#001a33)",
    title:"One Punch Man", year:2015, rating:8.7,
    tags:["action","comedy","scifi","fantasy"],
    desc:"A hero who can defeat any enemy with a single punch is utterly bored. A brilliant deconstruction of the superhero genre with Madhouse's most kinetic animation work ever committed to screen.",
    info:"12 Episodes", studio:"Madhouse" },

  { rank:"A", emoji:"🦴", bg:"linear-gradient(135deg,#001a20,#002d38)",
    title:"Overlord", year:2015, rating:7.9,
    tags:["fantasy","action","scifi","comedy"],
    desc:"A player is trapped in an MMORPG as his skeleton overlord character after the game shuts down. Dark, clever isekai that explores power from the villain's perspective with surprising political intrigue.",
    info:"52 Episodes", studio:"Madhouse" },

  // ── 2016 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🕰️", bg:"linear-gradient(135deg,#001a0a,#002d15)",
    title:"Re:Zero", year:2016, rating:8.3,
    tags:["fantasy","thriller","drama","psychological"],
    desc:"A teenager is transported to another world with one ability: he dies and respawns. What begins as light isekai becomes a brutal deconstruction — watch Subaru break down, and rebuild, and break again.",
    info:"50 Episodes", studio:"White Fox" },

  { rank:"S", emoji:"✨", bg:"linear-gradient(135deg,#0d0d1a,#1a1a40)",
    title:"Mob Psycho 100", year:2016, rating:8.7,
    tags:["action","comedy","drama","psychological"],
    desc:"The world's most powerful psychic tries to live as an ordinary middle schooler. One of anime's most visually inventive productions with a genuinely mature story about emotional growth over raw power.",
    info:"37 Episodes", studio:"Bones" },

  { rank:"A", emoji:"💪", bg:"linear-gradient(135deg,#001a05,#003010)",
    title:"My Hero Academia", year:2016, rating:8.4,
    tags:["action","fantasy","drama","comedy"],
    desc:"In a world where 80% of people have superpowers, a powerless boy is chosen by the world's greatest hero. A love letter to superhero stories with impeccably written mentor-student dynamics.",
    info:"138 Episodes", studio:"Bones" },

  { rank:"A", emoji:"💦", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"Konosuba", year:2016, rating:8.2,
    tags:["fantasy","comedy","adventure"],
    desc:"A gamer dies and gets reincarnated into a fantasy world with a useless party. The funniest isekai ever made — a loving parody that works because it genuinely understands the genre's tropes.",
    info:"20 Episodes", studio:"Studio DEEN" },

  // ── 2017 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🕳️", bg:"linear-gradient(135deg,#001020,#001a2e)",
    title:"Made in Abyss", year:2017, rating:8.8,
    tags:["adventure","fantasy","drama","horror"],
    desc:"Two children descend into a chasm where the deeper you go, the more devastating the physical toll of returning. One of anime's most beautiful and brutally punishing worlds ever conceived.",
    info:"25 Episodes", studio:"Kinema Citrus" },

  { rank:"S", emoji:"💜", bg:"linear-gradient(135deg,#001a30,#003060)",
    title:"Violet Evergarden", year:2018, rating:8.9,
    tags:["drama","romance","scifi"],
    desc:"An ex-child soldier learns to write letters to help people convey their feelings — and slowly rediscovers her own humanity. Kyoto Animation at their most visually stunning and emotionally devastating.",
    info:"13 Episodes", studio:"Kyoto Animation" },

  // ── 2019 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🌿", bg:"linear-gradient(135deg,#001a05,#003310)",
    title:"Vinland Saga", year:2019, rating:8.8,
    tags:["action","historical","drama"],
    desc:"A young Viking seeks revenge for his father's death and finds his path to true manhood among Danes. A profound meditation on war, revenge, and whether violence can ever be the right answer.",
    info:"48 Episodes", studio:"WIT / MAPPA" },

  { rank:"S", emoji:"🔥", bg:"linear-gradient(135deg,#1a0a00,#301a00)",
    title:"Demon Slayer", year:2019, rating:8.7,
    tags:["action","fantasy","drama"],
    desc:"A boy trains to avenge his slaughtered family and save his demon-turned sister. ufotable's animation redefined visual production standards — Rengoku vs Akaza remains anime's most cinematic fight.",
    info:"55+ Episodes", studio:"ufotable", isNew:true, awards:[{cls:'aoty', text:'🏆 AOTY 2020 · Crunchyroll'}] },

  { rank:"A", emoji:"🧪", bg:"linear-gradient(135deg,#001a0a,#003015)",
    title:"Dr. Stone", year:2019, rating:8.2,
    tags:["scifi","adventure","comedy"],
    desc:"All of humanity is petrified for 3700 years. The world's greatest genius wakes up and rebuilds civilization from scratch using science. Surprisingly educational and relentlessly optimistic.",
    info:"35 Episodes", studio:"TMS Entertainment" },

  { rank:"S", emoji:"🌹", bg:"linear-gradient(135deg,#0d0010,#1a0022)",
    title:"The Promised Neverland", year:2019, rating:8.5,
    tags:["thriller","mystery","horror","drama"],
    desc:"Children at an idyllic orphanage discover they are being raised as livestock. Season 1 is 12 perfect episodes of unrelenting tension and brilliant game theory. A modern thriller masterpiece.",
    info:"12 Episodes (S1)", studio:"CloverWorks" },

  // ── 2020s ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"⚡", bg:"linear-gradient(135deg,#0d001a,#1a0033)",
    title:"Jujutsu Kaisen", year:2020, rating:8.7,
    tags:["action","fantasy","thriller"],
    desc:"A high schooler swallows a cursed finger and becomes a vessel for the most powerful Cursed Spirit. Dark, incredibly stylish, and relentlessly hype — MAPPA's best production to date.",
    info:"47+ Episodes", studio:"MAPPA", isNew:true, awards:[{cls:'aoty', text:'🏆 AOTY 2021 · Crunchyroll'}] },

  { rank:"S", emoji:"🚕", bg:"linear-gradient(135deg,#001a10,#003025)",
    title:"Odd Taxi", year:2021, rating:9.0,
    tags:["mystery","thriller","drama"],
    desc:"An antisocial walrus taxi driver gets drawn into a missing girl's case. The most underrated anime of the decade — anthropomorphic animals mask a razor-sharp noir mystery with zero wasted scenes.",
    info:"13 Episodes", studio:"OLM / P.I.C.S", isNew:true },

  { rank:"A", emoji:"🧙", bg:"linear-gradient(135deg,#1a0800,#2e1500)",
    title:"Mushoku Tensei", year:2021, rating:8.4,
    tags:["fantasy","adventure","drama"],
    desc:"A 34-year-old NEET reincarnates into a fantasy world as a baby and dedicates himself to living without regrets. The isekai that takes the genre most seriously — sprawling and genuinely novelistic.",
    info:"23 Episodes", studio:"Studio Bind", isNew:true },

  { rank:"S", emoji:"⛓️", bg:"linear-gradient(135deg,#1a0000,#300000)",
    title:"Chainsaw Man", year:2022, rating:8.5,
    tags:["action","horror","comedy","thriller"],
    desc:"A starving boy merges with a chainsaw demon to pay off his father's debt. MAPPA's most audacious production — each episode is a standalone cinematic experience with a distinct visual identity.",
    info:"12 Episodes (S1)", studio:"MAPPA", isNew:true },

  { rank:"A", emoji:"🕵️", bg:"linear-gradient(135deg,#00151a,#002535)",
    title:"Spy x Family", year:2022, rating:8.5,
    tags:["comedy","action","drama","romance"],
    desc:"A spy, an assassin, and a telepath form a fake family — and each hides their identity from the others. The warmest, funniest anime in years — a pure-hearted ensemble with immaculate comic timing.",
    info:"37 Episodes", studio:"WIT / CloverWorks", isNew:true },

  { rank:"S", emoji:"🎸", bg:"linear-gradient(135deg,#001a1a,#003333)",
    title:"Cyberpunk: Edgerunners", year:2022, rating:8.6,
    tags:["scifi","action","drama","thriller"],
    desc:"A street kid becomes a mercenary in Night City with an implant that's driving him insane. 10 episodes of absolute emotional devastation — the best anime of 2022 by a significant margin.",
    info:"10 Episodes", studio:"Trigger", isNew:true },

  { rank:"A", emoji:"⚽", bg:"linear-gradient(135deg,#001520,#002030)",
    title:"Blue Lock", year:2022, rating:8.3,
    tags:["sports","thriller","psychological"],
    desc:"300 strikers compete in an extreme training program where only one can become Japan's absolute ace. Sports anime with the competitive tension of a survival game and genuinely interesting soccer philosophy.",
    info:"24+ Episodes", studio:"Eight Bit", isNew:true },

  { rank:"S", emoji:"⭐", bg:"linear-gradient(135deg,#1a0010,#300020)",
    title:"Oshi no Ko", year:2023, rating:8.7,
    tags:["drama","thriller","mystery","psychological"],
    desc:"Reincarnated into the children of his favorite idol, a doctor uncovers the dark truth behind her murder. A devastating critique of the entertainment industry with anime's most talked-about first episode.",
    info:"11 Episodes (S1)", studio:"Doga Kobo", isNew:true },

  { rank:"S", emoji:"🧊", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Frieren: Beyond Journey's End", year:2023, rating:9.2,
    tags:["fantasy","drama","adventure"],
    desc:"An elf mage who outlives her companions reflects on what she missed while they were alive. The most beautiful meditation on time, mortality, and connection in anime history. A new classic.",
    info:"28 Episodes (S1)", studio:"Madhouse", isNew:true, awards:[{cls:'aoty', text:'🏆 AOTY 2025 · Crunchyroll'}] },

  { rank:"S", emoji:"🍖", bg:"linear-gradient(135deg,#001a08,#003015)",
    title:"Delicious in Dungeon", year:2024, rating:9.0,
    tags:["fantasy","comedy","adventure"],
    desc:"A party descends into a dungeon and — out of necessity — cooks and eats the monsters they defeat. Deceptively deep worldbuilding hidden inside the most charming and inventive premise of 2024.",
    info:"24 Episodes", studio:"Trigger", isNew:true },

  { rank:"A", emoji:"⬆️", bg:"linear-gradient(135deg,#001a05,#003010)",
    title:"Solo Leveling", year:2024, rating:8.3,
    tags:["action","fantasy","adventure"],
    desc:"The world's weakest hunter gains the unique ability to level up without limit. Gorgeous action sequences powered by A-1 Pictures' most kinetic animation work — the power fantasy done right.",
    info:"24 Episodes", studio:"A-1 Pictures", isNew:true },

  { rank:"A", emoji:"🦖", bg:"linear-gradient(135deg,#001520,#002030)",
    title:"Kaiju No. 8", year:2024, rating:8.1,
    tags:["action","scifi","drama"],
    desc:"A failed Defense Force recruit transforms into the very monster he's supposed to fight. Brisk, visually ambitious kaiju action from the studio behind Jujutsu Kaisen.",
    info:"12 Episodes (S1)", studio:"Production I.G", isNew:true },

  // ── 2023 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🧪", bg:"linear-gradient(135deg,#1a000a,#300015)",
    title:"The Apothecary Diaries", year:2023, rating:8.9,
    tags:["mystery","drama","historical","thriller"],
    desc:"A young herbalist sold into an imperial palace solves medical mysteries while navigating lethal court politics. Masterfully written — Maomao is one of anime's most compelling protagonists, and the slow-burn mystery plotting rivals Monster at its best.",
    info:"24 Episodes", studio:"OLM / Toho Animation", isNew:true },

  // ── 2024 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🔮", bg:"linear-gradient(135deg,#0d0020,#1a0040)",
    title:"Dandadan", year:2024, rating:8.5,
    tags:["action","scifi","comedy","romance"],
    desc:"A boy who believes in aliens meets a girl who believes in ghosts — and they're both right. Science Saru's frenetic supernatural action-romance is one of the most visually inventive anime in years — chaotic, heartfelt, and irresistibly fun.",
    info:"12 Episodes", studio:"Science Saru", isNew:true },

  { rank:"A", emoji:"💨", bg:"linear-gradient(135deg,#000d1a,#001530)",
    title:"Wind Breaker", year:2024, rating:7.9,
    tags:["action","drama","sports"],
    desc:"A delinquent loner joins a gang that protects their town from outside threats — and slowly learns what it means to fight for something beyond himself. CloverWorks delivers one of 2024's most emotionally resonant character arcs.",
    info:"13 Episodes", studio:"CloverWorks", isNew:true },

  { rank:"A", emoji:"🔄", bg:"linear-gradient(135deg,#1a000d,#30001a)",
    title:"Ranma ½ (2024)", year:2024, rating:7.7,
    tags:["action","comedy","romance","fantasy"],
    desc:"MAPPA's loving remake of Rumiko Takahashi's gender-swapping martial arts classic. A boy cursed to transform into a girl when splashed with cold water navigates romance, rivalry, and family chaos — brought to life with modern animation that honours the original's anarchic spirit.",
    info:"12 Episodes", studio:"MAPPA", isNew:true },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"⛸️", bg:"linear-gradient(135deg,#00101e,#00182e)",
    title:"Medalist", year:2025, rating:8.2,
    tags:["sports","drama","comedy"],
    desc:"A young girl dreams of becoming a figure skating champion under a coach who was denied his own competitive career. Winter 2025's most heartfelt surprise — Medalist captures the joy and agony of athletic dedication with the emotional precision of Haikyuu at its best.",
    info:"13 Episodes", studio:"ENGI", isNew:true },

  { rank:"A", emoji:"🎬", bg:"linear-gradient(135deg,#1a0a00,#2e1800)",
    title:"Zenshu", year:2025, rating:7.5,
    tags:["drama","romance","comedy"],
    desc:"A burnt-out anime director loses her passion after a heartbreak and finds herself reliving her own unfinished romantic comedy. MAPPA's introspective original blurs the line between creator and creation in a quietly moving meditation on art and healing.",
    info:"8 Episodes", studio:"MAPPA", isNew:true },

  { rank:"S", emoji:"☠️", bg:"linear-gradient(135deg,#001a1a,#002e2e)",
    title:"Lazarus", year:2025, rating:8.2,
    tags:["action","scifi","thriller","drama"],
    desc:"In a near-future world where a miracle drug becomes a death sentence, a squad of doomed operatives race against time for a cure. Shinichirō Watanabe's (Cowboy Bebop) return to original anime — a stylish, morally complex thriller that belongs alongside his greatest work.",
    info:"13 Episodes", studio:"MAPPA", isNew:true },

  { rank:"S", emoji:"💎", bg:"linear-gradient(135deg,#001533,#002a60)",
    title:"Solo Leveling: Arise from the Shadow", year:2025, rating:8.7,
    tags:["action","fantasy","adventure"],
    desc:"Sung Jinwoo — now humanity's most powerful hunter — confronts threats that dwarf anything he has faced before. A-1 Pictures surpasses its already stunning first season with even more kinetic battles and a story that finally pays off the manhwa's grandest ambitions.",
    info:"13 Episodes", studio:"A-1 Pictures", isNew:true },

  // ── Ghibli Films ──────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌳", bg:"linear-gradient(135deg,#001a05,#003210)",
    title:"My Neighbor Totoro", year:1988, rating:8.5,
    tags:["fantasy","comedy","drama"],
    desc:"Two young sisters move to the countryside and befriend a massive forest spirit. Hayao Miyazaki's most purely joyful creation — a film with no villain, only wonder. The standard by which all family films are measured.",
    info:"Film", studio:"Studio Ghibli" },

  { rank:"S", emoji:"🦌", bg:"linear-gradient(135deg,#001500,#002800)",
    title:"Princess Mononoke", year:1997, rating:8.7,
    tags:["action","fantasy","drama","adventure"],
    desc:"A young prince cursed by a demon god wanders into a war between industrialising humans and the ancient gods of the forest. Miyazaki's most morally complex film — there are no heroes or villains, only sides in an unwinnable conflict between progress and nature.",
    info:"Film", studio:"Studio Ghibli" },

  { rank:"S", emoji:"🏮", bg:"linear-gradient(135deg,#100a1a,#1e1033)",
    title:"Spirited Away", year:2001, rating:9.1,
    tags:["fantasy","adventure","drama"],
    desc:"A 10-year-old girl's parents are turned into pigs, stranding her in the spirit world where she must work to free them. The highest-grossing anime film ever and a perfect piece of cinema — every frame is a painting, every moment rooted in genuine Shinto mythology and childhood anxiety.",
    info:"Film", studio:"Studio Ghibli", awards:[{cls:'critics', text:'🎬 Academy Award Winner'}, {cls:'special', text:'🌟 Highest-Grossing Anime Film'}] },

  { rank:"S", emoji:"🏯", bg:"linear-gradient(135deg,#1a1000,#2e1c00)",
    title:"Howl's Moving Castle", year:2004, rating:8.7,
    tags:["fantasy","romance","adventure","drama"],
    desc:"A young hat-maker is cursed to age decades by a jealous witch — and finds refuge in the moving castle of a vain but tender wizard. Miyazaki's anti-war love story is lush, eccentric, and emotionally overwhelming, carrying more feeling in a single scene than most films manage in two hours.",
    info:"Film", studio:"Studio Ghibli" },

  // ── Additional Classics ────────────────────────────────────────────────────
  { rank:"A", emoji:"🚢", bg:"linear-gradient(135deg,#000d1a,#001530)",
    title:"Black Lagoon", year:2006, rating:8.2,
    tags:["action","thriller","drama"],
    desc:"A Japanese salaryman kidnapped by pirates joins their crew of mercenaries sailing the morally bankrupt seas of Southeast Asia. Slick, ultraviolent crime pulp with surprisingly sharp writing — Revy remains one of anime's most compelling anti-heroes.",
    info:"24 Episodes", studio:"Madhouse" },

  { rank:"S", emoji:"🧛", bg:"linear-gradient(135deg,#200000,#400000)",
    title:"Hellsing Ultimate", year:2006, rating:8.4,
    tags:["action","horror","fantasy"],
    desc:"A secret organisation deploys the world's most powerful vampire — Alucard — against Nazi vampires, ghouls, and anyone else threatening Britain. Savage, stylish, and completely unhinged; Hellsing Ultimate doubles down on everything the TV series softened and delivers one of anime's greatest final acts.",
    info:"10 OVAs", studio:"Madhouse" },

  { rank:"S", emoji:"🚂", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Baccano!", year:2007, rating:8.4,
    tags:["action","thriller","mystery","comedy"],
    desc:"Alchemists, gangsters, and immortals collide aboard a transcontinental train in 1930s America in a non-linear mystery where every character is the protagonist. One of anime's most inventive narrative structures — it best reveals its genius when watched a second time.",
    info:"13 Episodes", studio:"Brain's Base" },

  { rank:"S", emoji:"🍂", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Naruto: Shippuden", year:2007, rating:8.6,
    tags:["action","fantasy","drama","adventure"],
    desc:"Naruto returns after two and a half years of training to face the Akatsuki — a criminal organisation hunting tailed beasts. The Pain arc and Fourth Great Ninja War deliver some of shonen's most epic set pieces, with an emotional payoff that rewards hundreds of hours of investment.",
    info:"500 Episodes", studio:"Pierrot" },

  { rank:"A", emoji:"🦊", bg:"linear-gradient(135deg,#1a0e00,#2e1a00)",
    title:"Spice and Wolf", year:2008, rating:8.3,
    tags:["fantasy","romance","drama","adventure"],
    desc:"A travelling merchant picks up an ancient wolf deity in human form, and the two navigate medieval economics and growing feelings across a beautifully realised world. The most intelligent romance in anime — their verbal sparring is endlessly charming and the economic intrigue is surprisingly gripping.",
    info:"25 Episodes", studio:"Brain's Base" },

  { rank:"S", emoji:"🦋", bg:"linear-gradient(135deg,#1a0015,#2e0028)",
    title:"Bakemonogatari", year:2009, rating:8.4,
    tags:["mystery","psychological","romance","fantasy"],
    desc:"A high schooler with supernatural survival abilities helps girls afflicted by apparitions, each arc a chamber piece of witty dialogue and expressionist animation. Shaft's Monogatari Series redefines what anime storytelling can look like — dense, literary, and completely unique in the medium.",
    info:"15 Episodes", studio:"Shaft" },

  { rank:"S", emoji:"⚖️", bg:"linear-gradient(135deg,#000d1a,#001533)",
    title:"Fate/Zero", year:2011, rating:8.7,
    tags:["action","fantasy","thriller","drama"],
    desc:"Seven mages summon legendary heroes to battle for the Holy Grail — a war with no true heroes, only survivors and their broken ideals. ufotable's prequel to the Fate franchise is one of anime's finest tragedies: beautifully animated, morally devastating, and built around the most compelling cast of antagonists in the medium.",
    info:"25 Episodes", studio:"ufotable" },

  { rank:"A", emoji:"🌻", bg:"linear-gradient(135deg,#1a0a00,#2e1600)",
    title:"Anohana: The Flower We Saw That Day", year:2011, rating:8.5,
    tags:["drama","romance","psychological"],
    desc:"A recluse begins to see the ghost of a childhood friend who died in an accident, rallying their broken friend group to grant her final wish. AnoHana earns every tear it draws — a surgical, perfectly paced 11-episode tragedy about grief, guilt, and the friendship we never got to finish.",
    info:"11 Episodes", studio:"A-1 Pictures" },

  { rank:"S", emoji:"🎹", bg:"linear-gradient(135deg,#001020,#001a33)",
    title:"Your Lie in April", year:2014, rating:8.7,
    tags:["drama","romance","music"],
    desc:"A piano prodigy who can no longer hear his own playing is dragged back into music by a violinist who performs with wild abandon. One of anime's most beautiful productions — a bittersweet meditation on art, mortality, and what it means to leave something of yourself behind.",
    info:"22 Episodes", studio:"A-1 Pictures" },

  { rank:"S", emoji:"🌙", bg:"linear-gradient(135deg,#1a0005,#2e000a)",
    title:"Fate/Stay Night: Unlimited Blade Works", year:2014, rating:8.3,
    tags:["action","fantasy","drama","thriller"],
    desc:"A young mage unknowingly enters the Holy Grail War and partners with the legendary Servant Archer, whose true identity rewrites everything. ufotable's stunning production elevates the Fate visual novel's strongest route — exceptional animation married to a genuinely affecting story about idealism and self-sacrifice.",
    info:"25 Episodes", studio:"ufotable" },

  { rank:"A", emoji:"🩸", bg:"linear-gradient(135deg,#1a0000,#2e0000)",
    title:"Tokyo Ghoul", year:2014, rating:7.9,
    tags:["action","horror","psychological","thriller"],
    desc:"A college student is transformed into a half-ghoul after a near-fatal encounter and must navigate a hidden world of flesh-eating beings struggling for coexistence. Season 1 is a tightly crafted supernatural thriller — Kaneki's psychological breakdown remains one of anime's most disturbing character arcs.",
    info:"12 Episodes (S1)", studio:"Pierrot" },

  { rank:"A", emoji:"♟️", bg:"linear-gradient(135deg,#1a1000,#2e1c00)",
    title:"No Game No Life", year:2014, rating:8.1,
    tags:["fantasy","comedy","thriller","adventure"],
    desc:"Genius gamer siblings are transported to a world where all conflicts are settled by games, and set out to challenge God himself. Maximally stylized and relentlessly clever — NGNL's game-theory battles are among the most satisfying in anime, even if its ambitions far exceed its single season.",
    info:"12 Episodes", studio:"Madhouse" },

  { rank:"A", emoji:"🎓", bg:"linear-gradient(135deg,#1a1500,#2e2500)",
    title:"Assassination Classroom", year:2015, rating:8.1,
    tags:["action","comedy","drama"],
    desc:"A creature that destroyed 70% of the moon becomes the homeroom teacher of Class 3-E, a group of misfit students tasked with killing him before he destroys Earth. Beneath the absurd premise is one of anime's most genuinely moving examinations of teaching, potential, and what it means to believe in someone.",
    info:"47 Episodes", studio:"Lerche" },

  { rank:"S", emoji:"🔇", bg:"linear-gradient(135deg,#00101a,#001a2e)",
    title:"A Silent Voice", year:2016, rating:8.9,
    tags:["drama","romance","psychological"],
    desc:"A former bully tracks down the deaf girl he tormented in elementary school to apologise — and finds neither of them has healed. Kyoto Animation's masterwork on guilt, forgiveness, and communication is the most emotionally honest film anime has ever produced.",
    info:"Film", studio:"Kyoto Animation", awards:[{cls:'aoty', text:'🏆 AOTY 2018 · Crunchyroll'}] },

  { rank:"A", emoji:"🍀", bg:"linear-gradient(135deg,#001200,#002200)",
    title:"Black Clover", year:2017, rating:8.1,
    tags:["action","fantasy","adventure","comedy"],
    desc:"A boy born without magic in a magic-saturated world earns a grimoire holding an anti-magic devil and vows to become Wizard King through sheer persistence. Predictably structured but delivered with relentless energy — Asta's grit and the world-building payoff across 170 episodes make it a rewarding long-haul investment.",
    info:"170 Episodes", studio:"Pierrot" },

  { rank:"S", emoji:"😈", bg:"linear-gradient(135deg,#1a0000,#350000)",
    title:"Devilman Crybaby", year:2018, rating:8.0,
    tags:["action","horror","psychological","drama"],
    desc:"A kind-hearted boy merges with a demon to gain power and must fight to protect humanity while his oldest friend plots its destruction. Masaaki Yuasa's Netflix original is one of anime's most visceral and thematically dense works — a brutal, beautiful apocalypse that demands to be seen and cannot be unseen.",
    info:"10 Episodes", studio:"Science Saru" },

  { rank:"S", emoji:"🐧", bg:"linear-gradient(135deg,#001a2a,#003050)",
    title:"A Place Further Than the Universe", year:2018, rating:8.7,
    tags:["adventure","drama","comedy"],
    desc:"Four high school girls journey to Antarctica in search of a missing mother and a reason to go somewhere that scares them. The most moving coming-of-age story in recent anime — each character grows organically across 13 episodes of extraordinary warmth and genuinely hard-earned tears.",
    info:"13 Episodes", studio:"Madhouse" },

  { rank:"S", emoji:"🐰", bg:"linear-gradient(135deg,#000d20,#001535)",
    title:"Rascal Does Not Dream of Bunny Girl Senpai", year:2018, rating:8.3,
    tags:["mystery","romance","drama","psychological"],
    desc:"A high schooler encounters a famous actress wearing a bunny costume that no one else can see — one of several girls afflicted by Adolescence Syndrome, a phenomenon caused by unresolved emotional pain. A love story dressed as sci-fi mystery, with dialogue sharp enough to cut glass and real emotional intelligence beneath the premise.",
    info:"13 Episodes", studio:"CloverWorks" },

  { rank:"A", emoji:"🐻", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Golden Kamuy", year:2018, rating:8.2,
    tags:["action","adventure","historical","comedy"],
    desc:"A war veteran and an Ainu girl hunt for a fortune in gold hidden across early 20th-century Hokkaido using a map tattooed across escaped convicts. A genre-defying adventure — equal parts survival thriller, cultural documentary, and absurdist comedy. Nothing else in anime is quite like it.",
    info:"36 Episodes", studio:"Geno Studio" },

  { rank:"A", emoji:"💧", bg:"linear-gradient(135deg,#0d001a,#1a0033)",
    title:"That Time I Got Reincarnated as a Slime", year:2018, rating:8.1,
    tags:["fantasy","adventure","comedy"],
    desc:"A salaryman is reincarnated as the lowest-ranked monster in a fantasy world and uses a unique ability-absorbing skill to build a monster nation through diplomacy and overwhelming competence. The isekai that made the genre's appeal legible: wish fulfilment with genuine heart and surprisingly thoughtful world-building.",
    info:"48 Episodes", studio:"Eight Bit" },

  { rank:"A", emoji:"🎎", bg:"linear-gradient(135deg,#0d0d00,#1a1a00)",
    title:"Dororo", year:2019, rating:8.2,
    tags:["action","historical","drama","fantasy"],
    desc:"A feudal lord bargained 48 of his unborn son's body parts to demons for power — that son wanders Japan reclaiming each piece by slaying the demons that took them. MAPPA's remake of a Tezuka classic is breathtakingly animated and structurally immaculate, with a quiet human weight beneath its action.",
    info:"24 Episodes", studio:"MAPPA / Tezuka Productions" },

  { rank:"S", emoji:"💐", bg:"linear-gradient(135deg,#1a0010,#2e0020)",
    title:"Kaguya-sama: Love is War", year:2019, rating:8.5,
    tags:["comedy","romance","psychological"],
    desc:"Two genius student council members — both too proud to confess — wage elaborate psychological warfare to make the other fall first. The smartest romantic comedy in anime: every episode is a precisely engineered battle of wits between two leads whose mutual suffering and growing warmth are endlessly entertaining.",
    info:"37 Episodes", studio:"A-1 Pictures" },

  { rank:"S", emoji:"💡", bg:"linear-gradient(135deg,#0d0d10,#1a1a20)",
    title:"86 — Eighty Six", year:2021, rating:8.5,
    tags:["mecha","scifi","drama","action"],
    desc:"In a republic that claims to have no casualties, the war is fought entirely by a persecuted ethnic group piloting autonomous mechs. A-1 Pictures' most ambitious work — a war story about identity, survival, and the wilful blindness of comfortable societies, told with devastating restraint.",
    info:"23 Episodes", studio:"A-1 Pictures" },

  { rank:"S", emoji:"🏆", bg:"linear-gradient(135deg,#0d0015,#1a0030)",
    title:"Ranking of Kings", year:2021, rating:8.7,
    tags:["fantasy","adventure","drama"],
    desc:"A deaf, powerless prince mocked across the kingdom sets out to prove himself worthy of the throne alongside a disgraced shadow demon. Wit Studio's visual fairy tale disguises one of anime's most complex explorations of kingship, trauma, and parental legacy beneath an achingly beautiful art style.",
    info:"23 Episodes", studio:"Wit Studio" },

  { rank:"S", emoji:"🎙️", bg:"linear-gradient(135deg,#1a0010,#2e0025)",
    title:"Bocchi the Rock!", year:2022, rating:8.9,
    tags:["comedy","drama","music"],
    desc:"A cripplingly shy girl who learned guitar hoping to make friends is recruited into a band before she has spoken to a single person her age. CloverWorks turns a slice-of-life premise into anime's most creative visual comedy — every episode bursts with inventive direction that externalises Bocchi's anxiety into pure comedy gold.",
    info:"12 Episodes", studio:"CloverWorks", awards:[{cls:'aoty', text:'🏆 AOTY 2023 · Crunchyroll'}] },
];

// ===================== GAMES DATA (70 titles, 1993–2024) =====================
const GAMES = [
  // ── 1993 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"💀", bg:"linear-gradient(135deg,#1a0000,#330000)",
    title:"DOOM", year:1993, rating:9.0,
    tags:["fps","action","horror"],
    desc:"id Software's genre-defining first-person shooter. DOOM created the template for virtually every FPS that followed — brutal, fast, and perfectly designed around movement and combat flow.",
    info:"FPS", studio:"id Software" },

  // ── 1994 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"⚔️", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"Warcraft: Orcs & Humans", year:1994, rating:7.9,
    tags:["strategy","rts","fantasy"],
    desc:"The game that launched the Warcraft universe and introduced millions to real-time strategy. Pitting humans against orcs across hand-crafted missions that defined the RTS genre.",
    info:"RTS", studio:"Blizzard Entertainment" },

  // ── 1995 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🏗️", bg:"linear-gradient(135deg,#001a0a,#003015)",
    title:"Command & Conquer", year:1995, rating:8.1,
    tags:["strategy","rts","action"],
    desc:"GDI vs NOD in a Cold War turned resource war. C&C perfected the base-building RTS formula and introduced cinematic live-action cutscenes that made strategy feel like a blockbuster movie.",
    info:"RTS", studio:"Westwood Studios" },

  // ── 1996 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"😈", bg:"linear-gradient(135deg,#1a0000,#350000)",
    title:"Diablo", year:1996, rating:8.8,
    tags:["rpg","action","horror"],
    desc:"Descend into procedurally generated dungeons beneath Tristram and face the Lord of Terror. Blizzard's hack-and-slash masterpiece invented the action-RPG loot loop that still drives the genre today.",
    info:"Action RPG", studio:"Blizzard North" },

  { rank:"A", emoji:"🔫", bg:"linear-gradient(135deg,#0a0a00,#1a1a00)",
    title:"Quake", year:1996, rating:8.5,
    tags:["fps","action","horror"],
    desc:"id Software's evolution of DOOM into fully 3D gothic horror. Introduced online multiplayer deathmatches and the competitive FPS scene — Quake tournaments became esports before the word existed.",
    info:"FPS", studio:"id Software" },

  // ── 1997 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🏛️", bg:"linear-gradient(135deg,#001a10,#003320)",
    title:"Age of Empires", year:1997, rating:8.2,
    tags:["strategy","rts","historical"],
    desc:"Build civilizations from stone age to iron age. Ensemble Studios' debut made history education thrilling — managing economies, armies, and ages across beautifully designed historical campaigns.",
    info:"RTS", studio:"Ensemble Studios" },

  // ── 1998 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🛸", bg:"linear-gradient(135deg,#00101a,#002030)",
    title:"StarCraft", year:1998, rating:9.2,
    tags:["strategy","rts","scifi"],
    desc:"Three asymmetric alien races battle for dominance in space. Still played competitively 25 years later — the deepest RTS ever designed with campaign storytelling that transcends the genre.",
    info:"RTS", studio:"Blizzard Entertainment" },

  { rank:"S", emoji:"🔬", bg:"linear-gradient(135deg,#001a0d,#003320)",
    title:"Half-Life", year:1998, rating:9.5,
    tags:["fps","scifi","action","adventure"],
    desc:"A physics experiment goes wrong. Gordon Freeman's silent journey through Black Mesa established the 'environmental storytelling' FPS — no cutscenes, just you and the collapsing world around you.",
    info:"FPS", studio:"Valve", awards:[{cls:'goty', text:'🏆 50+ GOTY Awards'}, {cls:'special', text:'🌟 Changed Gaming Forever'}] },

  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#1a0d00,#2e1a00)",
    title:"Baldur's Gate", year:1998, rating:9.0,
    tags:["rpg","adventure","strategy","fantasy"],
    desc:"The gold standard of D&D computer adaptations. BG's sprawling Sword Coast saga with its 400+ hours of content established the template for every narrative RPG that followed its release.",
    info:"CRPG", studio:"BioWare" },

  { rank:"S", emoji:"🌑", bg:"linear-gradient(135deg,#0a0005,#15000d)",
    title:"Planescape: Torment", year:1999, rating:9.4,
    tags:["rpg","mystery","drama","adventure"],
    desc:"What can change the nature of a man? An immortal amnesiac explores the infinite planes of existence. The most literary RPG ever written — its script surpasses most novels in depth and ambition.",
    info:"CRPG", studio:"Black Isle Studios" },

  // ── 1999 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🏰", bg:"linear-gradient(135deg,#001a08,#003215)",
    title:"Age of Empires II", year:1999, rating:9.3,
    tags:["strategy","rts","historical"],
    desc:"The definitive historical RTS. 13 civilizations, iconic campaigns, and still-active multiplayer 25 years later. AoE2 DE has more players today than at launch — a timeless masterpiece of design.",
    info:"RTS", studio:"Ensemble Studios" },

  { rank:"S", emoji:"🔫", bg:"linear-gradient(135deg,#001a05,#003010)",
    title:"Counter-Strike", year:2000, rating:9.0,
    tags:["fps","action","strategy"],
    desc:"The world's most played competitive FPS. Born as a Half-Life mod, CS's terrorist vs counter-terrorist formula has stayed essentially unchanged for 25 years because the design is simply perfect.",
    info:"Tactical FPS", studio:"Valve" },

  // ── 2000 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"😈", bg:"linear-gradient(135deg,#200000,#3a0000)",
    title:"Diablo II", year:2000, rating:9.3,
    tags:["rpg","action","horror","adventure"],
    desc:"The greatest action RPG ever made. Diablo II's isometric dungeon crawling, its seven distinct character classes, and addictive loot loop defined the genre for two decades — and still does.",
    info:"Action RPG", studio:"Blizzard North" },

  { rank:"S", emoji:"🤖", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"Deus Ex", year:2000, rating:9.2,
    tags:["rpg","fps","scifi","thriller"],
    desc:"A cyberpunk secret agent uncovers global conspiracies across multiple countries. The first immersive sim to fully trust the player — every mission has multiple solutions and respects every choice.",
    info:"Immersive Sim", studio:"Ion Storm" },

  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#1a0d00,#301800)",
    title:"Baldur's Gate II", year:2000, rating:9.5,
    tags:["rpg","adventure","fantasy","drama"],
    desc:"The greatest CRPG ever made until 2023. Irenicus's story is still the most compelling villain arc in RPG history, and the companion writing set the bar for party-based games for two decades.",
    info:"CRPG", studio:"BioWare" },

  // ── 2001 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🔫", bg:"linear-gradient(135deg,#1a0000,#2e0000)",
    title:"Max Payne", year:2001, rating:8.7,
    tags:["action","thriller","fps"],
    desc:"A cop hunting his family's killers through a blizzard-buried New York. Max Payne introduced bullet-time to action games and set the template for cinematic, noir-drenched third-person shooters.",
    info:"TPS / Noir Action", studio:"Remedy Entertainment" },

  // ── 2002 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌲", bg:"linear-gradient(135deg,#1a1500,#2e2500)",
    title:"Warcraft III", year:2002, rating:9.2,
    tags:["strategy","rts","fantasy"],
    desc:"RTS meets RPG in Blizzard's most narratively ambitious game. Its hero system and campaign writing inspired modern MOBAs — DotA was born as a Warcraft III custom map.",
    info:"RTS / RPG", studio:"Blizzard Entertainment" },

  { rank:"S", emoji:"🗺️", bg:"linear-gradient(135deg,#001a0a,#003218)",
    title:"The Elder Scrolls III: Morrowind", year:2002, rating:9.3,
    tags:["rpg","openworld","fantasy","adventure"],
    desc:"An alien, handcrafted open world unlike anything before it. Morrowind's Vvardenfell remains the most original fantasy setting in RPG history — exploration rewards genuine curiosity at every turn.",
    info:"Open World RPG", studio:"Bethesda Game Studios" },

  // ── 2003 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Star Wars: Knights of the Old Republic", year:2003, rating:9.1,
    tags:["rpg","scifi","adventure","drama"],
    desc:"Set 4000 years before the films — KOTOR's twist remains one of gaming's greatest reveals. BioWare's moral choice system and companion writing made this the definitive Star Wars video game experience.",
    info:"Turn-Based RPG", studio:"BioWare" },

  // ── 2004 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🔬", bg:"linear-gradient(135deg,#001010,#001e20)",
    title:"Half-Life 2", year:2004, rating:9.7,
    tags:["fps","scifi","action","adventure"],
    desc:"Gordon Freeman returns to an alien-occupied Earth. HL2's physics engine, environmental storytelling, and world design were 10 years ahead of their time — it still holds up perfectly today.",
    info:"FPS", studio:"Valve", awards:[{cls:'goty', text:'🏆 39 GOTY Awards'}] },

  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"World of Warcraft", year:2004, rating:9.0,
    tags:["rpg","adventure","openworld","strategy"],
    desc:"The MMORPG that defined online gaming for a generation. At its peak, WoW was the entire internet's shared culture — its Azeroth remains one of gaming's most beloved fictional worlds.",
    info:"MMORPG", studio:"Blizzard Entertainment" },

  { rank:"A", emoji:"🏛️", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Rome: Total War", year:2004, rating:8.9,
    tags:["strategy","historical","action"],
    desc:"Command legions across the ancient world in both real-time battles and grand strategy campaigns. Rome: Total War is still the benchmark against which every Total War game is measured.",
    info:"Grand Strategy", studio:"Creative Assembly" },

  // ── 2006 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🌄", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"The Elder Scrolls IV: Oblivion", year:2006, rating:9.0,
    tags:["rpg","openworld","fantasy","adventure"],
    desc:"A prisoner escapes to stop daedric gates tearing Tamriel apart. Oblivion's Cyrodiil world remains one of gaming's most lovingly crafted open worlds with the best NPC dialogue in the series.",
    info:"Open World RPG", studio:"Bethesda Game Studios" },

  // ── 2007 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌊", bg:"linear-gradient(135deg,#001a2a,#003050)",
    title:"BioShock", year:2007, rating:9.3,
    tags:["fps","action","horror","thriller"],
    desc:"A plane crash survivor stumbles into the sunken city of Rapture, Ayn Rand's utopia gone wrong. Gaming's best plot twist wrapped in a spectacular art deco nightmare with a thematically rich story.",
    info:"FPS", studio:"2K Boston", awards:[{cls:'goty', text:'🏆 GOTY 2007 · Multiple Outlets'}] },

  { rank:"S", emoji:"🔵", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Portal", year:2007, rating:9.4,
    tags:["puzzle","scifi","adventure"],
    desc:"Solve spatial puzzles using a gun that creates linked portals. Valve's perfectly tuned 2-hour puzzle game with the most iconic antagonist (GLaDOS) and the best single-player ending in gaming history.",
    info:"Puzzle", studio:"Valve" },

  { rank:"A", emoji:"💻", bg:"linear-gradient(135deg,#001015,#001a25)",
    title:"Team Fortress 2", year:2007, rating:8.8,
    tags:["fps","action","strategy"],
    desc:"Nine distinctive classes battle across colorful maps. TF2's class design, community economy, and cartoon aesthetic make it one of gaming's most beloved team shooters — still active 17 years later.",
    info:"Team FPS", studio:"Valve" },

  // ── 2008 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"☢️", bg:"linear-gradient(135deg,#001a08,#003015)",
    title:"Fallout 3", year:2008, rating:8.7,
    tags:["rpg","openworld","fps","scifi"],
    desc:"Emerge from Vault 101 into the Capital Wasteland. Fallout 3 made Bethesda's open-world formula work in an irradiated post-apocalypse — exploring D.C.'s ruins is still one of gaming's great atmospheric experiences.",
    info:"Open World RPG", studio:"Bethesda Game Studios" },

  { rank:"A", emoji:"🧟", bg:"linear-gradient(135deg,#001005,#001e0a)",
    title:"Left 4 Dead", year:2008, rating:8.9,
    tags:["fps","horror","survival","action"],
    desc:"Four survivors fight through zombie hordes guided by an adaptive AI director. Left 4 Dead defined cooperative shooter design — its moment-to-moment tension and pacing remain unmatched.",
    info:"Co-op FPS", studio:"Turtle Rock / Valve" },

  // ── 2009 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🐉", bg:"linear-gradient(135deg,#1a0000,#300000)",
    title:"Dragon Age: Origins", year:2009, rating:9.1,
    tags:["rpg","fantasy","adventure","strategy"],
    desc:"Six origin stories converge on saving Ferelden from a Blight. BioWare's last true masterpiece — tactical combat, deeply written companions, and a world with real political weight and moral consequence.",
    info:"CRPG", studio:"BioWare" },

  { rank:"A", emoji:"🦇", bg:"linear-gradient(135deg,#0a0010,#150020)",
    title:"Batman: Arkham Asylum", year:2009, rating:8.9,
    tags:["action","adventure","thriller","horror"],
    desc:"Batman trapped in Arkham Asylum with the Joker in control. The first superhero game to truly nail what it means to BE the hero — its Freeflow combat system became the blueprint for a decade of action games.",
    info:"Action Adventure", studio:"Rocksteady Studios" },

  // ── 2010 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌌", bg:"linear-gradient(135deg,#001020,#001a33)",
    title:"Mass Effect 2", year:2010, rating:9.6,
    tags:["rpg","scifi","action","adventure","drama"],
    desc:"Assemble a suicide squad to save the galaxy. The finest ensemble cast in gaming history, with a structure built entirely around loyalties earned and betrayals paid for — the perfect sequel.",
    info:"Action RPG", studio:"BioWare", awards:[{cls:'goty', text:'🏆 GOTY 2010 · Multiple Outlets'}] },

  { rank:"S", emoji:"☢️", bg:"linear-gradient(135deg,#1a1000,#2e1c00)",
    title:"Fallout: New Vegas", year:2010, rating:9.5,
    tags:["rpg","openworld","fps","thriller"],
    desc:"The best Fallout game. Obsidian's Mojave Wasteland political saga gives every faction genuine ideological weight and lets you resolve every conflict in countless ways — reactive writing at its finest.",
    info:"Open World RPG", studio:"Obsidian Entertainment" },

  { rank:"S", emoji:"👽", bg:"linear-gradient(135deg,#001020,#001830)",
    title:"StarCraft II", year:2010, rating:8.9,
    tags:["strategy","rts","scifi"],
    desc:"The definitive esports RTS. StarCraft II's Wings of Liberty campaign and Heart of the Swarm are among the finest strategy storytelling ever made, while its multiplayer depth remains unmatched.",
    info:"RTS", studio:"Blizzard Entertainment" },

  // ── 2011 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🧱", bg:"linear-gradient(135deg,#0a1a00,#143300)",
    title:"Minecraft", year:2011, rating:9.2,
    tags:["sandbox","survival","adventure"],
    desc:"The infinite sandbox that defined a generation. No game has more creative potential — from dirt huts to redstone computers that can run Minecraft inside Minecraft. Over a billion players served.",
    info:"Sandbox / Survival", studio:"Mojang" },

  { rank:"S", emoji:"🐉", bg:"linear-gradient(135deg,#0a0a00,#1a1a00)",
    title:"The Elder Scrolls V: Skyrim", year:2011, rating:9.4,
    tags:["rpg","openworld","fantasy","adventure"],
    desc:"You are the Dragonborn, destined to slay Alduin. Skyrim's Nordic world design, mod ecosystem, and sense of total freedom made it the most replayed RPG in history — re-released on everything, forever.",
    info:"Open World RPG", studio:"Bethesda Game Studios" },

  { rank:"S", emoji:"🔥", bg:"linear-gradient(135deg,#1a0500,#300a00)",
    title:"Dark Souls", year:2011, rating:9.2,
    tags:["action","soulslike","rpg","fantasy"],
    desc:"Undead adventurer explores the decaying kingdom of Lordran. FromSoftware's masterpiece of environmental storytelling and fair-but-punishing combat — its interconnected world design remains the genre's gold standard.",
    info:"Action RPG", studio:"FromSoftware" },

  { rank:"S", emoji:"🔵", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Portal 2", year:2011, rating:9.3,
    tags:["puzzle","scifi","adventure","strategy"],
    desc:"Navigate paradoxical puzzles with a portal gun under the watch of a psychotic AI. The most witty, clever, and perfectly designed puzzle game ever built — its co-op mode adds another layer of genius.",
    info:"Puzzle", studio:"Valve" },

  { rank:"A", emoji:"🗡️", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"The Witcher 2", year:2011, rating:9.0,
    tags:["rpg","action","adventure","thriller"],
    desc:"Geralt gets caught in a regicide plot with real branching paths — Act 2 takes place in entirely different locations depending on your choices. The RPG that proved choice could have genuine structural consequences.",
    info:"Action RPG", studio:"CD Projekt Red" },

  // ── 2012 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🗡️", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"Dishonored", year:2012, rating:9.0,
    tags:["action","adventure","fps","thriller"],
    desc:"A royal bodyguard framed for murder gains supernatural powers in steampunk Dunwall. Arkane's immersive sim with the best stealth system ever made — zero kills routes are as rewarding as violent chaos.",
    info:"Immersive Sim", studio:"Arkane Studios" },

  { rank:"S", emoji:"👽", bg:"linear-gradient(135deg,#001a0a,#003215)",
    title:"XCOM: Enemy Unknown", year:2012, rating:9.2,
    tags:["strategy","scifi","horror"],
    desc:"Command a squad of soldiers against an alien invasion with permanent death for every soldier. Firaxis's revival of the classic turned tactical strategy into an emotionally devastating experience of loss.",
    info:"Turn-Based Strategy", studio:"Firaxis Games" },

  // ── 2013 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"🌊", bg:"linear-gradient(135deg,#001a2a,#003050)",
    title:"BioShock Infinite", year:2013, rating:8.8,
    tags:["fps","action","scifi","thriller"],
    desc:"A disgraced agent travels to the sky-city of Columbia to rescue a woman who can manipulate tears in reality. A multiverse narrative wrapped in breathtaking art direction and political allegory.",
    info:"FPS", studio:"Irrational Games" },

  { rank:"S", emoji:"🌆", bg:"linear-gradient(135deg,#0d0d00,#1a1a00)",
    title:"Grand Theft Auto V", year:2013, rating:9.0,
    tags:["action","openworld","thriller","adventure"],
    desc:"Three criminals pull off heists in sun-scorched Los Santos. The best-selling game of all time with the most detailed open world ever constructed — still the benchmark for living, breathing game cities.",
    info:"Open World", studio:"Rockstar Games" },

  { rank:"A", emoji:"🌿", bg:"linear-gradient(135deg,#001500,#002800)",
    title:"Don't Starve", year:2013, rating:8.4,
    tags:["survival","indie","adventure"],
    desc:"A scientist is trapped in a hostile wilderness by a demon. Klei's beautifully hand-drawn survival roguelite — every death teaches you something new in this unforgiving, Tim Burton-esque world.",
    info:"Survival Roguelite", studio:"Klei Entertainment" },

  // ── 2014 ──────────────────────────────────────────────────────────────────
  { rank:"A", emoji:"💀", bg:"linear-gradient(135deg,#1a0000,#300000)",
    title:"Dark Souls II", year:2014, rating:8.5,
    tags:["action","soulslike","rpg","fantasy"],
    desc:"The most divisive Souls entry — but its mechanical depth, boss variety, and DLC trilogy are among FromSoftware's finest. Underrated by the fandom, beloved by those who dig into its systems.",
    info:"Action RPG", studio:"FromSoftware" },

  // ── 2015 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🐺", bg:"linear-gradient(135deg,#001a0a,#003315)",
    title:"The Witcher 3: Wild Hunt", year:2015, rating:9.8,
    tags:["rpg","openworld","adventure","fantasy"],
    desc:"Geralt of Rivia hunts for his surrogate daughter across a war-torn open world. The pinnacle of narrative RPGs — every side quest tells a complete story, and the world responds to every choice you make.",
    info:"Open World RPG", studio:"CD Projekt Red", awards:[{cls:'goty', text:'🏆 250+ GOTY Awards'}, {cls:'special', text:'🌟 Greatest RPG Ever Made'}] },

  { rank:"S", emoji:"❤️", bg:"linear-gradient(135deg,#001020,#001830)",
    title:"Undertale", year:2015, rating:9.2,
    tags:["indie","rpg","adventure","puzzle"],
    desc:"A child falls underground into a world of monsters — and you can finish it without killing a single one. Toby Fox's subversive RPG deconstructs the genre's assumptions about violence in ways that still resonate.",
    info:"Indie RPG", studio:"Toby Fox" },

  { rank:"A", emoji:"⚗️", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"Fallout 4", year:2015, rating:8.4,
    tags:["rpg","openworld","fps","survival"],
    desc:"A parent searches for their lost son in post-nuclear Boston. Fallout 4's settlement building and streamlined combat made it accessible — at the cost of the RPG depth that defined New Vegas.",
    info:"Open World RPG", studio:"Bethesda Game Studios" },

  // ── 2016 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"💀", bg:"linear-gradient(135deg,#1a0000,#300000)",
    title:"Dark Souls III", year:2016, rating:9.0,
    tags:["action","soulslike","rpg","fantasy"],
    desc:"Journey through a dying world of fire and ash. The refined, fastest, and most spectacularly boss-filled Souls entry — with each fight feeling like a confrontation with a piece of the world's history.",
    info:"Action RPG", studio:"FromSoftware" },

  { rank:"A", emoji:"💀", bg:"linear-gradient(135deg,#1a0000,#2e0000)",
    title:"DOOM (2016)", year:2016, rating:9.0,
    tags:["fps","action","horror"],
    desc:"id Software's thunderous DOOM revival. The fastest, most brutally satisfying first-person shooter in a decade — its push-forward combat philosophy where aggression generates health changed the genre.",
    info:"FPS", studio:"id Software" },

  { rank:"A", emoji:"🚀", bg:"linear-gradient(135deg,#001020,#001a33)",
    title:"Titanfall 2", year:2016, rating:9.2,
    tags:["fps","action","scifi"],
    desc:"The finest single-player FPS campaign ever made — six hours of constant mechanical invention and one of gaming's most heartfelt robot relationships. Its multiplayer is the best movement shooter ever.",
    info:"FPS", studio:"Respawn Entertainment" },

  { rank:"S", emoji:"🌾", bg:"linear-gradient(135deg,#001a08,#003215)",
    title:"Stardew Valley", year:2016, rating:9.3,
    tags:["simulation","rpg","indie","adventure"],
    desc:"Inherit your grandfather's farm and build a new life in Pelican Town. One developer made one of the most beloved games ever created — a cozy masterpiece of loop design and surprising emotional depth.",
    info:"Farming Sim / RPG", studio:"ConcernedApe" },

  // ── 2017 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🦋", bg:"linear-gradient(135deg,#001020,#001830)",
    title:"Hollow Knight", year:2017, rating:9.3,
    tags:["indie","action","adventure","soulslike"],
    desc:"A tiny knight explores a vast underground kingdom of insects. The finest indie Metroidvania ever made — 40+ hours of hand-drawn art, hauntingly beautiful music, and an enormous, surprising world.",
    info:"Metroidvania", studio:"Team Cherry" },

  { rank:"S", emoji:"⚔️", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Divinity: Original Sin 2", year:2017, rating:9.5,
    tags:["rpg","strategy","adventure","fantasy"],
    desc:"The RPG that rewrote what the genre could do. Every element in the world is a potential tool — combine fire and oil, charm enemies, teleport allies. The most reactive CRPG before Baldur's Gate 3.",
    info:"CRPG", studio:"Larian Studios" },

  { rank:"A", emoji:"☕", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Cuphead", year:2017, rating:8.9,
    tags:["indie","action","platformer"],
    desc:"1930s cartoon aesthetic meets unforgiving boss rush. Every frame is hand-drawn traditional animation — Cuphead is as beautiful as it is punishingly difficult, a technical and artistic marvel.",
    info:"Run & Gun", studio:"Studio MDHR" },

  // ── 2018 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🪓", bg:"linear-gradient(135deg,#1a0500,#300a00)",
    title:"God of War (2018)", year:2018, rating:9.4,
    tags:["action","adventure","fantasy","drama"],
    desc:"Kratos and his son Atreus journey through Norse mythology. A masterclass in reinvention — the camera never cuts, the story is emotionally devastating, and Kratos's character arc is gaming's finest.",
    info:"Action Adventure", studio:"Santa Monica Studio" },

  { rank:"S", emoji:"🐴", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Red Dead Redemption 2", year:2018, rating:9.7,
    tags:["action","openworld","adventure","drama"],
    desc:"Arthur Morgan's final chapter in a dying West. The most technically ambitious open world ever made — a slow, patient story about a man grappling with the violence he's built his life on.",
    info:"Open World", studio:"Rockstar Games" },

  { rank:"A", emoji:"🐉", bg:"linear-gradient(135deg,#001a05,#003210)",
    title:"Monster Hunter: World", year:2018, rating:9.0,
    tags:["action","rpg","adventure"],
    desc:"Hunt increasingly massive creatures across living ecosystems where animals predate each other. Monster Hunter World made the series accessible without losing its depth — its endgame loops rival any MMORPG.",
    info:"Action RPG", studio:"Capcom" },

  // ── 2019 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🗡️", bg:"linear-gradient(135deg,#1a0500,#300a00)",
    title:"Sekiro: Shadows Die Twice", year:2019, rating:9.0,
    tags:["action","soulslike","adventure"],
    desc:"A shinobi seeks revenge in Sengoku-era Japan. FromSoftware's most kinetic game — parrying becomes an art form, and the posture system makes every fight feel like a dance of death.",
    info:"Action Adventure", studio:"FromSoftware", awards:[{cls:'goty', text:'🏆 GOTY 2019 · TGA'}] },

  { rank:"S", emoji:"🎭", bg:"linear-gradient(135deg,#001a1a,#003333)",
    title:"Disco Elysium", year:2019, rating:9.4,
    tags:["rpg","mystery","drama","adventure"],
    desc:"A detective with no memory investigates a murder while rediscovering himself in a dying port city. The most literary RPG ever written — a uniquely political, philosophically rich, and devastatingly funny masterpiece.",
    info:"CRPG", studio:"ZA/UM", awards:[{cls:'goty', text:'🏆 GOTY 2019 · Many Outlets'}, {cls:'critics', text:'🎬 BAFTA Game of the Year'}] },

  { rank:"A", emoji:"📦", bg:"linear-gradient(135deg,#0a0010,#150020)",
    title:"Death Stranding", year:2019, rating:8.4,
    tags:["adventure","scifi","action"],
    desc:"A courier reconnects fractured America by carrying cargo across a post-apocalyptic landscape. Hideo Kojima's meditation on connection and the value of human contact — a walking simulator that makes you feel.",
    info:"Action Adventure", studio:"Kojima Productions" },

  // ── 2020 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🔱", bg:"linear-gradient(135deg,#1a0300,#330600)",
    title:"Hades", year:2020, rating:9.2,
    tags:["indie","action","rpg","roguelite"],
    desc:"Zagreus, son of Hades, battles through the Underworld to reach the surface. The roguelite that made narrative and replayability inseparable — every run advances the story, every death adds dialogue.",
    info:"Roguelite", studio:"Supergiant Games", awards:[{cls:'goty', text:'🏆 GOTY 2020 · Many Outlets'}] },

  { rank:"S", emoji:"🔬", bg:"linear-gradient(135deg,#001010,#001c20)",
    title:"Half-Life: Alyx", year:2020, rating:9.1,
    tags:["fps","scifi","action","horror"],
    desc:"Alyx Vance fights the Combine using gravity gloves in VR. The game that proved VR could support a full-length narrative blockbuster — and its ending is one of the most impactful in the series.",
    info:"VR FPS", studio:"Valve" },

  { rank:"A", emoji:"🌆", bg:"linear-gradient(135deg,#000010,#00001e)",
    title:"Cyberpunk 2077", year:2020, rating:9.0,
    tags:["rpg","action","openworld","scifi"],
    desc:"A mercenary in Night City with a rock legend's mind in their head fights for survival. Post-2.0 overhaul made this a genuine classic — the deepest character build system in recent memory.",
    info:"FPS RPG", studio:"CD Projekt Red" },

  // ── 2021 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🪓", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"Valheim", year:2021, rating:9.0,
    tags:["survival","action","adventure","sandbox"],
    desc:"Norse purgatory crafted survival game where you fight Odin's ancient enemies. The most atmospheric survival game ever — exploring Valheim's biomes solo at night is genuinely terrifying and thrilling.",
    info:"Survival Sandbox", studio:"Iron Gate" },

  { rank:"A", emoji:"🤝", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"It Takes Two", year:2021, rating:9.0,
    tags:["adventure","puzzle","action","indie"],
    desc:"A divorcing couple is magically shrunk and must cooperate to return to normal. Every chapter introduces completely new mechanics — the most inventive co-op game ever designed with an unexpectedly moving story.",
    info:"Co-op Adventure", studio:"Hazelight Studios", awards:[{cls:'goty', text:'🏆 GOTY 2021 · TGA'}] },

  // ── 2022 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🌑", bg:"linear-gradient(135deg,#0d001a,#1a0033)",
    title:"Elden Ring", year:2022, rating:9.5,
    tags:["action","rpg","soulslike","openworld","fantasy"],
    desc:"George R.R. Martin's lore, FromSoftware's design. An epic open-world dark fantasy where every corner hides a secret, a story, or a devastating boss — the biggest artistic achievement in gaming in years.",
    info:"Open World Action RPG", studio:"FromSoftware", awards:[{cls:'goty', text:'🏆 GOTY 2022 · TGA'}, {cls:'critics', text:'🎬 BAFTA Game of the Year'}] },

  { rank:"S", emoji:"⚡", bg:"linear-gradient(135deg,#1a0500,#300a00)",
    title:"God of War: Ragnarök", year:2022, rating:9.5,
    tags:["action","adventure","fantasy","drama"],
    desc:"Kratos and Atreus face the apocalypse of Norse mythology. A sequel that somehow surpasses the original — the character work for Atreus is the finest coming-of-age story in gaming history.",
    info:"Action Adventure", studio:"Santa Monica Studio" },

  { rank:"A", emoji:"🐈", bg:"linear-gradient(135deg,#00100a,#001a15)",
    title:"Stray", year:2022, rating:8.5,
    tags:["adventure","puzzle","scifi"],
    desc:"Play as a stray cat navigating a cyberpunk city abandoned by humans and populated by robots. Criminally short but unforgettably atmospheric — a small masterpiece of environmental design.",
    info:"Adventure", studio:"BlueTwelve Studio" },

  // ── 2023 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"⚡", bg:"linear-gradient(135deg,#1a0000,#330500)",
    title:"Baldur's Gate 3", year:2023, rating:9.6,
    tags:["rpg","strategy","adventure","fantasy"],
    desc:"A mind-flayer tadpole forces unlikely companions together. Larian's D&D masterwork is the most reactive, deepest, and most replayable RPG ever made — a game that genuinely listens to what you do.",
    info:"Turn-Based CRPG", studio:"Larian Studios", awards:[{cls:'goty', text:'🏆 GOTY 2023 · TGA'}, {cls:'critics', text:'🎬 BAFTA Game of the Year'}] },

  { rank:"S", emoji:"💡", bg:"linear-gradient(135deg,#001a18,#003230)",
    title:"Alan Wake 2", year:2023, rating:9.1,
    tags:["horror","thriller","adventure","mystery"],
    desc:"A writer trapped in a dark dimension rewrites reality to escape. Remedy's most ambitious and visually stunning work — a meta-horror that blends live-action sequences with surreal gameplay and genuine dread.",
    info:"Survival Horror", studio:"Remedy Entertainment" },

  { rank:"A", emoji:"🧙", bg:"linear-gradient(135deg,#001520,#002535)",
    title:"Hogwarts Legacy", year:2023, rating:8.5,
    tags:["rpg","openworld","adventure","fantasy"],
    desc:"A student discovers a hidden power and uncovers a goblin rebellion in the 1800s Wizarding World. The open-world Harry Potter game fans always wanted — Hogwarts itself is worth the price of admission.",
    info:"Open World RPG", studio:"Avalanche Software" },

  // ── 2024 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🃏", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Balatro", year:2024, rating:9.4,
    tags:["indie","strategy","roguelite","puzzle"],
    desc:"A poker-based roguelite where you break every rule of the game with jokers that combine into absurd synergies. The most addictive indie game since Hades — impossible to put down, stunning to master.",
    info:"Roguelite Card Game", studio:"LocalThunk", isNew:true },

  { rank:"S", emoji:"🐒", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Black Myth: Wukong", year:2024, rating:9.2,
    tags:["action","soulslike","rpg","fantasy"],
    desc:"Retell the story of the Monkey King through 6 chapters of breathtaking Chinese mythology. Game Science's debut is a technical marvel — the most visually stunning action game ever made.",
    info:"Action RPG", studio:"Game Science", isNew:true },

  { rank:"S", emoji:"🔱", bg:"linear-gradient(135deg,#1a0500,#300a00)",
    title:"Hades II", year:2024, rating:9.3,
    tags:["indie","action","rpg","roguelite"],
    desc:"Melinoë, Zagreus's sister, battles Chronos from within Tartarus. Supergiant's Early Access sequel already surpasses the original in scope and mechanical variety — a stunning achievement.",
    info:"Roguelite (Early Access)", studio:"Supergiant Games", isNew:true },

  // ── 2024 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🌺", bg:"linear-gradient(135deg,#001a08,#003215)",
    title:"Like a Dragon: Infinite Wealth", year:2024, rating:8.9,
    tags:["rpg","action","adventure","comedy"],
    desc:"Ichiban Kasuga travels to Hawaii to find his birth mother — and teams up with Kiryu for the Yakuza series' most ambitious and joyful adventure yet. The finest ensemble comedy-drama in gaming with a battle system that rewards sheer imagination.",
    info:"Action RPG", studio:"Ryu Ga Gotoku Studio", isNew:true },

  { rank:"S", emoji:"👑", bg:"linear-gradient(135deg,#1a0010,#300025)",
    title:"Metaphor: ReFantazio", year:2024, rating:9.4,
    tags:["rpg","fantasy","thriller","adventure"],
    desc:"An outcast prince traverses a corruption-ridden fantasy kingdom to claim a throne for the people. Atlus's boldest work — a richly political RPG that combines Persona's social systems with a staggeringly original fantasy world. The highest-rated game of 2024.",
    info:"JRPG", studio:"Atlus", isNew:true, awards:[{cls:'goty', text:'🏆 GOTY 2024 · Many Outlets'}] },

  { rank:"A", emoji:"🔦", bg:"linear-gradient(135deg,#1a1000,#2e1c00)",
    title:"Indiana Jones and the Great Circle", year:2024, rating:8.6,
    tags:["action","adventure","puzzle","fps"],
    desc:"Dr. Jones races across the globe to unravel the mystery of the Great Circle before a shadowy cult exploits its power. MachineGames delivers the definitive interactive Indiana Jones experience — globe-trotting puzzle design, impeccable period atmosphere, and a story faithful to the films' spirit.",
    info:"Action Adventure", studio:"MachineGames / Bethesda", isNew:true },

  { rank:"A", emoji:"🌫️", bg:"linear-gradient(135deg,#0a1000,#162000)",
    title:"STALKER 2: Heart of Chornobyl", year:2024, rating:7.4,
    tags:["fps","openworld","horror","survival"],
    desc:"Survive the Zone — a vast, anomaly-riddled exclusion zone around Chornobyl where supernatural phenomena and deadly factions vie for control. A landmark of atmospheric open-world design that turns Slavic post-Soviet horror into an unforgettable survival experience, rough edges and all.",
    info:"Open World FPS", studio:"GSC Game World", isNew:true },

  { rank:"A", emoji:"🧝", bg:"linear-gradient(135deg,#001a10,#003020)",
    title:"Dragon Age: The Veilguard", year:2024, rating:8.0,
    tags:["rpg","action","fantasy","adventure"],
    desc:"Rook and the Veilguard race across Thedas to stop two ancient elven gods from remaking the world. BioWare's most polished action-RPG in years — streamlined combat and a warmly written cast reboot the Dragon Age formula for a new generation.",
    info:"Action RPG", studio:"BioWare", isNew:true },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  { rank:"S", emoji:"🦕", bg:"linear-gradient(135deg,#1a0800,#301500)",
    title:"Monster Hunter Wilds", year:2025, rating:9.0,
    tags:["action","rpg","adventure"],
    desc:"Hunt colossal creatures through living ecosystems that change with storms, seasons, and migrations in the most ambitious Monster Hunter yet. Capcom refines two decades of design into a seamless, breathtaking world — 8 million copies sold in its first three days for a reason.",
    info:"Action RPG", studio:"Capcom", isNew:true },

  { rank:"S", emoji:"🏰", bg:"linear-gradient(135deg,#1a1000,#2e1c00)",
    title:"Kingdom Come: Deliverance II", year:2025, rating:9.0,
    tags:["rpg","action","historical","adventure"],
    desc:"Henry of Skalitz continues his journey across 15th-century Bohemia — a blacksmith's son thrust into noble intrigue, war, and politics with no plot armour and total moral agency. The most authentically immersive medieval RPG ever crafted, improved in every dimension from its already beloved predecessor.",
    info:"Open World RPG", studio:"Warhorse Studios", isNew:true },

  { rank:"A", emoji:"🌳", bg:"linear-gradient(135deg,#001a08,#003015)",
    title:"Avowed", year:2025, rating:8.3,
    tags:["rpg","adventure","fantasy","fps"],
    desc:"A godlike soldier investigates a mysterious plague tearing apart the Living Lands — a frontier territory of Eora. Obsidian's first-person RPG trades the wasteland for dense, hand-crafted fantasy with the sharpest companion writing in the genre.",
    info:"First-Person RPG", studio:"Obsidian Entertainment", isNew:true },

  { rank:"S", emoji:"🔀", bg:"linear-gradient(135deg,#200010,#3a0020)",
    title:"Split Fiction", year:2025, rating:9.2,
    tags:["action","adventure","puzzle","indie"],
    desc:"Two aspiring writers are trapped inside each other's stories and must cooperate across wildly different game worlds — fantasy, sci-fi, dystopia — to escape. Hazelight's follow-up to It Takes Two out-invents its predecessor, delivering a new genre mechanic every twenty minutes in gaming's best co-op experience.",
    info:"Co-op Action Adventure", studio:"Hazelight Studios", isNew:true },

  { rank:"A", emoji:"🌍", bg:"linear-gradient(135deg,#001a08,#003215)",
    title:"Civilization VII", year:2025, rating:8.2,
    tags:["strategy","historical","simulation"],
    desc:"Guide a civilization across three distinct historical ages — Antiquity, Exploration, and Modern — each with its own mechanics and win conditions. Firaxis's boldest reinvention of the franchise restructures how civilizations evolve across history in a genuinely ambitious leap forward.",
    info:"4X Strategy", studio:"Firaxis Games", isNew:true },

  { rank:"A", emoji:"🛡️", bg:"linear-gradient(135deg,#1a0000,#2e0000)",
    title:"Doom: The Dark Ages", year:2025, rating:8.4,
    tags:["fps","action","horror","fantasy"],
    desc:"The Slayer wages war across a medieval-dark-fantasy dimension in a prequel to 2016's DOOM. id Software doubles down on aggression with a shield-bashing, dragon-riding, mech-piloting spectacle — the heaviest and most bombastic DOOM game yet.",
    info:"FPS", studio:"id Software", isNew:true },

  // ── 2017 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🌸", bg:"linear-gradient(135deg,#0d0d0d,#1a1a1a)",
    title:"NieR: Automata", year:2017, rating:9.4,
    tags:["action","scifi","rpg","psychological"],
    desc:"Androids 2B and 9S fight proxy wars for humanity against machine lifeforms in a ruined far-future Earth. PlatinumGames' action masterpiece hides a devastating philosophical treatise on existence, purpose, and what it means to be alive behind three increasingly world-shattering playthroughs. One of the most profound games ever made.",
    info:"Action RPG", studio:"PlatinumGames" },

  { rank:"S", emoji:"🔭", bg:"linear-gradient(135deg,#001020,#001a30)",
    title:"Prey", year:2017, rating:9.0,
    tags:["fps","scifi","horror","adventure"],
    desc:"A scientist wakes on a space station overrun by shape-shifting aliens and must piece together what happened using improvised tools and an expansive skill tree. Arkane's finest immersive sim — a masterclass in environmental storytelling and player freedom that respects curiosity and rewards lateral thinking at every turn.",
    info:"Immersive Sim", studio:"Arkane Studios" },

  // ── 2018 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🏔️", bg:"linear-gradient(135deg,#001020,#001a2e)",
    title:"Celeste", year:2018, rating:9.3,
    tags:["indie","platformer","adventure","puzzle"],
    desc:"A young woman climbs a mystical mountain while battling her own anxiety and self-doubt. A precision platformer of extraordinary mechanical depth — over 700 handcrafted screens of climbing — that uses every mechanic as a metaphor for the mental health journey at its core. One of the finest indie games ever made.",
    info:"Precision Platformer", studio:"Maddy Makes Games" },

  { rank:"S", emoji:"⛵", bg:"linear-gradient(135deg,#0a0a10,#151520)",
    title:"Return of the Obra Dinn", year:2018, rating:9.2,
    tags:["puzzle","mystery","adventure"],
    desc:"An insurance investigator boards a ghost ship and must determine the fate of its 60-person crew by watching the final moments of each death. Lucas Pope's 1-bit puzzle masterpiece rewards patient reasoning — when the deductions click into place it produces the most satisfying feeling of pure logic in gaming.",
    info:"Puzzle / Mystery", studio:"3909" },

  // ── 2019 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🧟", bg:"linear-gradient(135deg,#0d0500,#1a0a00)",
    title:"Resident Evil 2", year:2019, rating:9.0,
    tags:["horror","action","adventure","survival"],
    desc:"Rookie cop Leon Kennedy and college student Claire Redfield flee a zombie outbreak in Raccoon City. Capcom's remake of the 1998 classic sets an unreachable benchmark for survival horror redesigns — relentless tension, brilliant resource management, and the indestructible Mr. X stalking your every step.",
    info:"Survival Horror", studio:"Capcom" },

  { rank:"S", emoji:"☄️", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Outer Wilds", year:2019, rating:9.4,
    tags:["adventure","puzzle","scifi"],
    desc:"An astronaut explores a solar system locked in a 22-minute time loop ending in supernova, unravelling the mystery of an extinct alien civilisation. The most extraordinary discovery-driven game ever made — no guides, no waypoints, only curiosity. Its ending is the most emotionally resonant in all of gaming.",
    info:"Adventure / Exploration", studio:"Mobius Digital" },

  { rank:"S", emoji:"🗼", bg:"linear-gradient(135deg,#0d0015,#1a002e)",
    title:"Slay the Spire", year:2019, rating:9.2,
    tags:["indie","strategy","roguelite","puzzle"],
    desc:"Climb a cursed spire using a deck of cards you build run by run against increasingly deadly enemies. MegaCrit's deckbuilding roguelite invented an entire genre — its four characters offer wildly different strategic identities, and no two runs ever feel the same.",
    info:"Deckbuilding Roguelite", studio:"MegaCrit" },

  { rank:"A", emoji:"🔷", bg:"linear-gradient(135deg,#0d0d10,#1a1a20)",
    title:"Control", year:2019, rating:8.3,
    tags:["action","scifi","horror","adventure"],
    desc:"A woman enters a brutalist government building hunting for her brother and becomes entangled in a war between supernatural forces and a secret bureau. Remedy's New Weird action game is drenched in atmosphere — kinetic telekinetic combat in one of gaming's most original and architecturally fascinating settings.",
    info:"Action Adventure", studio:"Remedy Entertainment" },

  { rank:"A", emoji:"🐀", bg:"linear-gradient(135deg,#0d0800,#1a1000)",
    title:"A Plague Tale: Innocence", year:2019, rating:8.5,
    tags:["adventure","action","horror","drama"],
    desc:"A teenage girl flees the Inquisition across plague-ravaged medieval France with her young brother, using swarms of rats as both obstacle and weapon. An intensely cinematic narrative game — emotionally devastating sibling bond, oppressive atmosphere, and a story that earns every one of its brutal moments.",
    info:"Action Adventure", studio:"Asobo Studio" },

  // ── 2020 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🕵️", bg:"linear-gradient(135deg,#1a1500,#2e2500)",
    title:"Persona 4 Golden", year:2020, rating:9.2,
    tags:["rpg","mystery","adventure"],
    desc:"A city teenager moves to rural Japan and discovers murders in a sleepy town are connected to a mysterious Midnight Channel. The definitive dungeon-crawler JRPG — its small-town murder mystery hooks from the first hour, and its Social Link system makes every character feel genuinely worth knowing.",
    info:"JRPG", studio:"Atlus" },

  { rank:"S", emoji:"🔥", bg:"linear-gradient(135deg,#1a0000,#330000)",
    title:"Doom Eternal", year:2020, rating:9.2,
    tags:["fps","action","horror"],
    desc:"The Doom Slayer tears through a demon-invaded Earth and the depths of Hell itself. The most mechanically demanding and rewarding FPS ever designed — its movement, resource, and weapon management systems turn combat into a balletic flow state that no other shooter has matched.",
    info:"FPS", studio:"id Software" },

  { rank:"S", emoji:"⚜️", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Crusader Kings III", year:2020, rating:9.1,
    tags:["strategy","historical","simulation","rpg"],
    desc:"Rule a medieval dynasty across generations — managing succession, intrigue, war, and romance across centuries of European history. Paradox's most accessible grand strategy is also its deepest character drama: every ruler tells a story, every dynasty generates an epic the game never scripted.",
    info:"Grand Strategy RPG", studio:"Paradox Development Studio" },

  { rank:"S", emoji:"⚙️", bg:"linear-gradient(135deg,#0a1000,#151e00)",
    title:"Factorio", year:2020, rating:9.3,
    tags:["strategy","simulation","indie"],
    desc:"Crash-landed on an alien planet, build an automated factory that grows from handcrafting tools to launching rockets into space. The most compulsive loop in strategy gaming — the satisfaction of watching a perfectly optimised production chain is incomparable, and the hostile alien biters keep you honest.",
    info:"Factory Builder", studio:"Wube Software" },

  // ── 2021 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🦅", bg:"linear-gradient(135deg,#050d00,#0a1a00)",
    title:"Inscryption", year:2021, rating:9.1,
    tags:["indie","puzzle","strategy","horror"],
    desc:"A deckbuilding card game played against a shadowy figure in a dark cabin — until the game starts to break its own rules. Daniel Mullins' most ambitious work is a genuine surprise best experienced knowing nothing: a deckbuilder, an escape room, and a meta-horror that genuinely earns its twists.",
    info:"Deckbuilding Horror", studio:"Daniel Mullins Games" },

  { rank:"A", emoji:"🏚️", bg:"linear-gradient(135deg,#0d0005,#1a000d)",
    title:"Resident Evil Village", year:2021, rating:8.6,
    tags:["horror","action","adventure"],
    desc:"Ethan Winters hunts for his daughter across a snow-buried village lorded over by four grotesque lords, chief among them the nine-foot vampire Lady Dimitrescu. Capcom shifts RE to a more action-forward Gothic horror — its first half is among the most atmospheric set-piece design in the entire series.",
    info:"Survival Horror", studio:"Capcom" },

  { rank:"A", emoji:"🔁", bg:"linear-gradient(135deg,#001a15,#002e25)",
    title:"Deathloop", year:2021, rating:8.5,
    tags:["fps","action","thriller"],
    desc:"An assassin trapped in an infinite time loop must kill eight targets in a single day to break the cycle — while another assassin hunts him across the same loop. Arkane's most stylish game, set on a groovy 60s island: a puzzle-box FPS that rewards creative lateral thinking and aggressive improvisation.",
    info:"FPS / Immersive Sim", studio:"Arkane Studios" },

  // ── 2022 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🎭", bg:"linear-gradient(135deg,#1a0000,#300000)",
    title:"Persona 5 Royal", year:2022, rating:9.5,
    tags:["rpg","thriller","adventure"],
    desc:"A high schooler falsely accused of assault forms a group of Phantom Thieves who enter the distorted desires of corrupt adults and change their hearts. Atlus's magnum opus — 120+ hours of JRPG perfection with impeccable style, a jazz-soaked soundtrack, and the finest ensemble cast in the genre.",
    info:"JRPG", studio:"Atlus" },

  { rank:"A", emoji:"🥊", bg:"linear-gradient(135deg,#1a0d00,#2e1800)",
    title:"Sifu", year:2022, rating:8.4,
    tags:["action","adventure"],
    desc:"A kung fu student hunts down the assassins who killed their father, aging years with each death until time runs out. Sloclap's brawler demands mastery — its tight parry and counter system captures the feel of a Hong Kong martial arts film, and the aging mechanic makes every run a tense resource management game.",
    info:"Beat 'em Up", studio:"Sloclap" },

  { rank:"A", emoji:"🧛", bg:"linear-gradient(135deg,#0d0015,#1a0028)",
    title:"Vampire Survivors", year:2022, rating:8.9,
    tags:["indie","action","roguelite"],
    desc:"Survive increasingly overwhelming hordes of monsters using a character who attacks automatically while you manoeuvre. poncle's one-person phenomenon became the template for an entire subgenre — its weapon synergies and escalating chaos are simple to understand and impossible to stop playing.",
    info:"Roguelite", studio:"poncle" },

  { rank:"A", emoji:"🐁", bg:"linear-gradient(135deg,#000d1a,#001530)",
    title:"A Plague Tale: Requiem", year:2022, rating:8.5,
    tags:["adventure","action","horror","drama"],
    desc:"Amicia and Hugo search the Mediterranean for a cure to his curse while trying to outrun both the Inquisition and ever-growing rat swarms. A technical and narrative leap from Innocence — more ambitious in scope, more devastating in emotional cost, and visually among the best-looking games ever made.",
    info:"Action Adventure", studio:"Asobo Studio" },

  // ── 2023 (additions) ──────────────────────────────────────────────────────
  { rank:"S", emoji:"🎵", bg:"linear-gradient(135deg,#1a0010,#300020)",
    title:"Hi-Fi Rush", year:2023, rating:9.1,
    tags:["action","adventure","comedy"],
    desc:"A wannabe rock star accidentally melds with a music player and must fight corporate robots to the beat of the world around him. Tango Gameworks' surprise drop is one of gaming's most joyful achievements — every enemy, platform, and punch is synchronised to an incredible licensed soundtrack.",
    info:"Rhythm Action", studio:"Tango Gameworks" },

  { rank:"S", emoji:"🦾", bg:"linear-gradient(135deg,#0d0d10,#1a1a20)",
    title:"Armored Core VI: Fires of Rubicon", year:2023, rating:8.9,
    tags:["action","scifi","soulslike"],
    desc:"A mercenary pilot navigates corporate wars over a mysterious substance on a distant planet in a fully customisable mech. FromSoftware's return to the Armored Core franchise is as deep as their RPGs in build variety and as demanding in its boss fights — a love letter to mech action that punishes passivity.",
    info:"Mech Action", studio:"FromSoftware" },

  { rank:"A", emoji:"🪆", bg:"linear-gradient(135deg,#0d0010,#1a001e)",
    title:"Lies of P", year:2023, rating:8.4,
    tags:["action","soulslike","adventure"],
    desc:"Pinocchio navigates a Belle Époque city overrun by mad puppets searching for Geppetto — a Soulslike built around the question of what it means to lie. Round8's debut is a shockingly polished genre entry with the most satisfying parry system since Sekiro and a narrative that earns its fairy tale dressing.",
    info:"Action RPG", studio:"Round8 Studio / Neowiz" },

  { rank:"A", emoji:"🤿", bg:"linear-gradient(135deg,#001a20,#002e38)",
    title:"Dave the Diver", year:2023, rating:8.6,
    tags:["adventure","rpg","indie","simulation"],
    desc:"By day, dive the Blue Hole collecting fish and encountering sea creatures; by night, run a sushi restaurant with an ever-expanding menu. Mintrocket's genre-blending surprise is one of gaming's most charming loops — it has no right being as deep, beautiful, or touching as it turns out to be.",
    info:"Adventure / Restaurant Sim", studio:"Mintrocket" },

  // ── 2024 (additions) ──────────────────────────────────────────────────────
  { rank:"A", emoji:"🪖", bg:"linear-gradient(135deg,#001a08,#002e12)",
    title:"Helldivers 2", year:2024, rating:8.2,
    tags:["action","scifi","strategy"],
    desc:"Drop into enemy territory as a Super Earth trooper spreading democracy across the galaxy — by any means necessary. Arrowhead's third-person shooter became a cultural phenomenon for its community-driven live narrative, brutal friendly-fire physics, and gloriously satirical take on military jingoism.",
    info:"Co-op TPS", studio:"Arrowhead Game Studios" },

  { rank:"S", emoji:"⛩️", bg:"linear-gradient(135deg,#1a0505,#2e0a0a)",
    title:"Ghost of Tsushima", year:2024, rating:9.0,
    tags:["action","adventure","historical"],
    desc:"A samurai defies the honour of his code to become a ghost — using stealth and guerrilla tactics to repel a Mongol invasion of 13th-century Japan. Sucker Punch's open-world masterpiece is the most cinematically beautiful game ever made, with sword combat that makes every duel feel like the last scene of a samurai film.",
    info:"Open World Action", studio:"Sucker Punch Productions" },
];

// ===================== STREAMING & JP DATA =====================
const STREAM_MAP = {
  "Cowboy Bebop":["Netflix","Crunchyroll"], "One Piece":["Crunchyroll"],
  "Naruto":["Crunchyroll","Netflix"], "Naruto: Shippuden":["Crunchyroll"],
  "Bleach":["Crunchyroll"], "Death Note":["Crunchyroll","Netflix"],
  "Attack on Titan":["Crunchyroll"], "Fullmetal Alchemist: Brotherhood":["Crunchyroll","Netflix"],
  "Demon Slayer":["Crunchyroll","Netflix"], "Jujutsu Kaisen":["Crunchyroll"],
  "Chainsaw Man":["Crunchyroll"], "Spy x Family":["Crunchyroll"],
  "Frieren: Beyond Journey's End":["Crunchyroll"], "Delicious in Dungeon":["Netflix"],
  "Solo Leveling":["Crunchyroll"], "Cyberpunk: Edgerunners":["Netflix"],
  "Devilman Crybaby":["Netflix"], "Violet Evergarden":["Netflix"],
  "Neon Genesis Evangelion":["Netflix"], "Vinland Saga":["Crunchyroll","Amazon"],
  "Steins;Gate":["Crunchyroll"], "My Hero Academia":["Crunchyroll"],
  "Re:Zero":["Crunchyroll"], "Mob Psycho 100":["Crunchyroll"],
  "Hunter x Hunter (2011)":["Crunchyroll","Netflix"], "Haikyuu!!":["Crunchyroll"],
  "Made in Abyss":["Amazon"], "Spirited Away":["Netflix"],
  "Princess Mononoke":["Netflix"], "Howl's Moving Castle":["Netflix"],
  "My Neighbor Totoro":["Netflix"], "Dragon Ball Z":["Crunchyroll"],
  "Bocchi the Rock!":["Crunchyroll"], "Oshi no Ko":["Crunchyroll"],
  "Blue Lock":["Crunchyroll"], "A Silent Voice":["Netflix"],
  "Your Lie in April":["Netflix"], "Dr. Stone":["Crunchyroll"],
  "The Promised Neverland":["Crunchyroll","Netflix"], "Odd Taxi":["Crunchyroll"],
  "86 — Eighty Six":["Crunchyroll"], "Mushoku Tensei":["Crunchyroll"],
  "The Apothecary Diaries":["Crunchyroll"], "Dandadan":["Netflix"],
  "Sword Art Online":["Crunchyroll"], "Code Geass":["Crunchyroll"],
  "Fate/Zero":["Crunchyroll"], "Overlord":["Crunchyroll"],
  "That Time I Got Reincarnated as a Slime":["Crunchyroll"],
  "Kaguya-sama: Love is War":["Crunchyroll"], "Ranking of Kings":["Amazon"],
  "Half-Life":["Steam"], "Half-Life 2":["Steam"], "Portal 2":["Steam"],
  "Half-Life: Alyx":["Steam"], "The Witcher 3: Wild Hunt":["Steam","GOG"],
  "The Witcher 2":["Steam","GOG"], "Cyberpunk 2077":["Steam","GOG"],
  "Elden Ring":["Steam"], "Baldur's Gate 3":["Steam"], "Baldur's Gate":["GOG"],
  "Baldur's Gate II":["GOG"], "Hades":["Steam","Epic"], "Hades II":["Steam"],
  "Disco Elysium":["Steam"], "Hollow Knight":["Steam"], "Celeste":["Steam","Epic"],
  "Stardew Valley":["Steam"], "Undertale":["Steam"], "Minecraft":["Steam"],
  "It Takes Two":["Steam","Epic"], "Split Fiction":["Steam"], "Balatro":["Steam"],
  "Black Myth: Wukong":["Steam","Epic"], "Monster Hunter Wilds":["Steam"],
  "Monster Hunter: World":["Steam"], "Sekiro: Shadows Die Twice":["Steam"],
  "Dark Souls III":["Steam"], "Dark Souls":["Steam"], "Dark Souls II":["Steam"],
  "Metaphor: ReFantazio":["Steam"], "Persona 5 Royal":["Steam"],
  "Persona 4 Golden":["Steam"], "NieR: Automata":["Steam"],
  "God of War (2018)":["Steam"], "God of War: Ragnarök":["Steam"],
  "Ghost of Tsushima":["Steam"], "Hogwarts Legacy":["Steam"],
  "Divinity: Original Sin 2":["Steam","GOG"], "BioShock":["Steam"],
  "Mass Effect 2":["Steam"], "DOOM (2016)":["Steam"], "Doom Eternal":["Steam"],
  "Doom: The Dark Ages":["Steam"], "Factorio":["Steam"], "Slay the Spire":["Steam"],
  "Inscryption":["Steam"], "Cuphead":["Steam"], "Undertale":["Steam"],
  "Kingdom Come: Deliverance II":["Steam"], "Avowed":["Steam","Epic"],
  "Resident Evil 2":["Steam"], "Resident Evil Village":["Steam"],
  "Control":["Steam","Epic"], "Dishonored":["Steam"], "BioShock Infinite":["Steam"],
  "Fallout: New Vegas":["Steam"], "Fallout 4":["Steam"],
  "Grand Theft Auto V":["Steam"], "Red Dead Redemption 2":["Steam"],
  "Witcher 3: Wild Hunt":["Steam","GOG"], "Outer Wilds":["Steam","Epic"],
  "Return of the Obra Dinn":["Steam"], "A Plague Tale: Innocence":["Steam"],
  "A Plague Tale: Requiem":["Steam"], "Deathloop":["Steam"],
  "Hi-Fi Rush":["Steam"], "Dave the Diver":["Steam"], "Sifu":["Steam","Epic"],
  "Vampire Survivors":["Steam"], "Valheim":["Steam"], "Crusader Kings III":["Steam"],
};

const JP_TITLES = {
  "Astro Boy":"鉄腕アトム", "Mobile Suit Gundam":"機動戦士ガンダム",
  "Dragon Ball":"ドラゴンボール", "Dragon Ball Z":"ドラゴンボールZ",
  "Akira":"AKIRA", "Neon Genesis Evangelion":"新世紀エヴァンゲリオン",
  "Cowboy Bebop":"カウボーイビバップ", "One Piece":"ワンピース",
  "Naruto":"NARUTO -ナルト-", "Naruto: Shippuden":"NARUTO -ナルト- 疾風伝",
  "Bleach":"ブリーチ",
  "Fullmetal Alchemist: Brotherhood":"鋼の錬金術師 FULLMETAL ALCHEMIST",
  "Fullmetal Alchemist (2003)":"鋼の錬金術師",
  "Death Note":"デスノート", "Attack on Titan":"進撃の巨人",
  "Demon Slayer":"鬼滅の刃", "Jujutsu Kaisen":"呪術廻戦",
  "Chainsaw Man":"チェンソーマン", "Spy x Family":"SPY×FAMILY",
  "Frieren: Beyond Journey's End":"葬送のフリーレン",
  "Delicious in Dungeon":"ダンジョン飯",
  "Solo Leveling":"俺だけレベルアップな件",
  "Spirited Away":"千と千尋の神隠し", "Princess Mononoke":"もののけ姫",
  "My Neighbor Totoro":"となりのトトロ", "Howl's Moving Castle":"ハウルの動く城",
  "Steins;Gate":"シュタインズ・ゲート",
  "Hunter x Hunter (2011)":"HUNTER×HUNTER", "Haikyuu!!":"ハイキュー!!",
  "Vinland Saga":"ヴィンランド・サガ", "Mob Psycho 100":"モブサイコ100",
  "My Hero Academia":"僕のヒーローアカデミア", "Made in Abyss":"メイドインアビス",
  "Re:Zero":"Re:ゼロから始める異世界生活",
  "Bocchi the Rock!":"ぼっち・ざ・ろっく!", "Oshi no Ko":"【推しの子】",
  "Kaguya-sama: Love is War":"かぐや様は告らせたい",
  "A Silent Voice":"聲の形", "Your Lie in April":"四月は君の嘘",
  "Violet Evergarden":"ヴァイオレット・エヴァーガーデン",
  "Cyberpunk: Edgerunners":"サイバーパンク エッジランナーズ",
  "Overlord":"オーバーロード", "Re:Zero":"Re:ゼロから始める異世界生活",
  "Code Geass":"コードギアス 反逆のルルーシュ",
  "Gurren Lagann":"天元突破グレンラガン",
  "Sword Art Online":"ソードアート・オンライン",
  "Ranking of Kings":"王様ランキング",
};

let jpMode = false;

// ===================== FRANCHISES =====================
const FRANCHISES = {
  // Anime
  'Dragon Ball': 'Dragon Ball', 'Dragon Ball Z': 'Dragon Ball',
  'Naruto': 'Naruto', 'Naruto: Shippuden': 'Naruto',
  'Fullmetal Alchemist (2003)': 'Fullmetal Alchemist', 'Fullmetal Alchemist: Brotherhood': 'Fullmetal Alchemist',
  'Fate/Zero': 'Fate', 'Fate/Stay Night: Unlimited Blade Works': 'Fate',
  'My Neighbor Totoro': 'Studio Ghibli', 'Princess Mononoke': 'Studio Ghibli',
  'Spirited Away': 'Studio Ghibli', 'Howl\'s Moving Castle': 'Studio Ghibli',
  'Lupin III Part I': 'Lupin III',
  'Solo Leveling': 'Solo Leveling', 'Solo Leveling: Arise from the Shadow': 'Solo Leveling',
  'Mobile Suit Gundam': 'Gundam',
  // Games
  'DOOM': 'Doom', 'DOOM (2016)': 'Doom', 'Doom Eternal': 'Doom', 'Doom: The Dark Ages': 'Doom',
  'Half-Life': 'Half-Life', 'Half-Life 2': 'Half-Life', 'Half-Life: Alyx': 'Half-Life',
  'Portal': 'Portal', 'Portal 2': 'Portal',
  'Dark Souls': 'Soulsborne', 'Dark Souls II': 'Soulsborne', 'Dark Souls III': 'Soulsborne',
  'Sekiro: Shadows Die Twice': 'Soulsborne', 'Elden Ring': 'Soulsborne',
  'Armored Core VI: Fires of Rubicon': 'Armored Core',
  'BioShock': 'BioShock', 'BioShock Infinite': 'BioShock',
  'Baldur\'s Gate': 'Baldur\'s Gate', 'Baldur\'s Gate II': 'Baldur\'s Gate', 'Baldur\'s Gate 3': 'Baldur\'s Gate',
  'The Witcher 2': 'The Witcher', 'The Witcher 3: Wild Hunt': 'The Witcher',
  'Fallout 3': 'Fallout', 'Fallout: New Vegas': 'Fallout', 'Fallout 4': 'Fallout',
  'The Elder Scrolls III: Morrowind': 'Elder Scrolls', 'The Elder Scrolls IV: Oblivion': 'Elder Scrolls', 'The Elder Scrolls V: Skyrim': 'Elder Scrolls',
  'StarCraft': 'StarCraft', 'StarCraft II': 'StarCraft',
  'Warcraft: Orcs & Humans': 'Warcraft', 'Warcraft III': 'Warcraft',
  'Diablo': 'Diablo', 'Diablo II': 'Diablo',
  'Age of Empires': 'Age of Empires', 'Age of Empires II': 'Age of Empires',
  'God of War (2018)': 'God of War', 'God of War: Ragnarök': 'God of War',
  'Resident Evil 2': 'Resident Evil', 'Resident Evil Village': 'Resident Evil',
  'Hades': 'Hades', 'Hades II': 'Hades',
  'A Plague Tale: Innocence': 'A Plague Tale', 'A Plague Tale: Requiem': 'A Plague Tale',
  'Persona 4 Golden': 'Persona', 'Persona 5 Royal': 'Persona',
  'Monster Hunter: World': 'Monster Hunter', 'Monster Hunter Wilds': 'Monster Hunter',
  'Dragon Age: Origins': 'Dragon Age', 'Dragon Age: The Veilguard': 'Dragon Age',
  'Like a Dragon: Infinite Wealth': 'Like a Dragon',
  'Civilization VII': 'Civilization',
};

// ===================== USER DATA STATE =====================
const STATUS_DISPLAY = { watched:'Watched', watching:'Watching', plan:'Plan to Watch', dropped:'Dropped' };

let userStatus  = JSON.parse(localStorage.getItem('otakuplay-status')  || '{}');
let userRatings = JSON.parse(localStorage.getItem('otakuplay-ratings') || '{}');
let userNotes   = JSON.parse(localStorage.getItem('otakuplay-notes')   || '{}');
let currentStatusFilter = { anime: 'all', games: 'all' };

function saveUserStatus()  { localStorage.setItem('otakuplay-status',  JSON.stringify(userStatus));  }
function saveUserRatings() { localStorage.setItem('otakuplay-ratings', JSON.stringify(userRatings)); }
function saveUserNotes()   { localStorage.setItem('otakuplay-notes',   JSON.stringify(userNotes));   }

function setUserStatus(title, status) {
  // empty status or clicking same status again = clear
  if (!status || userStatus[title] === status) { delete userStatus[title]; }
  else { userStatus[title] = status; }
  saveUserStatus();
  // Re-render only the relevant grid so status badges update
  const isGame = GAMES.some(g => g.title === title);
  renderGrid(isGame ? GAMES : ANIME, isGame ? 'games-grid' : 'anime-grid', isGame);
  // Sync status buttons currently visible in the modal
  document.querySelectorAll('.modal-status-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === (userStatus[title] || ''));
  });
}

function setUserRating(title, rating) {
  const prev = userRatings[title] || 0;
  userRatings[title] = (prev === rating) ? 0 : rating;
  saveUserRatings();
  const r = userRatings[title];
  document.querySelectorAll('.modal-pr-star').forEach(btn => {
    btn.classList.toggle('filled', parseInt(btn.dataset.r) <= r);
  });
  const display = document.getElementById('modal-pr-display');
  if (display) display.textContent = r > 0 ? `My rating: ${r}/10` : 'Not rated';
}

let _noteTimer = null;
function scheduleNoteSave(title) {
  clearTimeout(_noteTimer);
  _noteTimer = setTimeout(() => {
    const textarea = document.getElementById('modal-notes');
    if (textarea) { userNotes[title] = textarea.value; saveUserNotes(); }
  }, 500);
}

function getRelated(item) {
  const isGame = GAMES.some(g => g.title === item.title);
  const pool = isGame ? GAMES : ANIME;
  return pool
    .filter(x => x.title !== item.title)
    .map(x => ({ x, overlap: x.tags.filter(t => item.tags.includes(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.x.rating - a.x.rating)
    .slice(0, 3)
    .map(e => e.x);
}

function exportData() {
  const data = { favorites: [...currentFavorites], status: userStatus, ratings: userRatings, notes: userNotes, exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'otakuplay-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.favorites) { currentFavorites = new Set(data.favorites); saveFavorites(); }
      if (data.status)    { userStatus  = data.status;  saveUserStatus(); }
      if (data.ratings)   { userRatings = data.ratings; saveUserRatings(); }
      if (data.notes)     { userNotes   = data.notes;   saveUserNotes(); }
      renderGrid(ANIME, 'anime-grid', false);
      renderGrid(GAMES, 'games-grid', true);
      alert('Data imported successfully!');
    } catch { alert('Invalid file — please select a valid OtakuPlay JSON export.'); }
    input.value = '';
  };
  reader.readAsText(file);
}

// ===================== HELPERS =====================
function starsHtml(rating) {
  const full = Math.floor(rating / 2);
  const half = (rating % 2) >= 1 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function buildCard(item, idx) {
  const rankClass = `rank-${item.rank.toLowerCase()}`;
  const tagsHtml = item.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const newBadge = item.isNew ? '<span class="card-new-badge">New</span>' : '';
  const decade = Math.floor(item.year / 10) * 10;
  const awardsHtml = item.awards?.length
    ? `<div class="card-awards">${item.awards.map(a => `<span class="award-badge award-${a.cls}">${a.text}</span>`).join('')}</div>` : '';
  const platforms = STREAM_MAP[item.title] || [];
  const platformsHtml = platforms.length
    ? `<div class="card-platforms">${platforms.map(p => `<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('')}</div>` : '';
  const jpTitle = jpMode && JP_TITLES[item.title] ? `<div class="card-jp-title">${JP_TITLES[item.title]}</div>` : '';

  const franchise = FRANCHISES[item.title];
  const franchiseBadge = franchise ? `<span class="franchise-badge">${franchise}</span>` : '';
  const status = userStatus[item.title];
  const statusBadge = status ? `<span class="status-badge status-${status}">${STATUS_DISPLAY[status]}</span>` : '';
  const badgeRow = (franchise || status) ? `<div class="card-badge-row">${franchiseBadge}${statusBadge}</div>` : '';

  const safeTitle = item.title.replace(/"/g, '&quot;');
  return `
    <div class="card" data-tags="${item.tags.join(',')}" data-year="${item.year}" data-rating="${item.rating}" data-decade="${decade}" data-title="${safeTitle}" style="animation-delay:${idx * 0.04}s">
      <div class="card-banner">
        <div class="card-banner-bg" style="background:${item.bg}">${item.emoji}</div>
        <div class="card-banner-overlay"></div>
        <span class="card-rank ${rankClass}">Tier ${item.rank}</span>
        <span class="card-year-badge">${item.year}</span>
        ${newBadge}
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-studio-label">${item.studio}</span>
          <div class="card-rating">
            <span class="stars">${starsHtml(item.rating)}</span>
            <span class="rating-num">${item.rating}</span>
          </div>
        </div>
        <h3 class="card-title">${item.title}</h3>
        ${jpTitle}
        ${badgeRow}
        ${platformsHtml}
        ${awardsHtml}
        <p class="card-desc">${item.desc}</p>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-footer">
          <span class="card-info">${item.info}</span>
          <button class="card-fav-btn${currentFavorites.has(item.title) ? ' active' : ''}" data-title="${safeTitle}" aria-label="Favorite">♥</button>
        </div>
      </div>
    </div>`;
}

// ── Era labels ────────────────────────────────────────────────────────────────
const ERA_LABELS = {
  1960: "The Birth of Anime",
  1970: "The Pioneers",
  1980: "The Golden Age Begins",
  1990: "The Cultural Explosion",
  2000: "The Modern Era Dawns",
  2010: "The Renaissance",
  2020: "The Prestige Era",
};
const GAME_ERA_LABELS = {
  1990: "The Founders",
  2000: "The Classics",
  2010: "The Golden Decade",
  2020: "The Prestige Era",
};

function decadeDivider(decade, count, isGame) {
  const label = (isGame ? GAME_ERA_LABELS[decade] : ERA_LABELS[decade]) || '';
  return `
    <div class="decade-header" data-decade="${decade}">
      <div class="decade-pill">
        <span class="decade-year">${decade}s</span>
        ${label ? `<span class="decade-era">${label}</span>` : ''}
      </div>
      <div class="decade-line"></div>
      <span class="decade-badge">${count} titles</span>
    </div>`;
}

// ── Render ─────────────────────────────────────────────────────────────────
let currentSort      = { anime: 'year-asc', games: 'year-asc' };
let currentFilter    = { anime: new Set(), games: new Set() }; // empty = all; 'favorites' or tag strings
let currentMinRating = { anime: 0, games: 0 };
let currentFavorites = new Set(JSON.parse(localStorage.getItem('otakuplay-favs') || '[]'));

function saveFavorites() {
  localStorage.setItem('otakuplay-favs', JSON.stringify([...currentFavorites]));
}
function toggleFavorite(title) {
  currentFavorites.has(title) ? currentFavorites.delete(title) : currentFavorites.add(title);
  saveFavorites();
  document.querySelectorAll('.card-fav-btn').forEach(btn => {
    if (btn.dataset.title === title) btn.classList.toggle('active', currentFavorites.has(title));
  });
  ['anime', 'games'].forEach(s => {
    if (currentFilter[s].has('favorites')) applyFilter(s + '-grid');
  });
}

function sortData(data, sortKey) {
  const d = [...data];
  if (sortKey === 'year-asc')  return d.sort((a,b) => a.year - b.year);
  if (sortKey === 'year-desc') return d.sort((a,b) => b.year - a.year);
  if (sortKey === 'rating')    return d.sort((a,b) => b.rating - a.rating);
  if (sortKey === 'alpha')     return d.sort((a,b) => a.title.localeCompare(b.title));
  if (sortKey === 'tier') {
    const order = { S: 0, A: 1, B: 2, C: 3 };
    return d.sort((a,b) => ((order[a.rank]??9) - (order[b.rank]??9)) || b.rating - a.rating);
  }
  return d;
}

function renderGrid(data, gridId, isGame) {
  const grid = document.getElementById(gridId);
  const sect = isGame ? 'games' : 'anime';
  const sorted = sortData(data, currentSort[sect]);

  let html = '';

  if (currentSort[sect] === 'year-asc' || currentSort[sect] === 'year-desc') {
    // Group by decade
    const decades = {};
    sorted.forEach(item => {
      const d = Math.floor(item.year / 10) * 10;
      if (!decades[d]) decades[d] = [];
      decades[d].push(item);
    });
    const decadeKeys = Object.keys(decades).map(Number).sort((a,b) =>
      currentSort[sect] === 'year-desc' ? b-a : a-b
    );
    decadeKeys.forEach(d => {
      html += decadeDivider(d, decades[d].length, isGame);
      decades[d].forEach((item, i) => { html += buildCard(item, i); });
    });
  } else if (currentSort[sect] === 'tier') {
    // Group by tier rank
    const tiers = { S: [], A: [], B: [], C: [] };
    sorted.forEach(item => { if (tiers[item.rank]) tiers[item.rank].push(item); });
    ['S', 'A', 'B', 'C'].forEach(tier => {
      if (!tiers[tier].length) return;
      html += `<div class="decade-header" data-decade="tier-${tier}"><div class="decade-pill"><span class="decade-year">Tier ${tier}</span></div><div class="decade-line"></div><span class="decade-badge">${tiers[tier].length} titles</span></div>`;
      tiers[tier].forEach((item, i) => { html += buildCard(item, i); });
    });
  } else {
    // Flat sort (rating, alpha) — no grouping
    sorted.forEach((item, i) => { html += buildCard(item, i); });
  }

  grid.innerHTML = html;
  applyFilter(gridId);
  updateDecadeJumpBar(gridId);
}

let currentSearch = { anime: '', games: '' };

function applyFilter(gridId) {
  const sect = gridId === 'games-grid' ? 'games' : 'anime';
  const filterSet = currentFilter[sect];
  const minRating = currentMinRating[sect];
  const query = currentSearch[sect].toLowerCase();
  const statusF = currentStatusFilter[sect];
  const grid = document.getElementById(gridId);

  grid.querySelectorAll('.card').forEach(card => {
    const tags = card.dataset.tags.split(',');
    let matchesFilter;
    if (filterSet.size === 0) {
      matchesFilter = true;
    } else if (filterSet.has('favorites')) {
      matchesFilter = currentFavorites.has(card.dataset.title);
    } else if (filterSet.has('new')) {
      matchesFilter = parseInt(card.dataset.year) >= 2024;
    } else {
      matchesFilter = tags.some(t => filterSet.has(t));
    }
    const matchesRating = parseFloat(card.dataset.rating) >= minRating;
    const matchesStatus = statusF === 'all' || userStatus[card.dataset.title] === statusF;
    let matchesSearch = true;
    if (query) {
      const title  = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const studio = card.querySelector('.card-studio-label')?.textContent.toLowerCase() || '';
      const desc   = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
      const tagsStr = card.dataset.tags.toLowerCase();
      matchesSearch = title.includes(query) || studio.includes(query) || desc.includes(query) || tagsStr.includes(query);
    }
    card.classList.toggle('hidden', !(matchesFilter && matchesRating && matchesSearch && matchesStatus));
  });

  // Hide decade headers with no visible children
  grid.querySelectorAll('.decade-header').forEach(header => {
    const d = header.dataset.decade;
    const hasVisible = [...grid.querySelectorAll(`.card[data-decade="${d}"]`)]
      .some(c => !c.classList.contains('hidden'));
    header.classList.toggle('hidden', !hasVisible);
  });

  // Empty state
  const visibleCount = grid.querySelectorAll('.card:not(.hidden)').length;
  let emptyState = grid.querySelector('.empty-state');
  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      const isFav = filterSet.has('favorites');
      emptyState.innerHTML = `
        <div class="empty-icon">${isFav ? '♥' : '🔍'}</div>
        <h3 class="empty-title">${isFav ? 'No favorites yet' : 'No results found'}</h3>
        <p class="empty-desc">${isFav ? 'Click the ♥ on any card to save it here.' : 'Try a different search or clear your filters.'}</p>
        ${isFav ? '' : `<button class="empty-reset" onclick="resetFilters('${gridId}','${sect}')">Clear all filters</button>`}
      `;
      grid.appendChild(emptyState);
    }
  } else {
    emptyState?.remove();
  }
  updateVisibleCount(gridId);
}

function updateVisibleCount(gridId) {
  const isGame = gridId === 'games-grid';
  const grid = document.getElementById(gridId);
  const visible = grid.querySelectorAll('.card:not(.hidden)').length;
  const total = isGame ? GAMES.length : ANIME.length;
  const tabEl = document.getElementById(isGame ? 'tab-games-count' : 'tab-anime-count');
  tabEl.textContent = visible === total ? total : `${visible}/${total}`;
}

function resetFilters(gridId, sect) {
  currentFilter[sect] = new Set();
  currentMinRating[sect] = 0;
  currentSearch[sect] = '';
  currentStatusFilter[sect] = 'all';
  const sectionId = sect + '-section';
  document.getElementById(sectionId).querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'all');
  });
  document.getElementById(sect + '-status-row')?.querySelectorAll('.status-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.status === 'all');
  });
  const inp = document.getElementById(sect + '-search');
  if (inp) inp.value = '';
  document.getElementById(sect + '-search-clear')?.classList.remove('visible');
  const slider = document.getElementById(sect + '-rating-slider');
  if (slider) { slider.value = 0; document.getElementById(sect + '-rating-val').textContent = 'Any'; }
  applyFilter(gridId);
  pushHash();
}

// ── Filter buttons ──────────────────────────────────────────────────────────
function setupFilters(sectionId, gridId, sect) {
  const section = document.getElementById(sectionId);
  const allBtn = section.querySelector('.filter-btn[data-filter="all"]');
  const favBtn = section.querySelector('.filter-btn[data-filter="favorites"]');

  section.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      if (f === 'all') {
        currentFilter[sect] = new Set();
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else if (f === 'favorites' || f === 'new') {
        currentFilter[sect] = new Set([f]);
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else {
        currentFilter[sect].delete('favorites');
        currentFilter[sect].delete('new');
        favBtn?.classList.remove('active');
        section.querySelector('.filter-btn[data-filter="new"]')?.classList.remove('active');
        allBtn?.classList.remove('active');
        if (currentFilter[sect].has(f)) {
          currentFilter[sect].delete(f);
          btn.classList.remove('active');
        } else {
          currentFilter[sect].add(f);
          btn.classList.add('active');
        }
        if (currentFilter[sect].size === 0) allBtn?.classList.add('active');
      }
      applyFilter(gridId);
      pushHash();
    });
  });
}

// ── Sort buttons ────────────────────────────────────────────────────────────
function setupSort(sectionId, data, gridId, sect, isGame) {
  const section = document.getElementById(sectionId);
  section.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort[sect] = btn.dataset.sort;
      renderGrid(data, gridId, isGame);
      pushHash();
    });
  });
}

// ── Search ──────────────────────────────────────────────────────────────────
function setupSearch(inputId, clearId, gridId, sect) {
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearId);
  if (!input) return;

  input.addEventListener('input', () => {
    currentSearch[sect] = input.value.trim();
    clearBtn.classList.toggle('visible', currentSearch[sect].length > 0);
    applyFilter(gridId);
    pushHash();
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    currentSearch[sect] = '';
    clearBtn.classList.remove('visible');
    applyFilter(gridId);
    pushHash();
    input.focus();
  });
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function openModal(item) {
  const overlay = document.getElementById('detail-modal');
  const banner  = document.getElementById('modal-banner');
  const body    = document.getElementById('modal-body');
  const rankClass = `rank-${item.rank.toLowerCase()}`;
  const tagsHtml = item.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
  const awardsHtml = item.awards?.length
    ? `<div class="modal-awards-row">${item.awards.map(a => `<span class="award-badge award-${a.cls}">${a.text}</span>`).join('')}</div>` : '';
  const safeTitle = item.title.replace(/'/g, "\\'");
  const jpTitle = JP_TITLES[item.title] ? `<div style="font-size:0.82rem;color:var(--text-dim);margin-bottom:0.5rem">${JP_TITLES[item.title]}</div>` : '';
  const platforms = STREAM_MAP[item.title] || [];
  const platformsHtml = platforms.length
    ? `<div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.9rem">${platforms.map(p=>`<span class="platform-badge platform-${p.toLowerCase()}">${p}</span>`).join('')}</div>` : '';

  // User status & personal rating
  const isGame  = GAMES.some(g => g.title === item.title);
  const stLabels = isGame
    ? { watched: 'Played', watching: 'Playing', plan: 'Plan to Play', dropped: 'Dropped' }
    : STATUS_DISPLAY;
  const curStatus = userStatus[item.title] || '';
  const curRating = userRatings[item.title] || 0;
  const statusOptsHtml = ['', 'watched', 'watching', 'plan', 'dropped'].map(s =>
    `<button class="modal-status-opt${curStatus === s ? ' active' : ''}" data-status="${s}">${s === '' ? '— Clear' : stLabels[s]}</button>`
  ).join('');
  const starsInput = [1,2,3,4,5,6,7,8,9,10].map(n =>
    `<button class="modal-pr-star${curRating >= n ? ' filled' : ''}" data-r="${n}">${n}</button>`
  ).join('');

  // Related entries
  const related = getRelated(item);
  const relatedHtml = related.map(r =>
    `<div class="modal-related-item" data-rel-title="${r.title.replace(/"/g,'&quot;')}">
      <span class="modal-related-emoji">${r.emoji}</span>
      <div class="modal-related-info">
        <div class="modal-related-name">${r.title}</div>
        <div class="modal-related-sub">${r.year} · ${r.studio}</div>
      </div>
      <span class="modal-related-rating">${r.rating}</span>
    </div>`
  ).join('');

  const trailerQuery = encodeURIComponent(item.title + (isGame ? ' gameplay trailer' : ' anime trailer'));

  banner.style.background = item.bg;
  banner.innerHTML = `<span style="position:relative;z-index:1">${item.emoji}</span><div class="modal-banner-overlay"></div>`;

  body.innerHTML = `
    <div class="modal-year-row">
      <span class="card-rank ${rankClass}" style="position:static;font-size:0.65rem">Tier ${item.rank}</span>
      <span class="modal-year">${item.year}</span>
    </div>
    <h2 class="modal-title">${item.title}</h2>
    ${jpTitle}
    <p class="modal-studio-line">${item.studio}</p>
    ${platformsHtml}
    <div class="modal-rating-row">
      <span class="modal-rating-num">${item.rating}</span>
      <span class="modal-rating-stars">${starsHtml(item.rating)}</span>
      <span class="modal-rating-denom">/ 10</span>
    </div>
    ${awardsHtml}
    <p class="modal-desc">${item.desc}</p>
    <div class="modal-tags-row">${tagsHtml}</div>
    <p class="modal-info-row">${item.info}</p>
    <button class="modal-share-btn" onclick="shareEntry('${safeTitle}')">🔗 Copy Link to This Entry</button>
    <a class="modal-trailer-btn" href="https://www.youtube.com/results?search_query=${trailerQuery}" target="_blank" rel="noopener">▶ Watch Trailer on YouTube</a>

    <div class="modal-user-section">
      <span class="modal-user-label">My Status</span>
      <div class="modal-status-opts">${statusOptsHtml}</div>

      <div class="modal-personal-rating">
        <span class="modal-user-label">My Rating</span>
        <div class="modal-pr-stars">${starsInput}</div>
        <div class="modal-pr-display" id="modal-pr-display">${curRating > 0 ? `My rating: ${curRating}/10` : 'Not rated'}</div>
      </div>

      <div class="modal-notes-section">
        <span class="modal-user-label">Notes</span>
        <textarea class="modal-notes-area" id="modal-notes" placeholder="Your thoughts…"></textarea>
      </div>

      ${related.length ? `<div class="modal-related-section"><div class="modal-related-head">Similar Picks</div>${relatedHtml}</div>` : ''}
    </div>
  `;

  // Wire up status buttons
  body.querySelectorAll('.modal-status-opt').forEach(btn => {
    btn.addEventListener('click', () => setUserStatus(item.title, btn.dataset.status));
  });
  // Wire up personal rating stars
  body.querySelectorAll('.modal-pr-star').forEach(btn => {
    btn.addEventListener('click', () => setUserRating(item.title, parseInt(btn.dataset.r)));
  });
  // Set notes value safely (avoids </textarea> injection risk)
  const notesEl = body.querySelector('#modal-notes');
  if (notesEl) {
    notesEl.value = userNotes[item.title] || '';
    notesEl.addEventListener('input', () => scheduleNoteSave(item.title));
  }
  // Wire up related entry clicks
  body.querySelectorAll('.modal-related-item').forEach(el => {
    el.addEventListener('click', () => {
      const t = el.dataset.relTitle;
      const relItem = [...ANIME, ...GAMES].find(x => x.title === t);
      if (relItem) openModal(relItem);
    });
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function shareEntry(title) {
  const isGame = !!GAMES.find(x => x.title === title);
  const params = new URLSearchParams({ tab: isGame ? 'games' : 'anime', q: title });
  const url = `${location.origin}${location.pathname}#${params.toString()}`;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.querySelector('.modal-share-btn');
    if (btn) { btn.textContent = '✓ Link copied!'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = '🔗 Copy Link to This Entry'; btn.classList.remove('copied'); }, 2000); }
  });
}

function closeModal() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function setupModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Card click → open modal
  ['anime-grid', 'games-grid'].forEach(gridId => {
    document.getElementById(gridId).addEventListener('click', e => {
      if (e.target.closest('.card-fav-btn')) return;
      const card = e.target.closest('.card');
      if (!card) return;
      const title = card.dataset.title;
      const isGame = gridId === 'games-grid';
      const item = (isGame ? GAMES : ANIME).find(x => x.title === title);
      if (item) openModal(item);
    });
  });
}

// ── Random Pick ─────────────────────────────────────────────────────────────
function randomPick(gridId) {
  const grid = document.getElementById(gridId);
  const visible = [...grid.querySelectorAll('.card:not(.hidden)')];
  if (!visible.length) return;
  const card = visible[Math.floor(Math.random() * visible.length)];
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('highlight-flash');
  void card.offsetWidth; // reflow to restart animation
  card.classList.add('highlight-flash');
  card.addEventListener('animationend', () => card.classList.remove('highlight-flash'), { once: true });
}
function setupRandom(btnId, gridId) {
  const btn = document.getElementById(btnId);
  if (btn) btn.addEventListener('click', () => randomPick(gridId));
}

// ── URL Hash State ───────────────────────────────────────────────────────────
function getCurrentTab() {
  if (document.getElementById('stats-section')?.style.display !== 'none') return 'stats';
  return document.getElementById('games-section').style.display !== 'none' ? 'games' : 'anime';
}
function pushHash() {
  const sect = getCurrentTab();
  if (sect === 'stats') { history.replaceState(null, '', '#tab=stats'); return; }
  const params = new URLSearchParams();
  if (sect !== 'anime') params.set('tab', sect);
  const filterArr = [...currentFilter[sect]];
  if (filterArr.length) params.set('filter', filterArr.join(','));
  if (currentSort[sect] !== 'year-asc') params.set('sort', currentSort[sect]);
  if (currentSearch[sect]) params.set('q', currentSearch[sect]);
  if (currentMinRating[sect] > 0) params.set('minRating', currentMinRating[sect]);
  const str = params.toString();
  history.replaceState(null, '', str ? '#' + str : location.pathname + location.search);
}
function readHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const params    = new URLSearchParams(hash);
  const tab       = params.get('tab') || 'anime';
  const sort      = params.get('sort') || 'year-asc';
  const q         = params.get('q') || '';
  const filterStr = params.get('filter') || '';
  const minRating = parseFloat(params.get('minRating') || '0');

  if (tab === 'stats') { switchTab('stats'); return; }

  const sect      = tab;
  const gridId    = sect + '-grid';
  const sectionId = sect + '-section';

  document.querySelectorAll('.content-section').forEach(s => {
    s.style.display = s.id === sectionId ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.target === sectionId));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === sect));

  currentSort[sect]      = sort;
  currentFilter[sect]    = filterStr ? new Set(filterStr.split(',')) : new Set();
  currentSearch[sect]    = q;
  currentMinRating[sect] = minRating;

  document.getElementById(sectionId).querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === sort));
  document.getElementById(sectionId).querySelectorAll('.filter-btn').forEach(b => {
    const f = b.dataset.filter;
    b.classList.toggle('active', f === 'all' ? currentFilter[sect].size === 0 : currentFilter[sect].has(f));
  });
  const inp = document.getElementById(sect + '-search');
  if (inp) { inp.value = q; document.getElementById(sect + '-search-clear')?.classList.toggle('visible', q.length > 0); }
  const slider = document.getElementById(sect + '-rating-slider');
  if (slider && minRating > 0) { slider.value = minRating; document.getElementById(sect + '-rating-val').textContent = minRating + '+'; }

  renderGrid(sect === 'games' ? GAMES : ANIME, gridId, sect === 'games');
}

// ── Tabs ────────────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = s.id === target ? 'block' : 'none';
      });
      document.getElementById('top-tabs').scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });
}

function setupNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      switchTab(link.dataset.tab);
    });
  });
}

function switchTab(tab) {
  const target = tab + '-section';
  document.querySelectorAll('.content-section').forEach(s => {
    s.style.display = s.id === target ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === target);
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.tab === tab);
  });
  document.getElementById('top-tabs').scrollIntoView({ behavior:'smooth', block:'start' });
  if (tab === 'stats') renderStats();
  pushHash();
}

// ── Decade Jump Bar ──────────────────────────────────────────────────────────
function updateDecadeJumpBar(gridId) {
  const isGame = gridId === 'games-grid';
  const barId  = isGame ? 'games-jump-bar' : 'anime-jump-bar';
  const bar    = document.getElementById(barId);
  if (!bar) return;
  const sect   = isGame ? 'games' : 'anime';
  if (currentSort[sect] !== 'year-asc' && currentSort[sect] !== 'year-desc') {
    bar.innerHTML = ''; return;
  }
  const decades = [...new Set((isGame ? GAMES : ANIME).map(x => Math.floor(x.year/10)*10))].sort((a,b)=>a-b);
  bar.innerHTML = decades.map(d => `<button class="decade-jump-btn" onclick="jumpToDecade('${gridId}',${d})">${d}s</button>`).join('');
}

function jumpToDecade(gridId, decade) {
  const grid   = document.getElementById(gridId);
  const header = grid.querySelector(`.decade-header[data-decade="${decade}"]`);
  if (header && !header.classList.contains('hidden')) {
    header.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── Rating Slider ────────────────────────────────────────────────────────────
function setupRatingFilter(sliderId, valId, gridId, sect) {
  const slider = document.getElementById(sliderId);
  const val    = document.getElementById(valId);
  if (!slider) return;
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    currentMinRating[sect] = v;
    val.textContent = v > 0 ? v + '+' : 'Any';
    applyFilter(gridId);
    pushHash();
  });
}

// ── Stats Panel ──────────────────────────────────────────────────────────────
function renderStats() {
  const content = document.getElementById('stats-content');
  if (!content || content.dataset.rendered) return;
  content.dataset.rendered = '1';

  const avgAnime = (ANIME.reduce((s,x)=>s+x.rating,0)/ANIME.length).toFixed(2);
  const avgGames = (GAMES.reduce((s,x)=>s+x.rating,0)/GAMES.length).toFixed(2);
  const sTier = [...ANIME,...GAMES].filter(x=>x.rank==='S').length;
  const awarded = [...ANIME,...GAMES].filter(x=>x.awards?.length).length;

  function countBy(arr, fn) {
    const m = {}; arr.forEach(x => { const k=fn(x); m[k]=(m[k]||0)+1; }); return m;
  }
  function topEntries(obj, n=8) {
    return Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n);
  }
  function barChart(entries, colorCls='') {
    if (!entries.length) return '';
    const max = Math.max(...entries.map(([,v])=>v));
    return entries.map(([label,val]) => `
      <div class="stat-bar-row">
        <span class="stat-bar-label">${label}</span>
        <div class="stat-bar-track"><div class="stat-bar-fill ${colorCls}" style="width:0" data-w="${(val/max*100).toFixed(1)}%"></div></div>
        <span class="stat-bar-val">${val}</span>
      </div>`).join('');
  }
  function topList(items) {
    return items.slice(0,5).map((item,i) => `
      <div class="stat-top-item">
        <span class="stat-top-rank">#${i+1}</span>
        <span class="stat-top-emoji">${item.emoji}</span>
        <div class="stat-top-info">
          <div class="stat-top-title">${item.title}</div>
          <div class="stat-top-sub">${item.year} · ${item.studio}</div>
        </div>
        <span class="stat-top-rating">${item.rating}</span>
      </div>`).join('');
  }

  const animeDecade = topEntries(countBy(ANIME,x=>`${Math.floor(x.year/10)*10}s`), 10).sort((a,b)=>a[0].localeCompare(b[0]));
  const gamesDecade = topEntries(countBy(GAMES,x=>`${Math.floor(x.year/10)*10}s`), 10).sort((a,b)=>a[0].localeCompare(b[0]));
  const animeGenre  = topEntries(ANIME.reduce((m,x)=>{x.tags.forEach(t=>{m[t]=(m[t]||0)+1});return m},{}));
  const gamesGenre  = topEntries(GAMES.reduce((m,x)=>{x.tags.forEach(t=>{m[t]=(m[t]||0)+1});return m},{}));
  const animeStudio = topEntries(countBy(ANIME,x=>x.studio));
  const gamesStudio = topEntries(countBy(GAMES,x=>x.studio));
  const topAnime    = [...ANIME].sort((a,b)=>b.rating-a.rating);
  const topGames    = [...GAMES].sort((a,b)=>b.rating-a.rating);

  content.innerHTML = `
    <div class="stats-overview">
      <div class="stat-ov-card"><div class="stat-ov-num">${ANIME.length}</div><div class="stat-ov-label">Anime Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${GAMES.length}</div><div class="stat-ov-label">Game Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${avgAnime}</div><div class="stat-ov-label">Avg Anime Rating</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${avgGames}</div><div class="stat-ov-label">Avg Game Rating</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${sTier}</div><div class="stat-ov-label">S-Tier Entries</div></div>
      <div class="stat-ov-card"><div class="stat-ov-num">${awarded}</div><div class="stat-ov-label">Award Winners</div></div>
    </div>
    <div class="stats-charts">
      <div class="stat-chart-card"><div class="stat-chart-title">🎌 Anime by Decade</div>${barChart(animeDecade)}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎮 Games by Decade</div>${barChart(gamesDecade,'gold')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎌 Top Anime Genres</div>${barChart(animeGenre,'pink')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🎮 Top Game Genres</div>${barChart(gamesGenre)}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🏢 Top Anime Studios</div>${barChart(animeStudio,'pink')}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">🏢 Top Game Studios</div>${barChart(gamesStudio,'gold')}</div>
    </div>
    <div class="stats-charts">
      <div class="stat-chart-card"><div class="stat-chart-title">⭐ Highest Rated Anime</div>${topList(topAnime)}</div>
      <div class="stat-chart-card"><div class="stat-chart-title">⭐ Highest Rated Games</div>${topList(topGames)}</div>
    </div>
  `;

  // Animate bars after paint
  requestAnimationFrame(() => {
    content.querySelectorAll('.stat-bar-fill[data-w]').forEach(el => {
      el.style.width = el.dataset.w;
    });
  });
}

// ── JP Toggle ────────────────────────────────────────────────────────────────
function setupJpToggle() {
  const btn = document.getElementById('jp-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    jpMode = !jpMode;
    btn.classList.toggle('active', jpMode);
    renderGrid(ANIME, 'anime-grid', false);
    renderGrid(GAMES, 'games-grid', true);
  });
}

// ── Scroll to Top ────────────────────────────────────────────────────────────
function setupScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Status Filter Row ─────────────────────────────────────────────────────────
function setupStatusFilter(rowId, gridId, sect) {
  const row = document.getElementById(rowId);
  if (!row) return;
  row.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStatusFilter[sect] = btn.dataset.status;
      row.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(gridId);
    });
  });
}

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '/') {
      e.preventDefault();
      const sect = getCurrentTab();
      if (sect !== 'stats') document.getElementById(sect + '-search')?.focus();
    }
    if (e.key === 'r' || e.key === 'R') {
      const sect = getCurrentTab();
      if (sect !== 'stats') randomPick(sect + '-grid');
    }
  });
}

// ── Init ────────────────────────────────────────────────────────────────────
document.getElementById('stat-anime').textContent = ANIME.length;
document.getElementById('stat-games').textContent = GAMES.length;
document.getElementById('tab-anime-count').textContent = ANIME.length;
document.getElementById('tab-games-count').textContent = GAMES.length;

renderGrid(ANIME, 'anime-grid', false);
renderGrid(GAMES, 'games-grid', true);

setupFilters('anime-section', 'anime-grid', 'anime');
setupFilters('games-section', 'games-grid', 'games');
setupSort('anime-section', ANIME, 'anime-grid', 'anime', false);
setupSort('games-section', GAMES, 'games-grid', 'games', true);
setupModal();
setupTabs();
setupNavLinks();
setupSearch('anime-search', 'anime-search-clear', 'anime-grid', 'anime');
setupSearch('games-search', 'games-search-clear', 'games-grid', 'games');
setupRandom('anime-random', 'anime-grid');
setupRandom('games-random', 'games-grid');
setupRatingFilter('anime-rating-slider', 'anime-rating-val', 'anime-grid', 'anime');
setupRatingFilter('games-rating-slider', 'games-rating-val', 'games-grid', 'games');
setupJpToggle();
setupScrollTop();
setupKeyboardShortcuts();
setupStatusFilter('anime-status-row', 'anime-grid', 'anime');
setupStatusFilter('games-status-row', 'games-grid', 'games');

// Fav button delegation (works across re-renders)
document.addEventListener('click', e => {
  const btn = e.target.closest('.card-fav-btn');
  if (btn) { e.stopPropagation(); toggleFavorite(btn.dataset.title); }
});

// Restore state from URL hash on load
readHash();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
