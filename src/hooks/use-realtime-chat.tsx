import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    id: string
  }
  createdAt: string
}

interface UseRealtimeChatProps {
  roomName: string
  username: string
  currentUserId: string
  onMessage?: (messages: ChatMessage[]) => void
  initialMessages?: ChatMessage[]
}

export function useRealtimeChat({
  roomName,
  username,
  currentUserId,
  onMessage,
  initialMessages = []
}: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const setupChannel = async () => {
      try {
        // Create a unique channel for this room
        const channel = supabase.channel(`chat:${roomName}`, {
          config: {
            broadcast: { self: false }, // Don't echo our own messages
            presence: { key: currentUserId }
          }
        })

        // Handle incoming messages
        channel.on('broadcast', { event: 'message' }, ({ payload }) => {
          console.log('Received message:', payload)
          if (!mounted) return
          
          const newMessage: ChatMessage = {
            id: payload.id,
            content: payload.content,
            user: {
              name: payload.username,
              id: payload.userId
            },
            createdAt: payload.createdAt
          }

          setMessages(prev => {
            const updated = [...prev, newMessage]
            onMessage?.(updated)
            return updated
          })
        })

        // Subscribe to the channel
        channel.subscribe((status) => {
          console.log('Subscription status:', status)
          if (!mounted) return
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false)
          }
        })

        channelRef.current = channel

        // Set a timeout to mark as connected if no error occurs
        setTimeout(() => {
          if (mounted && channelRef.current) {
            setIsConnected(true)
          }
        }, 2000)

      } catch (error) {
        console.error('Error setting up channel:', error)
        if (mounted) {
          setIsConnected(false)
        }
      }
    }

    setupChannel()

    return () => {
      mounted = false
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [roomName, username, currentUserId, onMessage])

  const sendMessage = async (content: string) => {
    if (!content.trim() || !channelRef.current) return

    const messagePayload = {
      id: crypto.randomUUID(),
      content: content.trim(),
      username,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    }

    console.log('Sending message:', messagePayload)

    // Add message to local state immediately for better UX
    const newMessage: ChatMessage = {
      id: messagePayload.id,
      content: messagePayload.content,
      user: {
        name: messagePayload.username,
        id: messagePayload.userId
      },
      createdAt: messagePayload.createdAt
    }

    setMessages(prev => {
      const updated = [...prev, newMessage]
      onMessage?.(updated)
      return updated
    })

    // Broadcast the message to all subscribers
    const { error } = await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: messagePayload
    })

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }

    return messagePayload
  }

  return {
    messages,
    sendMessage,
    isConnected
  }
}
