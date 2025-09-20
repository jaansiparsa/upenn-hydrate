import React, { useState } from "react";

import type { RatingComment } from "../services/commentService";
import { Send } from "lucide-react";
import { createComment } from "../services/commentService";
import { useAuth } from "../contexts/AuthContext";

interface CommentFormProps {
  ratingId: string;
  onCommentCreated: (comment: RatingComment) => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  ratingId,
  onCommentCreated,
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newComment = await createComment({
        rating_id: ratingId,
        comment_text: commentText.trim(),
      });

      onCommentCreated(newComment);
      setCommentText("");
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600 text-center">
          Please sign in to leave a comment
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-4 border border-gray-200"
    >
      <div className="space-y-3">
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add a comment
          </label>
          <textarea
            id="comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts about this review..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={1000}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {commentText.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
