# SEN-BEACON: AI Mosquito Trap Monitoring Dashboard

## About

SEN-BEACON (formerly AiMT) is a web-based dashboard for monitoring AI-powered mosquito traps deployed in Senegal. The application provides real-time visualization of environmental sensor data, mosquito activity patterns, and species classification from smart traps designed to aid vector-borne disease surveillance.

The dashboard is currently configured to monitor a trap located in **Thies, Senegal** (14.7833, -16.9214).

---

## Features

### Dashboard Overview
The main dashboard presents a unified view of trap performance through five stat cards and three visualization panels:

- **Stat Cards** -- Temperature (C), Atmospheric Pressure (hPa), Total Mosquitoes Caught, Battery Level (%), and Trap Status (Online/Offline)
- **Mosquito Activity Bar Chart** -- Hourly catch count showing peak activity during dusk and dawn hours
- **Species Breakdown Pie Chart** -- Distribution across identified species: *Aedes aegypti*, *Anopheles*, and *Culex*
- **Temperature & Pressure Line Chart** -- 24-hour dual-axis environmental readings

### Dedicated Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main overview with stats, charts, and species breakdown |
| `/activity` | Mosquito Activity | Full-screen bar chart of hourly mosquito catch counts |
| `/temperature` | Temperature & Pressure | Dual-axis line chart tracking environmental conditions over 24 hours |
| `/timeline` | Activity Over Time | Line chart with a reference threshold line marking high activity (100+ catches) |
| `/map` | Trap Location | Interactive Leaflet map showing the trap's GPS position in Thies, Senegal |

### UI Features
- **Dark/Light Mode** -- Toggle between dark (default) and light themes via the top bar
- **Collapsible Sidebar** -- Navigation menu that can be collapsed for more screen space; displays trap name and location info
- **Responsive Layout** -- Grid-based design that adapts to different screen sizes

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.4 |
| Routing | React Router DOM | 6.30.3 |
| UI Library | Material-UI (MUI) | 7.3.9 |
| CSS-in-JS | Emotion | 11.14.x |
| Charts | Recharts | 3.8.0 |
| Maps | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Sidebar | React Pro Sidebar | 0.7.1 |
| Build Tool | Create React App (react-scripts) | 5.0.1 |

---

## Project Structure

```
SEN-BEACON/
├── public/
│   ├── index.html            # HTML entry point
│   ├── manifest.json         # PWA manifest
│   ├── favicon.ico           # App favicon
│   └── robots.txt
├── src/
│   ├── index.js              # React entry point, renders <App />
│   ├── index.css             # Global styles (flexbox layout, scrollbar)
│   ├── App.js                # Root component: routing, theme provider, layout
│   ├── theme.js              # MUI theme config, color tokens, dark/light mode
│   ├── assets/
│   │   └── AIMTLogo.png      # Application logo
│   ├── components/
│   │   └── Header.jsx        # Reusable page header (title + subtitle)
│   ├── data/
│   │   ├── mockData.js       # Mock sensor readings, activity, species, trap stats
│   │   └── mockGeoFeatures.js# GeoJSON feature collection (reserved for future use)
│   └── scenes/
│       ├── global/
│       │   ├── Sidebar.jsx   # Collapsible navigation sidebar
│       │   └── Topbar.jsx    # Top bar with search, theme toggle, settings icons
│       ├── dashboard/
│       │   └── index.jsx     # Main dashboard with stat cards and charts
│       ├── activity/
│       │   └── index.jsx     # Mosquito activity bar chart page
│       ├── temperature/
│       │   └── index.jsx     # Temperature & pressure line chart page
│       ├── timeline/
│       │   └── index.jsx     # Activity over time with threshold reference line
│       └── map/
│           └── index.jsx     # Leaflet map showing trap location
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Architecture

### Component Pattern
All components are **functional components** using React hooks (`useState`, `useContext`, `useMemo`). There are no class components.

### Theme System
The theme is managed through React Context API:

1. `tokens(mode)` -- Returns a color palette object (grey, primary, greenAccent, redAccent, blueAccent) with values inverted between dark and light modes
2. `themeSettings(mode)` -- Constructs a full MUI theme using the token palette
3. `ColorModeContext` -- Provides a `toggleColorMode()` function to all components via context
4. `useMode()` -- Custom hook that returns the current MUI theme and the color mode context value

### State Management
- **Theme state** -- Managed via `useState` in `useMode()`, toggled through `ColorModeContext`
- **Sidebar state** -- Local `useState` for collapsed/expanded toggle
- No external state management library (Redux, Zustand, etc.) is used

### Data Flow
All data is currently sourced from `src/data/mockData.js`. The mock data simulates:
- **Temperature readings** -- 12 data points across 24 hours (26-38 C range)
- **Pressure readings** -- Corresponding atmospheric pressure (1008-1013 hPa)
- **Mosquito activity** -- Hourly catch counts showing bimodal peaks at dawn (~120) and dusk (~134)
- **Species classification** -- Three species with percentage distribution
- **Trap statistics** -- Current sensor readings and device status

---

## Data Model

### Trap Statistics
```javascript
{
  temperature: 34,        // Celsius
  pressure: 1010,         // hPa
  mosquitoCount: 1243,    // Total caught
  status: "Online",       // Device status
  battery: 87,            // Percentage
  location: "Thies, Senegal"
}
```

### Mosquito Activity (per 2-hour interval)
```javascript
{ hour: "20:00", count: 134 }
```

### Species Classification
```javascript
{ id: "Aedes aegypti", label: "Aedes aegypti", value: 45, color: "hsl(...)" }
```

### Environmental Readings
```javascript
{ time: "14:00", temperature: 38, pressure: 1008 }
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
```bash
git clone https://github.com/mbayestark/SEN-BEACON.git
cd SEN-BEACON
npm install
```

### Development
```bash
npm start
```
Opens the app at [http://localhost:3000](http://localhost:3000). Hot-reloads on file changes.

### Production Build
```bash
npm run build
```
Outputs an optimized bundle to the `build/` directory.

---

## Current Limitations

- **Mock data only** -- No backend or API integration; all data is hardcoded
- **Single trap** -- Dashboard is configured for one trap location
- **No authentication** -- No user login or access control
- **No persistent storage** -- Theme preference resets on page reload

---

## Future Considerations

- Connect to a live backend API for real-time sensor data ingestion
- Support multiple trap deployments with a trap selection interface
- Add historical data views with date range filtering
- Implement user authentication and role-based access
- Integrate push notifications for trap alerts (low battery, offline, high activity)
- Replace mock data with WebSocket or MQTT for live streaming updates
