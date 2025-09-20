import { Calendar, Edit3, Save, Star, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { Review } from "../services/reviewService";
import { ReviewCard } from "./ReviewCard";
import { getUserReviews } from "../services/reviewService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    display_name?: string;
    email?: string;
    total_ratings: number;
    badges: string[];
    profile_picture_url?: string;
  } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and reviews
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setNewDisplayName(profileData.display_name || "");
        } else {
          // Create user profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert([
              {
                id: user.id,
                email: user.email || "",
                penn_email: user.email || "",
                display_name:
                  user.user_metadata?.display_name ||
                  user.email?.split("@")[0] ||
                  "User",
                total_ratings: 0,
                badges: [],
              },
            ])
            .select()
            .single();

          if (createError) throw createError;

          setProfile(newProfile);
          setNewDisplayName(newProfile.display_name || "");
        }

        // Fetch user reviews
        setReviewsLoading(true);
        const userReviews = await getUserReviews(user.id);
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
  }, [user]);

  const handleUpdateDisplayName = async () => {
    if (!user || !profile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ display_name: newDisplayName })
        .eq("id", user.id);

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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No profile found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Unable to load your profile information.
        </p>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              {editingName ? (
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
                  <button
                    onClick={() => setEditingName(true)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                </div>
              )}
              <p className="text-gray-600 mt-1">{profile.email}</p>
            </div>
          </div>
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
          <h2 className="text-xl font-bold text-gray-900">Your Reviews</h2>
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
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(review.created_at || "").toLocaleDateString()}
                    </span>
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
                <ReviewCard review={review} user={review.users} />
              </div>
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
              Start reviewing fountains to see them here!
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
