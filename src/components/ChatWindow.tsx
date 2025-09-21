import React, { useEffect, useState } from "react";
import { markMessagesAsRead } from "../services/messagingService";
import { RealtimeChat } from "./realtime-chat";
import { loadInitialMessages, generateRoomName } from "../services/realtimeChatService";
import type { ChatMessage } from "../hooks/use-realtime-chat";
import { useAuth } from "../contexts/AuthContext";

interface ChatWindowProps {
  otherUserId: string;
  otherUserName?: string;
  otherUserProfilePictureUrl?: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  otherUserId,
  otherUserName,
  otherUserProfilePictureUrl,
  onBack,
}) => {
  const { user } = useAuth();
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (otherUserId && user?.id) {
      loadInitialMessagesForChat();
      markMessagesAsRead(otherUserId);
    }
  }, [otherUserId, user?.id]);

  const loadInitialMessagesForChat = async () => {
    try {
      setLoading(true);
      const messages = await loadInitialMessages(otherUserId);
      setInitialMessages(messages);
    } catch (error) {
      console.error("Error loading initial messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUpdate = (messages: ChatMessage[]) => {
    // This callback can be used to sync messages with database if needed
    console.log('Messages updated:', messages.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-600">
          <p>{error}</p>
          <button 
            onClick={loadInitialMessagesForChat}
            className="mt-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Please log in to use messaging</p>
      </div>
    );
  }

  const roomName = generateRoomName(user.id, otherUserId);
  const username = user.user_metadata?.display_name || user.email || 'Anonymous';

  return (
    <RealtimeChat
      roomName={roomName}
      username={username}
      currentUserId={user.id}
      onMessage={handleMessageUpdate}
      messages={initialMessages}
      otherUserId={otherUserId}
      otherUserName={otherUserName}
      otherUserProfilePictureUrl={otherUserProfilePictureUrl}
      onBack={onBack}
    />
  );
};
