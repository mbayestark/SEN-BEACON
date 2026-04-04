# SEN-BEACON Dashboard — Claude Code Instructions

## Context

This is the SEN-BEACON health intelligence dashboard. The project currently monitors a single mosquito trap in Thiès, Senegal with mock data. Your job is to expand and redesign it into a full multi-device, multi-zone health surveillance dashboard for Senegal.

The existing stack is: **React 19 + MUI + Recharts + Leaflet + React Router DOM**. Do not change the stack.

---

## Design Direction

The dashboard is used by health professionals (MSAS, PNLP, district health officers). The aesthetic should feel:
- **Authoritative and data-dense** — this is a command center, not a consumer app
- **Dark-first** — dark mode is the default and primary experience
- **Clean and precise** — every element earns its place
- Typography: use **IBM Plex Mono** for data/numbers and **IBM Plex Sans** for labels and UI text. Import from Google Fonts.
- Color accent: use a sharp **teal/cyan** (`#00C9B1`) as the primary accent against dark backgrounds. Red (`#FF4D4D`) for critical alerts, amber (`#F5A623`) for warnings, green (`#4CAF50`) for healthy/online status.
- No gradients, no decorative clutter. Dense grids of data with sharp borders feel right here.

---

## Step 1 — Branding

1. Replace `src/assets/AIMTLogo.png` with a text-based logo component `SenBeaconLogo.jsx` in `src/components/` that renders "SEN-BEACON" in IBM Plex Mono, with "SEN-" in white and "BEACON" in teal (`#00C9B1`).
2. Update `public/index.html` `<title>` to `SEN-BEACON | Health Intelligence Dashboard`.
3. Update the sidebar header to show "SEN-BEACON" using the logo component and subtitle "Health Intelligence Platform".

---

## Step 2 — Expand Mock Data

Replace `src/data/mockData.js` entirely with the following expanded data model:

