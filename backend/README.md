# Disease Surveillance API - Senegal

Vector-enabled disease surveillance system tracking mosquito populations, healthcare data, and risk zones across Senegal.

## Features

- **IoT Mosquito Monitoring** - Real-time data from traps tracking Anopheles gambiae, A. funestus, Culex, and Aedes
- **Vector Embeddings** - MongoDB Atlas vector search for AI-powered semantic queries
- **Healthcare Integration** - Facility capacity, patient data, and disease breakdown tracking
- **Risk Zone Calculation** - Automated risk assessment with scheduled background jobs
- **Multi-Region Coverage** - Dakar, Ziguinchor, Kolda, Tambacounda, Kédougou, Saint-Louis

## Quick Start

```bash
# Development
docker compose up -d
npm run seed

# Production
docker compose -f docker-compose.prod.yml up -d
```

## API Endpoints

- `GET /api/public/diseases` - Disease catalog
- `GET /api/public/risk-zones` - Risk zone data by location
- `GET /api/public/health-alerts` - Active health alerts
- `POST /api/iot/mosquito-data` - Ingest mosquito trap data (breakdown format)
- `GET /api/iot/mosquito-stats` - Aggregated mosquito statistics

## Data Models

**MosquitoData** - `mosquito_breakdown[]` with counts per species, `total_count`, location, timestamp
**HealthcareData** - Facility capacity, `disease_breakdown[]`, patient counts
**RiskZone** - Area-based risk levels with weighted factors
**Hypothesis** - AI-generated insights with confidence scores

## Technology

TypeScript, Express, MongoDB, Mongoose, Vector Search, Docker
