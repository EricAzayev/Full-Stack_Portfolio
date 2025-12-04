# 📈 Rising Economies

Interactive data visualization platform for global economic development trends.

## Demo

## Overview

- Interactive visualizations of economic indicators
- Country-specific detail pages
- Dynamic rendering with vanilla JavaScript
- RESTful API backend

## Key Learnings

- **Vanilla JavaScript:** DOM manipulation without frameworks, event delegation, modular patterns
- **Data Visualization:** Interactive charts, responsive displays, dynamic filtering and sorting
- **Backend API:** RESTful design with Express.js, modular route handlers, static file serving
- **Async Data:** Fetch API, loading states, promise chains, async/await patterns

## 🛠️ Technologies Used

### Frontend
- **Vanilla JavaScript (ES6+)** - Modern JS without frameworks
- **HTML5** - Semantic markup structure
- **CSS3** - Custom styling and layouts
- **Fetch API** - Asynchronous data fetching
- **Vite** - Modern build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JSON Data Storage** - Country economic data

### Tools
- **npm** - Package management
- **Nodemon** - Development auto-reload

## Future Enhancements

- [ ] Add real-time economic data integration via external APIs (World Bank, IMF)
- [ ] Implement data filtering by region, GDP range, or other metrics
- [ ] Create comparison view for side-by-side country analysis
- [ ] Add historical trend graphs showing economic development over time
- [ ] Integrate mapping library to visualize geographic data
- [ ] Add search functionality for quick country lookup
- [ ] Deploy to production environment

## 📦 Installation & Setup

```bash
# Navigate to RisingEconomies directory
cd RisingEconomies

# Install dependencies
npm install

# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Start the backend server (from server directory)
npm start

# In a new terminal, start the frontend (from RisingEconomies root)
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and the API at `http://localhost:3001`.

## 📁 Project Structure

```
RisingEconomies/
├── server/
│   ├── server.js              # Express server setup
│   ├── routes/
│   │   └── countries.js       # API routes for country data
│   ├── controllers/
│   │   └── countries.js       # Business logic
│   ├── data/
│   │   └── countries.js       # Economic data
│   └── config/
│       └── database.js        # Data configuration
├── public/
│   └── scripts/
│       ├── header.js          # Navigation rendering
│       └── countries.js       # Country data display logic
├── src/
│   └── style.css              # Custom styles
├── index.html                 # Main HTML entry point
└── 404.html                   # Error page
```

## 📊 Data Sources

The application uses curated economic data representing emerging markets. Metrics include:
- GDP and GDP growth rates
- Population demographics
- Inflation rates
- Trade balances
- Foreign direct investment
- And more...

---

Built with ❤️ to visualize global economic development.
