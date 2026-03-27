import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.ui.bg.surface}
        border={`1px solid ${colors.ui.border.default}`}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1, color: colors.ui.text.primary }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1, color: colors.ui.text.tertiary }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode} sx={{ color: colors.ui.text.secondary }}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
