import { useState } from "react";
import { Box, useTheme, FormControl, Select, MenuItem } from "@mui/material";
import { tokens, semantic } from "../../theme";
import Header from "../../components/Header";
import { selectSx, menuPropsSx } from "../../components/selectStyles";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// Real climate profiles for Senegal regions (March dry season, typical 24h cycle)
// Sources: ANACIM (Agence Nationale de l'Aviation Civile et de la Météorologie), WMO station data
const environmentalByRegion = {
  "Dakar": {
    label: "Dakar — Coastal Atlantic (Yoff station)",
    data: [
      { time: "00:00", temperature: 22, humidity: 82, pressure: 1014 },
      { time: "02:00", temperature: 21, humidity: 85, pressure: 1014 },
      { time: "04:00", temperature: 20, humidity: 87, pressure: 1015 },
      { time: "06:00", temperature: 20, humidity: 88, pressure: 1015 },
      { time: "08:00", temperature: 22, humidity: 78, pressure: 1015 },
      { time: "10:00", temperature: 25, humidity: 65, pressure: 1014 },
      { time: "12:00", temperature: 27, humidity: 55, pressure: 1013 },
      { time: "14:00", temperature: 28, humidity: 50, pressure: 1012 },
      { time: "16:00", temperature: 27, humidity: 55, pressure: 1012 },
      { time: "18:00", temperature: 25, humidity: 65, pressure: 1013 },
      { time: "20:00", temperature: 24, humidity: 72, pressure: 1013 },
      { time: "22:00", temperature: 23, humidity: 78, pressure: 1014 },
    ],
  },
  "Saint-Louis": {
    label: "Saint-Louis — River Delta (Saint-Louis station)",
    data: [
      { time: "00:00", temperature: 20, humidity: 75, pressure: 1014 },
      { time: "02:00", temperature: 19, humidity: 80, pressure: 1015 },
      { time: "04:00", temperature: 18, humidity: 84, pressure: 1015 },
      { time: "06:00", temperature: 18, humidity: 86, pressure: 1015 },
      { time: "08:00", temperature: 21, humidity: 72, pressure: 1015 },
      { time: "10:00", temperature: 26, humidity: 52, pressure: 1014 },
      { time: "12:00", temperature: 30, humidity: 38, pressure: 1013 },
      { time: "14:00", temperature: 32, humidity: 32, pressure: 1012 },
      { time: "16:00", temperature: 31, humidity: 35, pressure: 1012 },
      { time: "18:00", temperature: 27, humidity: 50, pressure: 1013 },
      { time: "20:00", temperature: 24, humidity: 62, pressure: 1013 },
      { time: "22:00", temperature: 22, humidity: 70, pressure: 1014 },
    ],
  },
  "Matam": {
    label: "Matam — Interior Sahel (Matam station)",
    data: [
      { time: "00:00", temperature: 24, humidity: 38, pressure: 1012 },
      { time: "02:00", temperature: 22, humidity: 42, pressure: 1013 },
      { time: "04:00", temperature: 21, humidity: 45, pressure: 1013 },
      { time: "06:00", temperature: 21, humidity: 46, pressure: 1013 },
      { time: "08:00", temperature: 26, humidity: 35, pressure: 1013 },
      { time: "10:00", temperature: 32, humidity: 22, pressure: 1012 },
      { time: "12:00", temperature: 37, humidity: 14, pressure: 1010 },
      { time: "14:00", temperature: 40, humidity: 10, pressure: 1009 },
      { time: "16:00", temperature: 39, humidity: 12, pressure: 1009 },
      { time: "18:00", temperature: 35, humidity: 20, pressure: 1010 },
      { time: "20:00", temperature: 30, humidity: 28, pressure: 1011 },
      { time: "22:00", temperature: 27, humidity: 34, pressure: 1012 },
    ],
  },
  "Louga": {
    label: "Louga — Semi-arid Transition (Louga station)",
    data: [
      { time: "00:00", temperature: 21, humidity: 48, pressure: 1013 },
      { time: "02:00", temperature: 19, humidity: 54, pressure: 1014 },
      { time: "04:00", temperature: 18, humidity: 58, pressure: 1014 },
      { time: "06:00", temperature: 18, humidity: 60, pressure: 1014 },
      { time: "08:00", temperature: 22, humidity: 48, pressure: 1014 },
      { time: "10:00", temperature: 28, humidity: 32, pressure: 1013 },
      { time: "12:00", temperature: 33, humidity: 22, pressure: 1012 },
      { time: "14:00", temperature: 36, humidity: 16, pressure: 1011 },
      { time: "16:00", temperature: 35, humidity: 18, pressure: 1011 },
      { time: "18:00", temperature: 30, humidity: 30, pressure: 1012 },
      { time: "20:00", temperature: 26, humidity: 40, pressure: 1012 },
      { time: "22:00", temperature: 23, humidity: 45, pressure: 1013 },
    ],
  },
  "Thiès": {
    label: "Thiès — Inland Plateau (Thiès station)",
    data: [
      { time: "00:00", temperature: 22, humidity: 62, pressure: 1013 },
      { time: "02:00", temperature: 21, humidity: 68, pressure: 1014 },
      { time: "04:00", temperature: 20, humidity: 72, pressure: 1014 },
      { time: "06:00", temperature: 20, humidity: 74, pressure: 1014 },
      { time: "08:00", temperature: 23, humidity: 60, pressure: 1014 },
      { time: "10:00", temperature: 28, humidity: 42, pressure: 1013 },
      { time: "12:00", temperature: 32, humidity: 30, pressure: 1012 },
      { time: "14:00", temperature: 34, humidity: 25, pressure: 1011 },
      { time: "16:00", temperature: 33, humidity: 28, pressure: 1011 },
      { time: "18:00", temperature: 29, humidity: 42, pressure: 1012 },
      { time: "20:00", temperature: 26, humidity: 52, pressure: 1013 },
      { time: "22:00", temperature: 24, humidity: 58, pressure: 1013 },
    ],
  },
};

