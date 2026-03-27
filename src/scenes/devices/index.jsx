import { Box, Typography, useTheme, LinearProgress } from "@mui/material";
import { tokens, semantic } from "../../theme";
import Header from "../../components/Header";
import { deviceRegistry, mosquitoActivityByDevice } from "../../data/mockData";

const getDominantSpecies = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return "N/A";
  let totals = { Anopheles: 0, Aedes: 0, Culex: 0 };
  activity.forEach((entry) => {
    totals.Anopheles += entry.Anopheles;
    totals.Aedes += entry.Aedes;
    totals.Culex += entry.Culex;
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
};

const getTotalCatches = (deviceId) => {
  const activity = mosquitoActivityByDevice[deviceId];
  if (!activity) return 0;
  return activity.reduce((sum, entry) => sum + entry.Anopheles + entry.Aedes + entry.Culex, 0);
};

const sortedDevices = [...deviceRegistry].sort((a, b) => {
  if (a.status === "Offline" && b.status !== "Offline") return -1;
  if (a.status !== "Offline" && b.status === "Offline") return 1;
  return a.battery - b.battery;
});

const onlineCount = deviceRegistry.filter((d) => d.status === "Online").length;

const columns = ["Device ID", "Location", "Zone", "Status", "Battery", "Dominant Species", "Last Ping", "Catches Today"];

const StatusDot = ({ status, battery }) => {
  if (status === "Offline") {
    // Hollow gray circle for offline
    return (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Box
          sx={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            border: `2px solid ${semantic.status.offline}`,
            backgroundColor: "transparent",
          }}
        />
        <Typography fontSize="12px" color={semantic.status.offline}>{status}</Typography>
      </Box>
    );
  }
  // Filled dot for online/warning
  const dotColor = battery < 20 ? semantic.status.warning : semantic.status.online;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Box
        sx={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: dotColor,
        }}
      />
      <Typography fontSize="12px" color={dotColor}>{status}</Typography>
    </Box>
  );
};

const Devices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="FIELD DEVICES" subtitle="Device fleet status and diagnostics" />

      <Box
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
        overflow="hidden"
      >
        {/* SUMMARY */}
        <Box p="16px 20px" borderBottom={`1px solid ${colors.ui.border.default}`}>
          <Typography variant="h5" color={colors.ui.text.secondary}>
            <Box
              component="span"
              sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: semantic.status.online }}
            >
              {onlineCount}
            </Box>
            {" "}of{" "}
            <Box
              component="span"
              sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: colors.ui.text.primary }}
            >
              {deviceRegistry.length}
            </Box>
            {" "}devices online
          </Typography>
        </Box>

        {/* TABLE */}
        <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr" sx={{ borderBottom: `1px solid ${colors.ui.border.default}` }}>
              {columns.map((h) => (
                <Box
                  component="th"
                  key={h}
                  sx={{
                    p: "12px 16px",
                    textAlign: "left",
                    color: colors.ui.text.tertiary,
                    fontSize: "11px",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {sortedDevices.map((device) => (
              <Box
                component="tr"
                key={device.id}
                sx={{
                  borderBottom: `1px solid ${colors.ui.border.subtle}`,
                  "&:hover": { backgroundColor: colors.ui.bg.hover },
                }}
              >
                <Box
                  component="td"
                  sx={{
                    p: "12px 16px",
                    color: colors.ui.text.primary,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  {device.id}
                </Box>
                <Box component="td" sx={{ p: "12px 16px", color: colors.ui.text.primary, fontSize: "13px" }}>
                  {device.location}
                </Box>
                <Box component="td" sx={{ p: "12px 16px", color: colors.ui.text.secondary, fontSize: "13px" }}>
                  {device.zone}
                </Box>
                <Box component="td" sx={{ p: "12px 16px" }}>
                  <StatusDot status={device.status} battery={device.battery} />
                </Box>
                <Box component="td" sx={{ p: "12px 16px", minWidth: 130 }}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <LinearProgress
                      variant="determinate"
                      value={device.battery}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.ui.border.default,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            device.battery < 20 ? semantic.status.critical :
                            device.battery < 50 ? semantic.status.warning : semantic.status.online,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.ui.text.primary,
                        minWidth: "30px",
                      }}
                    >
                      {device.battery}%
                    </Typography>
                  </Box>
                </Box>
                <Box component="td" sx={{ p: "12px 16px", color: colors.ui.text.secondary, fontSize: "13px" }}>
                  {getDominantSpecies(device.id)}
                </Box>
                <Box component="td" sx={{ p: "12px 16px", color: colors.ui.text.tertiary, fontSize: "11px" }}>
                  {device.lastPing}
                </Box>
                <Box
                  component="td"
                  sx={{
                    p: "12px 16px",
                    color: colors.ui.text.primary,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {getTotalCatches(device.id).toLocaleString()}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Devices;
