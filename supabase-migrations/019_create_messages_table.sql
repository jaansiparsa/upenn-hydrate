    -- Create messages table for hyDATEr messaging
    -- Migration: 019_create_messages_table.sql

    -- Create messages table
    CREATE TABLE IF NOT EXISTS public.messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        read_at TIMESTAMP WITH TIME ZONE NULL,
        
        -- Ensure users can't message themselves
        CONSTRAINT different_users CHECK (sender_id != receiver_id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);

    -- Enable Row Level Security (RLS)
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
    DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;

    -- Policy for viewing messages (users can see messages they sent or received)
    CREATE POLICY "Users can view their own messages" ON public.messages
        FOR SELECT
        USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

    -- Policy for sending messages (authenticated users can send messages)
    CREATE POLICY "Users can send messages" ON public.messages
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = sender_id);

    -- Policy for updating messages (users can mark messages as read)
    CREATE POLICY "Users can mark messages as read" ON public.messages
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = receiver_id)
        WITH CHECK (auth.uid() = receiver_id);

    -- Add comments
    COMMENT ON TABLE public.messages IS 'Messages between users for hyDATEr feature';
    COMMENT ON COLUMN public.messages.sender_id IS 'User who sent the message';
    COMMENT ON COLUMN public.messages.receiver_id IS 'User who received the message';
    COMMENT ON COLUMN public.messages.content IS 'Message content (max 1000 characters)';
    COMMENT ON COLUMN public.messages.read_at IS 'When the message was read (NULL if unread)';
