import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Header from "../../components/Header";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const trapLocation = {
  lat: 14.7833,
  lng: -16.9214,
  name: "Trap #001",
  location: "Thiès, Senegal",
};

const TrapMap = () => {
  return (
    <Box m="20px">
      <Header title="TRAP LOCATION" subtitle="Live GPS location of your mosquito trap" />
      <Box
        height="70vh"
        borderRadius="8px"
        overflow="hidden"
        mt="20px"
      >
        <MapContainer
          center={[trapLocation.lat, trapLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[trapLocation.lat, trapLocation.lng]}>
            <Popup>
              <strong>{trapLocation.name}</strong><br />
              {trapLocation.location}<br />
              Lat: {trapLocation.lat}, Lng: {trapLocation.lng}
            </Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Box>
  );
};

export default TrapMap;
