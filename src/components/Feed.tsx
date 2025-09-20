import { Globe, RefreshCw, Rss, UserCheck } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { RatingComment } from "../services/commentService";
import type { Review } from "../services/reviewService";
import { ReviewItem } from "./ReviewItem";
import { getRatingComments } from "../services/commentService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

type FilterType = "all" | "following";

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [commentsMap, setCommentsMap] = useState<
    Record<string, RatingComment[]>
  >({});

  // Load comments for all reviews
  const loadCommentsForReviews = async (reviewsToLoad: Review[]) => {
    if (reviewsToLoad.length === 0) return;

    try {
      const commentsPromises = reviewsToLoad.map(async (review) => {
        try {
          const comments = await getRatingComments(review.id);
          return { reviewId: review.id, comments };
        } catch (error) {
          console.error(
            `Error loading comments for review ${review.id}:`,
            error
          );
          return { reviewId: review.id, comments: [] };
        }
      });

      const commentsResults = await Promise.all(commentsPromises);

      const newCommentsMap: Record<string, RatingComment[]> = {};
      commentsResults.forEach(({ reviewId, comments }) => {
        newCommentsMap[reviewId] = comments;
      });

      setCommentsMap((prev) => ({ ...prev, ...newCommentsMap }));
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Handle comment updates
  const handleCommentUpdate = (
    reviewId: string,
    updatedComment: RatingComment
  ) => {
    setCommentsMap((prev) => ({
      ...prev,
      [reviewId]:
        prev[reviewId]?.map((comment) =>
          comment.id === updatedComment.id ? updatedComment : comment
        ) || [],
    }));
  };

  const handleCommentCreated = (
    reviewId: string,
    newComment: RatingComment
  ) => {
    setCommentsMap((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newComment],
    }));
  };

  const handleCommentDelete = (reviewId: string, commentId: string) => {
    setCommentsMap((prev) => ({
      ...prev,
      [reviewId]:
        prev[reviewId]?.filter((comment) => comment.id !== commentId) || [],
    }));
  };

  // Handle vote updates
  const handleVote = (updatedReview: Review) => {
    // Update the review in both allReviews and filtered reviews
    setAllReviews((prev) =>
      prev.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    setReviews((prev) =>
      prev.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  };

  // Fetch user's following list
  const fetchFollowingUsers = async () => {
    if (!user) return;

    try {
      setLoadingFollowing(true);
      const { data, error } = await supabase
        .from("users")
        .select("following")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setFollowingUsers(data?.following || []);
    } catch (error) {
      console.error("Error fetching following users:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Filter reviews based on current filter
  const filterReviews = (reviews: Review[], filterType: FilterType) => {
    switch (filterType) {
      case "following":
        return reviews.filter((review) =>
          followingUsers.includes(review.user_id)
        );
      case "all":
      default:
        return reviews;
    }
  };

  // Fetch all reviews
  const fetchAllReviews = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("ratings")
        .select(
          `
          *,
          users:user_id (
            display_name,
            email,
            profile_picture_url
          ),
          fountains:fountain_id (
            name,
            building,
            floor
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      const reviewsData = data as Review[];
      setAllReviews(reviewsData);
      setReviews(filterReviews(reviewsData, filter));

      // Load comments for all reviews
      loadCommentsForReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  // Update reviews when filter changes
  useEffect(() => {
    if (allReviews.length > 0) {
      setReviews(filterReviews(allReviews, filter));
    }
  }, [filter, allReviews, followingUsers]);

  // Refresh function for manual refresh
  const refreshFeed = async () => {
    await fetchAllReviews();
    if (user) {
      await fetchFollowingUsers();
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllReviews();
    if (user) {
      fetchFollowingUsers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Rss className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Feed</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Rss className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Feed</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Feed
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Rss className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Feed</h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filter === "all"
              ? `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
              : `${reviews.length} of ${allReviews.length} review${
                  allReviews.length !== 1 ? "s" : ""
                }`}
          </span>
          <button
            onClick={refreshFeed}
            disabled={loading}
            className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <Globe className="h-4 w-4 mr-2" />
            All Reviews
          </button>

          {user && (
            <button
              onClick={() => setFilter("following")}
              disabled={loadingFollowing}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                filter === "following"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Following
              {loadingFollowing && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-2"></div>
              )}
            </button>
          )}
        </div>

        {/* Filter Description */}
        <div className="mt-2 text-xs text-gray-500">
          {filter === "all" && "Showing all reviews from all users"}
          {filter === "following" &&
            user &&
            `Showing reviews from ${followingUsers.length} users you follow`}
          {filter === "following" &&
            !user &&
            "Please sign in to see reviews from users you follow"}
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              showFountainInfo={true}
              onVote={handleVote}
              showComments={true}
              comments={commentsMap[review.id] || []}
              onCommentUpdate={(comment) =>
                handleCommentUpdate(review.id, comment)
              }
              onCommentCreated={(comment) =>
                handleCommentCreated(review.id, comment)
              }
              onCommentDelete={(commentId) =>
                handleCommentDelete(review.id, commentId)
              }
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
            {filter === "following" && user
              ? "No reviews from people you follow"
              : filter === "following" && !user
              ? "Sign in to see reviews from people you follow"
              : "No reviews yet"}
          </h3>
          <p className="text-gray-500">
            {filter === "following" && user
              ? "Follow some users to see their reviews here, or try switching to 'All Reviews'"
              : filter === "following" && !user
              ? "Please sign in to see reviews from users you follow"
              : "Be the first to review a water fountain!"}
          </p>
        </div>
      )}
    </div>
  );
};
