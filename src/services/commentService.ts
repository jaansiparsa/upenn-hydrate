import { supabase } from "../lib/supabase";

export interface RatingComment {
  id: string;
  rating_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  upvotes: string[];
  downvotes: string[];
  users: {
    display_name?: string;
    email?: string;
  };
}

export interface CreateCommentData {
  rating_id: string;
  comment_text: string;
}

export interface UpdateCommentData {
  comment_text?: string;
}

// Get all comments for a specific rating
export const getRatingComments = async (
  ratingId: string
): Promise<RatingComment[]> => {
  const { data, error } = await supabase
    .from("rating_comments")
    .select("*")
    .eq("rating_id", ratingId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  // Fetch user data separately for each comment
  const commentsWithUsers = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: userData } = await supabase
        .from("users")
        .select("display_name, email")
        .eq("id", comment.user_id)
        .single();

      return {
        ...comment,
        users: userData || { display_name: null, email: null },
      };
    })
  );

  return commentsWithUsers as RatingComment[];
};

// Create a new comment
export const createComment = async (
  commentData: CreateCommentData
): Promise<RatingComment> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a comment");
  }

  const { data, error } = await supabase
    .from("rating_comments")
    .insert([
      {
        ...commentData,
        user_id: user.id,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }

  // Fetch user data separately
  const { data: userData } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", data.user_id)
    .single();

  return {
    ...data,
    users: userData || { display_name: null, email: null },
  } as RatingComment;
};

// Update an existing comment
export const updateComment = async (
  commentId: string,
  updates: UpdateCommentData
): Promise<RatingComment> => {
  const { data, error } = await supabase
    .from("rating_comments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating comment:", error);
    throw error;
  }

  // Fetch user data separately
  const { data: userData } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", data.user_id)
    .single();

  return {
    ...data,
    users: userData || { display_name: null, email: null },
  } as RatingComment;
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from("rating_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Vote on a comment
export const voteOnComment = async (
  commentId: string,
  voteType: "upvote" | "downvote" | "remove"
): Promise<RatingComment> => {
  console.log("voteOnComment called:", { commentId, voteType });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to vote");
  }

  // First, get the current comment to check existing votes
  const { data: currentComment, error: fetchError } = await supabase
    .from("rating_comments")
    .select("upvotes, downvotes")
    .eq("id", commentId)
    .single();

  if (fetchError) {
    console.error("Error fetching comment:", fetchError);
    throw fetchError;
  }

  const currentUpvotes = currentComment?.upvotes || [];
  const currentDownvotes = currentComment?.downvotes || [];
  const userId = user.id;

  let newUpvotes = [...currentUpvotes];
  let newDownvotes = [...currentDownvotes];

  // Remove user from both arrays first (in case they're switching vote types)
  newUpvotes = newUpvotes.filter((id) => id !== userId);
  newDownvotes = newDownvotes.filter((id) => id !== userId);

  // Add user to the appropriate array based on vote type
  if (voteType === "upvote") {
    newUpvotes.push(userId);
  } else if (voteType === "downvote") {
    newDownvotes.push(userId);
  }
  // If voteType is "remove", we just leave both arrays without the user

  // Update the comment with new vote arrays
  const { data, error } = await supabase
    .from("rating_comments")
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq("id", commentId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating comment votes:", error);
    throw error;
  }

  // Fetch user data separately
  const { data: userData } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", data.user_id)
    .single();

  return {
    ...data,
    users: userData || { display_name: null, email: null },
  } as RatingComment;
};
