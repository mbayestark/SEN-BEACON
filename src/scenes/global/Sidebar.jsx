import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import SenBeaconLogo from "../../components/SenBeaconLogo";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";

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
          <Chip
            label={badge}
            size="small"
            sx={{
              height: "18px",
              fontSize: "10px",
              fontWeight: 600,
              backgroundColor: "#42A5F5",
              color: "#0A0E1A",
            }}
          />
        )}
      </Box>
      <Link to={to} />
    </MenuItem>
  );
};

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
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
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
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* PLATFORM INFO */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <BugReportOutlinedIcon
                  sx={{ fontSize: "60px", color: colors.ui.text.tertiary }}
                />
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

          {/* MENU ITEMS — OPERATIONAL */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.ui.text.tertiary}
              sx={{ m: "15px 0 5px 20px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 400 }}
            >
              Monitoring
            </Typography>
            <Item
              title="Device Map"
              to="/map"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Vector Activity"
              to="/activity"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Field Devices"
              to="/devices"
              icon={<DevicesOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Alerts"
              to="/alerts"
              icon={<NotificationsActiveOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.ui.text.tertiary}
              sx={{ m: "15px 0 5px 20px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 400 }}
            >
              Data
            </Typography>
            <Item
              title="Environmental Data"
              to="/temperature"
              icon={<ThermostatOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Activity Timeline"
              to="/timeline"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* SEPARATOR */}
            <Box
              sx={{
                borderTop: `1px solid ${colors.ui.border.default}`,
                m: "15px 20px 10px 20px",
              }}
            />

            <Typography
              variant="h6"
              color={colors.ui.text.tertiary}
              sx={{ m: "5px 0 5px 20px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 400 }}
            >
              Intelligence
            </Typography>
            <Item
              title="AI Predictions"
              to="/predictions"
              icon={<AutoGraphOutlinedIcon />}
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
