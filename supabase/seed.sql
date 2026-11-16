-- ==============================================================================
-- Supabase Seed & Storage Setup Script
-- HWI x VVITU Platform
-- ==============================================================================

-- 1. Ensure Site Settings Singleton Row Exists
INSERT INTO public.site_settings (
    id,
    logo_url,
    queries_email,
    whatsapp_url,
    brand_title,
    tagline,
    hero_headline,
    hero_subheadline,
    campus_location,
    events_notice
)
VALUES (
    1,
    'logo.svg',
    'ajayhemanth90@gmail.com',
    'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T',
    'HWI × VVITU',
    'Connecting India''s Hackathon Community',
    'Your Gateway to India''s Hackathon Ecosystem',
    'Discover hackathons, explore technology opportunities, connect with fellow innovators, and stay informed about what''s happening across the hackathon community.',
    'VVITU Campus • Technical Education & Innovation Wing',
    'Will Be Adding Soon'
)
ON CONFLICT (id) DO UPDATE SET
    queries_email = EXCLUDED.queries_email,
    whatsapp_url = EXCLUDED.whatsapp_url;

-- 2. Storage Buckets Setup (Run in SQL Editor if Storage Buckets do not auto-create)
-- Insert public storage buckets for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand', 'brand', true), ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public read brand assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'brand');

CREATE POLICY "Public read event posters"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'event-posters');

CREATE POLICY "Admins upload brand assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'brand' AND public.is_admin());

CREATE POLICY "Admins upload event posters"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-posters' AND public.is_admin());

CREATE POLICY "Admins delete event posters"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-posters' AND public.is_admin());
