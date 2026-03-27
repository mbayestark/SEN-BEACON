import { Box, Typography, useTheme, Chip } from "@mui/material";
import { tokens, semantic } from "../../theme";
import { dashboardStats, zoneStats } from "../../data/mockData";
import Header from "../../components/Header";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const StatCard = ({ title, value, icon, iconColor, tint, borderColor }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      backgroundColor={tint || colors.ui.bg.surface}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p="20px"
      borderRadius="4px"
      border={`1px solid ${colors.ui.border.default}`}
      borderLeft={borderColor ? `3px solid ${borderColor}` : `1px solid ${colors.ui.border.default}`}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "28px",
            fontWeight: 600,
            color: colors.ui.text.primary,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            color: colors.ui.text.secondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mt: "6px",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box color={iconColor} fontSize="32px" sx={{ opacity: 0.7 }}>
        {icon}
      </Box>
    </Box>
  );
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

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const speciesData = [
    { name: "Anopheles", value: 45, color: semantic.species.anopheles },
    { name: "Aedes aegypti", value: 30, color: semantic.species.aedes },
    { name: "Culex", value: 25, color: semantic.species.culex },
  ];

  const zoneCatchData = zoneStats.map((z) => ({
    zone: z.zone.replace("Zone ", ""),
    Anopheles: Math.round(z.totalCatches * 0.45),
    Aedes: Math.round(z.totalCatches * 0.3),
    Culex: Math.round(z.totalCatches * 0.25),
  }));

  const offlineCount = dashboardStats.totalDevices - dashboardStats.activeDevices;

  return (
    <Box m="20px">
      <Header title="DASHBOARD" subtitle="SEN-BEACON Health Intelligence Overview" />

      {/* STAT CARDS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(6, 1fr)"
        gap="16px"
        mb="20px"
      >
        <StatCard
          title="Active Devices"
          value={`${dashboardStats.activeDevices} / ${dashboardStats.totalDevices}`}
          icon={<DevicesOutlinedIcon fontSize="inherit" />}
          iconColor={semantic.status.online}
        />
        <StatCard
          title="Zones Monitored"
          value={dashboardStats.zonesMonitored}
          icon={<PublicOutlinedIcon fontSize="inherit" />}
          iconColor={colors.ui.text.secondary}
        />
        <StatCard
          title="Catches Today"
          value={dashboardStats.totalCatchesToday.toLocaleString()}
          icon={<BugReportOutlinedIcon fontSize="inherit" />}
          iconColor={colors.ui.text.secondary}
        />
        <StatCard
          title="Active Alerts"
          value={dashboardStats.activeAlerts}
          icon={<NotificationsActiveOutlinedIcon fontSize="inherit" />}
          iconColor={semantic.status.warning}
        />
        <StatCard
          title="Critical Alerts"
          value={dashboardStats.criticalAlerts}
          icon={<ErrorOutlineOutlinedIcon fontSize="inherit" />}
          iconColor={semantic.status.critical}
          tint={dashboardStats.criticalAlerts > 0 ? "rgba(244, 67, 54, 0.08)" : undefined}
          borderColor={dashboardStats.criticalAlerts > 0 ? semantic.status.critical : undefined}
        />
        <StatCard
          title="Offline Devices"
          value={offlineCount}
          icon={<WifiOffOutlinedIcon fontSize="inherit" />}
          iconColor={semantic.status.warning}
          tint={offlineCount > 0 ? "rgba(245, 166, 35, 0.08)" : undefined}
          borderColor={offlineCount > 0 ? semantic.status.warning : undefined}
        />
      </Box>

      {/* CHARTS ROW */}
      <Box
        display="grid"
        gridTemplateColumns="2fr 1fr"
        gap="16px"
        mb="20px"
      >
        {/* STACKED BAR CHART */}
        <Box
          backgroundColor={colors.ui.bg.surface}
          p="20px"
          borderRadius="4px"
          border={`1px solid ${colors.ui.border.default}`}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 400,
              color: colors.ui.text.secondary,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: "15px",
            }}
          >
            Catches by Species per Zone
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zoneCatchData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.ui.border.default} />
              <XAxis dataKey="zone" stroke={colors.ui.text.tertiary} tick={{ fontSize: 11 }} />
              <YAxis stroke={colors.ui.text.tertiary} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.ui.bg.elevated,
                  border: `1px solid ${colors.ui.border.default}`,
                  color: colors.ui.text.primary,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: colors.ui.text.secondary }} />
              <Bar dataKey="Anopheles" stackId="a" fill={semantic.species.anopheles} />
              <Bar dataKey="Aedes" stackId="a" fill={semantic.species.aedes} />
              <Bar dataKey="Culex" stackId="a" fill={semantic.species.culex} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* SPECIES PIE CHART */}
        <Box
          backgroundColor={colors.ui.bg.surface}
          p="20px"
          borderRadius="4px"
          border={`1px solid ${colors.ui.border.default}`}
        >
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 400,
              color: colors.ui.text.secondary,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: "15px",
            }}
          >
            Species Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {speciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: colors.ui.text.secondary }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* ZONE RISK TABLE */}
      <Box
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
        overflow="hidden"
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            color: colors.ui.text.secondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            p: "20px",
            pb: "10px",
          }}
        >
          Zone Risk Summary
        </Typography>
        <Box component="table" width="100%" sx={{ borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr" sx={{ borderBottom: `1px solid ${colors.ui.border.default}` }}>
              {["Zone", "Total Catches", "Dominant Species", "Risk Level", "Devices"].map((h) => (
                <Box
                  component="th"
                  key={h}
                  sx={{
                    p: "12px 20px",
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
            {zoneStats.map((zone) => (
              <Box
                component="tr"
                key={zone.zone}
                sx={{
                  borderBottom: `1px solid ${colors.ui.border.subtle}`,
                  "&:hover": { backgroundColor: colors.ui.bg.hover },
                }}
              >
                <Box component="td" sx={{ p: "12px 20px", color: colors.ui.text.primary, fontWeight: 500, fontSize: "13px" }}>
                  {zone.zone}
                </Box>
                <Box
                  component="td"
                  sx={{
                    p: "12px 20px",
                    color: colors.ui.text.primary,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {zone.totalCatches.toLocaleString()}
                </Box>
                <Box component="td" sx={{ p: "12px 20px", color: colors.ui.text.secondary, fontSize: "13px" }}>
                  {zone.dominantSpecies}
                </Box>
                <Box component="td" sx={{ p: "12px 20px" }}>
                  <Chip
                    label={zone.riskLevel}
                    size="small"
                    sx={{
                      backgroundColor: riskColor(zone.riskLevel),
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "10px",
                    }}
                  />
                </Box>
                <Box
                  component="td"
                  sx={{
                    p: "12px 20px",
                    color: colors.ui.text.primary,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "13px",
                  }}
                >
                  {zone.devicesOnline} / {zone.devicesTotal}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
