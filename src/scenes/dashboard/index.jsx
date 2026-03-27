import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { mockTrapStats, mockMosquitoActivity, mockTemperatureData, mockSpeciesData } from "../../data/mockData";
import Header from "../../components/Header";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import BatteryChargingFullOutlinedIcon from "@mui/icons-material/BatteryChargingFullOutlined";
import CompressOutlinedIcon from "@mui/icons-material/CompressOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts";

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      backgroundColor={colors.primary[400]}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p="20px"
      borderRadius="8px"
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
          {value}
        </Typography>
        <Typography variant="h6" color={colors.grey[300]}>
          {title}
        </Typography>
      </Box>
      <Box color={color} fontSize="40px">
        {icon}
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const COLORS = ["#4cceac", "#6870fa", "#db4f4a"];

  return (
    <Box m="20px">
      <Header title="DASHBOARD" subtitle="AI Mosquito Trap — Thiès, Senegal" />

      {/* STAT CARDS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(5, 1fr)"
        gap="20px"
        mb="20px"
      >
        <StatCard
          title="Temperature"
          value={`${mockTrapStats.temperature}°C`}
          icon={<ThermostatOutlinedIcon fontSize="inherit" />}
          color={colors.redAccent[500]}
        />
        <StatCard
          title="Pressure"
          value={`${mockTrapStats.pressure} hPa`}
          icon={<CompressOutlinedIcon fontSize="inherit" />}
          color={colors.blueAccent[500]}
        />
        <StatCard
          title="Mosquitoes Caught"
          value={mockTrapStats.mosquitoCount}
          icon={<BugReportOutlinedIcon fontSize="inherit" />}
          color={colors.greenAccent[500]}
        />
        <StatCard
          title="Battery"
          value={`${mockTrapStats.battery}%`}
          icon={<BatteryChargingFullOutlinedIcon fontSize="inherit" />}
          color={colors.greenAccent[300]}
        />
        <StatCard
          title="Status"
          value={mockTrapStats.status}
          icon={<WifiOutlinedIcon fontSize="inherit" />}
          color={colors.greenAccent[500]}
        />
      </Box>

      {/* CHARTS ROW */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap="20px"
      >
        {/* MOSQUITO ACTIVITY BAR CHART */}
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
          gridColumn="span 2"
        >
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} mb="15px">
            Mosquito Activity by Hour
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockMosquitoActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
              <XAxis dataKey="hour" stroke={colors.grey[300]} />
              <YAxis stroke={colors.grey[300]} />
              <Tooltip />
              <Bar dataKey="count" fill={colors.greenAccent[500]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* SPECIES PIE CHART */}
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
        >
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} mb="15px">
            Species Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockSpeciesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {mockSpeciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* TEMPERATURE & PRESSURE LINE CHART */}
        <Box
          backgroundColor={colors.primary[400]}
          p="20px"
          borderRadius="8px"
          gridColumn="span 3"
        >
          <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} mb="15px">
            Temperature & Pressure Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockTemperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.primary[300]} />
              <XAxis dataKey="time" stroke={colors.grey[300]} />
              <YAxis stroke={colors.grey[300]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke={colors.redAccent[500]} name="Temp (°C)" />
              <Line type="monotone" dataKey="pressure" stroke={colors.blueAccent[500]} name="Pressure (hPa)" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;