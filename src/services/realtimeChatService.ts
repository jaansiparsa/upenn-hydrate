import { supabase } from '../lib/supabase'
import type { Message } from './messagingService'
import type { ChatMessage } from '../hooks/use-realtime-chat'

// Convert database message to chat message format
export function convertToChatMessage(message: Message, currentUserId: string): ChatMessage {
  const isFromCurrentUser = message.sender_id === currentUserId
  const user = isFromCurrentUser ? message.sender : message.sender
  
  return {
    id: message.id,
    content: message.content,
    user: {
      name: user?.display_name || user?.email || 'Anonymous',
      id: message.sender_id
    },
    createdAt: message.created_at
  }
}

// Convert chat message to database message format
export function convertToDatabaseMessage(chatMessage: ChatMessage, senderId: string, receiverId: string): Partial<Message> {
  return {
    id: chatMessage.id,
    sender_id: senderId,
    receiver_id: receiverId,
    content: chatMessage.content,
    created_at: chatMessage.createdAt
  }
}

// Store messages in database (for persistence)
export async function storeMessages(messages: ChatMessage[], currentUserId: string, otherUserId: string): Promise<void> {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User must be authenticated to store messages')
  }

  // Convert chat messages to database format
  const dbMessages = messages.map(msg => ({
    id: msg.id,
    sender_id: msg.user.id === currentUserId ? currentUserId : otherUserId,
    receiver_id: msg.user.id === currentUserId ? otherUserId : currentUserId,
    content: msg.content,
    created_at: msg.createdAt
  }))

  // Insert messages in batch
  const { error } = await supabase
    .from('messages')
    .upsert(dbMessages, { 
      onConflict: 'id',
      ignoreDuplicates: true 
    })

  if (error) {
    console.error('Error storing messages:', error)
    throw error
  }
}

// Load initial messages for a conversation
export async function loadInitialMessages(otherUserId: string): Promise<ChatMessage[]> {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        display_name,
        email
      ),
      receiver:receiver_id (
        display_name,
        email
      )
    `)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading messages:', error)
    throw error
  }

  return (messages as Message[]).map(msg => convertToChatMessage(msg, user.id))
}

// Generate a unique room name for two users
export function generateRoomName(userId1: string, userId2: string): string {
  // Sort user IDs to ensure consistent room names regardless of order
  const sortedIds = [userId1, userId2].sort()
  return `conversation_${sortedIds[0]}_${sortedIds[1]}`
}
