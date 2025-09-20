import { Calendar, Star } from "lucide-react";

import React from "react";
import type { Review } from "../services/reviewService";
import { useNavigate } from "react-router-dom";

interface ReviewItemProps {
  review: Review;
  showFountainInfo?: boolean;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  showFountainInfo = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/user/${review.user_id}`)}
            className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium text-blue-600">
              {review.users?.display_name?.charAt(0) ||
                review.users?.email?.charAt(0) ||
                "U"}
            </span>
          </button>
          <div>
            <button
              onClick={() => navigate(`/user/${review.user_id}`)}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {review.users?.display_name ||
                review.users?.email ||
                "Anonymous User"}
            </button>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(review.created_at || "").toLocaleDateString()}
              </span>
              {showFountainInfo && review.fountains && (
                <>
                  <span>•</span>
                  <span>
                    {review.fountains.name} - {review.fountains.building}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-700">
            {(
              (review.coldness +
                review.experience +
                review.pressure +
                review.yum_factor) /
              4
            ).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Review Content - Inline without nested box */}
      <div className="space-y-3">
        {/* Rating Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 w-20">
              Coldness:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.coldness
                      ? "text-blue-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 w-20">
              Experience:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.experience
                      ? "text-blue-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 w-20">
              Pressure:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.pressure
                      ? "text-blue-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 w-20">
              Yum Factor:
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.yum_factor
                      ? "text-blue-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
              {review.comment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
