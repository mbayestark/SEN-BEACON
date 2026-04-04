# Health Monitoring Platform API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a session cookie obtained via login.

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin" // or "government"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /api/auth/logout
```

### Get Current User
```http
GET /api/auth/me
Authorization: Required (session cookie)
```

---

## IoT Device Management

### Register IoT Device
```http
POST /api/iot/devices/register
Content-Type: application/json

{
  "device_id": "RPI-001",
  "location": {
    "type": "Point",
    "coordinates": [30.0619, -1.9403]
  },
  "area_name": "Kigali Downtown"
}
```

### Get All Devices
```http
GET /api/iot/devices?status=active&area_name=Kigali
Authorization: Required
```

### Get Device by ID
```http
GET /api/iot/devices/RPI-001
Authorization: Required
```

### Update Device
```http
PUT /api/iot/devices/RPI-001
Authorization: Required
Content-Type: application/json

{
  "status": "maintenance"
}
```

---

## Mosquito Data Ingestion

### Ingest Mosquito Data (Single or Bulk)
```http
POST /api/iot/mosquito-data
Content-Type: application/json

// Single entry
{
  "device_id": "RPI-001",
  "location": {
    "type": "Point",
    "coordinates": [30.0619, -1.9403]
  },
  "mosquito_type": "Anopheles",
  "count": 45,
  "timestamp": "2026-03-28T10:00:00Z",
  "metadata": { "temperature": 25 }
}

// Bulk entries (array)
[
  { "device_id": "RPI-001", "mosquito_type": "Anopheles", "count": 45, ... },
  { "device_id": "RPI-002", "mosquito_type": "Aedes", "count": 30, ... }
]
```

### Query Mosquito Data
```http
GET /api/iot/mosquito-data?device_id=RPI-001&start_date=2026-03-01&limit=100
Authorization: Required
```

### Get Mosquito Statistics
```http
GET /api/iot/mosquito-data/stats?device_id=RPI-001&start_date=2026-03-01
Authorization: Required
```

---

## Healthcare Facilities

### Register Healthcare Facility
```http
POST /api/healthcare/facilities/register
Content-Type: application/json

{
  "facility_id": "HOSP-001",
  "name": "Kigali Central Hospital",
  "type": "hospital",
  "location": {
    "type": "Point",
    "coordinates": [30.0619, -1.9403]
  },
  "total_capacity": 500,
  "contact": "+250788123456",
  "services": ["emergency", "surgery", "maternity"]
}
```

### Get All Facilities
```http
GET /api/healthcare/facilities?type=hospital
Authorization: Required
```

### Get Facility by ID
```http
GET /api/healthcare/facilities/HOSP-001
Authorization: Required
```

---

## Healthcare Data Ingestion

### Ingest Healthcare Data (Single or Bulk)
```http
POST /api/healthcare/data
Content-Type: application/json

// Single entry
{
  "facility_id": "HOSP-001",
  "facility_name": "Kigali Central Hospital",
  "location": {
    "type": "Point",
    "coordinates": [30.0619, -1.9403]
  },
  "area_name": "Kigali Downtown",
  "current_patients": 450,
  "total_capacity": 500,
  "available_beds": 50,
  "disease_breakdown": [
    { "disease": "malaria", "count": 120 },
    { "disease": "covid19", "count": 30 }
  ],
  "timestamp": "2026-03-28T10:00:00Z"
}

// Bulk entries (array)
[...]
```

### Query Healthcare Data
```http
GET /api/healthcare/data?facility_id=HOSP-001&start_date=2026-03-01
Authorization: Required
```

### Get Current Capacity Overview
```http
GET /api/healthcare/data/current?area_name=Kigali
Authorization: Required
```

---

## Hypothesis Management

### Get All Hypotheses
```http
GET /api/hypotheses?status=pending&area_name=Kigali&min_confidence=0.7
Authorization: Required
```

### Get Hypothesis by ID
```http
GET /api/hypotheses/65f1234567890abcdef12345
Authorization: Required
```

### Evaluate Hypothesis
```http
PUT /api/hypotheses/65f1234567890abcdef12345/evaluate
Authorization: Required
Content-Type: application/json

