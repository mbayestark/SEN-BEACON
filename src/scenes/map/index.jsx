import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, useTheme, Chip, ToggleButton, ToggleButtonGroup,
  FormControl, Select, MenuItem, Slider, Button, Dialog, DialogContent, DialogActions,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { tokens, semantic } from "../../theme";
import Header from "../../components/Header";
import { selectSx, menuPropsSx } from "../../components/selectStyles";
import html2pdf from "html2pdf.js";
import PrintableReport from "../../components/PrintableReport";
import {
  deviceRegistry, zoneStats, mosquitoActivityByDevice,
  serviceHygieneZones, senegalAdmin, alertsData, weeklyTrendData,
} from "../../data/mockData";
import { MapPin, Flame, TriangleAlert, Crosshair, X, FileText } from "lucide-react";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Senegal bounds
const SENEGAL_BOUNDS = [
  [12.0, -18.0],
  [16.7, -11.3],
];

const createColorIcon = (color) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -35],
  });
};

const getMarkerColor = (device) => {
  if (device.status === "Offline") return semantic.status.offline;
  if (device.battery < 20) return semantic.status.warning;
  return semantic.status.online;
};

const getDeviceTopSpecies = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return { species: "N/A", count: 0 };
  let totals = { Anopheles: 0, Aedes: 0, Culex: 0 };
  activity.forEach((entry) => {
    totals.Anopheles += entry.Anopheles;
    totals.Aedes += entry.Aedes;
    totals.Culex += entry.Culex;
  });
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return { species: top[0], count: top[1] };
};

const getDeviceTotalCatches = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return 0;
  return activity.reduce((sum, e) => sum + e.Anopheles + e.Aedes + e.Culex, 0);
};

const riskColor = (level) => {
  switch (level) {
    case "Critical": return semantic.risk.critical;
    case "High": return semantic.risk.high;
    case "Medium": return semantic.risk.medium;
    case "Low": return semantic.risk.low;
    default: return semantic.risk.none;
  }
};

// Haversine distance in km
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Global max for absolute heatmap intensity
const globalMaxCatches = Math.max(
  ...deviceRegistry.map((d) => getDeviceTotalCatches(d.id)),
  1
);

