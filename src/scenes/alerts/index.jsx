import { useState } from "react";
import { Box, Typography, useTheme, Chip, Button } from "@mui/material";
import { tokens, semantic } from "../../theme";
import Header from "../../components/Header";
import { alertsData } from "../../data/mockData";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const severityConfig = {
  critical: {
    color: semantic.status.critical,
    bg: "rgba(244, 67, 54, 0.06)",
    icon: <ErrorOutlineIcon />,
    label: "Critical",
  },
  high: {
    color: semantic.risk.high,
    bg: "rgba(255, 107, 53, 0.06)",
    icon: <WarningAmberIcon />,
    label: "High",
  },
  warning: {
    color: semantic.status.warning,
    bg: "rgba(245, 166, 35, 0.06)",
    icon: <WarningAmberIcon />,
    label: "Warning",
  },
  info: {
    color: "#42A5F5",
    bg: "rgba(66, 165, 245, 0.06)",
    icon: <InfoOutlinedIcon />,
    label: "Info",
  },
};

const severityOrder = { critical: 0, high: 1, warning: 2, info: 3 };

const formatRelativeTime = (timestamp) => {
  const now = new Date("2026-03-27T22:00:00Z");
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  return `${Math.round(diffHrs / 24)} day${Math.round(diffHrs / 24) > 1 ? "s" : ""} ago`;
};

const filters = ["All", "Critical", "Warning", "Device Offline"];

const Alerts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeFilter, setActiveFilter] = useState("All");

  const sorted = [...alertsData].sort(
    (a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9)
  );

  const filtered = sorted.filter((alert) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Critical") return alert.severity === "critical";
    if (activeFilter === "Warning") return alert.severity === "warning";
    if (activeFilter === "Device Offline") return alert.type === "Device offline";
    return true;
  });

  return (
    <Box m="20px">
      <Header title="ALERTS" subtitle="Active alerts and notifications" />

      {/* FILTER BAR */}
      <Box display="flex" gap="8px" mb="20px">
        {filters.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? "contained" : "outlined"}
            size="small"
            onClick={() => setActiveFilter(f)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderColor: colors.ui.border.default,
              color: activeFilter === f ? "#0A0E1A" : colors.ui.text.secondary,
              backgroundColor: activeFilter === f ? colors.ui.text.primary : "transparent",
              "&:hover": {
                backgroundColor: activeFilter === f ? colors.ui.text.secondary : colors.ui.bg.hover,
                borderColor: colors.ui.border.default,
              },
            }}
          >
            {f}
          </Button>
        ))}
      </Box>

      {/* ALERT FEED */}
      <Box display="flex" flexDirection="column" gap="12px">
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <Box
              key={alert.id}
              backgroundColor={config.bg}
              borderRadius="4px"
              border={`1px solid ${colors.ui.border.default}`}
              borderLeft={`3px solid ${config.color}`}
              p="16px 20px"
              display="flex"
              alignItems="flex-start"
              gap="16px"
            >
              <Box color={config.color} mt="2px">
                {config.icon}
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap="10px" mb="4px">
                  <Typography fontWeight="600" fontSize="14px" color={colors.ui.text.primary}>
                    {alert.type}
                  </Typography>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{
                      height: "18px",
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: config.color,
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: colors.ui.text.tertiary,
                    mb: "4px",
                  }}
                >
                  {alert.zone} — {alert.device}
                </Typography>
                {alert.count !== null && (
                  <Typography
                    sx={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: colors.ui.text.primary,
                    }}
                  >
                    {alert.count} catches — threshold: {alert.threshold}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  color: colors.ui.text.tertiary,
                  whiteSpace: "nowrap",
                }}
              >
                {formatRelativeTime(alert.timestamp)}
              </Typography>
            </Box>
          );
        })}

        {filtered.length === 0 && (
          <Box textAlign="center" p="40px">
            <Typography color={colors.ui.text.tertiary}>No alerts match this filter.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Alerts;
