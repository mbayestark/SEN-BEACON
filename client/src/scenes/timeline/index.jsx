import { useState } from "react";
import { Box, useTheme, FormControl, Select, MenuItem } from "@mui/material";
import { tokens, semantic } from "../../theme";
import { deviceRegistry, mosquitoActivityByDevice } from "../../data/mockData";
import Header from "../../components/Header";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

const onlineDevices = deviceRegistry.filter((d) => d.status === "Online");

const Timeline = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedDevice, setSelectedDevice] = useState(onlineDevices[0]?.id || "");

  const rawData = mosquitoActivityByDevice[selectedDevice] || [];
  const chartData = rawData.map((entry) => ({
    hour: entry.hour,
    total: entry.Anopheles + entry.Aedes + entry.Culex,
  }));

  return (
    <Box m="20px">
      <Header title="ACTIVITY TIMELINE" subtitle="Total vector activity trends over 24 hours" />

      {/* DEVICE SELECTOR */}
      <Box mb="16px">
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <Select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            sx={{
              backgroundColor: colors.ui.bg.surface,
              color: colors.ui.text.primary,
              border: `1px solid ${colors.ui.border.default}`,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "13px",
              "& .MuiSelect-icon": { color: colors.ui.text.tertiary },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: colors.ui.bg.elevated,
                  color: colors.ui.text.primary,
                },
              },
            }}
          >
            {onlineDevices.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.id} — {d.name} ({d.location})
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
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.ui.border.default} />
            <XAxis
              dataKey="hour"
              stroke={colors.ui.text.tertiary}
              tick={{ fontSize: 11 }}
              label={{ value: "Time of Day", position: "insideBottom", offset: -10, fill: colors.ui.text.tertiary, fontSize: 11 }}
            />
            <YAxis
              stroke={colors.ui.text.tertiary}
              tick={{ fontSize: 11 }}
              label={{ value: "Total Catches", angle: -90, position: "insideLeft", fill: colors.ui.text.tertiary, fontSize: 11 }}
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
              y={100}
              stroke={semantic.status.critical}
              strokeDasharray="3 3"
              label={{ value: "High Activity", fill: semantic.status.critical, fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#42A5F5"
              name="Total Catches"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Timeline;
