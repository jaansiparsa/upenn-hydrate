import { supabase } from "../lib/supabase";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender?: {
    display_name?: string;
    email?: string;
  };
  receiver?: {
    display_name?: string;
    email?: string;
  };
}

export interface Conversation {
  user_id: string;
  display_name?: string;
  email?: string;
  last_message?: Message;
  unread_count: number;
  total_ratings: number;
  badges: string[];
}

// Send a message
export async function sendMessage(
  receiverId: string,
  content: string
): Promise<Message> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to send messages");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select(
      `
      *,
      sender:sender_id (
        display_name,
        email
      ),
      receiver:receiver_id (
        display_name,
        email
      )
    `
    )
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data as Message;
}

// Get conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  // Get all messages involving the current user
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:sender_id (
        display_name,
        email
      ),
      receiver:receiver_id (
        display_name,
        email
      )
    `
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  // Group messages by conversation partner
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((message) => {
    const otherUserId =
      message.sender_id === user.id ? message.receiver_id : message.sender_id;

    const otherUser =
      message.sender_id === user.id ? message.receiver : message.sender;

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        user_id: otherUserId,
        display_name: otherUser?.display_name,
        email: otherUser?.email,
        last_message: message,
        unread_count: 0,
        total_ratings: 0,
        badges: [],
      });
    }

    const conversation = conversationMap.get(otherUserId)!;

    // Update last message if this is more recent
    if (
      !conversation.last_message ||
      new Date(message.created_at) >
        new Date(conversation.last_message.created_at)
    ) {
      conversation.last_message = message;
    }

    // Count unread messages (messages sent to current user that haven't been read)
    if (message.receiver_id === user.id && !message.read_at) {
      conversation.unread_count++;
    }
  });

  // Get user stats for each conversation partner
  const userIds = Array.from(conversationMap.keys());
  const { data: userStats } = await supabase
    .from("users")
    .select("id, display_name, email, total_ratings, badges")
    .in("id", userIds);

  // Update conversations with user stats
  userStats?.forEach((userStat) => {
    const conversation = conversationMap.get(userStat.id);
    if (conversation) {
      conversation.total_ratings = userStat.total_ratings;
      conversation.badges = userStat.badges;
    }
  });

  // Sort by last message time
  return Array.from(conversationMap.values()).sort((a, b) => {
    if (!a.last_message || !b.last_message) return 0;
    return (
      new Date(b.last_message.created_at).getTime() -
      new Date(a.last_message.created_at).getTime()
    );
  });
}

// Get messages between two users
export async function getMessages(otherUserId: string): Promise<Message[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:sender_id (
        display_name,
        email
      ),
      receiver:receiver_id (
        display_name,
        email
      )
    `
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  return (data as Message[]) || [];
}

// Mark messages as read
export async function markMessagesAsRead(otherUserId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", user.id)
    .eq("sender_id", otherUserId)
    .is("read_at", null);

  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

// Subscribe to new messages
export function subscribeToMessages(callback: (payload: any) => void) {
  return supabase
    .channel("messages_changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      callback
    )
    .subscribe();
}

// Subscribe to messages for a specific conversation
export async function subscribeToConversation(
  otherUserId: string,
  callback: (payload: any) => void
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  return supabase
    .channel(`conversation_${user.id}_${otherUserId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id}))`,
      },
      callback
    )
    .subscribe();
}
