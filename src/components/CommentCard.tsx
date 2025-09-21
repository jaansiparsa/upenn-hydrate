import {
  Check,
  Edit3,
  MoreHorizontal,
  Reply,
  ThumbsDown,
  ThumbsUp,
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  // Generate avatar initials
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    comment.users.display_name ||
    comment.users.email?.split("@")[0] ||
    "Anonymous";

  return (
    <div className="flex space-x-3 py-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getAvatarInitials(displayName)}
        </div>
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-1">
          <button
            onClick={() => navigate(`/user/${comment.user_id}`)}
            className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors cursor-pointer"
          >
            {displayName}
          </button>
          <span className="text-gray-500 text-sm">
            {formatDate(comment.created_at)}
          </span>
          {/* Verified badge for certain users (you can customize this logic) */}
          {displayName === "Skill Sprout" && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Comment Text */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={isUpdating || !editText.trim()}
                  className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 text-sm leading-relaxed mb-3">
            {comment.comment_text}
          </p>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleVote(hasUpvoted ? "remove" : "upvote")}
            disabled={isVoting}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              hasUpvoted
                ? "text-primary-500"
                : "text-gray-500 hover:text-primary-500"
            } ${isVoting ? "opacity-50" : ""}`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="font-medium">{comment.upvotes.length}</span>
          </button>

          <button
            onClick={() => handleVote(hasDownvoted ? "remove" : "downvote")}
            disabled={isVoting}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              hasDownvoted ? "text-red-500" : "text-gray-500 hover:text-red-500"
            } ${isVoting ? "opacity-50" : ""}`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="font-medium">{comment.downvotes.length}</span>
          </button>

          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Reply className="h-4 w-4" />
            <span>Reply</span>
          </button>

          {isOwnComment && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
      </div>
    </div>
  );
};
