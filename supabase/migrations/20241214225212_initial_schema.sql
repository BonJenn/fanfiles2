BEGIN;

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Then create public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    subscriber_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    subscription_price INTEGER,
    stripe_customer_id TEXT UNIQUE,
    stripe_account_id TEXT UNIQUE,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subscriber_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    stripe_subscription_id TEXT UNIQUE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(creator_id, subscriber_id)
);

-- Then create posts table
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    url TEXT,
    type VARCHAR(50) NOT NULL,
    price INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create message_threads table
CREATE TABLE message_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_mass_message BOOLEAN DEFAULT false,
    attached_content_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    content_price INTEGER DEFAULT 0,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add foreign key for last_message_id after messages table is created
ALTER TABLE message_threads 
ADD CONSTRAINT fk_last_message 
FOREIGN KEY (last_message_id) 
REFERENCES messages(id) 
ON DELETE SET NULL;

-- Add RLS for messages
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Message thread policies
CREATE POLICY "Users can view their message threads"
ON message_threads FOR SELECT
USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create message threads"
ON message_threads FOR INSERT
WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Message policies
CREATE POLICY "Users can view messages in their threads"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM message_threads
        WHERE id = messages.thread_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM message_threads
        WHERE id = thread_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Subscription policies
CREATE POLICY "Users can view their subscriptions"
ON subscriptions FOR SELECT
USING (subscriber_id = auth.uid() OR creator_id = auth.uid());

CREATE POLICY "Users can manage their subscriptions"
ON subscriptions FOR ALL
USING (subscriber_id = auth.uid() OR creator_id = auth.uid());

-- Post policies
CREATE POLICY "Users can view posts they have access to"
ON posts FOR SELECT
USING (
    is_public = true
    OR creator_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM subscriptions
        WHERE creator_id = posts.creator_id 
        AND subscriber_id = auth.uid()
        AND status = 'active'
    )
);

CREATE POLICY "Users can create posts"
ON posts FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- Storage policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true);

CREATE POLICY "Anyone can view post files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

CREATE POLICY "Authenticated users can upload post files"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'posts' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own post files"
ON storage.objects FOR UPDATE
USING ( auth.uid()::text = owner::text )
WITH CHECK ( auth.uid()::text = owner::text );

CREATE POLICY "Users can delete their own post files"
ON storage.objects FOR DELETE
USING ( auth.uid()::text = owner::text );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create profile trigger for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to get user threads with correct types
CREATE OR REPLACE FUNCTION get_user_threads(user_id UUID)
RETURNS TABLE (
    id UUID,
    user1_id UUID,
    user2_id UUID,
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    other_user_name TEXT,
    other_user_avatar TEXT,
    last_message TEXT,
    last_message_sender_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mt.id,
        mt.user1_id,
        mt.user2_id,
        mt.last_message_id,
        mt.last_message_at,
        mt.created_at,
        CASE 
            WHEN mt.user1_id = user_id THEN u2.name::TEXT
            ELSE u1.name::TEXT
        END as other_user_name,
        CASE 
            WHEN mt.user1_id = user_id THEN u2.avatar_url::TEXT
            ELSE u1.avatar_url::TEXT
        END as other_user_avatar,
        m.content::TEXT as last_message,
        m.sender_id as last_message_sender_id
    FROM message_threads mt
    JOIN profiles u1 ON mt.user1_id = u1.id
    JOIN profiles u2 ON mt.user2_id = u2.id
    LEFT JOIN messages m ON mt.last_message_id = m.id
    WHERE mt.user1_id = user_id OR mt.user2_id = user_id
    ORDER BY mt.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update thread's last message
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads
    SET 
        last_message_id = NEW.id,
        last_message_at = NEW.created_at
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_last_message();

COMMIT;