```javascript
// Device registry — static, location resolved from device_id
export const deviceRegistry = [
  { id: "TRAP-001", name: "Thiès Nord", location: "Thiès", lat: 14.7833, lng: -16.9214, zone: "Zone Nord", status: "Online", battery: 87, lastPing: "2 min ago" },
  { id: "TRAP-002", name: "Dakar Plateau", location: "Dakar", lat: 14.6937, lng: -17.4441, zone: "Zone Ouest", status: "Online", battery: 62, lastPing: "5 min ago" },
  { id: "TRAP-003", name: "Saint-Louis", location: "Saint-Louis", lat: 16.0179, lng: -16.4896, zone: "Zone Nord", status: "Offline", battery: 12, lastPing: "3 hours ago" },
  { id: "TRAP-004", name: "Ziguinchor", location: "Ziguinchor", lat: 12.5681, lng: -16.2719, zone: "Zone Sud", status: "Online", battery: 94, lastPing: "1 min ago" },
  { id: "TRAP-005", name: "Kaolack", location: "Kaolack", lat: 14.1652, lng: -16.0726, zone: "Zone Centre", status: "Online", battery: 71, lastPing: "8 min ago" },
];

// Mosquito catch data per device (last 24h, per 2h interval)
export const mosquitoActivityByDevice = {
  "TRAP-001": [
    { hour: "00:00", Anopheles: 12, Aedes: 5, Culex: 8 },
    { hour: "02:00", Anopheles: 18, Aedes: 7, Culex: 11 },
    { hour: "04:00", Anopheles: 34, Aedes: 12, Culex: 19 },
    { hour: "06:00", Anopheles: 56, Aedes: 23, Culex: 31 },
    { hour: "08:00", Anopheles: 28, Aedes: 14, Culex: 16 },
    { hour: "10:00", Anopheles: 9, Aedes: 6, Culex: 7 },
    { hour: "12:00", Anopheles: 5, Aedes: 3, Culex: 4 },
    { hour: "14:00", Anopheles: 7, Aedes: 4, Culex: 5 },
    { hour: "16:00", Anopheles: 14, Aedes: 8, Culex: 10 },
    { hour: "18:00", Anopheles: 42, Aedes: 18, Culex: 26 },
    { hour: "20:00", Anopheles: 67, Aedes: 31, Culex: 44 },
    { hour: "22:00", Anopheles: 38, Aedes: 19, Culex: 24 },
  ],
  "TRAP-002": [
    { hour: "00:00", Anopheles: 6, Aedes: 22, Culex: 4 },
    { hour: "02:00", Anopheles: 9, Aedes: 31, Culex: 6 },
    { hour: "04:00", Anopheles: 14, Aedes: 47, Culex: 9 },
    { hour: "06:00", Anopheles: 22, Aedes: 68, Culex: 14 },
    { hour: "08:00", Anopheles: 11, Aedes: 39, Culex: 8 },
    { hour: "10:00", Anopheles: 4, Aedes: 17, Culex: 3 },
    { hour: "12:00", Anopheles: 2, Aedes: 11, Culex: 2 },
    { hour: "14:00", Anopheles: 3, Aedes: 14, Culex: 3 },
    { hour: "16:00", Anopheles: 7, Aedes: 28, Culex: 6 },
    { hour: "18:00", Anopheles: 18, Aedes: 54, Culex: 13 },
    { hour: "20:00", Anopheles: 29, Aedes: 82, Culex: 19 },
    { hour: "22:00", Anopheles: 17, Aedes: 48, Culex: 12 },
  ],
  "TRAP-004": [
    { hour: "00:00", Anopheles: 21, Aedes: 9, Culex: 14 },
    { hour: "02:00", Anopheles: 29, Aedes: 12, Culex: 18 },
    { hour: "04:00", Anopheles: 48, Aedes: 19, Culex: 31 },
    { hour: "06:00", Anopheles: 73, Aedes: 28, Culex: 47 },
    { hour: "08:00", Anopheles: 41, Aedes: 16, Culex: 26 },
    { hour: "10:00", Anopheles: 15, Aedes: 6, Culex: 9 },
    { hour: "12:00", Anopheles: 8, Aedes: 3, Culex: 5 },
    { hour: "14:00", Anopheles: 11, Aedes: 4, Culex: 7 },
    { hour: "16:00", Anopheles: 22, Aedes: 9, Culex: 14 },
    { hour: "18:00", Anopheles: 61, Aedes: 23, Culex: 39 },
    { hour: "20:00", Anopheles: 91, Aedes: 34, Culex: 58 },
    { hour: "22:00", Anopheles: 54, Aedes: 21, Culex: 35 },
  ],
  "TRAP-005": [
    { hour: "00:00", Anopheles: 8, Aedes: 4, Culex: 6 },
    { hour: "02:00", Anopheles: 11, Aedes: 5, Culex: 8 },
    { hour: "04:00", Anopheles: 19, Aedes: 8, Culex: 13 },
    { hour: "06:00", Anopheles: 27, Aedes: 11, Culex: 18 },
    { hour: "08:00", Anopheles: 14, Aedes: 6, Culex: 9 },
    { hour: "10:00", Anopheles: 5, Aedes: 2, Culex: 3 },
    { hour: "12:00", Anopheles: 3, Aedes: 1, Culex: 2 },
    { hour: "14:00", Anopheles: 4, Aedes: 2, Culex: 3 },
    { hour: "16:00", Anopheles: 9, Aedes: 4, Culex: 6 },
    { hour: "18:00", Anopheles: 24, Aedes: 10, Culex: 15 },
    { hour: "20:00", Anopheles: 37, Aedes: 15, Culex: 23 },
    { hour: "22:00", Anopheles: 22, Aedes: 9, Culex: 14 },
  ],
};

// Zone-level aggregated stats for heatmap
export const zoneStats = [
  { zone: "Zone Nord", totalCatches: 1847, dominantSpecies: "Anopheles", riskLevel: "High", devicesOnline: 1, devicesTotal: 2 },
  { zone: "Zone Ouest", totalCatches: 2134, dominantSpecies: "Aedes aegypti", riskLevel: "Critical", devicesOnline: 1, devicesTotal: 1 },
  { zone: "Zone Sud", totalCatches: 2891, dominantSpecies: "Anopheles", riskLevel: "Critical", devicesOnline: 1, devicesTotal: 1 },
  { zone: "Zone Centre", totalCatches: 743, dominantSpecies: "Culex", riskLevel: "Medium", devicesOnline: 1, devicesTotal: 1 },
];

// Alerts feed
export const alertsData = [
  { id: "ALT-001", zone: "Zone Sud", device: "TRAP-004", type: "High Anopheles activity", severity: "critical", count: 91, threshold: 70, timestamp: "2026-03-27T20:14:00Z" },
  { id: "ALT-002", zone: "Zone Ouest", device: "TRAP-002", type: "High Aedes aegypti activity", severity: "critical", count: 82, threshold: 70, timestamp: "2026-03-27T20:02:00Z" },
  { id: "ALT-003", zone: "Zone Nord", device: "TRAP-003", type: "Device offline", severity: "warning", count: null, threshold: null, timestamp: "2026-03-27T17:30:00Z" },
  { id: "ALT-004", zone: "Zone Nord", device: "TRAP-003", type: "Low battery", severity: "warning", count: null, threshold: null, timestamp: "2026-03-27T15:10:00Z" },
  { id: "ALT-005", zone: "Zone Nord", device: "TRAP-001", type: "High Anopheles activity", severity: "high", count: 67, threshold: 50, timestamp: "2026-03-27T20:08:00Z" },
];

// Dashboard summary stats
export const dashboardStats = {
  activeDevices: 4,
  totalDevices: 5,
  zonesMonitored: 4,
  totalCatchesToday: 7615,
  activeAlerts: 3,
  criticalAlerts: 2,
};

// Prediction mockup data (future vision — static)
export const predictionData = [
  { zone: "Zone Sud", riskScore: 91, trend: "rising", factors: ["High Anopheles density", "Rainfall +40%", "Temperature 34°C"], predictedPeak: "In 3–5 days" },
  { zone: "Zone Ouest", riskScore: 87, trend: "rising", factors: ["High Aedes density", "Urban water accumulation", "Temperature 33°C"], predictedPeak: "In 2–4 days" },
  { zone: "Zone Nord", riskScore: 64, trend: "stable", factors: ["Moderate Anopheles density", "Seasonal pattern"], predictedPeak: "In 7–10 days" },
  { zone: "Zone Centre", riskScore: 31, trend: "falling", factors: ["Low catch counts", "Dry conditions"], predictedPeak: "No imminent risk" },
];

// Weekly trend for predictions chart
export const weeklyTrendData = [
  { day: "Mon", "Zone Sud": 41, "Zone Ouest": 38, "Zone Nord": 29, "Zone Centre": 18 },
  { day: "Tue", "Zone Sud": 53, "Zone Ouest": 44, "Zone Nord": 31, "Zone Centre": 16 },
  { day: "Wed", "Zone Sud": 61, "Zone Ouest": 52, "Zone Nord": 35, "Zone Centre": 19 },
  { day: "Thu", "Zone Sud": 74, "Zone Ouest": 63, "Zone Nord": 41, "Zone Centre": 21 },
  { day: "Fri", "Zone Sud": 82, "Zone Ouest": 71, "Zone Nord": 52, "Zone Centre": 24 },
  { day: "Sat", "Zone Sud": 88, "Zone Ouest": 79, "Zone Nord": 58, "Zone Centre": 28 },
  { day: "Sun", "Zone Sud": 91, "Zone Ouest": 87, "Zone Nord": 64, "Zone Centre": 31 },
];
```

