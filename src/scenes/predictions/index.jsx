import { Box, Typography, useTheme } from "@mui/material";
import { tokens, semantic } from "../../theme";
import Header from "../../components/Header";
import { predictionData, weeklyTrendData } from "../../data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Zap, CheckCircle, Circle } from "lucide-react";

const riskScoreColor = (score) => {
  if (score <= 30) return semantic.risk.low;
  if (score <= 60) return semantic.risk.medium;
  if (score <= 80) return semantic.risk.high;
  return semantic.risk.critical;
};

const trendIcon = (trend) => {
  if (trend === "rising") return <TrendingUp size={20} />;
  if (trend === "falling") return <TrendingDown size={20} />;
  return <Minus size={20} />;
};

const dataSources = [
  { available: true, label: "Device catches (live \u2014 available now)" },
  { available: false, label: "Hospital records 30yr (Phase 2)" },
  { available: false, label: "Environmental sensors \u2014 temperature, rainfall (Phase 2)" },
  { available: false, label: "ASC field reports (Phase 2)" },
  { available: false, label: "Citizen symptom reports via Telegram (Phase 2)" },
];

const Predictions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="AI PREDICTIONS" subtitle="Risk forecasting and trend analysis" />

      {/* PROTOTYPE BANNER */}
      <Box
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        borderLeft="4px solid #42A5F5"
        p="16px 20px"
        mb="20px"
      >
        <Typography fontWeight="600" fontSize="14px" color="#42A5F5" mb="4px">
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            <Zap size={16} /> AI-Powered Predictions — Future Vision
          </Box>
        </Typography>
        <Typography fontSize="11px" color={colors.ui.text.tertiary} lineHeight={1.6}>
          This view is a prototype showing what SEN-BEACON will look like once the prediction
          layer integrates hospital records, environmental sensors, and historical case data.
          Current data is illustrative.
        </Typography>
      </Box>

      {/* RISK SCORE CARDS */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        gap="16px"
        mb="20px"
      >
        {predictionData.map((zone) => (
          <Box
            key={zone.zone}
            backgroundColor={colors.ui.bg.surface}
            borderRadius="4px"
            border={`1px solid ${colors.ui.border.default}`}
            p="20px"
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                color: colors.ui.text.secondary,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                mb: "12px",
              }}
            >
              {zone.zone}
            </Typography>
            <Box display="flex" alignItems="center" gap="8px" mb="10px">
              <Typography
                sx={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "40px",
                  fontWeight: 600,
                  color: riskScoreColor(zone.riskScore),
                  lineHeight: 1,
                }}
              >
                {zone.riskScore}
              </Typography>
              <Box color={riskScoreColor(zone.riskScore)}>
                {trendIcon(zone.trend)}
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "11px",
                color: colors.ui.text.tertiary,
                mb: "10px",
              }}
            >
              Predicted peak: {zone.predictedPeak}
            </Typography>
            <Box>
              {zone.factors.map((f, i) => (
                <Typography key={i} fontSize="11px" color={colors.ui.text.tertiary} lineHeight={1.6}>
                  {"\u2022"} {f}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* WEEKLY RISK TREND CHART */}
      <Box
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
        p="20px"
        mb="20px"
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
          Weekly Risk Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.ui.border.default} />
            <XAxis dataKey="day" stroke={colors.ui.text.tertiary} tick={{ fontSize: 11 }} />
            <YAxis stroke={colors.ui.text.tertiary} tick={{ fontSize: 11 }} domain={[0, 100]} />
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
            <ReferenceLine
              y={70}
              stroke={semantic.status.critical}
              strokeDasharray="6 4"
              label={{
                value: "Alert threshold",
                position: "right",
                fill: semantic.status.critical,
                fontSize: 11,
              }}
            />
            {Object.entries(semantic.zones).map(([zone, color]) => (
              <Line
                key={zone}
                type="monotone"
                dataKey={zone}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* DATA SOURCES */}
      <Box
        backgroundColor={colors.ui.bg.surface}
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
        p="20px"
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            color: colors.ui.text.secondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mb: "12px",
          }}
        >
          Data Sources
        </Typography>
        {dataSources.map((source, i) => (
          <Box key={i} display="flex" alignItems="center" gap="10px" mb="6px">
            {source.available
              ? <CheckCircle size={14} color={semantic.status.online} />
              : <Circle size={14} color={colors.ui.text.tertiary} />
            }
            <Typography
              fontSize="12px"
              color={source.available ? colors.ui.text.primary : colors.ui.text.tertiary}
            >
              {source.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Predictions;
