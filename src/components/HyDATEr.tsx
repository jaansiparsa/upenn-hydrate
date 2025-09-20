import { Calendar, Heart, MessageCircle, User, Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import type { Match } from "../services/datingService";
import { getUserMatches } from "../services/datingService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HyDATErProps {
  onStartMessage?: (userId: string, userName?: string) => void;
}

export const HyDATEr: React.FC<HyDATErProps> = ({ onStartMessage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userMatches = await getUserMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error("Error loading matches:", error);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user, loadMatches]);

  const handlePlanDate = (userId: string) => {
    navigate(`/plan-date/${userId}`);
  };

  const formatCompatibilityScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    if (score >= 0.4) return "text-orange-600";
    return "text-red-600";
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 0.8) return "Excellent Match";
    if (score >= 0.6) return "Good Match";
    if (score >= 0.4) return "Fair Match";
    return "Low Match";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">Loading matches...</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No matches yet
        </h3>
        <p className="text-gray-500 mb-4">
          Keep reviewing fountains to find your perfect hydration match!
        </p>
        <p className="text-sm text-gray-400">
          Matches are based on how similarly you rate water fountains with other
          users.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <Heart className="mx-auto h-12 w-12 text-pink-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">hyDATEr</h1>
        <p className="text-gray-600 mt-2">
          Find your perfect hydration match based on fountain preferences!
        </p>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <div
            key={match.user_id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {match.display_name || "Anonymous User"}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {match.total_ratings} fountain reviews
                  </p>
                  {match.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.badges.map((badge) => (
                        <span
                          key={badge}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {badge.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${getCompatibilityColor(
                    match.compatibility_score
                  )}`}
                >
                  {formatCompatibilityScore(match.compatibility_score)}
                </div>
                <div className="text-sm text-gray-600">
                  {getCompatibilityLabel(match.compatibility_score)}
                </div>
              </div>
            </div>

            {/* Compatibility Breakdown */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Compatibility Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Rating Correlation:
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      match.compatibility_breakdown.correlation_score * 100
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Rating Similarity:
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      match.compatibility_breakdown.weighted_similarity_score *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Shared Fountains:
                  </span>
                  <span className="text-sm font-medium">
                    {match.shared_fountains_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className="text-sm font-medium">
                    {Math.round(match.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors flex items-center justify-center">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </button>
              <button
                onClick={() =>
                  onStartMessage?.(match.user_id, match.display_name)
                }
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </button>
              <button
                onClick={() => handlePlanDate(match.user_id)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Plan First Date
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
