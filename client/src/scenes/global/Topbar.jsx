import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import { Sun, Moon, Bell, Settings, User, Search } from "lucide-react";

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
          <Search size={20} />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode} sx={{ color: colors.ui.text.secondary }}>
          {theme.palette.mode === "dark" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <Bell size={20} />
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <Settings size={20} />
        </IconButton>
        <IconButton sx={{ color: colors.ui.text.secondary }}>
          <User size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
