import {
  ArrowLeft,
  Calendar,
  Droplets,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import {
  getPlanDateData,
  type PlanDateData,
} from "../services/planDateService";

export const PlanDate: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [planData, setPlanData] = useState<PlanDateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !user) {
      navigate("/dashboard");
      return;
    }

    loadPlanData();
  }, [userId, user, navigate]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      const data = await getPlanDateData(user.id, userId);
      setPlanData(data);
    } catch (error) {
      console.error("Error loading plan date data:", error);
      setError("Failed to load date planning data");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const formatCompatibilityScore = (score: number) => {
    const percentage = Math.round(score * 100);
    if (percentage >= 80) return `${percentage}% - Excellent Match!`;
    if (percentage >= 60) return `${percentage}% - Great Match!`;
    if (percentage >= 40) return `${percentage}% - Good Match`;
    return `${percentage}% - Decent Match`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Planning your perfect date...</p>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Plan Date
          </h2>
          <p className="text-gray-600 mb-4">{error || "No data available"}</p>
          <button
            onClick={handleBack}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Plan Your First Date
                </h1>
                <p className="text-sm text-gray-600">
                  Find the perfect hydration spot
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compatibility Score */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Hydration Compatibility
              </h2>
              <p className="text-pink-100">
                {formatCompatibilityScore(planData.compatibilityScore)}
              </p>
            </div>
            <Users className="h-12 w-12 text-pink-200" />
          </div>
        </div>

        {/* Suggested Location */}
        {planData.suggestedLocation && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-pink-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Suggested Location
              </h2>
            </div>

            <div className="bg-pink-50 rounded-lg p-6 border-2 border-pink-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {planData.suggestedLocation.fountain_name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {planData.suggestedLocation.building}, Floor{" "}
                    {planData.suggestedLocation.floor}
                  </p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700">
                      {planData.suggestedLocation.average_rating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
                <Droplets className="h-8 w-8 text-pink-600" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Why This Location?
              </h4>
              <p className="text-blue-800 text-sm">
                {planData.user1TopFountains.some(
                  (f) =>
                    f.fountain_id === planData.suggestedLocation?.fountain_id
                ) &&
                planData.user2TopFountains.some(
                  (f) =>
                    f.fountain_id === planData.suggestedLocation?.fountain_id
                )
                  ? "Both of you have rated this fountain highly - it's a mutual favorite!"
                  : "This fountain has the highest rating among your preferences - perfect for a great first impression!"}
              </p>
            </div>
          </div>
        )}

        {/* Your Top Fountains */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Top Fountains
          </h2>
          <div className="space-y-3">
            {planData.user1TopFountains.map((fountain, index) => (
              <div
                key={fountain.fountain_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-pink-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {fountain.fountain_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {fountain.building}, Floor {fountain.floor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {fountain.average_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Their Top Fountains */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Their Top Fountains
          </h2>
          <div className="space-y-3">
            {planData.user2TopFountains.map((fountain, index) => (
              <div
                key={fountain.fountain_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-purple-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {fountain.fountain_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {fountain.building}, Floor {fountain.floor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {fountain.average_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/dashboard?tab=messages&userId=${userId}`)}
            className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors flex items-center justify-center"
          >
            <Users className="h-5 w-5 mr-2" />
            Start Chatting
          </button>
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Matches
          </button>
        </div>
      </div>
    </div>
  );
};
