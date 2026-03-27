import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// SEMANTIC COLOR SYSTEM
// Each color has ONE meaning. Never reuse a color for a different meaning.
export const semantic = {
  status: {
    online: "#4CAF50",
    offline: "#9E9E9E",
    warning: "#F5A623",
    critical: "#F44336",
  },
  risk: {
    low: "#4CAF50",
    medium: "#F5A623",
    high: "#FF6B35",
    critical: "#F44336",
    none: "#616161",
  },
  species: {
    anopheles: "#F44336",
    aedes: "#F5A623",
    culex: "#42A5F5",
  },
  zones: {
    "Technopôle-Pikine": "#D32F2F",
    "Grand-Yoff": "#C62828",
    "Nord-Foire": "#E53935",
    "Pikine-Guédiawaye": "#F44336",
    "Lac Rose": "#E91E63",
    "Parcelles Assainies": "#FF6B35",
    "Plateau": "#F5A623",
    "Rufisque": "#42A5F5",
    "Richard-Toll": "#AB47BC",
    "Saint-Louis Ville": "#7E57C2",
    "Dagana": "#5C6BC0",
    "Matam Ville": "#26A69A",
    "Kanel": "#00897B",
    "Matam Rural": "#00796B",
    "Louga Ville": "#FF7043",
    "Linguère": "#EF6C00",
    "Kébémer": "#FFA726",
    "Ranérou": "#78909C",
    "Podor": "#8E99A4",
    "Almadies-Ngor": "#4CAF50",
    "Gorée": "#66BB6A",
    "Thiès": "#8D6E63",
  },
};

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        ui: {
          bg: {
            page: "#0A0E1A",
            surface: "#111827",
            elevated: "#1A2235",
            hover: "#1E2A3D",
          },
          text: {
            primary: "#F0F4F8",
            secondary: "#8899AA",
            tertiary: "#4A5568",
            disabled: "#2D3748",
          },
          border: {
            default: "#1E2D3D",
            subtle: "#162030",
            focus: "#42A5F5",
          },
        },
      }
    : {
        ui: {
          bg: {
            page: "#F7F8FA",
            surface: "#FFFFFF",
            elevated: "#F0F2F5",
            hover: "#E8ECF0",
          },
          text: {
            primary: "#111827",
            secondary: "#6B7280",
            tertiary: "#9CA3AF",
            disabled: "#D1D5DB",
          },
          border: {
            default: "#E5E7EB",
            subtle: "#F3F4F6",
            focus: "#42A5F5",
          },
        },
      }),
});

export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: { main: colors.ui.bg.page },
            secondary: { main: "#42A5F5" },
            background: { default: colors.ui.bg.page },
          }
        : {
            primary: { main: colors.ui.bg.page },
            secondary: { main: "#42A5F5" },
            background: { default: colors.ui.bg.page },
          }),
    },
    typography: {
      fontFamily: ["IBM Plex Sans", "sans-serif"].join(","),
      fontSize: 12,
      h1: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 40 },
      h2: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 32 },
      h3: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 24 },
      h4: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 20 },
      h5: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 14 },
      h6: { fontFamily: ["IBM Plex Sans", "sans-serif"].join(","), fontSize: 12 },
    },
  };
};

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("dark");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
