import { Calendar, Star, User } from "lucide-react";

import React from "react";
import type { Review } from "../services/reviewService";

interface ReviewCardProps {
  review: Review;
  user?: {
    display_name?: string;
    email?: string;
    profile_picture_url?: string;
  };
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, user }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getDisplayName = () => {
    if (user?.display_name) return user.display_name;
    if (user?.email) return user.email.split("@")[0];
    return "Anonymous User";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.display_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-3 w-3 text-blue-600" />
            )}
          </div>
          <span className="font-medium text-gray-900">{getDisplayName()}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(review.created_at)}</span>
        </div>
      </div>

      {/* Ratings Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Coldness</span>
          <div className="flex items-center space-x-1">
            {renderStars(review.coldness)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Experience</span>
          <div className="flex items-center space-x-1">
            {renderStars(review.experience)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Pressure</span>
          <div className="flex items-center space-x-1">
            {renderStars(review.pressure)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Yum Factor</span>
          <div className="flex items-center space-x-1">
            {renderStars(review.yum_factor)}
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            "{review.comment}"
          </p>
        </div>
      )}
    </div>
  );
};
