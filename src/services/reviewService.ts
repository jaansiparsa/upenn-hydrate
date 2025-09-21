import { checkReviewBasedBadges } from "./badgeService";
import { supabase } from "../lib/supabase";

export interface Review {
  id: string;
  fountain_id: string;
  user_id: string;
  coldness: number;
  experience: number;
  pressure: number;
  yum_factor: number;
  comment?: string;
  created_at?: string;
  upvotes?: string[];
  downvotes?: string[];
  users?: {
    display_name?: string;
    email?: string;
    profile_picture_url?: string;
  };
  fountains?: {
    name: string;
    building: string;
    floor: string;
  };
}

export interface CreateReviewData {
  fountain_id: string;
  coldness: number;
  experience: number;
  pressure: number;
  yum_factor: number;
  comment?: string;
}

export interface UpdateReviewData {
  coldness?: number;
  experience?: number;
  pressure?: number;
  yum_factor?: number;
  comment?: string;
}

// Fetch all reviews for a specific fountain with user information
export const getFountainReviews = async (
  fountainId: string
): Promise<Review[]> => {
  const { data, error } = await supabase
    .from("ratings")
    .select(
      `
      *,
      users:user_id (
        display_name,
        email,
        profile_picture_url
      )
    `
    )
    .eq("fountain_id", fountainId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching fountain reviews:", error);
    throw error;
  }
  return data as Review[];
};

// Fetch all reviews by a specific user
export const getUserReviews = async (userId: string): Promise<Review[]> => {
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
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
  return data as Review[];
};

// Fetch a user's review for a specific fountain
export const getUserReview = async (
  fountainId: string,
  userId: string
): Promise<Review | null> => {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("fountain_id", fountainId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No review found
      return null;
    }
    console.error("Error fetching user review:", error);
    throw error;
  }
  return data as Review;
};