{
  "status": "accepted", // or "refuted"
  "notes": "Data confirms the prediction"
}
```

### Get Hypothesis Statistics
```http
GET /api/hypotheses/stats
Authorization: Required
```

---

## Analytics

### Get Risk Zones
```http
GET /api/analytics/risk-zones?disease_id=malaria&risk_level=high
Authorization: Required
```

### Get Risk Map
```http
GET /api/analytics/risk-map?disease_id=malaria
Authorization: Required
```

### Get Trends
```http
GET /api/analytics/trends?type=mosquito&start_date=2026-03-01&end_date=2026-03-28
Authorization: Required

Types: mosquito, healthcare, weather
```

### Get All Diseases
```http
GET /api/analytics/diseases
Authorization: Required
```

### Get Disease Risk Assessment
```http
GET /api/analytics/diseases/malaria/risk
Authorization: Required
```

### Get Disease Hotspots
```http
GET /api/analytics/diseases/malaria/hotspots?min_risk_level=medium
Authorization: Required
```

### Get Overcrowded Facilities
```http
GET /api/analytics/healthcare/overcrowded?threshold=90
Authorization: Required
```

### Get Underutilized Facilities
```http
GET /api/analytics/healthcare/underutilized?threshold=50
Authorization: Required
```

### Get Resource Allocation Recommendations
```http
GET /api/analytics/healthcare/recommendations
Authorization: Required
```

---

## Public APIs (No Authentication Required)

### Check Risk Level for Location
```http
GET /api/public/risk-check?lat=-1.9403&long=30.0619
GET /api/public/risk-check?area=Kigali Downtown
```

**Response:**
```json
{
  "success": true,
  "data": {
    "risk_level": "high",
    "area": "Kigali Downtown",
    "risks": [
      {
        "disease": "malaria",
        "risk_level": "high",
        "area": "Kigali Downtown"
      }
    ],
    "nearby_facilities": [
      {
        "name": "Kigali Central Hospital",
        "type": "hospital",
        "contact": "+250788123456",
        "coordinates": [30.0619, -1.9403]
      }
    ],
    "safety_tips": [
      "Avoid outdoor activities during peak mosquito hours",
      "Use mosquito repellent and wear protective clothing",
      ...
    ]
  }
}
```

### Find Nearest Healthcare Facilities
```http
GET /api/public/healthcare/nearest?lat=-1.9403&long=30.0619&disease=malaria&limit=5
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "facility_id": "HOSP-001",
      "name": "Kigali Central Hospital",
      "type": "hospital",
      "contact": "+250788123456",
      "coordinates": [30.0619, -1.9403],
      "total_capacity": 500,
      "current_patients": 450,
      "available_beds": 50,
      "last_updated": "2026-03-28T10:00:00Z",
      "services": ["emergency", "surgery", "maternity"]
    }
  ]
}
```

---

## Background Jobs

Automated tasks running on schedule:

1. **Risk Zone Calculation** - Every 30 minutes
   - Analyzes mosquito data, weather patterns, and healthcare load
   - Updates risk zones for all diseases

2. **Healthcare Facility Alerts** - Every 15 minutes
   - Checks for overcrowded facilities (>90% capacity)
   - Logs alerts to console

3. **Data Aggregation** - Every 1 hour
   - Aggregates time-series data
   - Calculates hourly/daily statistics

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (dev mode only)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### Location Format (GeoJSON)
```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

### Disease Breakdown
```json
[
  { "disease": "malaria", "count": 120 },
  { "disease": "covid19", "count": 30 }
]
```

### Risk Factors
```json
[
  { "factor": "mosquito_density", "value": 45, "weight": 0.5 },
  { "factor": "humidity", "value": 75, "weight": 0.3 }
]
```
