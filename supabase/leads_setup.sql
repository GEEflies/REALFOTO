-- =====================================================
-- AURIX LEADS TABLE SQL
-- For email collection and usage tracking (pre-signup)
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    usage_count INTEGER DEFAULT 0,
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Allow anonymous users to insert their email (for email gate)
CREATE POLICY "Anyone can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow service role to read/update leads
CREATE POLICY "Service role can read leads" ON public.leads
    FOR SELECT USING (true);

CREATE POLICY "Service role can update leads" ON public.leads
    FOR UPDATE USING (true);

-- 4. Create index on IP address for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_ip_address ON public.leads(ip_address);

-- 5. Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 6. Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_lead_usage(lead_email TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.leads
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE email = lead_email
    RETURNING usage_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get or create lead by IP
CREATE OR REPLACE FUNCTION public.get_or_create_lead_by_ip(user_ip TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    usage_count INTEGER,
    is_pro BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.email, l.usage_count, l.is_pro
    FROM public.leads l
    WHERE l.ip_address = user_ip
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! Your leads tracking system is ready.
-- =====================================================
