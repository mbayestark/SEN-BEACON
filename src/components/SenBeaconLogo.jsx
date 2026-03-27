import { Box } from "@mui/material";

const SenBeaconLogo = ({ fontSize = "24px" }) => {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        fontSize,
        letterSpacing: "0.05em",
      }}
    >
      <span style={{ color: "#F0F4F8" }}>SEN-</span>
      <span style={{ color: "#42A5F5" }}>BEACON</span>
    </Box>
  );
};

export default SenBeaconLogo;