---

## Step 3 — Update Sidebar Navigation

Update `src/scenes/global/Sidebar.jsx` to include these routes:

```
/ .............. Dashboard (overview)
/map ........... Device Map & Heatmap
/activity ...... Vector Activity (renamed from Mosquito Activity)
/devices ....... Field Devices
/alerts ........ Alerts Feed
/predictions ... AI Predictions ⚡ (badge: "Preview")
/temperature ... Environmental Data
/timeline ...... Activity Timeline
```

Add a visual separator between the operational routes (`/`, `/map`, `/activity`, `/devices`, `/alerts`) and the future-vision route (`/predictions`). Label the predictions item with a small teal "Preview" badge.

---

## Step 4 — Update Dashboard Overview (`src/scenes/dashboard/index.jsx`)

Replace the 5 stat cards with 6 new cards using `dashboardStats`:

| Card | Value | Color |
|------|-------|-------|
| Active Devices | 4 / 5 | Green |
| Zones Monitored | 4 | Teal |
| Catches Today | 7,615 | White |
| Active Alerts | 3 | Amber |
| Critical Alerts | 2 | Red |
| Offline Devices | 1 | Amber |

Below the stat cards, keep:
- A stacked bar chart (Recharts) showing catches by species per zone (use `zoneStats`)
- The species breakdown pie chart (keep existing, update data)
- A zone risk summary table with colored risk badges

Remove the temperature/pressure chart from the main dashboard — it has its own page.

---

## Step 5 — Update Map Page (`src/scenes/map/index.jsx`)

Transform the single-pin map into a **multi-device map**:

1. Loop over `deviceRegistry` and render a marker for each device
2. Color each marker based on device status: green = Online, red = Offline, amber = Low battery (< 20%)
3. On marker click, show a popup with: device ID, zone, species caught today (top species + count), battery level, last ping
4. Add a **legend** in the bottom-left corner of the map showing marker colors
5. Add a **zone risk overlay** — color each zone label on the map with its risk level color (use `zoneStats`)

---

## Step 6 — Create Devices Page (`src/scenes/devices/index.jsx`)

New page at `/devices`. Show a data table (MUI Table) with one row per device:

Columns: Device ID | Location | Zone | Status | Battery | Dominant Species | Last Ping | Total Catches Today

