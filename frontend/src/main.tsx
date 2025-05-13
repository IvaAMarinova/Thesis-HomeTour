import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const loadGoogleMapsApi = () => {
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is missing.");
    return;
  } else {
    console.log("Key found.");
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => console.log("Google Maps API loaded successfully.");
  script.onerror = () => console.error("Failed to load Google Maps API.");

  document.head.appendChild(script);
};

loadGoogleMapsApi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
