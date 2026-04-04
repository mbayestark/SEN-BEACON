import { Box, Typography, useTheme, Chip } from "@mui/material";
import { tokens, semantic } from "../../theme";
import { dashboardStats, zoneStats, alertsData, deviceRegistry, weeklyTrendData } from "../../data/mockData";
import Header from "../../components/Header";
import { Cpu, Map, Bug, AlertCircle, CircleAlert, WifiOff } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";

const zoneSparklineColors = {
  "Technopôle-Pikine": "#F44336",
  "Grand-Yoff": "#F5A623",
  "Nord-Foire": "#42A5F5",
  "Pikine-Guédiawaye": "#4CAF50",
  "Lac Rose": "#F44336",
  "Parcelles Assainies": "#F5A623",
  "Plateau": "#42A5F5",
  "Rufisque": "#4CAF50",
  "Richard-Toll": "#F44336",
  "Saint-Louis Ville": "#42A5F5",
  "Linguère": "#F5A623",
  "Louga Ville": "#4CAF50",
};

const Sparkline = ({ zone }) => {
  const color = zoneSparklineColors[zone] || "#8899AA";
  const data = weeklyTrendData.map(d => ({ value: d[zone] ?? 0 }));
  const last = data[data.length - 1]?.value ?? 0;
  const prev = data[data.length - 2]?.value ?? 0;
  const isRising = last > prev;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <LineChart width={100} height={36} data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
      <Typography sx={{
        fontSize: "12px",
        fontFamily: "IBM Plex Mono, monospace",
        color: isRising ? "#F44336" : "#4CAF50",
        lineHeight: 1,
      }}>
        {isRising ? "↑" : "↓"}
      </Typography>
    </Box>
  );
};

const StatCard = ({ title, value, icon, iconColor, tint, borderColor, subtitle }) => {
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
        {subtitle && (
          <Typography sx={{
            fontSize: "11px",
            fontFamily: "'IBM Plex Mono', monospace",
            mt: "4px",
            color: colors.ui.text.tertiary,
          }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box color={iconColor} sx={{ opacity: 0.7 }}>
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

  const criticalAlerts = alertsData.filter(a => a.severity === "critical");
  const highestRiskZone = [...zoneStats].sort((a, b) => b.totalCatches - a.totalCatches)[0];
  const offlineDevices = deviceRegistry.filter(d => d.status === "Offline");

  let summary = "";
  if (criticalAlerts.length > 0) {
    const zones = [...new Set(criticalAlerts.map(a => a.zone))].join(" and ");
    summary = `${criticalAlerts.length} critical alert${criticalAlerts.length > 1 ? "s" : ""} active in ${zones}. `;
  }
  summary += `Highest vector activity in ${highestRiskZone.zone} (${highestRiskZone.totalCatches.toLocaleString()} catches). `;
  if (offlineDevices.length > 0) {
    summary += ` ${offlineDevices.length} device${offlineDevices.length > 1 ? "s" : ""} offline.`;
  }

  const bannerColor = criticalAlerts.length > 0 ? "#F44336"
    : offlineDevices.length > 0 ? "#F5A623"
    : "#4CAF50";
  const bannerBg = criticalAlerts.length > 0 ? "rgba(244, 67, 54, 0.08)"
    : offlineDevices.length > 0 ? "rgba(245, 166, 35, 0.08)"
    : "rgba(76, 175, 80, 0.08)";

  return (
    <Box m="20px">
      <Header title="DASHBOARD" subtitle="SEN-BEACON Health Intelligence Overview" />

      {/* SITUATION SUMMARY BANNER */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: bannerBg,
        borderLeft: `3px solid ${bannerColor}`,
        borderRadius: "4px",
        padding: "12px 20px",
        marginBottom: "20px",
        gap: 2,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          {criticalAlerts.length > 0
            ? <CircleAlert size={14} color="#F44336" />
            : offlineDevices.length > 0
              ? <AlertCircle size={14} color="#F5A623" />
              : <AlertCircle size={14} color="#4CAF50" />
          }
          <Typography sx={{
            fontSize: "11px",
            color: "text.secondary",
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Situation — {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Box>
        <Typography sx={{
          fontSize: "14px",
          color: "text.primary",
          fontFamily: "IBM Plex Sans, sans-serif",
          lineHeight: 1.5,
        }}>
          {summary}
        </Typography>
      </Box>

      {/* STAT CARDS */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }}
        gap="16px"
        mb="20px"
      >
        <StatCard
          title="Active Devices"
          value={`${dashboardStats.activeDevices} / ${dashboardStats.totalDevices}`}
          icon={<Cpu size={32} />}
          iconColor={semantic.status.online}
        />
        <StatCard
          title="Zones Monitored"
          value={dashboardStats.zonesMonitored}
          icon={<Map size={32} />}
          iconColor={colors.ui.text.secondary}
        />
        <StatCard
          title="Catches Today"
          value={dashboardStats.totalCatchesToday.toLocaleString()}
          icon={<Bug size={32} />}
          iconColor={colors.ui.text.secondary}
        />
        {/* Combined Alerts card */}
        <StatCard
          title="Alerts"
          value={dashboardStats.activeAlerts}
          icon={<AlertCircle size={32} />}
          iconColor={dashboardStats.criticalAlerts > 0 ? semantic.status.critical : semantic.status.warning}
          tint={dashboardStats.criticalAlerts > 0 ? "rgba(244, 67, 54, 0.08)" : undefined}
          borderColor={dashboardStats.criticalAlerts > 0 ? semantic.status.critical : undefined}
          subtitle={<>
            <span style={{ color: semantic.status.critical }}>{dashboardStats.criticalAlerts} critical</span>
            {" · "}
            <span style={{ color: semantic.status.warning }}>{dashboardStats.activeAlerts - dashboardStats.criticalAlerts} warning</span>
          </>}
        />
        <StatCard
          title="Offline Devices"
          value={offlineCount}
          icon={<WifiOff size={32} />}
          iconColor={semantic.status.warning}
          tint={offlineCount > 0 ? "rgba(245, 166, 35, 0.08)" : undefined}
          borderColor={offlineCount > 0 ? semantic.status.warning : undefined}
        />
      </Box>

      {/* CHARTS ROW */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
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
        <Box sx={{ overflowX: "auto" }}>
        <Box component="table" width="100%" sx={{ borderCollapse: "collapse", minWidth: "700px" }}>
          <Box component="thead">
            <Box component="tr" sx={{ borderBottom: `1px solid ${colors.ui.border.default}` }}>
              {["Zone", "Total Catches", "Dominant Species", "Risk Level", "Devices", "Trend"].map((h) => (
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
                <Box component="td" sx={{ p: "12px 20px" }}>
                  <Sparkline zone={zone.zone} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
