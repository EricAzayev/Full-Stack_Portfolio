// Star projects for the cinematic slider.
// lines are counted from this repository's actual source; codeUrl points into the repo on GitHub.
const GH = 'https://github.com/EricAzayev/Full-Stack_Portfolio/tree/main';

export const starProjects = [
  {
    id: 'food-tracker',
    name: 'Food Tracker',
    category: 'Full-Stack Desktop App',
    description: 'Nutrition tracking application that runs as a Windows desktop app or web application',
    keyChallenge: 'Packaged the web app as a native Windows executable with Electron: a companion app hosts the Express + SQLite storage so the UI and its data live in separate processes, plus per-instance data directories and import/export of tracking history.',
    screenshots: [
      '/assets/screenshots/food-tracker/today.png',
      '/assets/screenshots/food-tracker/food-library.png',
      '/assets/screenshots/food-tracker/analytics.png',
      '/assets/screenshots/food-tracker/history.png',
      '/assets/screenshots/food-tracker/user-settings.png',
    ],
    demoUrl: '/projects/food-tracker/',
    codeUrl: `${GH}/FoodTracker`,
    thumbnail: '/assets/thumbnails/food-tracker.png',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'Electron', icon: 'https://cdn.simpleicons.org/electron/47848F' },
      { name: 'Chart.js', icon: 'https://cdn.simpleicons.org/chartdotjs/FF6384' }
    ],
    lines: 14708,
    features: [
      'Daily caloric tracking with visual charts',
      'Macronutrient breakdown and goals',
      'Custom food library management',
      'Desktop app with Electron',
      'Offline data storage'
    ]
  },
  {
    id: 'rpg-chess',
    name: 'RPG Chess',
    category: 'Full-Stack Game',
    description: 'Chess variant where pieces have stats and cost gold - board editor, armory and shop',
    keyChallenge: 'Built a 3x8 chess variant with an HP/attack economy on top of the standard rules: piece placement rules, a shop that purchases pieces with earned gold, and board persistence through localStorage so a session survives reloads even when the API is out.',
    demoVideo: null,
    demoUrl: '/projects/rpg-chess/chessboard',
    codeUrl: `${GH}/Chess/RPGChess`,
    thumbnail: '/assets/thumbnails/rpg-chess.png',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' }
    ],
    lines: 2290,
    features: [
      '3x8 chess variant board',
      'Piece stats and gold economy',
      'Armory and shop system',
      'Board persistence across reloads'
    ]
  },
  {
    id: 'adirondack46ers',
    name: 'Adirondack 46ers',
    category: 'Full-Stack Event Platform',
    description: 'Event management platform for hiking the 46 High Peaks of the Adirondack Mountains',
    keyChallenge: 'Designed a month-navigation calendar with per-month event filtering, live countdown state on each hike card, and nested routes for the six tallest peaks and all 46 mountains with their associated events.',
    demoVideo: null,
    demoUrl: '/projects/adirondack46ers/',
    codeUrl: `${GH}/Adirondack46ers`,
    thumbnail: '/assets/thumbnails/adirondack46ers.png',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
      { name: 'React Router', icon: 'https://cdn.simpleicons.org/reactrouter/CA4245' }
    ],
    lines: 1949,
    features: [
      'Browse upcoming hiking events',
      'Monthly calendar navigation',
      'Live countdown on each hike',
      'RESTful API with PostgreSQL'
    ]
  },
  {
    id: 'rising-economies',
    name: 'Rising Economies',
    category: 'Full-Stack Data Visualization',
    description: 'Interactive data visualization platform for global economic development trends',
    keyChallenge: 'Built a scoring engine in plain JavaScript that normalizes five economic indicators per country and ranks them into a 0-100 rising score, rendered as vanilla-DOM cards over an Express API - no framework, no chart library.',
    demoVideo: null,
    demoUrl: '/projects/rising-economies/',
    codeUrl: `${GH}/RisingEconomies`,
    thumbnail: '/assets/thumbnails/rising-economies.png',
    techStack: [
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' }
    ],
    lines: 773,
    features: [
      'Country ranking by composite score',
      'Country detail pages',
      'Zero framework dependencies',
      'Express API with bundled dataset fallback'
    ]
  }
];