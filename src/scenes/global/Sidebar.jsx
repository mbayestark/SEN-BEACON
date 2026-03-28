import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import SenBeaconLogo from "../../components/SenBeaconLogo";
import {
  LayoutDashboard, Map, Bug, Cpu, AlertCircle,
  Thermometer, Activity, Zap, Menu as MenuIcon,
} from "lucide-react";

const Item = ({ title, to, icon, selected, setSelected, badge }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.ui.text.secondary }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Box display="flex" alignItems="center" gap="8px">
        <Typography>{title}</Typography>
        {badge && (
          <Box sx={{
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "rgba(0,201,177,0.15)",
            color: "#00C9B1",
            padding: "2px 6px",
            borderRadius: "3px",
            marginLeft: "auto",
          }}>
            {badge}
          </Box>
        )}
      </Box>
      <Link to={to} />
    </MenuItem>
  );
};

const SectionLabel = ({ label }) => (
  <Typography sx={{
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "text.disabled",
    padding: "16px 20px 6px",
    fontFamily: "IBM Plex Mono, monospace",
  }}>
    {label}
  </Typography>
);

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.ui.bg.surface} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
          color: `${colors.ui.text.secondary} !important`,
        },
        "& .pro-inner-item:hover": {
          color: `${colors.ui.text.primary} !important`,
        },
        "& .pro-menu-item.active": {
          color: `${colors.ui.text.primary} !important`,
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuIcon size={20} /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.ui.text.primary }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <SenBeaconLogo fontSize="20px" />
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuIcon size={20} />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* PLATFORM INFO */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Bug size={48} color={colors.ui.text.tertiary} strokeWidth={1.5} />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  color={colors.ui.text.tertiary}
                  sx={{ m: "10px 0 0 0" }}
                >
                  Health Intelligence Platform
                </Typography>
              </Box>
            </Box>
          )}

          {/* MENU ITEMS */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* OVERVIEW */}
            <SectionLabel label="Overview" />
            <Item
              title="Dashboard"
              to="/"
              icon={<LayoutDashboard size={18} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Map & Heatmap"
              to="/map"
              icon={<Map size={18} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

            {/* MONITORING */}
            <SectionLabel label="Monitoring" />
            <Item
              title="Vector Activity"
              to="/activity"
              icon={<Bug size={18} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Field Devices"
              to="/devices"
              icon={<Cpu size={18} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Alerts"
              to="/alerts"
              icon={<AlertCircle size={18} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Environmental Data"
              to="/temperature"
              icon={<Thermometer size={18} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Activity Timeline"
              to="/timeline"
              icon={<Activity size={18} />}
              selected={selected}
              setSelected={setSelected}
            />

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

            {/* INTELLIGENCE */}
            <SectionLabel label="Intelligence" />
            <Item
              title="AI Predictions"
              to="/predictions"
              icon={<Zap size={18} />}
              selected={selected}
              setSelected={setSelected}
              badge="Preview"
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
