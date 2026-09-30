import Map, { Marker } from "react-map-gl";
import SectionTitle from "../SectionTitle/SectionTitle";
import "mapbox-gl/dist/mapbox-gl.css";
import CustomMarker from "./CustomMarker"; // Import the CustomMarker component
import { useParams } from "react-router-dom";

const Location = () => {
  const params=useParams()
  // console.log(params.location)
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const info={
  latitude: params.location.split(",")[0],
  longitude: params.location.split(",")[1]
}

  const markerCoordinates = {
    latitude: info.latitude,
    longitude: info.longitude,
  };

  return (
    <div className="max-h-screen">
      <SectionTitle
        heading={"Delivery location"}
        subHeading={"See Receiver Location"}
      />
      <div className="flex justify-center items-center">
        <Map
          mapboxAccessToken={mapboxAccessToken}
          initialViewState={{
            latitude: info.latitude,
            longitude: info.longitude,
            zoom: 8,
          }}
          style={{ width: 600, height: 400 }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
        >
          {/* Add CustomMarker */}
          <Marker {...markerCoordinates}>
            <CustomMarker />
          </Marker>
        </Map>
      </div>
    </div>
  );
};

export default Location;