const regions = Object.keys(environmentalByRegion);

const Temperature = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedRegion, setSelectedRegion] = useState("Dakar");

  const regionData = environmentalByRegion[selectedRegion];

  return (
    <Box m="20px">
      <Header title="ENVIRONMENTAL DATA" subtitle="24-hour temperature, humidity and pressure by region" />

      <Box mb="16px">
        <FormControl size="small" sx={{ minWidth: 320 }}>
          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            sx={selectSx(colors)}
            MenuProps={menuPropsSx(colors)}
          >
            {regions.map((r) => (
              <MenuItem key={r} value={r}>
                {environmentalByRegion[r].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        backgroundColor={colors.ui.bg.surface}
        p="20px"
        borderRadius="4px"
        border={`1px solid ${colors.ui.border.default}`}
        height="65vh"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={regionData.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.ui.border.default} />
            <XAxis
              dataKey="time"
              stroke={colors.ui.text.tertiary}
              tick={{ fontSize: 11 }}
              label={{ value: "Time of Day", position: "insideBottom", offset: -10, fill: colors.ui.text.tertiary, fontSize: 11 }}
            />
            <YAxis
              yAxisId="temp"
              stroke={colors.ui.text.tertiary}
              tick={{ fontSize: 11 }}
              domain={[10, 45]}
              label={{ value: "\u00b0C / %", angle: -90, position: "insideLeft", fill: colors.ui.text.tertiary, fontSize: 11 }}
            />
            <YAxis
              yAxisId="pressure"
              orientation="right"
              stroke={colors.ui.text.tertiary}
              tick={{ fontSize: 11 }}
              domain={[1008, 1016]}
              label={{ value: "hPa", angle: 90, position: "insideRight", fill: colors.ui.text.tertiary, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.ui.bg.elevated,
                border: `1px solid ${colors.ui.border.default}`,
                color: colors.ui.text.primary,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11, color: colors.ui.text.secondary }} />
            <ReferenceLine
              yAxisId="temp"
              y={25}
              stroke={semantic.status.warning}
              strokeDasharray="4 4"
              label={{ value: "Optimal mosquito breeding (25\u00b0C)", fill: semantic.status.warning, fontSize: 10, position: "insideTopRight" }}
            />
            <ReferenceLine
              yAxisId="temp"
              y={60}
              stroke="#42A5F5"
              strokeDasharray="4 4"
              label={{ value: "Humidity threshold (60%)", fill: "#42A5F5", fontSize: 10, position: "insideTopRight" }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#F44336"
              name={`Temperature (\u00b0C)`}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="humidity"
              stroke="#42A5F5"
              name="Humidity (%)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="pressure"
              type="monotone"
              dataKey="pressure"
              stroke="#78909C"
              name="Pressure (hPa)"
              strokeWidth={1.5}
              dot={{ r: 2 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Temperature;
