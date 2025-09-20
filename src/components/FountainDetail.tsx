import { ArrowLeft, Building, Layers, MapPin, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getFountain, updateFountain } from "../services/fountainService";
import { useNavigate, useParams } from "react-router-dom";

import type { Fountain } from "../services/fountainService";
import type { Review } from "../services/reviewService";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { getFountainReviews } from "../services/reviewService";

export const FountainDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fountain, setFountain] = useState<Fountain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Handle vote updates
  const handleVote = (updatedReview: Review) => {
    setReviews(prev => 
      prev.map(review => review.id === updatedReview.id ? updatedReview : review)
    );
  };

  const handleReviewSubmit = async (reviewData: {
    coldness: number;
    experience: number;
    pressure: number;
    yumFactor: number;
    comments: string;
  }) => {
    // This is now handled by the ReviewForm component directly
    // This function is kept for backward compatibility but is optional
    console.log("Review submitted:", reviewData);
    // Refresh reviews after submission
    if (id) {
      fetchReviews(id);
    }
  };

  const fetchReviews = async (fountainId: string) => {
    setReviewsLoading(true);
    try {
      const reviewsData = await getFountainReviews(fountainId);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusUpdate = async (
    newStatus: "working" | "bad_filter" | "out_of_order"
  ) => {
    if (!fountain) return;

    setStatusUpdateLoading(true);
    try {
      await updateFountain(fountain.id, {
        status: newStatus as Fountain["status"],
        last_checked: new Date().toISOString(),
      });

      // Update local state
      setFountain((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus as Fountain["status"],
              last_checked: new Date().toISOString(),
            }
          : null
      );

      // Close modal
      setShowStatusModal(false);

      // Show success message
      alert(`Fountain status updated to: ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.error("Error updating fountain status:", error);
      alert("Failed to update fountain status. Please try again.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchFountain = async () => {
      if (!id) {
        setError("No fountain ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getFountain(id);
        if (data) {
          setFountain(data);
        } else {
          setError("Fountain not found");
        }
      } catch (err) {
        console.error("Error fetching fountain:", err);
        setError("Failed to load fountain details");
      } finally {
        setLoading(false);
      }
    };

    fetchFountain();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews(id);
    }
  }, [id]);

  const getStatusColor = (status: Fountain["status"]) => {
    switch (status) {
      case "working":
        return "text-green-600 bg-green-100";
      case "bad_filter":
        return "text-yellow-600 bg-yellow-100";
      case "out_of_order":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: Fountain["type"]) => {
    return type === "indoor" ? "🏢" : "🌳";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fountain details...</p>
        </div>
      </div>
    );
  }

  if (error || !fountain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <MapPin className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fountain Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The fountain you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </button>
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
              onClick={() => navigate("/")}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Map
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Hydrate</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Fountain Details (Sticky) */}
          <div className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Image Section */}
                {fountain.image_url ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={fountain.image_url}
                      alt={fountain.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : imagePreview ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={imagePreview}
                      alt="Fountain preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <label
                        htmlFor="fountain-image"
                        className="cursor-pointer"
                      >
                        <span className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                          Have a photo?
                        </span>
                        <input
                          id="fountain-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a photo of this fountain
                      </p>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {fountain.name}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-1">
                        <Building className="h-4 w-4 mr-2" />
                        <span className="font-medium text-sm">
                          {fountain.building}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Layers className="h-4 w-4 mr-2" />
                        <span className="text-sm">Floor: {fountain.floor}</span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        fountain.status
                      )}`}
                    >
                      <span className="mr-1">{getTypeIcon(fountain.type)}</span>
                      {fountain.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Description */}
                  {fountain.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        Description
                      </h3>
                      <p className="text-sm text-gray-600">
                        {fountain.description}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {/* Location Details */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lat:</span>
                          <span className="font-mono">{fountain.latitude}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lng:</span>
                          <span className="font-mono">
                            {fountain.longitude}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Details */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        Info
                      </h3>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="capitalize">{fountain.type}</span>
                        </div>
                        {fountain.last_checked && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Checked:</span>
                            <span>
                              {new Date(
                                fountain.last_checked
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Added:</span>
                          <span>
                            {new Date(
                              fountain.created_at || ""
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View on Map
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${fountain.latitude},${fountain.longitude}`;
                        window.open(url, "_blank");
                      }}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Review Form and Reviews */}
          <div className="flex-1 min-w-0">
            {/* Review Form */}
            <div className="mb-8">
              <ReviewForm
                fountainId={fountain.id}
                onSubmit={handleReviewSubmit}
              />
            </div>

            {/* Reviews Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reviews ({reviews.length})
              </h2>
              <p className="text-gray-600">
                See what other users think about this fountain
              </p>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading reviews...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    showFountainInfo={false}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-500">
                  Be the first to review this fountain!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Update Fountain Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Select the current status of this fountain:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleStatusUpdate("working")}
                disabled={statusUpdateLoading}
                className="w-full flex items-center justify-between p-3 border border-green-300 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-green-700">Working</span>
                </div>
                <span className="text-sm text-green-600">
                  Fountain is functioning properly
                </span>
              </button>

              <button
                onClick={() => handleStatusUpdate("bad_filter")}
                disabled={statusUpdateLoading}
                className="w-full flex items-center justify-between p-3 border border-yellow-300 rounded-lg hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-yellow-700">
                    Bad Filter
                  </span>
                </div>
                <span className="text-sm text-yellow-600">
                  Water quality issues, filter needs replacement
                </span>
              </button>

              <button
                onClick={() => handleStatusUpdate("out_of_order")}
                disabled={statusUpdateLoading}
                className="w-full flex items-center justify-between p-3 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-red-700">Out of Order</span>
                </div>
                <span className="text-sm text-red-600">
                  Fountain is not working
                </span>
              </button>
            </div>

            {statusUpdateLoading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Updating status...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
