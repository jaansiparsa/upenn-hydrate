import { ArrowLeft, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RealtimeChat } from "./RealtimeChat";
import { useAuth } from "../contexts/AuthContext";
import type { ChatMessage } from "../hooks/useRealtimeChat";
import { getMessages, markMessagesAsRead } from "../services/messagingService";

interface SupabaseChatWindowProps {
  otherUserId: string;
  otherUserName?: string;
  onBack: () => void;
}

export const SupabaseChatWindow: React.FC<SupabaseChatWindowProps> = ({
  otherUserId,
  otherUserName,
  onBack,
}) => {
  const { user } = useAuth();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (otherUserId && user?.id) {
      loadInitialMessages();
      markMessagesAsRead(otherUserId);
    }
  }, [otherUserId, user?.id]);

  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      const messages = await getMessages(otherUserId);
      
      // Convert our Message format to ChatMessage format
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        user: {
          name: msg.sender_id === user?.id ? user.email || 'You' : otherUserName || 'Anonymous'
        },
        createdAt: msg.created_at
      }));
      
      setInitialMessages(chatMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (messages: ChatMessage[]) => {
    // Here you could save messages to your database if needed
    // For now, we'll just log them
    console.log("Messages updated:", messages);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {otherUserName || "Anonymous User"}
          </h2>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>

      {/* Chat Component */}
      <div className="flex-1">
        <RealtimeChat
          roomName={`chat_${user?.id}_${otherUserId}`}
          username={user?.email || 'Anonymous'}
          onMessage={handleMessage}
          messages={initialMessages}
        />
      </div>
    </div>
  );
};
