import React, { useEffect, useState } from "react";
import {
  createReview,
  getUserReview,
  subscribeToReviews,
  updateReview,
} from "../services/reviewService";

import type { Review } from "../services/reviewService";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

// Type for Supabase real-time payload
interface SupabaseRealtimePayload {
  new?: Review;
  old?: Review;
  eventType?: string;
}

interface ReviewFormProps {
  fountainId: string;
  onSubmit?: (review: ReviewData) => void;
}

interface ReviewData {
  coldness: number;
  experience: number;
  pressure: number;
  yumFactor: number;
  comments: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  fountainId,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ReviewData>({
    coldness: 0,
    experience: 0,
    pressure: 0,
    yumFactor: 0,
    comments: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing review when component mounts
  useEffect(() => {
    const loadExistingReview = async () => {
      if (!user) return;

      try {
        const review = await getUserReview(fountainId, user.id);
        if (review) {
          setExistingReview(review);
          setFormData({
            coldness: review.coldness,
            experience: review.experience,
            pressure: review.pressure,
            yumFactor: review.yum_factor,
            comments: review.comment || "",
          });
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading existing review:", error);
      }
    };

    loadExistingReview();
  }, [fountainId, user]);

  // Set up real-time subscription for reviews
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToReviews(fountainId, (payload) => {
      console.log("Real-time review update:", payload);
      // Reload the review if it's the current user's review
      const typedPayload = payload as SupabaseRealtimePayload;
      if (typedPayload.new && typedPayload.new.user_id === user.id) {
        setExistingReview(typedPayload.new);
        setFormData({
          coldness: typedPayload.new.coldness,
          experience: typedPayload.new.experience,
          pressure: typedPayload.new.pressure,
          yumFactor: typedPayload.new.yum_factor,
          comments: typedPayload.new.comment || "",
        });
        setIsEditing(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fountainId, user]);

  const handleRatingChange = (field: keyof ReviewData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      comments: e.target.value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.coldness === 0) newErrors.coldness = "Please rate coldness";
    if (formData.experience === 0)
      newErrors.experience = "Please rate experience";
    if (formData.pressure === 0) newErrors.pressure = "Please rate pressure";
    if (formData.yumFactor === 0)
      newErrors.yumFactor = "Please rate yum factor";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) {
      setErrors({ submit: "You must be logged in to submit a review." });
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        fountain_id: fountainId,
        coldness: formData.coldness,
        experience: formData.experience,
        pressure: formData.pressure,
        yum_factor: formData.yumFactor,
        comment: formData.comments || undefined,
      };

      let savedReview: Review;

      if (isEditing && existingReview) {
        // Update existing review
        savedReview = await updateReview(existingReview.id, {
          coldness: reviewData.coldness,
          experience: reviewData.experience,
          pressure: reviewData.pressure,
          yum_factor: reviewData.yum_factor,
          comment: reviewData.comment,
        });
      } else {
        // Create new review
        savedReview = await createReview(reviewData);
      }

      // Update local state
      setExistingReview(savedReview);
      setIsEditing(true);

      // Check for new badges after review creation/update
      if (!isEditing) {
        try {
          const { checkReviewBasedBadges } = await import(
            "../services/badgeService"
          );
          const newBadges = await checkReviewBasedBadges(user.id, {
            review_id: savedReview.id,
            ...reviewData,
          });

          // Show badge notifications
          if (newBadges.length > 0) {
            console.log("New badges earned:", newBadges);
            newBadges.forEach((badgeName) => {
              toast.success("🎉 New Badge Earned!", {
                description: `You've earned the "${badgeName}" badge!`,
                duration: 5000,
              });
            });
          }
        } catch (error) {
          console.error("Error checking badges:", error);
        }
      }

      // Show success toast
      toast.success(
        isEditing ? "Review Updated Successfully!" : "Review Posted Successfully!",
        {
          description: isEditing 
            ? "Your review has been updated." 
            : "Thank you for sharing your experience!",
          duration: 3000,
        }
      );

      // Call optional onSubmit callback
      if (onSubmit) {
        onSubmit(formData);
      }

    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit review. Please try again.";

      // Handle specific error cases
      if (errorMessage.includes("already has a review")) {
        // User already has a review, switch to edit mode
        setIsEditing(true);
        setErrors({
          submit:
            "You already have a review for this fountain. Your changes will be saved.",
        });
        toast.info("Review Already Exists", {
          description: "You already have a review for this fountain. Your changes will be saved.",
          duration: 4000,
        });
      } else {
        setErrors({ submit: errorMessage });
        toast.error("Failed to Submit Review", {
          description: errorMessage,
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
    error?: string;
  }> = ({ value, onChange, label, error }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}{" "}
        {value > 0 && <span className="text-blue-600">({value}/5)</span>}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded ${
              star <= value
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Rate This Fountain
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Fields - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StarRating
            value={formData.coldness}
            onChange={(value) => handleRatingChange("coldness", value)}
            label="Coldness"
            error={errors.coldness}
          />

          <StarRating
            value={formData.experience}
            onChange={(value) => handleRatingChange("experience", value)}
            label="Experience"
            error={errors.experience}
          />

          <StarRating
            value={formData.pressure}
            onChange={(value) => handleRatingChange("pressure", value)}
            label="Pressure"
            error={errors.pressure}
          />

          <StarRating
            value={formData.yumFactor}
            onChange={(value) => handleRatingChange("yumFactor", value)}
            label="Yum Factor"
            error={errors.yumFactor}
          />
        </div>

        {/* Comments */}
        <div>
          <label
            htmlFor="comments"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            value={formData.comments}
            onChange={handleCommentsChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this fountain..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading
            ? isEditing
              ? "Saving..."
              : "Submitting..."
            : isEditing
            ? "Save Review"
            : "Submit Review"}
        </button>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
      </form>
    </div>
  );
};
