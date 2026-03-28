import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mosquitoActivityByDevice } from "../data/mockData";

const FitToDevices = ({ devices }) => {
  const map = useMap();
  React.useEffect(() => {
    if (devices.length === 0) return;
    const bounds = L.latLngBounds(devices.map(d => [d.lat, d.lng]));
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }, [map, devices]);
  return null;
};

const speciesColors = {
  Anopheles: "#F44336",
  "Aedes aegypti": "#F5A623",
  Culex: "#42A5F5",
};

const recommendedActions = {
  "High Anopheles activity": "Deploy indoor residual spraying. Notify district health officer.",
  "High Aedes aegypti activity": "Eliminate standing water sources in zone. Issue dengue prevention advisory.",
  "Device offline": "Send field technician to inspect device. Check power supply and connectivity.",
  "Low battery": "Schedule battery replacement within 24 hours.",
  "High Culex activity": "Inspect drainage systems and sewage infrastructure. Apply larvicide treatment.",
};

const getDeviceTotalCatches = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return 0;
  return activity.reduce((sum, e) => sum + e.Anopheles + e.Aedes + e.Culex, 0);
};

const getDeviceDominantSpecies = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return "Anopheles";
  const totals = { Anopheles: 0, "Aedes aegypti": 0, Culex: 0 };
  activity.forEach((e) => {
    totals.Anopheles += e.Anopheles;
    totals["Aedes aegypti"] += e.Aedes;
    totals.Culex += e.Culex;
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
};

const riskColor = (level) => {
  const map = {
    Critical: "#F44336", critical: "#F44336",
    High: "#FF6B35", high: "#FF6B35",
    Medium: "#F5A623", medium: "#F5A623", warning: "#F5A623",
    Low: "#4CAF50", low: "#4CAF50",
  };
  return map[level] ?? "#8899AA";
};

const PrintableReport = React.forwardRef(({ zone, devices, alerts, zoneStats, weeklyTrendData, visible }, ref) => {
  const [mapReady, setMapReady] = React.useState(false);

  // Only mount the Leaflet map after the dialog is visible and DOM has settled
  React.useEffect(() => {
    if (!visible) {
      setMapReady(false);
      return;
    }
    const t = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(t);
  }, [visible]);
  if (!zone) return null;

  // Determine if this is a region-level or zone-level report
  const isRegion = !zoneStats.some(z => z.zone === zone);
  const matchingZoneStats = isRegion
    ? zoneStats.filter(z => z.region === zone)
    : zoneStats.filter(z => z.zone === zone);

  // For region reports, pick the highest-risk zone stat for the summary badge
  const zoneStat = isRegion
    ? matchingZoneStats.length > 0
      ? matchingZoneStats.reduce((worst, z) => {
          const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return (order[z.riskLevel] ?? 9) < (order[worst.riskLevel] ?? 9) ? z : worst;
        })
      : null
    : matchingZoneStats[0] || null;

  const totalCatches = matchingZoneStats.reduce((sum, z) => sum + z.totalCatches, 0);

  const zoneNames = new Set(matchingZoneStats.map(z => z.zone));
  const zoneDevices = isRegion
    ? devices.filter(d => d.region === zone)
    : devices.filter(d => d.zone === zone);
  const zoneAlerts = isRegion
    ? alerts.filter(a => zoneNames.has(a.zone))
    : alerts.filter(a => a.zone === zone);
  const generatedAt = new Date().toLocaleString();

  return (
    <Box ref={ref} sx={{
      padding: "40px",
      fontFamily: "IBM Plex Sans, sans-serif",
      color: "#111",
      background: "#fff",
      maxWidth: "800px",
      margin: "0 auto",
      "@media print": { padding: "20px" },
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>
            <span style={{ color: "#111" }}>SEN-</span>
            <span style={{ color: "#00C9B1" }}>BEACON</span>
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
            {isRegion ? "Region" : "Zone"} Health Report
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>{zone}</Typography>
          <Typography sx={{ fontSize: "12px", color: "#888", fontFamily: "IBM Plex Mono, monospace" }}>
            Generated: {generatedAt}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#888" }}>Period: Last 24 hours</Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: "24px" }} />

      {/* Section 1 — Situation */}
      <Typography sx={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#888" }}>
        01 — Situation Summary
      </Typography>
      <Box sx={{
        borderLeft: `3px solid ${riskColor(zoneStat?.riskLevel)}`,
        paddingLeft: "16px",
        marginBottom: "24px",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "6px" }}>
          <Box sx={{ background: riskColor(zoneStat?.riskLevel), color: "#fff", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "3px" }}>
            {zoneStat?.riskLevel?.toUpperCase() ?? "UNKNOWN"}
          </Box>
          <Typography sx={{ fontSize: "13px", color: "#444" }}>
            {zoneAlerts.length} active alert{zoneAlerts.length !== 1 ? "s" : ""} in this zone
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "14px", color: "#222" }}>
          Total catches today: <strong>{totalCatches > 0 ? totalCatches.toLocaleString() : "—"}</strong>
        </Typography>
      </Box>

      {/* Section 2 — Activity Heatmap */}
      {zoneDevices.length > 0 && (() => {
        const maxCatches = Math.max(...zoneDevices.map(d => getDeviceTotalCatches(d.id)), 1);
        const centerLat = zoneDevices.reduce((s, d) => s + d.lat, 0) / zoneDevices.length;
        const centerLng = zoneDevices.reduce((s, d) => s + d.lng, 0) / zoneDevices.length;
        return (
          <>
            <Typography sx={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#888" }}>
              02 — Activity Heatmap
            </Typography>
            <Box sx={{
              height: "320px",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid #eee",
              marginBottom: "16px",
              background: "#f8f8f8",
            }}>
              {mapReady && (
                <MapContainer
                  center={[centerLat, centerLng]}
                  zoom={11}
                  zoomControl={false}
                  attributionControl={false}
                  preferCanvas={true}
                  style={{ height: "100%", width: "100%", background: "#f8f8f8" }}
                >
                  <FitToDevices devices={zoneDevices} />
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  {zoneDevices.map(device => {
                    const catches = getDeviceTotalCatches(device.id);
                    const intensity = catches / maxCatches;
                    const dominant = getDeviceDominantSpecies(device.id);
                    const color = speciesColors[dominant] || "#8899AA";
                    return (
                      <CircleMarker
                        key={device.id}
                        center={[device.lat, device.lng]}
                        radius={8 + intensity * 22}
                        pathOptions={{
                          color: color,
                          fillColor: color,
                          fillOpacity: 0.25 + intensity * 0.35,
                          weight: 1.5,
                        }}
                      />
                    );
                  })}
                </MapContainer>
              )}
            </Box>
            {/* Heatmap legend */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, marginBottom: "24px" }}>
              {Object.entries(speciesColors).map(([species, color]) => (
                <Box key={species} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color, opacity: 0.7 }} />
                  <Typography sx={{ fontSize: "10px", color: "#888" }}>{species}</Typography>
                </Box>
              ))}
              <Typography sx={{ fontSize: "10px", color: "#aaa", marginLeft: "auto" }}>
                Circle size = relative catch volume
              </Typography>
            </Box>
          </>
        );
      })()}

      {/* Section 3 — Species Breakdown */}
      <Typography sx={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#888" }}>
        03 — Species Breakdown
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {["Anopheles", "Aedes aegypti", "Culex"].map(species => (
          <Box key={species} sx={{
            border: "1px solid #eee",
            borderTop: `3px solid ${speciesColors[species]}`,
            borderRadius: "6px",
            padding: "12px",
          }}>
            <Typography sx={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{species}</Typography>
            <Typography sx={{ fontSize: "20px", fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>
              —
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#aaa" }}>catches today</Typography>
          </Box>
        ))}
      </Box>

      {/* Section 3 — Devices in Zone */}
      <Typography sx={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#888" }}>
        04 — Field Devices ({zoneDevices.length})
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <Box component="thead">
          <Box component="tr" sx={{ borderBottom: "1px solid #eee" }}>
            {["Device ID", "Location", "Status", "Battery", "Last Ping"].map(h => (
              <Box component="th" key={h} sx={{ textAlign: "left", padding: "6px 8px", color: "#888", fontSize: "11px", fontWeight: 500 }}>{h}</Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          {zoneDevices.map(d => (
            <Box component="tr" key={d.id} sx={{ borderBottom: "0.5px solid #f0f0f0" }}>
              <Box component="td" sx={{ padding: "6px 8px", fontFamily: "IBM Plex Mono, monospace", fontSize: "12px" }}>{d.id}</Box>
              <Box component="td" sx={{ padding: "6px 8px" }}>{d.name}</Box>
              <Box component="td" sx={{ padding: "6px 8px" }}>
                <span style={{ color: d.status === "Online" ? "#4CAF50" : "#9E9E9E" }}>
                  {d.status === "Online" ? "●" : "○"} {d.status}
                </span>
              </Box>
              <Box component="td" sx={{ padding: "6px 8px" }}>{d.battery}%</Box>
              <Box component="td" sx={{ padding: "6px 8px", color: "#888" }}>{d.lastPing}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Section 4 — Active Alerts + Recommended Actions */}
      {zoneAlerts.length > 0 && (
        <>
          <Typography sx={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", color: "#888" }}>
            05 — Active Alerts & Recommended Actions
          </Typography>
          {zoneAlerts.map(alert => (
            <Box key={alert.id} sx={{
              borderLeft: `3px solid ${riskColor(alert.severity)}`,
              paddingLeft: "12px",
              marginBottom: "14px",
            }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>{alert.type}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#888", marginBottom: "4px", fontFamily: "IBM Plex Mono, monospace" }}>
                {alert.device} · {new Date(alert.timestamp).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#444", fontStyle: "italic" }}>
                → {recommendedActions[alert.type] ?? "Investigate and report to district health officer."}
              </Typography>
            </Box>
          ))}
          <Box sx={{ marginBottom: "24px" }} />
        </>
      )}

      {/* Footer */}
      <Divider sx={{ marginBottom: "16px" }} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "11px", color: "#bbb", fontFamily: "IBM Plex Mono, monospace" }}>
          SEN-BEACON Health Intelligence Platform
        </Typography>
        <Typography sx={{ fontSize: "11px", color: "#bbb", fontStyle: "italic" }}>
          Data is illustrative — MVP prototype. Not for clinical use.
        </Typography>
      </Box>
    </Box>
  );
});

PrintableReport.displayName = "PrintableReport";
export default PrintableReport;
