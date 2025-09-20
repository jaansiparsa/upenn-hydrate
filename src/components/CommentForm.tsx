import React, { useState } from "react";

import type { RatingComment } from "../services/commentService";
import { 
  Bold, 
  Italic, 
  Underline, 
  Paperclip, 
  Image, 
  Smile, 
  AtSign 
} from "lucide-react";
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Comment Input Area */}
        <div className="space-y-3">
          <textarea
            id="comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add comment..."
            className="w-full p-4 bg-gray-50 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 placeholder-gray-500"
            rows={4}
            maxLength={1000}
            required
          />
          
          {/* Formatting Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Formatting Options */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </button>
                
                {/* Separator */}
                <div className="w-px h-6 bg-gray-300"></div>
                
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Add image"
                >
                  <Image className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Mention someone"
                >
                  <AtSign className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="inline-flex items-center px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
