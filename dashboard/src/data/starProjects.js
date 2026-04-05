// Star projects for the cinematic slider
export const starProjects = [
  {
    id: 'food-tracker',
    name: 'Food Tracker',
    category: 'Full-Stack Desktop App',
    description: 'Nutrition tracking application that runs as a Windows desktop app or web application',
    keyChallenge: 'Built a complete Electron wrapper to package the web app as a native Windows executable with offline SQLite storage and cross-process communication.',
    demoVideo: '/assets/videos/food-tracker-demo.mp4',
    demoUrl: '/projects/food-tracker/',
    thumbnail: '/assets/thumbnails/food-tracker.webp',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'Electron', icon: 'https://cdn.simpleicons.org/electron/47848F' },
      { name: 'Chart.js', icon: 'https://cdn.simpleicons.org/chartdotjs/FF6384' }
    ],
    linesOfCode: 12450,
    commits: '140+',
    dependencies: 18,
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
    description: 'Chess game with RPG elements and real-time multiplayer functionality',
    keyChallenge: 'Implemented custom game logic engine handling both traditional chess rules and RPG stat modifiers with WebSocket-based real-time synchronization.',
    demoVideo: '/assets/videos/rpg-chess-demo.mp4',
    demoUrl: '/projects/rpg-chess/',
    thumbnail: '/assets/thumbnails/rpg-chess.webp',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Socket.io', icon: 'https://cdn.simpleicons.org/socketdotio/010101' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' }
    ],
    linesOfCode: 8920,
    commits: '95+',
    dependencies: 14,
    features: [
      'Traditional chess gameplay',
      'RPG stat system for pieces',
      'Real-time multiplayer',
      'WebSocket communication'
    ]
  },
  {
    id: 'adirondack46ers',
    name: 'Adirondack 46ers',
    category: 'Full-Stack Event Platform',
    description: 'Event management platform for hiking the 46 High Peaks of the Adirondack Mountains',
    keyChallenge: 'Designed a dynamic calendar system with custom date filtering algorithms and nested routing for 46 mountain detail pages with associated events.',
    demoVideo: '/assets/videos/adirondack-demo.mp4',
    demoUrl: '/projects/adirondack46ers/',
    thumbnail: '/assets/thumbnails/adirondack46ers.webp',
    techStack: [
      { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
      { name: 'React Router', icon: 'https://cdn.simpleicons.org/reactrouter/CA4245' }
    ],
    linesOfCode: 7350,
    commits: '78+',
    dependencies: 12,
    features: [
      'Browse upcoming hiking events',
      'View mountain details and history',
      'Monthly calendar navigation',
      'RESTful API with PostgreSQL'
    ]
  },
  {
    id: 'rising-economies',
    name: 'Rising Economies',
    category: 'Full-Stack Data Visualization',
    description: 'Interactive data visualization platform for global economic development trends',
    keyChallenge: 'Built a modular vanilla JavaScript architecture with dynamic DOM manipulation and interactive data visualizations without framework dependencies.',
    demoVideo: '/assets/videos/rising-economies-demo.mp4',
    demoUrl: '/projects/rising-economies/',
    thumbnail: '/assets/thumbnails/rising-economies.webp',
    techStack: [
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Express', icon: 'https://cdn.simpleicons.org/express/FFFFFF' },
      { name: 'Vite', icon: 'https://cdn.simpleicons.org/vite/646CFF' }
    ],
    linesOfCode: 5680,
    commits: '62+',
    dependencies: 8,
    features: [
      'Interactive economic visualizations',
      'Country-specific detail pages',
      'Dynamic data rendering',
      'RESTful API backend'
    ]
  }
];
