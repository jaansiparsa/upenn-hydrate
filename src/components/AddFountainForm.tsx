import { ArrowLeft, Building, MapPin, Upload, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createFountain,
  uploadFountainImage,
} from "../services/fountainService";

import type { CreateFountainData } from "../services/fountainService";
import { mapboxConfig } from "../config/supabase";
import mapboxgl from "mapbox-gl";
import { useNavigate } from "react-router-dom";

interface AddFountainFormProps {
  onClose: () => void;
}

export const AddFountainForm: React.FC<AddFountainFormProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [formData, setFormData] = useState<CreateFountainData>({
    name: "",
    building: "",
    floor: "",
    latitude: 39.9522, // Default to UPenn
    longitude: -75.1932,
    description: "",
    status: "working",
    type: "indoor",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize map for coordinate selection
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (
      !mapboxConfig.accessToken ||
      mapboxConfig.accessToken === "your_mapbox_access_token"
    ) {
      console.error("Mapbox not configured!");
      return;
    }

    mapboxgl.accessToken = mapboxConfig.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [formData.longitude, formData.latitude],
      zoom: 16,
    });

    // Add initial marker
    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([formData.longitude, formData.latitude])
      .addTo(map.current);

    // Update coordinates when marker is dragged
    markerRef.current.on("dragend", () => {
      if (markerRef.current) {
        const lngLat = markerRef.current.getLngLat();
        setFormData((prev) => ({
          ...prev,
          longitude: lngLat.lng,
          latitude: lngLat.lat,
        }));
      }
    });

    // Update marker when coordinates are manually changed
    const handleCoordinateChange = () => {
      if (markerRef.current && map.current) {
        markerRef.current.setLngLat([formData.longitude, formData.latitude]);
        map.current.setCenter([formData.longitude, formData.latitude]);
      }
    };

    map.current.on("load", handleCoordinateChange);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker when coordinates change
  useEffect(() => {
    if (markerRef.current && map.current) {
      markerRef.current.setLngLat([formData.longitude, formData.latitude]);
    }
  }, [formData.longitude, formData.latitude]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.building.trim()) newErrors.building = "Building is required";
    if (!formData.floor.trim()) newErrors.floor = "Floor is required";
    if (!formData.latitude || formData.latitude === 0)
      newErrors.latitude = "Valid latitude is required";
    if (!formData.longitude || formData.longitude === 0)
      newErrors.longitude = "Valid longitude is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = "";

      // Upload image if provided
      if (imageFile) {
        // We'll need to create the fountain first to get an ID, then upload the image
        // For now, we'll skip image upload in this implementation
        console.log("Image upload will be implemented after fountain creation");
      }

      // Create fountain
      const fountainData = {
        ...formData,
        image_url: imageUrl,
      };

      await createFountain(fountainData);

      // Show success message
      setShowSuccess(true);

      // Navigate back to map after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error creating fountain:", error);
      setErrors({ submit: "Failed to create fountain. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Show success message overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fountain Submitted!
          </h2>
          <p className="text-gray-600">
            Your new fountain has been added to the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onClose}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Map
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Fountain
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Fountain Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fountain Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Main Library Fountain"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Building */}
              <div>
                <label
                  htmlFor="building"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Building *
                </label>
                <input
                  type="text"
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.building ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Van Pelt Library"
                />
                {errors.building && (
                  <p className="mt-1 text-sm text-red-600">{errors.building}</p>
                )}
              </div>

              {/* Floor */}
              <div>
                <label
                  htmlFor="floor"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Floor *
                </label>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.floor ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Ground Floor, 2nd Floor"
                />
                {errors.floor && (
                  <p className="mt-1 text-sm text-red-600">{errors.floor}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="working">Working</option>
                  <option value="bad_filter">Bad Filter</option>
                  <option value="out_of_order">Out of Order</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details about this fountain..."
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Location</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Map */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Select Location on Map
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag the marker to set the fountain location, or enter
                  coordinates manually below.
                </p>
                <div
                  ref={mapContainer}
                  className="w-full h-64 rounded-lg border border-gray-300"
                />
              </div>

              {/* Manual Coordinates */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manual Coordinates
                </h3>

                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Latitude *
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="any"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.latitude ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="39.9522"
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.latitude}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Longitude *
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="any"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.longitude ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="-75.1932"
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.longitude}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> You can drag the marker on the map to
                    automatically update these coordinates, or enter them
                    manually if you know the exact location.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Fountain Image (Optional)
            </h2>

            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="image" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">
                      Click to upload an image
                    </span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Fountain preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Add Fountain"}
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
