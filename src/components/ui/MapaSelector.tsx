import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// IMPORTA LOS ICONOS Directamente
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Solo se debe ejecutar una vez!
function fixLeafletIcon() {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

interface MapaSelectorProps {
    value: { lat: number; lng: number } | null;
    onChange: (pos: { lat: number; lng: number }) => void;
}

const MapaSelector = ({ value, onChange }: MapaSelectorProps) => {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    const defaultPosition = value || { lat: -34.6037, lng: -58.3816 };

    function LocationMarker() {
        useMapEvents({
            click(e) {
                onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            },
        });
        return value ? <Marker position={value} /> : null;
    }

    return (
        <MapContainer center={defaultPosition} zoom={5} className="z-10" style={{ height: "300px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
        </MapContainer>
    );
};

export default MapaSelector;