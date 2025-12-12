-- ==============================================================================
-- 🏗️ KBS V0.1 MASTER SCHEMA (Tables, Security, Storage, Seed)
-- ==============================================================================

BEGIN;

-- 1. TYPES & ENUMS
CREATE TYPE listing_type AS ENUM ('SALE', 'DONATION', 'TRADE');
CREATE TYPE item_condition AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- 2. TABLES

-- Users (Extension of auth.users)
CREATE TABLE public.app_user (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    city TEXT,
    zip TEXT,
    avatar_url TEXT,
    reputation_score INT DEFAULT 0,
    karma_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Circles (Hubs)
CREATE TABLE public.circle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT,
    zip_center TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Listings
CREATE TABLE public.listing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.app_user(id) ON DELETE SET NULL,
    circle_id UUID REFERENCES public.circle(id) ON DELETE SET NULL,
    type listing_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    condition item_condition,
    price_cents INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    has_recall_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Listing Media
CREATE TABLE public.listing_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listing(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE public.conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID REFERENCES public.app_user(id),
    participant2_id UUID REFERENCES public.app_user(id),
    listing_id UUID REFERENCES public.listing(id),
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE public.message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversation(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.app_user(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.app_user(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Stories
CREATE TABLE public.story (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID REFERENCES public.circle(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.app_user(id),
    media_url TEXT NOT NULL,
    title TEXT,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS (Security)
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE story ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Simplified for V0.1 Launch)
CREATE POLICY "Public Read Users" ON app_user FOR SELECT USING (true);
CREATE POLICY "Public Read Circles" ON circle FOR SELECT USING (true);
CREATE POLICY "Public Read Active Listings" ON listing FOR SELECT USING (status = 'active');
CREATE POLICY "Owner Write Listing" ON listing FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Public Read Media" ON listing_media FOR SELECT USING (true);
-- Chat policies
CREATE POLICY "Chat Participants Read" ON conversation FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Chat Participants Write" ON conversation FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Message Read" ON message FOR SELECT USING (EXISTS (SELECT 1 FROM conversation WHERE id = conversation_id AND (participant1_id = auth.uid() OR participant2_id = auth.uid())));
CREATE POLICY "Message Write" ON message FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 5. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true) ON CONFLICT DO NOTHING;

-- Storage Policies (Public Read, Auth Write)
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Public Read Listings" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Auth Upload Listings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

-- 6. SEED DATA (Test Content)
-- Circles
INSERT INTO public.circle (id, name, state, zip_center) VALUES 
('11111111-1111-1111-1111-111111111111', 'Florence Hub (KY)', 'KY', '41042'),
('22222222-2222-2222-2222-222222222222', 'Cincy Downtown (OH)', 'OH', '45202')
ON CONFLICT DO NOTHING;

-- Trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_user (id, email, name) VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
