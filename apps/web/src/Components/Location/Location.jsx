import { Link, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SectionTitle from "../SectionTitle/SectionTitle";
import DocumentTitle from "../Seo/DocumentTitle";

// Fix default marker icons under Vite (leaflet expects image assets).
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function parseLatLng(raw) {
  const [lat, lng] = String(raw || "")
    .split(",")
    .map((v) => Number(String(v).trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

const Location = () => {
  const { location } = useParams();
  const center = parseLatLng(location);

  if (!center) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <DocumentTitle title="RapidParcelHub | Location" />
        <SectionTitle heading="Delivery location" subHeading="See receiver location" />
        <p className="text-sm text-base-content/70">
          The coordinates in this link look invalid. Expected format:{" "}
          <code className="font-mono">latitude,longitude</code>.
        </p>
        <Link to="/dashboard/myParcels" className="btn btn-primary mt-6">
          Back to my parcels
        </Link>
      </div>
    );
  }

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Delivery location" />
      <SectionTitle heading="Delivery location" subHeading="See receiver location" />
      <div className="overflow-hidden rounded-3xl border border-base-200 shadow-sm">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          style={{ height: 420, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={markerIcon}>
            <Popup>Receiver location</Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="mt-3 text-center text-xs text-base-content/50">
        {center[0].toFixed(5)}, {center[1].toFixed(5)} · free OpenStreetMap tiles, no token needed
      </p>
    </div>
  );
};

export default Location;
