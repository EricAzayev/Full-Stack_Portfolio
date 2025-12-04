# ⛰️ Adirondack 46ers

Event management platform for hiking the 46 High Peaks of the Adirondack Mountains.

## Demo

https://github.com/user-attachments/assets/b99642d4-03f9-4a47-b6a8-e110382c55ec

## Overview

- Browse upcoming hiking events across all 46 peaks
- View mountain details and associated events
- Navigate monthly calendars
- Track "The Six" featured peaks
- Community hub for organized group climbs

## Key Learnings

- **React Router v6:** Client-side routing, nested routes, dynamic route parameters for 46 mountains
- **Date & Calendar Logic:** Custom calendar navigation, date filtering algorithms, JavaScript Date handling
- **Component Architecture:** Reusable modular components, separation of concerns, prop drilling patterns
- **Backend & Database:** RESTful API with Express.js, PostgreSQL configuration, environment variables
- **Full-Stack Integration:** Async data loading with Fetch API, loading states, CORS configuration

## 🛠️ Technologies Used

### Frontend
- **React** - Component-based UI with hooks (useState, useEffect)
- **React Router** - Client-side routing and navigation
- **JavaScript (ES6+)** - Modern async/await patterns
- **CSS3** - Custom styling for calendar and mountain views
- **Vite** - Fast development build tool

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database for event data
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Tools
- **npm** - Package management
- **Nodemon** - Development server auto-restart

## 🚀 Future Enhancements

- [ ] Add user authentication to allow hikers to RSVP for events
- [ ] Implement event creation interface for organizers
- [ ] Add weather API integration for real-time mountain conditions
- [ ] Create a completion tracker for users working toward their 46er patch
- [ ] Integrate mapping functionality to show trailheads and routes
- [ ] Add photo gallery for each peak
- [ ] Deploy to production (Render + Vercel)

## 📦 Installation & Setup

```bash
# Navigate to Adirondack46ers directory
cd Adirondack46ers

# Install frontend dependencies
npm install

# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Set up environment variables
# Create a .env file in server/ directory with:
# DATABASE_URL=your_postgresql_connection_string
# PORT=3001

# Initialize database (from server directory)
npm run reset

# Start the backend server
npm start

# In a new terminal, start the frontend (from Adirondack46ers root)
npm run dev
```

The app will be available at `http://localhost:5173` (frontend) and the API at `http://localhost:3001`.

## 📁 Project Structure

```
Adirondack46ers/
├── server/
│   ├── server.js              # Express server setup
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection
│   │   ├── dotenv.js          # Environment config
│   │   └── reset.js           # Database seeding
│   ├── controllers/
│   │   └── events.js          # Business logic for events
│   ├── routes/
│   │   └── events.js          # API route definitions
│   └── data/
│       └── events.js          # Seed data
├── src/
│   ├── App.jsx                # Main app with routing
│   ├── components/
│   │   ├── Header.jsx         # Navigation header
│   │   ├── TheSix.jsx         # Featured peaks display
│   │   ├── AllUpcomingHikes.jsx   # Calendar view
│   │   ├── MountainSelector.jsx   # Mountain list
│   │   ├── MountainDetail.jsx     # Individual mountain page
│   │   └── Countdown.jsx      # Event countdown timer
│   └── style.css
├── images/                     # Mountain photos
└── index.html
```

---

*Supporting the Adirondack 46ers community - climb all 46 High Peaks.*
