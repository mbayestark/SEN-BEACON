import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockMosquitoActivity } from "../../data/mockData";
import Header from "../../components/Header";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

const Timeline = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="ACTIVITY OVER TIME" subtitle="Mosquito activity trends throughout the day" />
      <Box
        backgroundColor={colors.primary[400]}
        p="20px"
        borderRadius="8px"
        mt="20px"
        height="70vh"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockMosquitoActivity}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
            <XAxis
              dataKey="hour"
              stroke={colors.grey[300]}
              label={{ value: "Time of Day", position: "insideBottom", offset: -10, fill: colors.grey[300] }}
            />
            <YAxis
              stroke={colors.grey[300]}
              label={{ value: "Mosquitoes Caught", angle: -90, position: "insideLeft", fill: colors.grey[300] }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.primary[400],
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="top" />
            <ReferenceLine
              y={100}
              stroke={colors.redAccent[500]}
              strokeDasharray="3 3"
              label={{ value: "High Activity", fill: colors.redAccent[500] }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={colors.greenAccent[500]}
              name="Mosquitoes Caught"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Timeline;