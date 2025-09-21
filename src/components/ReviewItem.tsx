import { Calendar, MessageCircle, Star } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import type { RatingComment } from "../services/commentService";
import type { Review } from "../services/reviewService";
import { getRatingComments } from "../services/commentService";
import { useNavigate } from "react-router-dom";

interface ReviewItemProps {
  review: Review;
  showFountainInfo?: boolean;
  onVote?: (updatedReview: Review) => void;
  showComments?: boolean;
  comments?: RatingComment[];
  onCommentUpdate?: (comment: RatingComment) => void;
  onCommentCreated?: (comment: RatingComment) => void;
  onCommentDelete?: (commentId: string) => void;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  showFountainInfo = false,
  showComments = false,
  comments = [],
  onCommentUpdate,
  onCommentCreated,
  onCommentDelete,
}) => {
  const navigate = useNavigate();
  const [localComments, setLocalComments] = useState<RatingComment[]>(comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(false);

  // Update local comments when props change
  useEffect(() => {
    console.log("ReviewItem: Comments prop changed:", {
      reviewId: review.id,
      commentsLength: comments.length,
      comments: comments,
    });
    setLocalComments(comments);
  }, [comments, review.id]);

  const loadComments = useCallback(async () => {
    // Only load if we don't have comments already and no comments were passed as props
    if (localComments.length > 0 || comments.length > 0) return;

    setLoadingComments(true);
    try {
      const fetchedComments = await getRatingComments(review.id);
      setLocalComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [review.id, localComments.length, comments.length]);

  // Load comments when comments section is opened
  useEffect(() => {
    if (
      showCommentsSection &&
      localComments.length === 0 &&
      comments.length === 0
    ) {
      loadComments();
    }
  }, [
    showCommentsSection,
    localComments.length,
    comments.length,
    loadComments,
  ]);

  const handleCommentCreated = (newComment: RatingComment) => {
    setLocalComments((prev) => [...prev, newComment]);
    onCommentCreated?.(newComment);
  };

  const handleCommentUpdate = (updatedComment: RatingComment) => {
    setLocalComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
    onCommentUpdate?.(updatedComment);
  };

  const handleCommentDelete = (commentId: string) => {
    setLocalComments((prev) =>
      prev.filter((comment) => comment.id !== commentId)
    );
    onCommentDelete?.(commentId);
  };

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

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowCommentsSection(!showCommentsSection)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {showCommentsSection ? "Hide" : "Show"} Comments (
                {localComments.length})
              </span>
            </button>
          </div>

          {showCommentsSection && (
            <div className="space-y-4">
              {/* Comment Form */}
              <CommentForm
                ratingId={review.id}
                onCommentCreated={handleCommentCreated}
              />

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading comments...
                  </span>
                </div>
              ) : localComments.length > 0 ? (
                <div className="space-y-3">
                  {localComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onCommentUpdate={handleCommentUpdate}
                      onCommentDelete={handleCommentDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
