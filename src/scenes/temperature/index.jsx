import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTemperatureData } from "../../data/mockData";
import Header from "../../components/Header";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const Temperature = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="TEMPERATURE & PRESSURE" subtitle="24 hour temperature and pressure readings" />
      <Box
        backgroundColor={colors.primary[400]}
        p="20px"
        borderRadius="8px"
        mt="20px"
        height="70vh"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockTemperatureData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
            <XAxis
              dataKey="time"
              stroke={colors.grey[300]}
              label={{ value: "Time of Day", position: "insideBottom", offset: -10, fill: colors.grey[300] }}
            />
            <YAxis stroke={colors.grey[300]} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.primary[400],
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="top" />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke={colors.redAccent[500]}
              name="Temperature (°C)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="pressure"
              stroke={colors.blueAccent[500]}
              name="Pressure (hPa)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Temperature;