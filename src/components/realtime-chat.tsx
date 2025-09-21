import { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { useRealtimeChat, type ChatMessage } from '../hooks/use-realtime-chat'
import { useChatScroll } from '../hooks/use-chat-scroll'
import { ChatMessageItem } from './chat-message'
import { sendMessage as sendMessageToDB } from '../services/messagingService'

interface RealtimeChatProps {
  roomName: string
  username: string
  currentUserId: string
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
  otherUserId: string
  otherUserName?: string
  onBack?: () => void
}

export const RealtimeChat = ({
  roomName,
  username,
  currentUserId,
  onMessage,
  messages: initialMessages = [],
  otherUserId,
  otherUserName,
  onBack
}: RealtimeChatProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { messages, sendMessage, isConnected } = useRealtimeChat({
    roomName,
    username,
    currentUserId,
    onMessage,
    initialMessages
  })

  const { messagesEndRef } = useChatScroll({ messages })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      setError(null)

      // Always persist to database first
      await sendMessageToDB(otherUserId, newMessage)
      
      // Try to send via realtime broadcast if connected
      if (isConnected) {
        try {
          await sendMessage(newMessage)
        } catch (realtimeError) {
          console.warn('Realtime send failed, but message saved to database:', realtimeError)
        }
      } else {
        console.warn('Realtime not connected, message saved to database only')
      }
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
          <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {otherUserName || 'Anonymous User'}
          </h2>
          <p className="text-sm text-gray-500">
            {isConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.user.id === currentUserId
            const showDate =
              index === 0 ||
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt)

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <ChatMessageItem
                  message={message}
                  isOwnMessage={isOwn}
                  showHeader={index === 0 || messages[index - 1].user.name !== message.user.name}
                />
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            maxLength={1000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {!isConnected && (
          <div className="mt-2 text-sm text-yellow-600">
            Connecting to chat...
          </div>
        )}
      </div>
    </div>
  )
}
