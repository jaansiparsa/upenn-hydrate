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

// Vote on a review
export const voteOnReview = async (
  reviewId: string,
  voteType: "upvote" | "downvote" | "remove"
): Promise<Review> => {
  console.log("voteOnReview called:", { reviewId, voteType });
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Current user:", user?.id);

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // First, get the current review to check existing votes
  console.log("Fetching current review data...");
  const { data: currentReview, error: fetchError } = await supabase
    .from("ratings")
    .select("upvotes, downvotes")
    .eq("id", reviewId)
    .single();

  console.log("Current review data:", { currentReview, fetchError });

  if (fetchError) {
    console.error("Error fetching review:", fetchError);
    throw fetchError;
  }

  const currentUpvotes = currentReview?.upvotes || [];
  const currentDownvotes = currentReview?.downvotes || [];
  const userId = user.id;

  let newUpvotes = [...currentUpvotes];
  let newDownvotes = [...currentDownvotes];

  // Remove user from both arrays first (in case they're switching vote types)
  newUpvotes = newUpvotes.filter(id => id !== userId);
  newDownvotes = newDownvotes.filter(id => id !== userId);

  // Add user to the appropriate array based on vote type
  if (voteType === "upvote") {
    newUpvotes.push(userId);
  } else if (voteType === "downvote") {
    newDownvotes.push(userId);
  }
  // If voteType is "remove", we just leave both arrays without the user

  // Update the review with new vote arrays
  console.log("Updating review with votes:", { 
    reviewId, 
    newUpvotes, 
    newDownvotes, 
    userId 
  });
  
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
      )
    `
    )
    .single();

  console.log("Update result:", { data, error });

  if (error) {
    console.error("Error updating review:", error);
    throw error;
  }

  return data as Review;
};

// Get user's vote status for a review
export const getUserVoteStatus = (
  review: Review,
  userId: string
): "upvoted" | "downvoted" | "none" => {
  if (review.upvotes?.includes(userId)) return "upvoted";
  if (review.downvotes?.includes(userId)) return "downvoted";
  return "none";
};

// Subscribe to real-time updates for reviews
export const subscribeToReviews = (
  fountainId: string,
  callback: (payload: unknown) => void
) => {
  return supabase
    .channel(`ratings_changes_${fountainId}`)
    .on(
      "postgres_changes",
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