- Status column: colored chip (green = Online, red = Offline)
- Battery column: MUI LinearProgress bar + percentage
- Sort by: Status (Offline first), then Battery (lowest first)
- Add a summary row at the top: "4 of 5 devices online"

---

## Step 7 — Create Alerts Page (`src/scenes/alerts/index.jsx`)

New page at `/alerts`. Show a feed of alerts from `alertsData`:

Each alert card shows:
- Severity icon + colored left border (red = critical, amber = warning, blue = info)
- Alert type title
- Zone + Device ID
- Count vs threshold (if applicable): "91 catches — threshold: 70"
- Timestamp (formatted as relative time: "2 hours ago")

Sort by timestamp descending (most recent first). Group by severity: Critical → High → Warning.

Add a filter bar at the top to filter by: All / Critical / Warning / Device Offline.

---

## Step 8 — Create Predictions Page (`src/scenes/predictions/index.jsx`)

New page at `/predictions`. This is a **prototype/mockup** of the future AI prediction layer.

**Important**: Display a prominent banner at the top of the page:

```
⚡ AI-Powered Predictions — Future Vision
This view is a prototype showing what SEN-BEACON will look like once the prediction 
layer integrates hospital records, environmental sensors, and historical case data.
Current data is illustrative.
```

Style the banner with a teal left border and slightly muted background to distinguish it from live data.

Page content:

1. **Risk Score Cards** — one card per zone from `predictionData`:
   - Large risk score number (0–100)
   - Color: 0–30 green, 31–60 amber, 61–80 red, 81–100 deep red
   - Trend arrow (↑ rising, → stable, ↓ falling)
   - Contributing factors listed below
   - Predicted peak text

2. **Weekly Risk Trend Chart** — Recharts LineChart using `weeklyTrendData`:
   - One line per zone
   - Colors: Zone Sud = red, Zone Ouest = amber, Zone Nord = teal, Zone Centre = green
   - Add a horizontal reference line at y=70 labeled "Alert threshold"

3. **Data sources section** — a simple info block explaining what data will feed the model:
   - ✓ Device catches (live — available now)
   - ○ Hospital records 30yr (Phase 2)
   - ○ Environmental sensors — temperature, rainfall (Phase 2)
   - ○ ASC field reports (Phase 2)
   - ○ Citizen symptom reports via Telegram (Phase 2)

   Use checkmarks for available data and circles for future data.

---

## Step 9 — Update Vector Activity Page (`src/scenes/activity/index.jsx`)

Rename from "Mosquito Activity" to "Vector Activity". Add:

1. A **device selector** dropdown at the top (populated from `deviceRegistry`, only online devices)
2. The bar chart updates to show the selected device's activity from `mosquitoActivityByDevice`
3. Show three bars per time slot (one per species: Anopheles, Aedes, Culex) using a grouped bar chart
4. Color: Anopheles = red, Aedes = amber, Culex = teal

---

## Step 10 — Global Theme Update (`src/theme.js`)

Update the MUI theme:

1. Import IBM Plex Mono and IBM Plex Sans from Google Fonts in `public/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

2. Set `typography.fontFamily` to `'IBM Plex Sans', sans-serif`
3. Set monospace font for stat card numbers using `fontFamily: 'IBM Plex Mono, monospace'`
4. Update the primary accent color to `#00C9B1` (teal)
5. Keep dark mode as default

---

## File Checklist

After completing all steps, the project should have these new/modified files:

```
src/
├── components/
│   └── SenBeaconLogo.jsx          ← NEW
├── data/
│   └── mockData.js                ← REPLACED
├── scenes/
│   ├── global/
│   │   └── Sidebar.jsx            ← MODIFIED
│   ├── dashboard/
│   │   └── index.jsx              ← MODIFIED
│   ├── activity/
│   │   └── index.jsx              ← MODIFIED
│   ├── map/
│   │   └── index.jsx              ← MODIFIED
│   ├── devices/
│   │   └── index.jsx              ← NEW
│   ├── alerts/
│   │   └── index.jsx              ← NEW
│   └── predictions/
│       └── index.jsx              ← NEW
├── theme.js                       ← MODIFIED
└── App.js                         ← MODIFIED (add new routes)
public/
└── index.html                     ← MODIFIED (title + Google Fonts)
```

---

## Notes for Claude Code

- All data comes from `mockData.js` — no backend calls
- Do not install new dependencies unless strictly necessary; use what is already in `package.json`
- All new components should use the existing MUI theme system and `useTheme()` / `tokens()` pattern already established in the codebase
- Maintain the existing dark/light toggle behavior
- The predictions page must be clearly labeled as a prototype — never present it as live data
- Test that all routes are reachable from the sidebar before finishing
