import { useEffect, useRef } from 'react'

interface UseChatScrollProps {
  messages: any[]
  behavior?: ScrollBehavior
}

export function useChatScroll({ messages, behavior = 'smooth' }: UseChatScrollProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return {
    messagesEndRef,
    scrollToBottom
  }
}
