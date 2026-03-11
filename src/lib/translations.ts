// Conteúdo principal em português; inglês como opção de tradução

export type Locale = 'pt' | 'en';

export const translations = {
  pt: {
    // App / layout
    appTitle: 'Rabbit Hole',
    appTagline: 'Pesquise uma coisa. Perda-se em tudo.',
    tryIt: 'Experimentar',
    backHome: '← Voltar ao início',
    newSearch: 'Nova busca',
    home: 'Início',
    exploreGraph: 'Explorar grafo →',
    footerTagline: 'Um motor de curiosidade cinematográfico. Sem login.',

    // Home
    searchOneThing: 'Pesquise uma coisa.',
    loseYourself: 'Perda-se em tudo.',
    searchPlaceholder: 'Einstein, Dinossauros, Roma, IA...',
    searchHint: 'Digite qualquer coisa. Nós mapeamos as conexões.',
    takeMeRandom: 'Me leve a um lugar aleatório',
    takingYou: 'Te levando...',

    // Trending
    trendingTitle: 'Top 5 mais buscados (últimas 24h)',

    // Quiz
    quizTitle: 'Quais temas te fascinam?',
    quizSubtitle: 'Ajustamos seu feed de descobertas. Você pode pular.',
    startExploring: 'Começar a explorar',
    skip: 'Pular',
    startQuiz: 'Fazer o quiz',
    quizTopicScience: 'Ciência',
    quizTopicHistory: 'História',
    quizTopicTechnology: 'Tecnologia',
    quizTopicMovies: 'Cinema',
    quizTopicSpace: 'Espaço',
    quizTopicPsychology: 'Psicologia',
    quizTopicArt: 'Arte',
    quizTopicRandom: 'Descobertas aleatórias',

    // Explore
    mappingConnections: 'Mapeando conexões…',
    enterSearchOrTrending: 'Digite um termo ou escolha um tema em alta.',
    noData: 'Sem dados',
    somethingWentWrong: 'Algo deu errado',
    discoveryFeed: 'Feed de descobertas',
    details: 'Detalhes',
    noDiscoveriesYet: 'Nenhuma descoberta ainda. Pesquise para começar.',
    clickNodeOrCard: 'Clique em um nó ou em um card para ver os detalhes.',
    noDescription: 'Sem descrição disponível.',
    readOnWikipedia: 'Ler na Wikipédia →',
    fullEntityPage: 'Ver página completa da entidade →',
    trail: 'Trilha',
    share: 'Compartilhar',
    shareTrail: 'Compartilhar esta trilha',
<<<<<<< HEAD
    recenter: 'Centralizar',
    copied: 'Copiado',
=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

    // Entity page
    missingEntityId: 'ID da entidade ausente.',
    entityNotFound: 'Entidade não encontrada.',
    related: 'Relacionados',

    // Language toggle (no menu)
    langSwitchToEn: 'EN',
    langSwitchToPt: 'PT',
    langLabel: 'Idioma',

    // Connect (Six Degrees)
    connectTitle: 'Six Degrees',
    connectSubtitle: 'Conecte duas pessoas em até 6 passos.',
    connectPersonA: 'Pessoa A',
    connectPersonB: 'Pessoa B',
    connectPlaceholder: 'Nome de uma pessoa…',
    findConnection: 'Encontrar conexão',
    connecting: 'Buscando conexão…',
    noConnectionFound: 'Nenhuma conexão encontrada em até 6 graus.',
    connectionLength: 'Graus de separação',
    surprisePair: 'Surpresa',
    swapPeople: 'Trocar',
    exploreFromHere: 'Explorar daqui',
    setAsStart: 'Definir como início',
    setAsTarget: 'Definir como destino',
    degreesOfSeparation: 'graus',
<<<<<<< HEAD
    whyInPath: 'Nesta conexão',
=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

    // Chroma Grid
    chromaTrendingTitle: 'Pessoas em alta',
    chromaTrendingSubtitle: 'Top buscados nas últimas 24h',
    chromaRelatedTitle: 'Pessoas relacionadas',
    chromaRelatedSubtitle: 'Conectadas à sua busca',
    chromaContinueTitle: 'Continue explorando',
    chromaContinueSubtitle: 'Mais pessoas para descobrir',
    chromaSavedTitle: 'Trilhas salvas',
    chromaSavedSubtitle: 'Suas jornadas anteriores',
    chromaPopularTitle: 'Conexões populares',
    chromaPopularSubtitle: 'Pares mais explorados',
  },
  en: {
    appTitle: 'Rabbit Hole',
    appTagline: 'Search one thing. Lose yourself in everything.',
    tryIt: 'Try it',
    backHome: '← Back home',
    newSearch: 'New search',
    home: 'Home',
    exploreGraph: 'Explore graph →',
    footerTagline: 'A cinematic curiosity engine. No login required.',

    searchOneThing: 'Search one thing.',
    loseYourself: 'Lose yourself in everything.',
    searchPlaceholder: 'Einstein, Dinosaurs, Rome, AI...',
    searchHint: "Type anything. We'll map the connections.",
    takeMeRandom: 'Take me somewhere random',
    takingYou: 'Taking you somewhere…',

    trendingTitle: 'Top 5 Most Searched (Last 24h)',

    quizTitle: 'What topics fascinate you?',
    quizSubtitle: "We'll tailor your discovery feed. You can skip.",
    startExploring: 'Start exploring',
    skip: 'Skip',
    startQuiz: 'Start quiz',
    quizTopicScience: 'Science',
    quizTopicHistory: 'History',
    quizTopicTechnology: 'Technology',
    quizTopicMovies: 'Movies',
    quizTopicSpace: 'Space',
    quizTopicPsychology: 'Psychology',
    quizTopicArt: 'Art',
    quizTopicRandom: 'Random discoveries',

    mappingConnections: 'Mapping connections…',
    enterSearchOrTrending: 'Enter a search term or select a trending topic.',
    noData: 'No data',
    somethingWentWrong: 'Something went wrong',
    discoveryFeed: 'Discovery feed',
    details: 'Details',
    noDiscoveriesYet: 'No discoveries yet. Search to start.',
    clickNodeOrCard: 'Click a node or a discovery card to see details.',
    noDescription: 'No description available.',
    readOnWikipedia: 'Read on Wikipedia →',
    fullEntityPage: 'Full entity page →',
    trail: 'Trail',
    share: 'Share',
    shareTrail: 'Share this trail',
<<<<<<< HEAD
    recenter: 'Recenter',
    copied: 'Copied',
=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

    missingEntityId: 'Missing entity ID.',
    entityNotFound: 'Entity not found.',
    related: 'Related',

    langSwitchToEn: 'EN',
    langSwitchToPt: 'PT',
    langLabel: 'Language',

    connectTitle: 'Six Degrees',
    connectSubtitle: 'Connect two people in up to 6 steps.',
    connectPersonA: 'Person A',
    connectPersonB: 'Person B',
    connectPlaceholder: 'Name of a person…',
    findConnection: 'Find Connection',
    connecting: 'Finding connection…',
    noConnectionFound: 'No connection found within six degrees.',
    connectionLength: 'Degrees of separation',
    surprisePair: 'Surprise Pair',
    swapPeople: 'Swap',
    exploreFromHere: 'Explore from here',
    setAsStart: 'Set as start',
    setAsTarget: 'Set as target',
    degreesOfSeparation: 'degrees',
<<<<<<< HEAD
    whyInPath: 'In this connection',
=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

    chromaTrendingTitle: 'Trending people',
    chromaTrendingSubtitle: 'Top searched in the last 24h',
    chromaRelatedTitle: 'Related people',
    chromaRelatedSubtitle: 'Connected to your search',
    chromaContinueTitle: 'Continue exploring',
    chromaContinueSubtitle: 'More people to discover',
    chromaSavedTitle: 'Saved trails',
    chromaSavedSubtitle: 'Your past journeys',
    chromaPopularTitle: 'Popular connections',
    chromaPopularSubtitle: 'Most explored pairs',
  },
} as const;

export type TranslationKey = keyof typeof translations.pt;