const HeatmapLayer = ({ visible, points }) => {
  const map = useMap();

  useEffect(() => {
    if (!visible || points.length === 0) return;

    const heat = L.heatLayer(points, {
      radius: 60,
      blur: 40,
      maxZoom: 18,
      minOpacity: 0.4,
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, visible, points]);

  return null;
};

const MapClickHandler = ({ active, onSetCenter }) => {
  useMapEvents({
    click(e) {
      if (active) {
        onSetCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

const FitBounds = ({ devices, active }) => {
  const map = useMap();
  useEffect(() => {
    if (!active || devices.length === 0) return;
    const bounds = L.latLngBounds(devices.map((d) => [d.lat, d.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [devices, map, active]);
  return null;
};

const TrapMap = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Layer toggles
  const [layers, setLayers] = useState(["markers", "heatmap", "zones"]);
  const handleLayers = (_, newLayers) => {
    if (newLayers !== null) setLayers(newLayers);
  };
  const showMarkers = layers.includes("markers");
  const showHeatmap = layers.includes("heatmap");
  const showZones = layers.includes("zones");

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [radiusMode, setRadiusMode] = useState(false);
  const [radiusCenter, setRadiusCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [shouldFit, setShouldFit] = useState(false);

  const reportRef = useRef();
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = () => {
    const element = reportRef.current;
    if (!element || downloading) return;
    setDownloading(true);
    const filename = `SEN-BEACON_Zone_Report_${selectedRegion !== "all" ? selectedRegion : "All"}_${new Date().toISOString().slice(0, 10)}.pdf`;
    // Small delay to ensure map tiles are fully rendered before capture
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save()
        .then(() => setDownloading(false))
        .catch(() => setDownloading(false));
    }, 500);
  };

  const departments = selectedRegion !== "all" ? senegalAdmin[selectedRegion] || [] : [];
  const hasActiveFilter = selectedRegion !== "all" || selectedDepartment !== "all" || (radiusMode && radiusCenter);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    let devices = deviceRegistry;
    if (selectedRegion !== "all") devices = devices.filter((d) => d.region === selectedRegion);
    if (selectedDepartment !== "all") devices = devices.filter((d) => d.department === selectedDepartment);
    if (radiusMode && radiusCenter) {
      devices = devices.filter(
        (d) => getDistanceKm(radiusCenter.lat, radiusCenter.lng, d.lat, d.lng) <= radiusKm
      );
    }
    return devices;
  }, [selectedRegion, selectedDepartment, radiusMode, radiusCenter, radiusKm]);

  // Filtered zone stats
  const filteredZoneStats = useMemo(() => {
    let zones = zoneStats;
    if (selectedRegion !== "all") zones = zones.filter((z) => z.region === selectedRegion);
    if (selectedDepartment !== "all") zones = zones.filter((z) => z.department === selectedDepartment);
    return zones;
  }, [selectedRegion, selectedDepartment]);

  // Filtered service d'hygiène zones
  const filteredServiceZones = useMemo(() => {
    let zones = serviceHygieneZones;
    if (selectedRegion !== "all") zones = zones.filter((z) => z.region === selectedRegion);
    if (selectedDepartment !== "all") zones = zones.filter((z) => z.department === selectedDepartment);
    if (radiusMode && radiusCenter) {
      zones = zones.filter(
        (z) => getDistanceKm(radiusCenter.lat, radiusCenter.lng, z.lat, z.lng) <= radiusKm
      );
    }
    return zones;
  }, [selectedRegion, selectedDepartment, radiusMode, radiusCenter, radiusKm]);

  // Heatmap points (normalized against global max for consistent intensity)
  const filteredHeatmapPoints = useMemo(() => {
    return filteredDevices.map((d) => [
      d.lat,
      d.lng,
      getDeviceTotalCatches(d.id) / globalMaxCatches,
    ]);
  }, [filteredDevices]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSelectedDepartment("all");
    setShouldFit(true);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setShouldFit(true);
  };

  const handleClearFilters = () => {
    setSelectedRegion("all");
    setSelectedDepartment("all");
    setRadiusMode(false);
    setRadiusCenter(null);
    setRadiusKm(5);
    setShouldFit(true);
  };

  // Reset fit trigger after render
  useEffect(() => {
    if (shouldFit) {
      const t = setTimeout(() => setShouldFit(false), 500);
      return () => clearTimeout(t);
    }
  }, [shouldFit]);

  return (
    <Box m="20px">
      <Header title="DEVICE MAP" subtitle="Trap locations and zone risk overview" />

      {/* LAYER TOGGLES */}
      <Box mb="12px">
        <ToggleButtonGroup
          value={layers}
          onChange={handleLayers}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: colors.ui.text.tertiary,
              borderColor: colors.ui.border.default,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "13px",
              px: "16px",
              "&.Mui-selected": {
                backgroundColor: colors.ui.text.primary,
                color: colors.ui.bg.page,
                "&:hover": { backgroundColor: colors.ui.text.secondary },
              },
            },
          }}
        >
          <ToggleButton value="markers">
            <MapPin size={16} style={{ marginRight: 4 }} />
            Markers
          </ToggleButton>
          <ToggleButton value="heatmap">
            <Flame size={16} style={{ marginRight: 4 }} />
            Heatmap
          </ToggleButton>
          <ToggleButton value="zones">
            <TriangleAlert size={16} style={{ marginRight: 4 }} />
            Risk Zones
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* FILTER BAR */}
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap="12px"
        mb="12px"
        p="12px 16px"
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
      >
        {/* Region */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={selectedRegion}
            onChange={handleRegionChange}
            sx={{ ...selectSx(colors), height: "36px" }}
            MenuProps={menuPropsSx(colors)}
          >
            <MenuItem value="all">All Regions</MenuItem>
            {Object.keys(senegalAdmin).map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Department */}
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            disabled={selectedRegion === "all"}
            sx={{
              ...selectSx(colors),
              height: "36px",
              opacity: selectedRegion === "all" ? 0.5 : 1,
            }}
            MenuProps={menuPropsSx(colors)}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Divider */}
        <Box width="1px" height="24px" backgroundColor={colors.ui.border.default} />

        {/* Radius toggle */}
        <ToggleButton
          value="radius"
          selected={radiusMode}
          onChange={() => {
            setRadiusMode((prev) => !prev);
            if (radiusMode) setRadiusCenter(null);
          }}
          size="small"
          sx={{
            color: radiusMode ? colors.ui.bg.page : colors.ui.text.tertiary,
            borderColor: radiusMode ? "#4FC3F7" : colors.ui.border.default,
            backgroundColor: radiusMode ? "#4FC3F7" : "transparent",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "13px",
            px: "14px",
            "&:hover": {
              backgroundColor: radiusMode ? "#4FC3F7CC" : colors.ui.bg.hover,
            },
          }}
        >
          <Crosshair size={16} style={{ marginRight: 4 }} />
          Radius
        </ToggleButton>

        {/* Radius controls */}
        {radiusMode && (
          <>
            <Typography fontSize="12px" color={colors.ui.text.secondary} sx={{ whiteSpace: "nowrap" }}>
              {radiusCenter ? `${radiusKm} km` : "Click map to set center"}
            </Typography>
            {radiusCenter && (
              <Box width="120px">
                <Slider
                  value={radiusKm}
                  onChange={(_, v) => setRadiusKm(v)}
                  min={1}
                  max={50}
                  step={1}
                  size="small"
                  sx={{
                    color: "#4FC3F7",
                    "& .MuiSlider-thumb": { width: 14, height: 14 },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Export Zone Report */}
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenPreview}
          disabled={selectedRegion === "all"}
          sx={{
            borderColor: "#00C9B1",
            color: "#00C9B1",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: "11px",
            letterSpacing: "0.05em",
            textTransform: "none",
            "&:hover": { borderColor: "#00C9B1", background: "rgba(0,201,177,0.08)" },
            "&.Mui-disabled": { opacity: 0.3 },
          }}
        >
          <FileText size={14} style={{ marginRight: 4 }} /> Export Zone Report
        </Button>

        {/* Clear all */}
        {hasActiveFilter && (
          <Button
            onClick={handleClearFilters}
            size="small"
            startIcon={<X size={14} />}
            sx={{
              color: colors.ui.text.secondary,
              textTransform: "none",
              fontSize: "12px",
              ml: "auto",
              "&:hover": { color: colors.ui.text.primary },
            }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      {/* Active filter summary */}
      {hasActiveFilter && (
        <Box mb="8px" display="flex" alignItems="center" gap="8px">
          <Typography fontSize="11px" color={colors.ui.text.tertiary}>
            Showing {filteredDevices.length} of {deviceRegistry.length} devices
          </Typography>
          {selectedRegion !== "all" && (
            <Chip label={selectedRegion} size="small" sx={{ height: 20, fontSize: "10px", backgroundColor: colors.ui.bg.elevated, color: colors.ui.text.secondary }} />
          )}
          {selectedDepartment !== "all" && (
            <Chip label={selectedDepartment} size="small" sx={{ height: 20, fontSize: "10px", backgroundColor: colors.ui.bg.elevated, color: colors.ui.text.secondary }} />
          )}
          {radiusMode && radiusCenter && (
            <Chip label={`${radiusKm} km radius`} size="small" sx={{ height: 20, fontSize: "10px", backgroundColor: "#4FC3F720", color: "#4FC3F7" }} />
          )}
        </Box>
      )}

      {/* MAP */}
      <Box
        height={{ xs: "50vh", md: "65vh" }}
        borderRadius="4px"
        overflow="hidden"
        border={`1px solid ${colors.ui.border.default}`}
        position="relative"
      >
        <MapContainer
          center={[14.74, -17.3]}
          zoom={11}
          minZoom={7}
          maxBounds={SENEGAL_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={
              theme.palette.mode === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapClickHandler active={radiusMode} onSetCenter={(c) => { setRadiusCenter(c); setShouldFit(true); }} />
          <FitBounds devices={filteredDevices} active={shouldFit} />
          <HeatmapLayer visible={showHeatmap} points={filteredHeatmapPoints} />

          {/* Radius circle */}
          {radiusMode && radiusCenter && (
            <Circle
              center={[radiusCenter.lat, radiusCenter.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: "#4FC3F7",
                fillColor: "#4FC3F7",
                fillOpacity: 0.06,
                weight: 2,
                dashArray: "6 3",
              }}
            />
          )}

          {/* Service d'Hygiène zone circles */}
          {showZones && filteredServiceZones.map((zone) => (
            <Circle
              key={zone.zone}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: semantic.risk.critical,
                fillColor: semantic.risk.critical,
                fillOpacity: 0.12,
                weight: 2,
                dashArray: "8 4",
              }}
            >
              <Popup>
                <Box sx={{ fontFamily: "'IBM Plex Sans', sans-serif", minWidth: 200 }}>
                  <Typography fontWeight="bold" fontSize="14px" color={semantic.risk.critical}>
                    {zone.zone}
                  </Typography>
                  <Typography fontSize="11px" color="text.secondary" mb={1}>
                    Service d'Hygiène — Identified High-Risk Zone
                  </Typography>
                  <Box fontSize="12px">
                    <div>{zone.description}</div>
                    <div style={{ marginTop: 4 }}><strong>Dominant:</strong> {zone.dominantSpecies}</div>
                    <div><strong>Peak catch:</strong> {zone.peakCatch} / 2h interval</div>
                  </Box>
                </Box>
              </Popup>
            </Circle>
          ))}

          {/* Device markers */}
          {showMarkers && filteredDevices.map((device) => {
            const markerColor = getMarkerColor(device);
            const topSpecies = getDeviceTopSpecies(device.id);
            return (
              <Marker
                key={device.id}
                position={[device.lat, device.lng]}
                icon={createColorIcon(markerColor)}
              >
                <Popup>
                  <Box sx={{ fontFamily: "'IBM Plex Sans', sans-serif", minWidth: 180 }}>
                    <Typography fontWeight="bold" fontSize="14px">{device.id}</Typography>
                    <Typography fontSize="11px" color="text.secondary">{device.name} — {device.zone}</Typography>
                    <Box mt={1} fontSize="12px">
                      <div><strong>Status:</strong> {device.status}</div>
                      <div><strong>Battery:</strong> {device.battery}%</div>
                      <div><strong>Top species:</strong> {topSpecies.species} ({topSpecies.count})</div>
                      <div><strong>Last ping:</strong> {device.lastPing}</div>
                    </Box>
                  </Box>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* DEVICE STATUS LEGEND */}
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
          zIndex={1000}
          backgroundColor={
            theme.palette.mode === "dark"
              ? "rgba(10, 14, 26, 0.92)"
              : "rgba(255, 255, 255, 0.94)"
          }
          p="12px 16px"
          borderRadius="4px"
          border={`1px solid ${colors.ui.border.default}`}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 400,
              color: colors.ui.text.tertiary,
              mb: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Device Status
          </Typography>
          {[
            { color: semantic.status.online, label: "Online", filled: true },
            { color: semantic.status.warning, label: "Low Battery", filled: true },
            { color: semantic.status.offline, label: "Offline", filled: false },
          ].map(({ color, label, filled }) => (
            <Box key={label} display="flex" alignItems="center" gap="8px" mb="3px">
              <Box
                width="10px"
                height="10px"
                borderRadius="50%"
                backgroundColor={filled ? color : "transparent"}
                border={filled ? "none" : `2px solid ${color}`}
              />
              <Typography fontSize="11px" color={colors.ui.text.secondary}>{label}</Typography>
            </Box>
          ))}
        </Box>

      </Box>

      {/* PANELS BELOW MAP */}
      <Box display="flex" gap="16px" mt="16px" flexWrap="wrap">
        {/* ZONE RISK TABLE */}
        <Box
          flex="1"
          minWidth="280px"
          backgroundColor={colors.ui.bg.surface}
          p="16px 20px"
          borderRadius="4px"
          border={`1px solid ${colors.ui.border.default}`}
        >
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 400,
              color: colors.ui.text.tertiary,
              mb: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Zone Risk{hasActiveFilter ? ` (${filteredZoneStats.length})` : ""}
          </Typography>
          {filteredZoneStats.map((z) => (
            <Box key={z.zone} display="flex" alignItems="center" gap="10px" mb="6px">
              <Chip
                label={z.riskLevel}
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "10px",
                  fontWeight: 600,
                  backgroundColor: riskColor(z.riskLevel),
                  color: "#fff",
                  minWidth: "58px",
                }}
              />
              <Box flex="1">
                <Typography fontSize="12px" color={colors.ui.text.primary}>
                  {z.zone}
                  {z.serviceHygiene ? " *" : ""}
                </Typography>
              </Box>
              <Typography
                fontSize="11px"
                fontFamily="'IBM Plex Mono', monospace"
                color={colors.ui.text.secondary}
              >
                {z.totalCatches.toLocaleString()}
              </Typography>
              <Typography fontSize="10px" color={colors.ui.text.tertiary}>
                catches
              </Typography>
            </Box>
          ))}
          {filteredZoneStats.length === 0 && (
            <Typography fontSize="12px" color={colors.ui.text.tertiary}>
              No zones match current filters
            </Typography>
          )}
        </Box>

        {/* SERVICE D'HYGIÈNE PANEL */}
        {filteredServiceZones.length > 0 && (
          <Box
            flex="1"
            minWidth="280px"
            backgroundColor={colors.ui.bg.surface}
            p="16px 20px"
            borderRadius="4px"
            border={`1px solid ${semantic.risk.critical}30`}
          >
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 600,
                color: semantic.risk.critical,
                mb: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Service d'Hygiène — Identified High-Risk Zones
            </Typography>
            <Typography
              sx={{ fontSize: "11px", color: colors.ui.text.tertiary, mb: "14px", lineHeight: 1.5 }}
            >
              Water catchment areas identified by Dakar's Regional Hygiene Brigade as highest-density mosquito zones
            </Typography>
            {filteredServiceZones.map((z) => (
              <Box
                key={z.zone}
                display="flex"
                alignItems="flex-start"
                gap="12px"
                mb="10px"
                p="10px 12px"
                borderRadius="4px"
                backgroundColor={`${semantic.risk.critical}08`}
                border={`1px solid ${semantic.risk.critical}18`}
              >
                <Box
                  width="14px"
                  height="14px"
                  borderRadius="50%"
                  border={`2px dashed ${semantic.risk.critical}`}
                  backgroundColor={`${semantic.risk.critical}20`}
                  flexShrink={0}
                  mt="2px"
                />
                <Box flex="1">
                  <Typography fontSize="13px" fontWeight={600} color={colors.ui.text.primary}>
                    {z.zone}
                  </Typography>
                  <Typography fontSize="11px" color={colors.ui.text.secondary} mt="2px">
                    {z.description}
                  </Typography>
                  <Box display="flex" gap="16px" mt="6px">
                    <Typography fontSize="11px" color={colors.ui.text.tertiary}>
                      <strong style={{ color: colors.ui.text.secondary }}>Dominant:</strong> {z.dominantSpecies}
                    </Typography>
                    <Typography fontSize="11px" color={colors.ui.text.tertiary}>
                      <strong style={{ color: colors.ui.text.secondary }}>Peak:</strong>{" "}
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: semantic.risk.critical }}>
                        {z.peakCatch}
                      </span>{" "}
                      / 2h
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Report preview dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#fff",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogContent sx={{ p: 0, overflow: "auto" }}>
          <PrintableReport
            ref={reportRef}
            zone={selectedRegion !== "all" ? selectedRegion : null}
            devices={deviceRegistry}
            alerts={alertsData}
            zoneStats={zoneStats}
            weeklyTrendData={weeklyTrendData}
            visible={previewOpen}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#fff", borderTop: "1px solid #eee", px: 3, py: 1.5 }}>
          <Button
            onClick={handleClosePreview}
            size="small"
            sx={{ color: "#666", textTransform: "none" }}
          >
            Close
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={downloading}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#00C9B1",
              color: "#fff",
              textTransform: "none",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
              "&:hover": { backgroundColor: "#00B3A0" },
            }}
          >
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrapMap;
