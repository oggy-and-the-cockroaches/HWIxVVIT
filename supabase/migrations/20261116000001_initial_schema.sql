-- ==============================================================================
-- Migration: 20261116000001_initial_schema.sql
-- Description: Core Schema for HWI x VVITU Platform
-- Includes: Profiles, Site Settings, Events, Registrations, Opportunities, Inquiries
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Security Definer Helper: Check if current user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Site Settings Table (Singleton pattern for dynamic platform configuration)
-- Admin can change logo, queries email, WhatsApp URL, headlines, and positioning
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    logo_url TEXT NOT NULL DEFAULT 'logo.svg',
    queries_email TEXT NOT NULL DEFAULT 'ajayhemanth90@gmail.com',
    whatsapp_url TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T',
    brand_title TEXT NOT NULL DEFAULT 'HWI × VVITU',
    tagline TEXT NOT NULL DEFAULT 'Connecting India''s Hackathon Community',
    hero_headline TEXT NOT NULL DEFAULT 'Your Gateway to India''s Hackathon Ecosystem',
    hero_subheadline TEXT NOT NULL DEFAULT 'Discover hackathons, explore technology opportunities, connect with fellow innovators, and stay informed about what''s happening across the hackathon community.',
    campus_location TEXT NOT NULL DEFAULT 'VVITU Campus • Technical Education & Innovation Wing',
    events_notice TEXT NOT NULL DEFAULT 'Will Be Adding Soon',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 5. Events Table (Campus Workshops, Hackathons, Meetups)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_summary TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'workshop', 'tech_talk', 'meetup', 'competition')),
    location_type TEXT NOT NULL DEFAULT 'in_person' CHECK (location_type IN ('in_person', 'virtual', 'hybrid')),
    venue TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ NOT NULL,
    max_capacity INTEGER CHECK (max_capacity IS NULL OR max_capacity > 0),
    poster_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_event_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_reg_deadline CHECK (registration_deadline <= end_date)
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college_id_or_usn TEXT NOT NULL,
    department TEXT NOT NULL,
    year_of_study TEXT NOT NULL CHECK (year_of_study IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_event_email UNIQUE (event_id, email)
);

-- 7. Opportunities Table (National Hackathons, Grants, Contests)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('hackathon', 'grant', 'fellowship', 'hiring_challenge', 'open_source')),
    format TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'offline', 'hybrid')),
    short_description TEXT NOT NULL,
    external_url TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    event_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closing_soon', 'closed')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Contact Messages / Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_events_status_start ON public.events(status, start_date ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline ON public.opportunities(status, deadline ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Site Settings Policies
CREATE POLICY "Site settings are publicly viewable"
ON public.site_settings FOR SELECT TO public USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR ALL TO authenticated USING (public.is_admin());

-- Events Policies
CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT TO public USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins have full access to events"
ON public.events FOR ALL TO authenticated USING (public.is_admin());

-- Registrations Policies
CREATE POLICY "Public can register for published events"
ON public.registrations FOR INSERT TO public WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE id = registrations.event_id AND status = 'published'
  )
);

CREATE POLICY "Admins have full access to registrations"
ON public.registrations FOR ALL TO authenticated USING (public.is_admin());

-- Opportunities Policies
CREATE POLICY "Opportunities are publicly readable"
ON public.opportunities FOR SELECT TO public USING (true);

CREATE POLICY "Admins have full access to opportunities"
ON public.opportunities FOR ALL TO authenticated USING (public.is_admin());

-- Contact Messages Policies
CREATE POLICY "Public can send contact inquiries"
ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view and manage inquiries"
ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    -- Automatically make first user or specific admin email an admin
    CASE 
      WHEN NEW.email = 'ajayhemanth90@gmail.com' THEN 'admin'
      WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN 'admin'
      ELSE 'member'
    END
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- INITIAL SITE SETTINGS SEED ROW
-- ==============================================================================
INSERT INTO public.site_settings (
  id, logo_url, queries_email, whatsapp_url, brand_title, tagline, hero_headline, hero_subheadline
)
VALUES (
  1,
  'logo.svg',
  'ajayhemanth90@gmail.com',
  'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T',
  'HWI × VVITU',
  'Connecting India''s Hackathon Community',
  'Your Gateway to India''s Hackathon Ecosystem',
  'Discover hackathons, explore technology opportunities, connect with fellow innovators, and stay informed about what''s happening across the hackathon community.'
)
ON CONFLICT (id) DO NOTHING;
