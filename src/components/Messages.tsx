import React, { useState } from "react";

import { ChatWindow } from "./ChatWindow";
import { MessageList } from "./MessageList";

interface MessagesProps {
  initialUserId?: string;
  initialUserName?: string;
  initialUserProfilePictureUrl?: string;
}

export const Messages: React.FC<MessagesProps> = ({
  initialUserId,
  initialUserName,
  initialUserProfilePictureUrl,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    initialUserId
  );
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(
    initialUserName
  );
  const [selectedUserProfilePictureUrl, setSelectedUserProfilePictureUrl] = useState<string | undefined>(
    initialUserProfilePictureUrl
  );

  const handleSelectConversation = (userId: string, userName?: string, profilePictureUrl?: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserProfilePictureUrl(profilePictureUrl);
  };

  const handleBack = () => {
    setSelectedUserId(undefined);
    setSelectedUserName(undefined);
    setSelectedUserProfilePictureUrl(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[600px] overflow-hidden">
        {selectedUserId ? (
          <ChatWindow
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            otherUserProfilePictureUrl={selectedUserProfilePictureUrl}
            onBack={handleBack}
          />
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Chat with your hyDATEr matches
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <MessageList
                onSelectConversation={handleSelectConversation}
                selectedUserId={selectedUserId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
