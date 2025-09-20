import {
  ArrowLeft,
  Edit3,
  Save,
  User,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Review } from "../services/reviewService";
import { ReviewItem } from "./ReviewItem";
import { getUserReviews } from "../services/reviewService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    display_name?: string;
    email?: string;
    total_ratings: number;
    badges: string[];
    followers: string[];
    following: string[];
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle vote updates
  const handleVote = (updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  };
  const isOwnProfile = currentUser?.id === id;

  // Fetch user profile and reviews
  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) {
          if (profileError.code === "PGRST116") {
            setError("User not found");
            return;
          }
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setNewDisplayName(profileData.display_name || "");

          // Check if current user is following this profile
          if (currentUser && !isOwnProfile) {
            // We need to check if the current user's following list includes this profile
            // So we need to fetch the current user's data to check their following list
            const { data: currentUserData, error: getUserError } =
              await supabase
                .from("users")
                .select("following")
                .eq("id", currentUser.id)
                .single();

            if (getUserError) {
              console.error("Error fetching current user data:", getUserError);
              setIsFollowing(false);
            } else {
              const isCurrentlyFollowing =
                currentUserData.following?.includes(profileData.id) || false;
              console.log("Follow status check on page load:", {
                profileId: profileData.id,
                currentUserId: currentUser.id,
                currentUserFollowing: currentUserData.following,
                followingType: typeof currentUserData.following,
                followingLength: currentUserData.following?.length,
                isFollowing: isCurrentlyFollowing,
              });
              setIsFollowing(isCurrentlyFollowing);
            }
          }
        }

        // Fetch user reviews
        setReviewsLoading(true);
        const userReviews = await getUserReviews(id);
        setReviews(userReviews);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, isOwnProfile]);

  const handleUpdateDisplayName = async () => {
    if (!currentUser || !profile || !isOwnProfile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ display_name: newDisplayName })
        .eq("id", currentUser.id);

      if (error) throw error;

      setProfile((prev) =>
        prev ? { ...prev, display_name: newDisplayName } : null
      );
      setEditingName(false);
    } catch (error) {
      console.error("Error updating display name:", error);
      setError("Failed to update display name");
    } finally {
      setUpdating(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile || isOwnProfile) return;

    console.log("Follow button clicked:", {
      isFollowing,
      profileId: profile.id,
      currentUserId: currentUser.id,
      followers: profile.followers,
    });

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow: Remove current user from profile's followers and remove profile from current user's following
        // Check if actually following before attempting removal
        if (profile.followers?.includes(currentUser.id)) {
          const { error: removeFollowerError } = await supabase
            .from("users")
            .update({
              followers: profile.followers.filter(
                (followerId) => followerId !== currentUser.id
              ),
            })
            .eq("id", profile.id);

          if (removeFollowerError) throw removeFollowerError;
        }

        // Get current user's following list and remove the profile user
        const { data: currentUserData, error: getUserError } = await supabase
          .from("users")
          .select("following")
          .eq("id", currentUser.id)
          .single();

        if (getUserError) throw getUserError;

        // Check if actually following before attempting removal
        if (currentUserData.following?.includes(profile.id)) {
          const { error: removeFollowingError } = await supabase
            .from("users")
            .update({
              following: currentUserData.following.filter(
                (followingId: string) => followingId !== profile.id
              ),
            })
            .eq("id", currentUser.id);

          if (removeFollowingError) throw removeFollowingError;
        }

        setIsFollowing(false);
        console.log("Setting isFollowing to false after unfollow action");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers:
                  prev.followers?.filter(
                    (followerId) => followerId !== currentUser.id
                  ) || [],
              }
            : null
        );
      } else {
        // Follow: Add current user to profile's followers and add profile to current user's following
        // Check if already following to prevent duplicates
        if (!profile.followers?.includes(currentUser.id)) {
          console.log("Adding follower to database:", {
            profileId: profile.id,
            currentUserId: currentUser.id,
            currentFollowers: profile.followers,
            newFollowers: [...(profile.followers || []), currentUser.id],
          });

          const { error: addFollowerError } = await supabase
            .from("users")
            .update({
              followers: [...(profile.followers || []), currentUser.id],
            })
            .eq("id", profile.id);

          if (addFollowerError) {
            console.error("Error adding follower:", addFollowerError);
            throw addFollowerError;
          }

          console.log("Successfully added follower to database");
        } else {
          console.log(
            "User already in followers list, skipping database update"
          );
        }

        // Get current user's following list and add the profile user
        const { data: currentUserData, error: getUserError } = await supabase
          .from("users")
          .select("following")
          .eq("id", currentUser.id)
          .single();

        if (getUserError) throw getUserError;

        // Check if already in following list to prevent duplicates
        if (!currentUserData.following?.includes(profile.id)) {
          const { error: addFollowingError } = await supabase
            .from("users")
            .update({
              following: [...(currentUserData.following || []), profile.id],
            })
            .eq("id", currentUser.id);

          if (addFollowingError) throw addFollowingError;
        }

        setIsFollowing(true);
        console.log("Setting isFollowing to true after follow action");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers: [...(prev.followers || []), currentUser.id],
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      setError("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => {
      return (
        sum +
        (review.coldness +
          review.experience +
          review.pressure +
          review.yum_factor) /
          4
      );
    }, 0);

    return totalRating / reviews.length;
  };

  const getBadgeDisplay = (badges: string[]) => {
    if (!badges || badges.length === 0) return "No badges yet";

    const badgeMap: Record<string, string> = {
      new_reviewer: "New Reviewer",
      frequent_reviewer: "Frequent Reviewer",
      quality_reviewer: "Quality Reviewer",
      helpful_reviewer: "Helpful Reviewer",
    };

    return badges.map((badge) => badgeMap[badge] || badge).join(", ");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        </div>
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "User not found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              {editingName && isOwnProfile ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                    placeholder="Enter display name"
                  />
                  <button
                    onClick={handleUpdateDisplayName}
                    disabled={updating}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {updating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewDisplayName(profile.display_name || "");
                    }}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.display_name || "No display name set"}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditingName(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              )}
              <p className="text-gray-600 mt-1">{profile.email}</p>
            </div>
          </div>

          {/* Follow Button - Only show for other users' profiles */}
          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
                isFollowing
                  ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  : "border-transparent text-white bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {followLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {isFollowing ? "Unfollowing..." : "Following..."}
                </>
              ) : (
                <>
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {profile.total_ratings}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Badges</div>
            <div className="text-xs text-gray-500 mt-1">
              {getBadgeDisplay(profile.badges)}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isOwnProfile ? "Your Reviews" : "Reviews"}
          </h2>
          <span className="text-sm text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                showFountainInfo={true}
                onVote={handleVote}
                showComments={true}
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
              {isOwnProfile
                ? "Start reviewing fountains to see them here!"
                : "This user hasn't reviewed any fountains yet."}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
