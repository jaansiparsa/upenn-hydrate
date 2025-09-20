import { Calendar, Star, ThumbsUp, ThumbsDown } from "lucide-react";

import React, { useState } from "react";
import type { Review } from "../services/reviewService";
import { voteOnReview, getUserVoteStatus } from "../services/reviewService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ReviewItemProps {
  review: Review;
  showFountainInfo?: boolean;
  onVote?: (updatedReview: Review) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  showFountainInfo = false,
  onVote,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);

  const upvotes = review.upvotes?.length || 0;
  const downvotes = review.downvotes?.length || 0;
  const userVoteStatus = user ? getUserVoteStatus(review, user.id) : "none";

  const handleVote = async (voteType: "upvote" | "downvote" | "remove") => {
    console.log("Vote attempt:", { voteType, user: user?.id, reviewId: review.id });
    
    if (!user) {
      console.log("No user found, showing alert");
      alert("Please sign in to vote on reviews");
      return;
    }

    if (voting) {
      console.log("Already voting, ignoring");
      return;
    }

    console.log("Starting vote process...");
    setVoting(true);
    try {
      const updatedReview = await voteOnReview(review.id, voteType);
      console.log("Vote successful:", updatedReview);
      if (onVote) {
        onVote(updatedReview);
      }
    } catch (error) {
      console.error("Error voting on review:", error);
      alert("Failed to vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  const handleUpvote = () => {
    if (userVoteStatus === "upvoted") {
      handleVote("remove");
    } else {
      handleVote("upvote");
    }
  };

  const handleDownvote = () => {
    if (userVoteStatus === "downvoted") {
      handleVote("remove");
    } else {
      handleVote("downvote");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Review Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/user/${review.user_id}`)}
            className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer overflow-hidden"
          >
            {review.users?.profile_picture_url ? (
              <img
                src={review.users.profile_picture_url}
                alt={review.users?.display_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-blue-600">
                {review.users?.display_name?.charAt(0) ||
                  review.users?.email?.charAt(0) ||
                  "U"}
              </span>
            )}
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

        {/* Voting Section */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              disabled={voting || !user}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userVoteStatus === "upvoted"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{upvotes}</span>
            </button>
            
            <button
              onClick={handleDownvote}
              disabled={voting || !user}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userVoteStatus === "downvoted"
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{downvotes}</span>
            </button>
          </div>
          
          {voting && (
            <div className="flex items-center text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
              Voting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