// Create a new review
export const createReview = async (
  reviewData: CreateReviewData
): Promise<Review> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a review");
  }

  // First, ensure the user exists in the users table
  const { error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (userError && userError.code !== "PGRST116") {
    console.error("Error checking user:", userError);
    throw new Error("User not found in users table");
  }

  // If user doesn't exist in users table, create them
  if (userError && userError.code === "PGRST116") {
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: user.id,
        email: user.email || "",
        penn_email: user.email || "",
        display_name:
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          "User",
      },
    ]);

    if (insertError) {
      console.error("Error creating user:", insertError);
      throw new Error("Failed to create user profile");
    }
  }

  // Check if user already has a review for this fountain
  const { data: existingReview } = await supabase
    .from("ratings")
    .select("id")
    .eq("fountain_id", reviewData.fountain_id)
    .eq("user_id", user.id)
    .single();

  if (existingReview) {
    throw new Error(
      "User already has a review for this fountain. Use updateReview instead."
    );
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert([
      {
        ...reviewData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    console.error("Review data:", reviewData);
    console.error("User ID:", user.id);
    throw error;
  }

  // Check and award badges after successful review creation
  try {
    const newBadges = await checkReviewBasedBadges(user.id, {
      review_id: data.id,
      ...reviewData,
    });

    if (newBadges.length > 0) {
      console.log("New badges earned:", newBadges);
    }
  } catch (badgeError) {
    console.error("Error checking badges after review creation:", badgeError);
    // Don't throw here - review creation was successful
  }

  return data as Review;
};

// Update an existing review
export const updateReview = async (
  reviewId: string,
  updates: UpdateReviewData
): Promise<Review> => {
  const { data, error } = await supabase
    .from("ratings")
    .update(updates)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating review:", error);
    throw error;
  }
  return data as Review;
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const { error } = await supabase.from("ratings").delete().eq("id", reviewId);

  if (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

// Subscribe to real-time updates for reviews
export const subscribeToReviews = (
  fountainId: string,
  callback: (payload: unknown) => void
) => {
  return supabase
    .channel(`ratings_changes_${fountainId}`)
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "ratings",
        filter: `fountain_id=eq.${fountainId}`,
      },
      callback
    )
    .subscribe();
};

// Voting functions
export const upvoteRating = async (ratingId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Get current rating to check existing votes
  const { data: rating, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", ratingId)
    .single();

  if (fetchError) {
    console.error("Error fetching rating:", fetchError);
    throw new Error("Failed to fetch rating");
  }

  const currentUpvotes = rating.upvotes || [];
  const currentDownvotes = rating.downvotes || [];

  // Remove user from downvotes if they were there
  const newDownvotes = currentDownvotes.filter((id: string) => id !== user.id);

  // Add user to upvotes if not already there
  const newUpvotes = currentUpvotes.includes(user.id)
    ? currentUpvotes.filter((id: string) => id !== user.id) // Remove if already upvoted
    : [...currentUpvotes, user.id]; // Add if not upvoted

  const { error } = await supabase
    .from("ratings")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", ratingId);

  if (error) {
    console.error("Error upvoting rating:", error);
    throw new Error("Failed to upvote rating");
  }
};

export const downvoteRating = async (ratingId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Get current rating to check existing votes
  const { data: rating, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", ratingId)
    .single();

  if (fetchError) {
    console.error("Error fetching rating:", fetchError);
    throw new Error("Failed to fetch rating");
  }

  const currentUpvotes = rating.upvotes || [];
  const currentDownvotes = rating.downvotes || [];

  // Remove user from upvotes if they were there
  const newUpvotes = currentUpvotes.filter((id: string) => id !== user.id);

  // Add user to downvotes if not already there
  const newDownvotes = currentDownvotes.includes(user.id)
    ? currentDownvotes.filter((id: string) => id !== user.id) // Remove if already downvoted
    : [...currentDownvotes, user.id]; // Add if not downvoted

  const { error } = await supabase
    .from("ratings")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", ratingId);

  if (error) {
    console.error("Error downvoting rating:", error);
    throw new Error("Failed to downvote rating");
  }
};

export const removeVote = async (ratingId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Get current rating to check existing votes
  const { data: rating, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", ratingId)
    .single();

  if (fetchError) {
    console.error("Error fetching rating:", fetchError);
    throw new Error("Failed to fetch rating");
  }

  const currentUpvotes = rating.upvotes || [];
  const currentDownvotes = rating.downvotes || [];

  // Remove user from both upvotes and downvotes
  const newUpvotes = currentUpvotes.filter((id: string) => id !== user.id);
  const newDownvotes = currentDownvotes.filter((id: string) => id !== user.id);

  const { error } = await supabase
    .from("ratings")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", ratingId);

  if (error) {
    console.error("Error removing vote:", error);
    throw new Error("Failed to remove vote");
  }
};

export const getUserVoteStatus = async (
  ratingId: string
): Promise<"upvoted" | "downvoted" | "none"> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "none";
  }

  const { data: rating, error } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", ratingId)
    .single();

  if (error) {
    console.error("Error fetching rating:", error);
    return "none";
  }

  const upvotes = rating.upvotes || [];
  const downvotes = rating.downvotes || [];

  if (upvotes.includes(user.id)) {
    return "upvoted";
  } else if (downvotes.includes(user.id)) {
    return "downvoted";
  } else {
    return "none";
  }
};

// Test function to check ratings table access
export const testRatingsTable = async (): Promise<void> => {
  console.log("Testing ratings table access...");

  try {
    // Try a simple query first
    const { data, error } = await supabase
      .from("ratings")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Ratings table test failed:", error);
      throw error;
    }

    console.log("Ratings table test successful:", data);
  } catch (error) {
    console.error("Error testing ratings table:", error);
    throw error;
  }
};

// Voting functions
export const upvoteReview = async (reviewId: string): Promise<Review> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Get current review data
  const { data: review, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", reviewId)
    .single();

  if (fetchError) {
    console.error("Error fetching review:", fetchError);
    throw fetchError;
  }

  const currentUpvotes = review.upvotes || [];
  const currentDownvotes = review.downvotes || [];

  // Check if user already upvoted
  if (currentUpvotes.includes(user.id)) {
    // Remove upvote
    const newUpvotes = currentUpvotes.filter((id: string) => id !== user.id);
    const { data, error } = await supabase
      .from("ratings")
      .update({ upvotes: newUpvotes })
      .eq("id", reviewId)
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
      .single();

    if (error) {
      console.error("Error removing upvote:", error);
      throw error;
    }

    return data as Review;
  }

  // Check if user downvoted, remove from downvotes first
  let newDownvotes = currentDownvotes;
  if (currentDownvotes.includes(user.id)) {
    newDownvotes = currentDownvotes.filter((id: string) => id !== user.id);
  }

  // Add upvote
  const newUpvotes = [...currentUpvotes, user.id];

  const { data, error } = await supabase
    .from("ratings")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", reviewId)
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
    .single();

  if (error) {
    console.error("Error adding upvote:", error);
    throw error;
  }

  return data as Review;
};

export const downvoteReview = async (reviewId: string): Promise<Review> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // Get current review data
  const { data: review, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", reviewId)
    .single();

  if (fetchError) {
    console.error("Error fetching review:", fetchError);
    throw fetchError;
  }

  const currentUpvotes = review.upvotes || [];
  const currentDownvotes = review.downvotes || [];

  // Check if user already downvoted
  if (currentDownvotes.includes(user.id)) {
    // Remove downvote
    const newDownvotes = currentDownvotes.filter(
      (id: string) => id !== user.id
    );
    const { data, error } = await supabase
      .from("ratings")
      .update({ downvotes: newDownvotes })
      .eq("id", reviewId)
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
      .single();

    if (error) {
      console.error("Error removing downvote:", error);
      throw error;
    }

    return data as Review;
  }

  // Check if user upvoted, remove from upvotes first
  let newUpvotes = currentUpvotes;
  if (currentUpvotes.includes(user.id)) {
    newUpvotes = currentUpvotes.filter((id: string) => id !== user.id);
  }

  // Add downvote
  const newDownvotes = [...currentDownvotes, user.id];

  const { data, error } = await supabase
    .from("ratings")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", reviewId)
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
    .single();

  if (error) {
    console.error("Error adding downvote:", error);
    throw error;
  }

  return data as Review;
};
