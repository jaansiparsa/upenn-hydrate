import { Calendar, MessageCircle, Star, User, ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import type { RatingComment } from "../services/commentService";
import type { Review } from "../services/reviewService";
import { getRatingComments } from "../services/commentService";
import { useNavigate } from "react-router-dom";

interface ReviewCardProps {
  review: Review;
  user?: {
    display_name?: string;
    email?: string;
    profile_picture_url?: string;
  };
  showComments?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  user,
  showComments = false,
}) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<RatingComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
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

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const fetchedComments = await getRatingComments(review.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [review.id]);

  // Load comments when comments section is shown
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments, comments.length, loadComments]);

  const handleCommentCreated = (newComment: RatingComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const handleCommentUpdate = (updatedComment: RatingComment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/user/${review.user_id}`)}
            className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden hover:bg-blue-200 transition-colors cursor-pointer"
          >
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.display_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-3 w-3 text-blue-600" />
            )}
          </button>
          <button
            onClick={() => navigate(`/user/${review.user_id}`)}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
          >
            {getDisplayName()}
          </button>
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

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {comments.length}
              </span>
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>Most recent</option>
                <option>Oldest first</option>
                <option>Most liked</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Comment Form */}
            <CommentForm
              ratingId={review.id}
              onCommentCreated={handleCommentCreated}
            />

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading comments...
                </span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onCommentUpdate={handleCommentUpdate}
                    onCommentDelete={handleCommentDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
