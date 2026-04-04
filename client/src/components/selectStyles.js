export const selectSx = (colors) => ({
  backgroundColor: colors.ui.bg.surface,
  color: colors.ui.text.primary,
  border: `1px solid ${colors.ui.border.default}`,
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: "13px",
  "& .MuiSelect-icon": { color: colors.ui.text.tertiary },
});

export const menuPropsSx = (colors) => ({
  PaperProps: {
    sx: {
      backgroundColor: colors.ui.bg.elevated,
      color: colors.ui.text.primary,
    },
  },
});
