import { MessageCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { Conversation } from "../services/messagingService";
import { getConversations } from "../services/messagingService";
import { useNavigate } from "react-router-dom";

interface MessageListProps {
  onSelectConversation: (userId: string, userName?: string, profilePictureUrl?: string) => void;
  selectedUserId?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  onSelectConversation,
  selectedUserId,
}) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const userConversations = await getConversations();
      setConversations(userConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessage = (message: Conversation["last_message"]) => {
    if (!message) return "No messages yet";

    const content = message.content;
    if (content.length > 50) {
      return content.substring(0, 50) + "...";
    }
    return content;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadConversations}
          className="mt-2 text-pink-600 hover:text-pink-700 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-500">
          Start a conversation with someone from your matches!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.user_id}
          onClick={() =>
            onSelectConversation(
              conversation.user_id,
              conversation.display_name,
              conversation.profile_picture_url
            )
          }
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedUserId === conversation.user_id
              ? "bg-pink-100 border-2 border-pink-300"
              : "bg-white hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {conversation.profile_picture_url ? (
                <img
                  src={conversation.profile_picture_url}
                  alt={conversation.display_name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-pink-600">
                  {conversation.display_name?.charAt(0) ||
                    conversation.email?.charAt(0) ||
                    "U"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${conversation.user_id}`);
                  }}
                  className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer text-left"
                >
                  {conversation.display_name || "Anonymous User"}
                </button>
                {conversation.last_message && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(conversation.last_message.created_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {formatLastMessage(conversation.last_message)}
                </p>
                {conversation.unread_count > 0 && (
                  <span className="bg-pink-600 text-white text-xs rounded-full px-2 py-1 flex-shrink-0 ml-2">
                    {conversation.unread_count}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {conversation.total_ratings} reviews
                </span>
                {conversation.badges.length > 0 && (
                  <span className="text-xs text-blue-600">
                    {conversation.badges[0].replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
