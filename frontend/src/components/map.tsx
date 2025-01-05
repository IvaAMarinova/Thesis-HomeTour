import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import React, { useState, useEffect, useCallback } from "react";

const containerStyle = {
    width: "100%",
    height: "100%",
};

const libraries: Array<"places" | "geometry" | "drawing" | "visualization" | "marker"> = ["marker"];

const mapOptions = {
    mapId: "DEMO_MAP_ID",
};

function Map({ street, city, neighborhood }: { street: string; city: string; neighborhood: string }) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
        version: "beta",
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [geocodingError, setGeocodingError] = useState<boolean>(false);

    useEffect(() => {
        if (isLoaded) {
            const address = `${street}, ${neighborhood}, ${city}`;
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ address }, (results, status) => {
                if (status === "OK" && results && results[0]?.geometry?.location) {
                    const location = results[0].geometry.location;
                    const foundLocation = { lat: location.lat(), lng: location.lng() };
                    setCenter(foundLocation);
                    setGeocodingError(false);
                } else {
                    console.log()
                    setGeocodingError(true);
                }
            });
        }
    }, [street, city, neighborhood, isLoaded]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        if (center) {
            if (window.google?.maps?.marker?.AdvancedMarkerElement) {
                new window.google.maps.marker.AdvancedMarkerElement({
                    map,
                    position: center,
                    title: "Property Location",
                });
            }
        } else {
            console.warn("Center is not set, cannot place marker");
        }
    }, [center]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    if (geocodingError || !center) {
        return <p>Невалиден адрес - не може да бъде визуализиран.</p>;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        />
    );
}

export default React.memo(Map);