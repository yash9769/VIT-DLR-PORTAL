-- Security Features Schema

-- 1. Create Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL, -- e.g., 'FAILED_LOGIN', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS_ATTEMPT'
    user_email TEXT,
    ip_address TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS) on Security Logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Security Logs
-- Policy: Only Admins can view security logs
CREATE POLICY "Admins can view security logs" ON public.security_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'hod')
        )
    );

-- Policy: Anyone (even unauthenticated, for login failures) can insert security logs
-- In a real production app, this would be handled by an edge function with a service role to prevent spam.
CREATE POLICY "Anyone can insert security logs" ON public.security_logs
    FOR INSERT
    WITH CHECK (true);

-- 4. Example: Strict RLS on Users table to prevent IDOR
-- (Documenting this for the RLS Showcase)
-- Policy: Users can only view their own profile, OR admins can view all.
-- This prevents an attacker from iterating through UUIDs to scrape user data.
/*
CREATE POLICY "Users view own profile or admin views all" ON public.users
    FOR SELECT
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users u2 
            WHERE u2.id = auth.uid() AND u2.role IN ('admin', 'hod')
        )
    );
*/
