// Itinéraire calqué sur la carte classique de l'Odyssée (tradition Bérard) :
// Troie → Kikones → Lotophages → Cyclopes → Éole → Lestrygons → Circé →
// Enfers → Sirènes → Charybde & Scylla → Île du Soleil → Ogygie → Phéaciens →
// Ithaque. Ogygie est bien placée au bord de l'Océan, au détroit de Gibraltar.
//
// Chaque étape porte :
//  - coordinates : le point retenu sur la carte (lat/lng réels)
//  - via        : waypoints maritimes pour que la route contourne les terres
//  - year       : date d'arrivée, en années depuis la chute de Troie
//  - gapLabel   : temps passé sur place, affiché sur le rail chronologique
//  - mood       : teinte dominante de la mer, pour donner sa couleur au chapitre
//  - weather    : intensités des effets atmosphériques (0 → 1), interpolées
//                 d'un chapitre au suivant
//  - plate      : gravure de Flaxman associée (public/plates/<id>.png)
//  - zoom       : facteur de zoom imposé à l'escale (défaut : ZOOM_STOP)
//  - certainty  : 'certain' | 'debated' — pilote le mode « historiens »

export const journeySteps = [
  {
    id: 'troy',
    numeral: 'O',
    chapter: 'Prologue',
    title: 'Troie',
    greek: 'Ἴλιον',
    theme: 'La chute et le départ',
    mood: '#12293f',
    weather: { embers: 0.85, mist: 0.15, motes: 0.1 },
    plate: 'troy',
    plateCaption: "Ulysse s'attendrit au récit du siège de Troie que chante l'aveugle Démodocos",
    coordinates: { lat: 39.9575, lng: 26.2389 },
    via: [],
    year: 0,
    timeLabel: 'Année 0',
    duration: 'Le départ',
    summary:
      "Après dix ans de siège, Troie tombe. Ulysse et ses hommes reprennent la mer, chargés de butin, persuadés que le plus dur est derrière eux.",
    fullStory:
      "Après dix années de guerre et la ruse du cheval de bois conçue par Ulysse lui-même, Troie est enfin tombée. Les Grecs pillent la ville et reprennent la mer. Pour Ulysse, roi d'Ithaque, commence alors un retour qui aurait dû ne durer que quelques semaines : douze navires, un vent favorable, six cents kilomètres de mer familière. Mais l'orgueil des vainqueurs a offensé les dieux, et Poséidon n'a pas encore dit son dernier mot.",
    quote:
      "Chante-moi, Ô Muse, cet homme aux mille tours, qui erra si longtemps après avoir renversé la citadelle sacrée de Troie.",
    quoteRef: 'Odyssée, I, 1',
    characters: ['Ulysse', 'Les Achéens'],
    consequence: "Douze navires quittent la Troade. Un seul homme reviendra.",
    certainty: 'certain',
    historianNote:
      "Le site d'Hisarlik, en Turquie, est identifié à Troie depuis les fouilles de Schliemann en 1870 — l'une des rares localisations du récit qui soit archéologiquement établie.",
  },
  {
    id: 'cicones',
    numeral: 'I',
    chapter: 'Chapitre I',
    title: 'Les Kikones',
    greek: 'Κίκονες',
    theme: 'La victoire de trop',
    mood: '#3a2620',
    weather: { embers: 0.7, wind: 0.35, mist: 0.1 },
    coordinates: { lat: 40.87, lng: 25.52 }, // Ismaros, côte de Thrace
    via: [{ lat: 40.5, lng: 26.0 }],
    year: 0.02,
    timeLabel: 'Année 0 · premiers jours',
    duration: 'Quelques jours',
    summary:
      "Première escale, premier pillage. Les hommes refusent de repartir : soixante-douze d'entre eux y laissent la vie.",
    fullStory:
      "À peine sortis de Troade, les Grecs mettent à sac Ismaros, la cité des Kikones. La razzia est un succès. Ulysse ordonne alors de rembarquer immédiatement — et personne ne l'écoute : on égorge les moutons sur la plage, on boit le vin pris à l'ennemi. Pendant la nuit, les Kikones de l'intérieur des terres descendent en nombre. Au matin, six hommes par navire sont morts, soit soixante-douze compagnons, pour une fête d'une nuit. C'est la première leçon du voyage, et elle sera répétée jusqu'à la fin : ce n'est jamais un monstre qui perd l'équipage d'Ulysse, c'est l'équipage lui-même.",
    quote: "Là je fis piller la ville et tuer les hommes ; et nous partageâmes les femmes et les richesses.",
    quoteRef: 'Odyssée, IX, 40',
    characters: ['Ulysse', 'Les Kikones', "L'équipage"],
    consequence: "Soixante-douze morts avant même d'avoir quitté la mer connue.",
    certainty: 'certain',
    historianNote:
      "Ismaros est une cité thrace réellement attestée, sur la côte de l'actuelle Grèce du Nord — le seul épisode du voyage dont la géographie ne fasse aucun doute.",
  },
  {
    id: 'lotus-eaters',
    numeral: 'II',
    chapter: 'Chapitre II',
    title: 'Les Lotophages',
    greek: 'Λωτοφάγοι',
    theme: "La tentation de l'oubli",
    mood: '#3a3020',
    weather: { motes: 0.85, mist: 0.4 },
    coordinates: { lat: 33.81, lng: 10.86 }, // Djerba, Tunisie
    via: [
      { lat: 39.3, lng: 24.8 },
      { lat: 36.4, lng: 23.3 }, // cap Malée, où la tempête les emporte
      { lat: 35.6, lng: 22.4 },
      { lat: 34.2, lng: 19.0 },
      { lat: 33.6, lng: 14.0 },
      { lat: 33.7, lng: 11.6 },
    ],
    year: 0.06,
    timeLabel: 'Année 0 · + quelques jours',
    duration: 'Quelques jours',
    summary:
      "Déroutés par une tempête au cap Malée, les hommes d'Ulysse goûtent le lotus et perdent tout désir de rentrer chez eux.",
    fullStory:
      "Une tempête au large du cap Malée détourne la flotte de sa route et la pousse neuf jours durant vers le sud. Ulysse envoie trois éclaireurs à terre. Ils sont accueillis sans violence : on leur offre simplement le lotus, dont le fruit efface le souvenir et le désir du retour. C'est la première épreuve qui ne se combat pas — il n'y a rien à vaincre, aucun monstre, aucune armée, juste un bonheur qui rend le foyer inutile. Ulysse doit ramener ses hommes de force, en pleurs, et les attacher sous les bancs de nage.",
    quote:
      "Quiconque mangeait ce fruit doux comme le miel ne voulait plus revenir ni donner de nouvelles.",
    quoteRef: 'Odyssée, IX, 94',
    characters: ['Ulysse', 'Trois éclaireurs', 'Les Lotophages'],
    consequence: "Le voyage sort des cartes connues. Plus personne ne sait où l'on est.",
    certainty: 'debated',
    historianNote:
      "Djerba est l'hypothèse la plus répandue depuis l'Antiquité — Hérodote déjà y place les mangeurs de lotus — mais aucune preuve matérielle ne la confirme.",
    uncertaintyRadiusKm: 180,
  },
  {
    id: 'polyphemus',
    numeral: 'III',
    chapter: 'Chapitre III',
    title: "L'Île des Cyclopes",
    greek: 'Πολύφημος',
    theme: "L'intelligence contre la force",
    mood: '#2b1d1a',
    weather: { embers: 0.35, mist: 0.3, wind: 0.2 },
    plate: 'polyphemus',
    plateCaption: "Ulysse enivre le cyclope Polyphème",
    coordinates: { lat: 37.505, lng: 15.14 }, // au large de Catane, au pied de l'Etna
    via: [
      { lat: 34.6, lng: 12.4 },
      { lat: 36.3, lng: 14.7 },
      { lat: 36.8, lng: 15.45 },
    ],
    year: 0.14,
    timeLabel: 'Année 0 · + 2 mois',
    duration: '3 semaines',
    summary:
      "Enfermé dans la caverne de Polyphème, Ulysse se sauve en se nommant « Personne » — puis perd tout en criant son vrai nom.",
    fullStory:
      "Ulysse et douze compagnons pénètrent dans la caverne de Polyphème, fils de Poséidon. Le géant referme l'entrée d'un rocher que vingt hommes ne pourraient pousser, et dévore les Grecs deux par deux. Ulysse l'enivre, lui donne son nom — « Personne » — puis lui crève l'œil unique d'un pieu chauffé au rouge. Les voisins accourus aux hurlements repartent : Personne ne l'attaque. Les survivants s'échappent accrochés sous le ventre des béliers. Et là, depuis le pont, ivre de victoire, Ulysse crie son vrai nom au rivage. Polyphème le transmet à son père. La malédiction commence à cet instant précis.",
    quote: "Mon nom est Personne ; c'est Personne que mon père et ma mère m'appellent.",
    quoteRef: 'Odyssée, IX, 366',
    characters: ['Ulysse', 'Polyphème', 'Poséidon'],
    consequence: "Poséidon jure qu'Ulysse ne rentrera pas — ou tard, seul, sur un navire étranger.",
    certainty: 'debated',
    historianNote:
      "La tradition antique situe l'épisode près de l'Etna, dont les blocs de lave jetés à la mer auraient inspiré les rochers lancés par le Cyclope. L'identification reste littéraire.",
    uncertaintyRadiusKm: 150,
  },
  {
    id: 'aeolus',
    numeral: 'IV',
    chapter: 'Chapitre IV',
    title: "L'Île d'Éole",
    greek: 'Αἴολος',
    theme: 'Ithaque en vue, puis perdue',
    mood: '#123246',
    weather: { wind: 0.95, rain: 0.15 },
    coordinates: { lat: 38.4824, lng: 14.9629 }, // Lipari, îles Éoliennes
    via: [
      { lat: 37.9, lng: 15.4 },
      { lat: 38.2, lng: 15.6 },
    ],
    year: 0.28,
    timeLabel: 'Année 0 · + 3 mois',
    duration: 'Un mois, puis quelques jours',
    summary:
      "Éole enferme les vents contraires dans une outre. À portée de vue d'Ithaque, l'équipage l'ouvre.",
    fullStory:
      "Éole, maître des vents, les héberge un mois entier puis offre à Ulysse une outre de cuir renfermant toutes les tempêtes, ne laissant souffler que le Zéphyr. Neuf jours de navigation parfaite. Le dixième, les feux d'Ithaque sont visibles depuis le pont. Ulysse, qui n'a pas dormi depuis le départ, s'assoupit enfin. Ses compagnons — persuadés qu'il leur cache de l'or — dénouent l'outre. Les vents s'échappent d'un seul coup et les rejettent exactement d'où ils venaient. Éole, cette fois, les chasse : on n'aide pas deux fois un homme que les dieux détestent.",
    quote: "Ils délièrent l'outre, et tous les vents s'échappèrent d'un coup.",
    quoteRef: 'Odyssée, X, 47',
    characters: ['Ulysse', 'Éole', "L'équipage"],
    consequence: 'Ithaque était en vue. Il faudra encore neuf ans.',
    certainty: 'debated',
    historianNote:
      "Les îles Éoliennes portent le nom du dieu des vents depuis l'Antiquité : c'est l'identification traditionnelle la plus stable de tout le récit.",
    uncertaintyRadiusKm: 100,
  },
  {
    id: 'laestrygonians',
    numeral: 'V',
    chapter: 'Chapitre V',
    title: 'Les Lestrygons',
    greek: 'Λαιστρυγόνες',
    theme: 'La flotte anéantie en une heure',
    mood: '#2a1a1c',
    weather: { wind: 0.6, rain: 0.5 },
    plate: 'laestrygonians',
    plateCaption: "Antiphatès, roi des Lestrygons, massacre un grand nombre des compagnons d'Ulysse",
    coordinates: { lat: 41.386, lng: 9.16 }, // Bonifacio, Corse
    via: [
      { lat: 39.6, lng: 13.6 },
      { lat: 40.6, lng: 11.6 },
      { lat: 41.2, lng: 10.2 },
      { lat: 41.42, lng: 9.65 },
    ],
    year: 0.36,
    timeLabel: 'Année 0 · + 4 mois',
    duration: 'Une heure',
    summary:
      "Onze navires entrent dans un port parfaitement abrité. Des géants les écrasent à coups de rochers. Seul celui d'Ulysse, resté dehors, s'échappe.",
    fullStory:
      "Le port des Lestrygons est un mouillage idéal : une baie profonde, resserrée, à l'abri de toute houle. Onze navires y entrent. Ulysse, par méfiance, amarre le sien à l'extérieur, contre le rocher. C'est ce réflexe qui lui sauve la vie. Les Lestrygons, des géants anthropophages, se massent sur les falaises et fracassent la flotte à coups de blocs de pierre, puis harponnent les hommes dans l'eau comme des poissons. En une heure, onze navires et près de cinq cents hommes disparaissent. Ulysse tranche son amarre à l'épée et fuit avec l'unique équipage restant.",
    quote: "Ils harponnaient les hommes comme des poissons et emportaient cet horrible repas.",
    quoteRef: 'Odyssée, X, 124',
    characters: ['Ulysse', 'Les Lestrygons', 'Antiphatès'],
    consequence: "Il partait avec douze navires. Il lui en reste un.",
    certainty: 'debated',
    historianNote:
      "Bérard identifiait le port des Lestrygons aux calanques de Bonifacio, en Corse, dont le goulet resserré correspond à la description homérique. D'autres proposent Formia, dans le Latium.",
    uncertaintyRadiusKm: 200,
  },
  {
    id: 'circe',
    numeral: 'VI',
    chapter: 'Chapitre VI',
    title: 'Aiaia, la Terre de Circé',
    greek: 'Κίρκη',
    theme: "La métamorphose et l'oubli du temps",
    mood: '#2a2044',
    weather: { motes: 0.9, mist: 0.35 },
    moteColor: [176, 148, 232],
    plate: 'circe',
    plateCaption: "Ulysse supplie Circé de rendre ses compagnons à leur première figure",
    coordinates: { lat: 41.2033, lng: 13.0667 }, // Mont Circeo, Latium
    via: [
      { lat: 41.7, lng: 10.2 },
      { lat: 42.0, lng: 11.2 },
      { lat: 41.6, lng: 12.3 },
    ],
    year: 0.45,
    gapLabel: 'un an sur place',
    timeLabel: 'Année 1',
    duration: 'Un an',
    summary:
      "La magicienne change les compagnons d'Ulysse en pourceaux, puis devient son alliée. Il reste une année entière.",
    fullStory:
      "Sur l'île d'Aiaia, Circé accueille les éclaireurs, leur sert un vin mêlé de drogues et les change en pourceaux — ils gardent leur esprit d'homme dans un corps de bête, ce qui est bien pire. Protégé par le môly que lui remet Hermès, Ulysse résiste au philtre et l'oblige à rendre leur forme à ses hommes. Puis il reste. Un an. Ce n'est plus un naufrage, c'est un choix : festins, chaleur, une déesse. Ce sont ses compagnons qui doivent venir le secouer et lui rappeler qu'il existe une île appelée Ithaque. Avant de le laisser partir, Circé lui apprend qu'il devra d'abord descendre chez les morts.",
    quote: "Ô toi qui as bu ce breuvage sans être changé, tu es donc Ulysse aux mille tours.",
    quoteRef: 'Odyssée, X, 330',
    characters: ['Ulysse', 'Circé', 'Hermès', 'Euryloque'],
    consequence: "Une année entière disparaît. Pénélope, elle, compte les jours.",
    certainty: 'debated',
    historianNote:
      "Le promontoire du Mont Circeo porte le nom de Circé depuis l'Antiquité et forme, vu de la mer, une silhouette d'île. Aiaia reste néanmoins un lieu avant tout mythique.",
    uncertaintyRadiusKm: 120,
  },
  {
    id: 'underworld',
    numeral: 'VII',
    chapter: 'Chapitre VII',
    title: 'Le Royaume des Morts',
    greek: 'Νέκυια',
    theme: 'Affronter le passé pour connaître la suite',
    mood: '#0b0d14',
    weather: { mist: 0.95, motes: 0.15 },
    plate: 'underworld',
    plateCaption: "Ulysse descend aux enfers pour y consulter l'ombre de Tirésias",
    coordinates: { lat: 40.848, lng: 14.053 }, // Cumes / lac Averne
    via: [{ lat: 40.95, lng: 13.3 }],
    year: 1.55,
    timeLabel: 'Année 1 · + quelques semaines',
    duration: 'Quelques semaines',
    summary:
      "Ulysse descend consulter le devin Tirésias. Il y retrouve sa mère, qu'il ignorait morte.",
    fullStory:
      "Sur les conseils de Circé, Ulysse navigue jusqu'aux confins du monde, creuse une fosse et appelle les morts par le sang. Tirésias vient lui dire l'avenir : la colère de Poséidon, le bétail du Soleil auquel il ne faut pas toucher, et un retour tardif, seul, sur un navire étranger. Puis vient l'ombre de sa mère Anticlée, morte de chagrin en l'attendant — et qu'il ne savait pas morte. Trois fois il tente de la serrer contre lui, trois fois elle lui glisse entre les bras comme une ombre. Achille lui dira qu'il préférerait être valet d'un pauvre paysan vivant plutôt que roi de tous les morts.",
    quote: "Il te faudra d'abord accomplir un autre voyage, jusqu'aux demeures d'Hadès.",
    quoteRef: 'Odyssée, X, 490',
    characters: ['Ulysse', 'Tirésias', 'Anticlée', 'Achille', 'Agamemnon'],
    consequence: "Il connaît désormais la fin de son histoire. Il choisit quand même de continuer.",
    certainty: 'debated',
    historianNote:
      "Cumes et le lac Averne abritaient un sanctuaire oraculaire réputé donner accès au monde des morts. C'est une association religieuse, non une localisation géographique.",
    uncertaintyRadiusKm: 200,
  },
  {
    id: 'sirens',
    numeral: 'VIII',
    chapter: 'Chapitre VIII',
    title: 'Le Chant des Sirènes',
    greek: 'Σειρῆνες',
    theme: 'Le savoir absolu contre le retour',
    mood: '#1e3140',
    weather: { motes: 0.55, mist: 0.3, wind: 0.15 },
    plate: 'sirens',
    plateCaption: "Les Sirènes cherchant, par leurs chants, à attirer Ulysse près d'elles",
    coordinates: { lat: 40.576, lng: 14.428 }, // îlots Li Galli
    via: [{ lat: 40.65, lng: 14.15 }],
    year: 1.62,
    timeLabel: 'Année 1 · + quelques jours',
    duration: 'Une heure',
    summary:
      "Attaché au mât, Ulysse est le seul homme à avoir entendu les Sirènes et à y avoir survécu.",
    fullStory:
      "Les Sirènes ne promettent pas le plaisir : elles promettent de tout savoir. Elles connaissent chaque événement de la guerre de Troie et tout ce qui advient sur la terre — c'est cela leur piège, et le rivage jonché d'ossements en dit le prix. Prévenu par Circé, Ulysse bouche à la cire les oreilles de ses hommes et se fait lier au mât, avec l'ordre de resserrer les liens s'il supplie qu'on le détache. Il supplie. On resserre. Il passe. Il est le seul mortel à avoir entendu ce chant et à avoir continué sa route.",
    quote:
      "Approche, viens ici, illustre Ulysse, gloire des Achéens ; arrête ton vaisseau pour écouter notre voix.",
    quoteRef: 'Odyssée, XII, 184',
    characters: ['Ulysse', 'Les Sirènes', "L'équipage"],
    consequence: "La seule épreuve qu'il traverse sans perdre un seul homme.",
    certainty: 'debated',
    historianNote:
      "Les îlots Li Galli, au large de Positano, sont associés aux Sirènes depuis l'Antiquité — Strabon les nomme déjà Sirenusæ — mais plusieurs autres sites revendiquent la légende.",
    uncertaintyRadiusKm: 150,
  },
  {
    id: 'scylla-charybdis',
    numeral: 'IX',
    chapter: 'Chapitre IX',
    title: 'Charybde & Scylla',
    greek: 'Σκύλλα καὶ Χάρυβδις',
    theme: 'Choisir sciemment de perdre',
    mood: '#1b2029',
    weather: { wind: 0.7, rain: 0.4 },
    plate: 'scylla-charybdis',
    plateCaption: "Scylla dévore six des compagnons d'Ulysse",
    coordinates: { lat: 38.2466, lng: 15.635 }, // détroit de Messine
    via: [
      { lat: 39.8, lng: 15.1 },
      { lat: 38.7, lng: 15.8 },
    ],
    year: 1.64,
    timeLabel: 'Année 1 · + quelques jours',
    duration: 'Quelques minutes',
    summary:
      "D'un côté un gouffre qui avale le navire entier, de l'autre un monstre qui prend six hommes. Ulysse choisit les six.",
    fullStory:
      "Le passage est étroit : à bâbord Charybde, un tourbillon qui engloutit trois fois par jour tout ce qui flotte ; à tribord Scylla, six gueules tapies dans une falaise, six marins à chaque passage. Circé a été claire — mieux vaut six morts qu'un navire entier. Ulysse ne prévient pas son équipage, parce qu'un équipage qui sait ne rame plus. Il longe Scylla. Six hommes sont arrachés du pont au-dessus de sa tête, criant son nom, et il ne peut rien faire. Il dira que c'est le spectacle le plus pitoyable de tout son voyage.",
    quote: "Mieux vaut pleurer six compagnons sur ton navire que de les perdre tous à la fois.",
    quoteRef: 'Odyssée, XII, 109',
    characters: ['Ulysse', 'Scylla', 'Charybde'],
    consequence: "Six hommes arrachés du pont, sous ses yeux, sans un geste possible.",
    certainty: 'debated',
    historianNote:
      "Le détroit de Messine, aux courants réellement dangereux et aux tourbillons documentés, est l'identification traditionnelle depuis l'Antiquité grecque.",
    uncertaintyRadiusKm: 80,
  },
  {
    id: 'helios',
    numeral: 'X',
    chapter: 'Chapitre X',
    title: "L'Île du Soleil",
    greek: 'Θρινακίη',
    theme: "L'interdit qu'on savait mortel",
    mood: '#3d2a18',
    weather: { rain: 0.85, lightning: 0.9, wind: 0.8 },
    plate: 'helios',
    plateCaption: "Les compagnons d'Ulysse tuent les bœufs du Soleil ; Lampétie porte ses plaintes à Apollon",
    coordinates: { lat: 37.85, lng: 15.34 }, // Thrinacie, au large de Taormine
    via: [{ lat: 38.05, lng: 15.55 }],
    year: 1.68,
    timeLabel: 'Année 1 · + un mois',
    duration: 'Un mois',
    summary:
      "Bloqués un mois par les vents, affamés, les hommes égorgent les bœufs sacrés d'Hélios. Zeus foudroie le navire.",
    fullStory:
      "Tirésias et Circé l'avaient dit deux fois : ne touchez pas au bétail du Soleil. Ulysse fait jurer à ses hommes de n'y pas toucher. Puis le vent tourne et souffle contre eux un mois entier ; les vivres s'épuisent, on en vient à pêcher des oiseaux. Un jour qu'Ulysse s'endort, Euryloque convainc les autres : mieux vaut mourir d'un coup, foudroyé, que lentement de faim. Ils égorgent les plus belles bêtes du troupeau. Les peaux rampent sur le sol, les broches se mettent à mugir. Six jours plus tard, en pleine mer, la foudre de Zeus brise le navire en deux. Tous se noient. Ulysse reste seul, accroché à la quille.",
    quote: "Toutes les morts sont odieuses aux malheureux mortels, mais la plus lamentable est de mourir de faim.",
    quoteRef: 'Odyssée, XII, 341',
    characters: ['Ulysse', 'Hélios', 'Euryloque', 'Zeus'],
    consequence: "Le dernier navire coule. Il n'y a plus d'équipage, plus de flotte, plus qu'un homme.",
    certainty: 'debated',
    historianNote:
      "Thrinacie, « l'île aux trois pointes », est traditionnellement identifiée à la Sicile — dont la forme triangulaire a donné son nom antique de Trinacria.",
    uncertaintyRadiusKm: 130,
  },
  {
    id: 'calypso',
    numeral: 'XI',
    chapter: 'Chapitre XI',
    title: "Ogygie, l'Île de Calypso",
    greek: 'Καλυψώ',
    theme: "Refuser l'immortalité",
    mood: '#123040',
    weather: { mist: 0.6, motes: 0.3 },
    plate: 'calypso',
    plateCaption: "Mercure, envoyé par Jupiter, ordonne à Calypso de renvoyer Ulysse",
    coordinates: { lat: 35.92, lng: -5.75 }, // au bord de l'Océan, au détroit de Gibraltar
    via: [
      { lat: 37.2, lng: 14.6 },
      { lat: 36.6, lng: 12.2 },
      { lat: 37.6, lng: 8.6 },
      { lat: 37.7, lng: 4.5 },
      { lat: 36.9, lng: -0.5 },
      { lat: 36.0, lng: -4.6 },
    ],
    year: 1.85,
    gapLabel: 'sept ans sur place',
    timeLabel: 'Années 2 à 9',
    duration: 'Sept ans',
    summary:
      "Seul survivant, Ulysse échoue chez une nymphe qui lui offre de ne jamais mourir. Il refuse — et pleure sept ans face à la mer.",
    fullStory:
      "Ulysse dérive neuf jours accroché à une quille, jusqu'au bout du monde connu. Il échoue sur Ogygie, « l'île du nombril de la mer ». Calypso l'aime, le soigne, et lui propose ce qu'aucun mortel n'a jamais refusé : l'immortalité, la jeunesse éternelle, à ses côtés, pour toujours. Sept années passent. Chaque jour il descend s'asseoir sur le rivage et regarde la mer en pleurant. Quand Hermès vient enfin ordonner sa libération, il ne demande pas un navire : il demande des outils, et construit son radeau lui-même.",
    quote:
      "Je sais bien que Pénélope t'est inférieure en beauté et en grandeur ; mais je désire, je souhaite chaque jour rentrer chez moi.",
    quoteRef: 'Odyssée, V, 215',
    characters: ['Ulysse', 'Calypso', 'Hermès', 'Athéna'],
    consequence:
      "Sept années immobiles — la plus longue étape du voyage est celle où rien n'arrive.",
    certainty: 'debated',
    historianNote:
      "Victor Bérard plaçait Ogygie au bord de l'Océan, aux colonnes d'Héraclès — l'îlot de Perejil, face à Ceuta. Gozo, à Malte, est l'autre grande hypothèse ; une île entièrement fictive reste la plus probable.",
    uncertaintyRadiusKm: 320,
  },
  {
    id: 'phaeacians',
    numeral: 'XII',
    chapter: 'Chapitre XII',
    title: 'Les Phéaciens',
    greek: 'Φαίακες',
    theme: 'Raconter enfin son histoire',
    mood: '#1d3a44',
    weather: { rain: 0.7, wind: 0.85, lightning: 0.2 },
    plate: 'phaeacians',
    plateCaption: "Nausicaa et ses femmes trouvent Ulysse sur le rivage",
    coordinates: { lat: 39.62, lng: 19.92 }, // Schérie / Corcyre, Corfou
    via: [
      { lat: 36.0, lng: -4.6 },
      { lat: 36.9, lng: -0.5 },
      { lat: 37.7, lng: 4.5 },
      { lat: 37.8, lng: 8.9 },
      { lat: 37.6, lng: 11.4 },
      { lat: 36.9, lng: 12.6 },
      { lat: 36.3, lng: 13.6 },
      { lat: 36.5, lng: 15.6 },
      { lat: 37.6, lng: 17.8 },
      { lat: 38.9, lng: 19.6 },
    ],
    year: 9.0,
    timeLabel: 'Année 9',
    duration: 'Quelques jours',
    summary:
      "Nu et méconnaissable, il est recueilli par Nausicaa. C'est chez les Phéaciens qu'Ulysse raconte, pour la première fois, tout ce qui précède.",
    fullStory:
      "Son radeau brisé par une dernière tempête de Poséidon, Ulysse aborde nu, couvert de sel, sur la terre des Phéaciens. C'est une jeune fille, Nausicaa, venue laver du linge au fleuve, qui le trouve et ne s'enfuit pas. À la cour d'Alcinoos, un aède chante la guerre de Troie ; Ulysse, le visage dans son manteau, se met à pleurer, et le roi comprend qu'il a devant lui quelqu'un du récit. Alors Ulysse dit son nom et raconte — les Cyclopes, les morts, les Sirènes, Calypso. Tout ce voyage n'existe, dans le poème, que parce qu'il le raconte lui-même ce soir-là. Les Phéaciens le ramèneront chez lui endormi, sur un navire qui ne se perd jamais.",
    quote: "Je suis Ulysse, fils de Laërte, connu de tous les hommes pour mes ruses, et ma gloire monte jusqu'au ciel.",
    quoteRef: 'Odyssée, IX, 19',
    characters: ['Ulysse', 'Nausicaa', 'Alcinoos', 'Démodocos'],
    consequence: "Il redevient quelqu'un le jour où il redit son nom à voix haute.",
    certainty: 'debated',
    historianNote:
      "Schérie, la terre des Phéaciens, est identifiée à Corcyre — l'actuelle Corfou — depuis Thucydide au moins, sans qu'aucune preuve ne vienne l'appuyer.",
    uncertaintyRadiusKm: 120,
  },
  {
    id: 'ithaca',
    numeral: 'XIII',
    chapter: 'Chapitre XIII',
    title: 'Ithaque',
    greek: 'Ἰθάκη',
    theme: 'Rentrer sans être reconnu',
    mood: '#2a3a4e',
    weather: { motes: 0.5, mist: 0.2 },
    plate: 'ithaca',
    plateCaption: "Ulysse endormi est déposé à terre par les Phéaciens, sur le rivage d'Ithaque",
    coordinates: { lat: 38.4419, lng: 20.6614 },
    via: [
      { lat: 39.2, lng: 20.1 },
      { lat: 38.8, lng: 20.5 },
    ],
    year: 9.9,
    timeLabel: 'Année 10',
    duration: 'Le retour',
    summary:
      "Dix ans après Troie, Ulysse débarque endormi sur son île — et personne ne le reconnaît, sauf son chien.",
    fullStory:
      "Les Phéaciens le déposent endormi sur le rivage, avec ses présents rangés près de lui ; il se réveille seul et ne reconnaît pas sa propre île, qu'Athéna a noyée dans la brume. Puis la déesse le vieillit, ride sa peau, blanchit ses cheveux et le couvre de haillons : chez lui, il sera un mendiant. Il monte chez Eumée, son porcher, qui l'héberge sans le reconnaître et lui parle toute la nuit d'un maître disparu depuis vingt ans. Devant le palais, son vieux chien Argos, couché sur du fumier, dresse les oreilles, remue la queue et meurt — vingt ans d'attente pour une seconde de reconnaissance.",
    quote:
      "Il n'est rien de plus doux que sa patrie et ses parents, même à celui qui habite au loin une riche demeure.",
    quoteRef: 'Odyssée, IX, 34',
    characters: ['Ulysse', 'Athéna', 'Eumée', 'Argos'],
    consequence: "Il est enfin chez lui — et chez lui, il est un mendiant que personne n'attend.",
    certainty: 'certain',
    historianNote:
      "L'île d'Ithaki, en mer Ionienne, porte le nom depuis l'Antiquité ; certains chercheurs proposent toutefois la péninsule de Paliki, sur Céphalonie voisine.",
  },
  {
    id: 'suitors',
    numeral: 'XIV',
    chapter: 'Épilogue',
    title: 'Le Massacre des Prétendants',
    greek: 'Μνηστηροφονία',
    theme: 'Reprendre son nom, son arc et son lit',
    mood: '#3d2a1a',
    weather: { embers: 0.55, motes: 0.3, mist: 0.15 },
    plate: 'suitors',
    plateCaption:
      "Les prétendants découvrent la ruse que Pénélope employait pour échapper à leurs poursuites",
    coordinates: { lat: 38.465, lng: 20.633 }, // le palais, au nord de l'île
    zoom: 8.5,
    via: [],
    year: 9.95,
    timeLabel: 'Année 10',
    duration: 'Un après-midi',
    summary:
      "Cent huit hommes mangent sa maison depuis quatre ans. Il tend l'arc que nul n'a pu bander, et referme les portes.",
    fullStory:
      "Ils sont cent huit à dévorer ses troupeaux, à courtiser sa femme et à humilier son fils. Pénélope a tenu quatre ans en tissant le jour un linceul qu'elle défaisait la nuit ; une servante l'a trahie. Elle propose alors une épreuve : tendre l'arc d'Ulysse et faire passer une flèche à travers douze fers de hache. Aucun n'y parvient. Le mendiant demande à essayer ; on se moque de lui. Il tend l'arc sans effort, comme un aède accorde sa lyre, et la corde chante sous son doigt. La première flèche traverse la gorge d'Antinoos, la coupe encore à la main. Alors il jette ses haillons, saute sur le seuil — le seul passage — et dit son nom. Télémaque, Eumée et le bouvier ferment les portes. Il ne restera personne.",
    quote:
      "Chiens ! vous pensiez que je ne reviendrais jamais du pays des Troyens. Voici pour vous le jour de la mort.",
    quoteRef: 'Odyssée, XXII, 35',
    characters: ['Ulysse', 'Télémaque', 'Pénélope', 'Athéna', 'Eumée', 'Antinoos'],
    consequence:
      "Reste la dernière épreuve, la seule qu'Athéna ne puisse pas l'aider à passer : convaincre Pénélope.",
    certainty: 'certain',
    historianNote:
      "Le palais d'Ulysse n'a jamais été localisé avec certitude sur Ithaki ; les fouilles de Stavros, au nord de l'île, en sont l'hypothèse la plus discutée.",
  },
];
