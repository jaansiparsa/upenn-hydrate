import "mapbox-gl/dist/mapbox-gl.css";

import { MapPin, Navigation } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getFountains,
  subscribeToFountains,
} from "../services/fountainService";

import type { Fountain } from "../services/fountainService";
import { mapboxConfig } from "../config/supabase";
import mapboxgl from "mapbox-gl";
import { useNavigate } from "react-router-dom";

interface MapProps {
  className?: string;
  filteredFountains?: Fountain[];
}

export const Map: React.FC<MapProps> = ({ className = "", filteredFountains }) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [lng, setLng] = useState(-75.1932); // UPenn longitude
  const [lat, setLat] = useState(39.9522); // UPenn latitude
  const [zoom, setZoom] = useState(16); // Closer zoom for campus view
  const [isLoaded, setIsLoaded] = useState(false);
  const [fountains, setFountains] = useState<Fountain[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch fountains from Supabase
  const fetchFountains = async () => {
    try {
      setLoading(true);
      const data = await getFountains();
      setFountains(data);
    } catch (error) {
      console.error("Error fetching fountains:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get marker color based on status
  const getMarkerColor = (status: Fountain["status"]) => {
    switch (status) {
      case "working":
        return "#10B981"; // Green
      case "bad_filter":
        return "#F59E0B"; // Yellow/Orange
      case "out_of_order":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  // Function to create custom marker element
  const createMarkerElement = useCallback((fountain: Fountain) => {
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: ${getMarkerColor(fountain.status)};
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
    `;

    // No icon inside - just a clean colored circle
    return el;
  }, []);

  // Function to clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  // Function to add fountain markers to map
  const addFountainMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    clearMarkers();

    // Use filtered fountains if provided, otherwise use all fountains
    const fountainsToShow = filteredFountains || fountains;

    fountainsToShow.forEach((fountain) => {
      const markerElement = createMarkerElement(fountain);

      // Use latitude and longitude directly
      const coordinates: [number, number] = [
        fountain.longitude, // longitude
        fountain.latitude, // latitude
      ];

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .addTo(map.current!);

      // Add popup with fountain information
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        maxWidth: '280px',
        className: 'fountain-popup'
      }).setHTML(`
          <div class="p-3 max-w-xs">
            <h3 class="font-bold text-base sm:text-lg mb-2">${fountain.name}</h3>
            <div class="text-xs sm:text-sm text-gray-600 mb-2">
              <div class="font-medium">${fountain.building}</div>
              <div>Floor: ${fountain.floor}</div>
              ${
                fountain.description
                  ? `<div class="mt-1 italic">${fountain.description}</div>`
                  : ""
              }
            </div>
            ${
              fountain.image_url
                ? `<div class="mb-3">
                    <img 
                      src="${fountain.image_url}" 
                      alt="${fountain.name}" 
                      class="w-full h-24 sm:h-32 object-cover rounded-lg shadow-sm"
                      onerror="this.style.display='none'"
                    />
                   </div>`
                : ""
            }
            <div class="space-y-1 text-xs sm:text-sm mb-3">
              <div class="flex items-center">
                <span class="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2" style="background-color: ${getMarkerColor(
                  fountain.status
                )}"></span>
                <span class="capitalize">${fountain.status.replace(
                  "_",
                  " "
                )}</span>
              </div>
              <div class="text-gray-600">Type: ${fountain.type}</div>
              ${
                fountain.last_checked
                  ? `<div class="text-gray-600">Last checked: ${new Date(
                      fountain.last_checked
                    ).toLocaleDateString()}</div>`
                  : ""
              }
            </div>
            <button 
              onclick="window.navigateToFountain('${fountain.id}')"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors touch-manipulation min-h-[44px]"
            >
              View Details
            </button>
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current.push(marker);
    });
  }, [fountains, filteredFountains, createMarkerElement]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if Mapbox is configured
    if (
      !mapboxConfig.accessToken ||
      mapboxConfig.accessToken === "your_mapbox_access_token"
    ) {
      console.error(
        "Mapbox not configured! Please set VITE_MAPBOX_ACCESS_TOKEN in .env.local"
      );
      return;
    }

    mapboxgl.accessToken = mapboxConfig.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.current.addControl(geolocate, "top-right");

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Add a marker at the center
    new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Set loaded state
    map.current.on("load", () => {
      setIsLoaded(true);
    });

    // Add global function to handle fountain navigation
    (
      window as Window & { navigateToFountain?: (fountainId: string) => void }
    ).navigateToFountain = (fountainId: string) => {
      navigate(`/fountain/${fountainId}`);
    };

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clean up global function
      delete (
        window as Window & { navigateToFountain?: (fountainId: string) => void }
      ).navigateToFountain;
    };
  }, []); // Only run once on mount

  // Track map movement separately (without recreating the map)
  useEffect(() => {
    if (!map.current) return;

    const handleMove = () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    };

    map.current.on("move", handleMove);

    return () => {
      if (map.current) {
        map.current.off("move", handleMove);
      }
    };
  }, [isLoaded]); // Only run when map is loaded

  // Fetch fountains when component mounts
  useEffect(() => {
    fetchFountains();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = subscribeToFountains((payload) => {
      console.log("Real-time update:", payload);
      // Refetch fountains when there's a change
      fetchFountains();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update markers when fountains data or filteredFountains changes
  useEffect(() => {
    if (isLoaded && (fountains.length > 0 || filteredFountains)) {
      addFountainMarkers();
    }
  }, [fountains, filteredFountains, isLoaded, addFountainMarkers]);

  const handleStyleChange = (style: string) => {
    if (map.current) {
      map.current.setStyle(style);
    }
  };

  if (
    !mapboxConfig.accessToken ||
    mapboxConfig.accessToken === "your_mapbox_access_token"
  ) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Mapbox Not Configured
          </h3>
          <p className="text-gray-600 text-sm">
            Please add VITE_MAPBOX_ACCESS_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Map Controls Overlay */}
      {isLoaded && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
            <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              {lng}, {lat}
            </span>
            <span className="sm:hidden">
              {lng.toFixed(2)}, {lat.toFixed(2)}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Zoom: {zoom.toFixed(1)}</div>
        </div>
      )}

      {/* Legend */}
      {isLoaded && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3">
          <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-1 sm:mb-2">
            Fountain Status
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2"
                style={{ backgroundColor: "#10B981" }}
              ></div>
              <span className="text-xs">Working</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2"
                style={{ backgroundColor: "#F59E0B" }}
              ></div>
              <span className="text-xs">Bad Filter</span>
            </div>
            <div className="flex items-center">
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2"
                style={{ backgroundColor: "#EF4444" }}
              ></div>
              <span className="text-xs">Out of Order</span>
            </div>
          </div>
        </div>
      )}

      {/* Style Selector */}
      {isLoaded && (
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white rounded-lg shadow-lg p-1 sm:p-2">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
            <button
              onClick={() =>
                handleStyleChange("mapbox://styles/mapbox/streets-v12")
              }
              className="px-2 py-1 sm:px-3 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors touch-manipulation"
            >
              Streets
            </button>
            <button
              onClick={() =>
                handleStyleChange("mapbox://styles/mapbox/satellite-v9")
              }
              className="px-2 py-1 sm:px-3 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors touch-manipulation"
            >
              Satellite
            </button>
            <button
              onClick={() =>
                handleStyleChange("mapbox://styles/mapbox/light-v11")
              }
              className="px-2 py-1 sm:px-3 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors touch-manipulation"
            >
              Light
            </button>
            <button
              onClick={() =>
                handleStyleChange("mapbox://styles/mapbox/dark-v11")
              }
              className="px-2 py-1 sm:px-3 text-xs bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors touch-manipulation"
            >
              Dark
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(!isLoaded || loading) && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">
              {!isLoaded ? "Loading map..." : "Loading fountains..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
