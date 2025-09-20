import {
  ChevronDown,
  ChevronUp,
  Edit3,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import {
  deleteComment,
  updateComment,
  voteOnComment,
} from "../services/commentService";

import type { RatingComment } from "../services/commentService";
import { useAuth } from "../contexts/AuthContext";

interface CommentCardProps {
  comment: RatingComment;
  onCommentUpdate: (updatedComment: RatingComment) => void;
  onCommentDelete: (commentId: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnComment = user?.id === comment.user_id;
  const hasUpvoted = comment.upvotes.includes(user?.id || "");
  const hasDownvoted = comment.downvotes.includes(user?.id || "");

  const handleVote = async (voteType: "upvote" | "downvote" | "remove") => {
    if (!user) return;

    setIsVoting(true);
    try {
      const updatedComment = await voteOnComment(comment.id, voteType);
      onCommentUpdate(updatedComment);
    } catch (error) {
      console.error("Error voting on comment:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === comment.comment_text) {
      setIsEditing(false);
      setEditText(comment.comment_text);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedComment = await updateComment(comment.id, {
        comment_text: editText.trim(),
      });
      onCommentUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(comment.id);
      onCommentDelete(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">
            {comment.users.display_name ||
              comment.users.email?.split("@")[0] ||
              "Anonymous"}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(comment.created_at)}
          </span>
        </div>

        {isOwnComment && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {editText.length}/1000 characters
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.comment_text);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isUpdating || !editText.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap">
          {comment.comment_text}
        </p>
      )}

      {/* Voting Section */}
      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleVote(hasUpvoted ? "remove" : "upvote")}
            disabled={isVoting}
            className={`p-1 rounded-full transition-colors ${
              hasUpvoted
                ? "text-green-600 bg-green-100"
                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
            } ${isVoting ? "opacity-50" : ""}`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
            {comment.upvotes.length}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleVote(hasDownvoted ? "remove" : "downvote")}
            disabled={isVoting}
            className={`p-1 rounded-full transition-colors ${
              hasDownvoted
                ? "text-red-600 bg-red-100"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            } ${isVoting ? "opacity-50" : ""}`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
            {comment.downvotes.length}
          </span>
        </div>
      </div>
    </div>
  );
};
