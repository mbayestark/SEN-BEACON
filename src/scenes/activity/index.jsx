import { Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockMosquitoActivity } from "../../data/mockData";
import Header from "../../components/Header";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const Activity = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="MOSQUITO ACTIVITY" subtitle="Mosquito catch count by hour" />
      <Box
        backgroundColor={colors.primary[400]}
        p="20px"
        borderRadius="8px"
        mt="20px"
        height="70vh"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <Bar
              dataKey="count"
              fill={colors.greenAccent[500]}
              name="Mosquitoes Caught"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Activity;