import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapPreview({ lat, lon, address }) {
  if (!lat || !lon) {
    return (
      <div className="bg-gray-200 h-48 rounded-xl flex flex-col justify-center items-center text-gray-500">
        <div>Interactive Map</div>
        <div className="text-sm">{address}</div>
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl overflow-hidden">
      <MapContainer center={[lat, lon]} zoom={15} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lon]} icon={icon}></Marker>
      </MapContainer>
    </div>
  );
}

export default MapPreview;
