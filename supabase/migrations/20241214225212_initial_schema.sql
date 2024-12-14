-- Drop everything first
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

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

-- Create posts table
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

-- Create post_access table
CREATE TABLE post_access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(post_id, user_id)
);

-- Create post_views table
CREATE TABLE post_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(post_id, viewer_id)
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

-- Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    amount INTEGER NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
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
    OR EXISTS (
        SELECT 1 FROM post_access
        WHERE post_id = posts.id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create posts"
ON posts FOR INSERT
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (creator_id = auth.uid());

CREATE POLICY "Users can view their subscriptions"
ON subscriptions FOR SELECT
USING (
    subscriber_id = auth.uid()
    OR creator_id = auth.uid()
);

CREATE POLICY "Users can manage their subscriptions"
ON subscriptions FOR ALL
USING (
    subscriber_id = auth.uid()
    OR creator_id = auth.uid()
)
WITH CHECK (
    subscriber_id = auth.uid()
    OR creator_id = auth.uid()
);

CREATE POLICY "Users can view their message threads"
ON message_threads FOR SELECT
USING (
    user1_id = auth.uid()
    OR user2_id = auth.uid()
);

CREATE POLICY "Users can create message threads"
ON message_threads FOR INSERT
WITH CHECK (
    user1_id = auth.uid()
    OR user2_id = auth.uid()
);

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

-- Create indexes
CREATE INDEX posts_creator_id_idx ON posts(creator_id);
CREATE INDEX posts_created_at_idx ON posts(created_at);
CREATE INDEX post_views_post_id_idx ON post_views(post_id);
CREATE INDEX post_views_viewer_id_idx ON post_views(viewer_id);
CREATE INDEX post_views_creator_id_idx ON post_views(creator_id);
CREATE INDEX transactions_creator_id_idx ON transactions(creator_id);
CREATE INDEX transactions_buyer_id_idx ON transactions(buyer_id);
CREATE INDEX subscriptions_creator_subscriber_idx ON subscriptions(creator_id, subscriber_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
CREATE INDEX message_threads_user1_id_idx ON message_threads(user1_id);
CREATE INDEX message_threads_user2_id_idx ON message_threads(user2_id);
CREATE INDEX messages_thread_id_idx ON messages(thread_id);
CREATE INDEX messages_sender_id_idx ON messages(sender_id);
CREATE INDEX messages_recipient_id_idx ON messages(recipient_id);
CREATE INDEX messages_read_at_idx ON messages(read_at);

-- Create functions and triggers
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_last_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_message();

-- Create profile trigger for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Add debug logging
    RAISE NOTICE 'Attempting to create profile for user: % with email: %', NEW.id, NEW.email;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RAISE NOTICE 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
    END IF;

    -- Try to insert profile
    BEGIN
        INSERT INTO public.profiles (id, email, name)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        );
        RAISE NOTICE 'Successfully created profile for user: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Storage policies
CREATE POLICY "Storage public view policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = ANY (ARRAY['avatars'::text, 'posts'::text]));

CREATE POLICY "Storage upload policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = ANY (ARRAY['avatars'::text, 'posts'::text]));

CREATE POLICY "Storage update policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = ANY (ARRAY['avatars'::text, 'posts'::text]));

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;