-- ============================================================
-- VIT DLR PORTAL — MISSING TABLES SCHEMA UPDATE
-- Run this in Supabase SQL Editor to fix Faculty Dashboard errors
-- ============================================================

-- ── 1. Substitutions Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    absent_faculty_id UUID REFERENCES public.users(id),
    proxy_faculty_id UUID REFERENCES public.users(id),
    timetable_id UUID REFERENCES public.timetable(id),
    substitution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

-- Faculty can view substitutions where they are either absent or proxy
CREATE POLICY "Users can view their own substitutions" ON public.substitutions
    FOR SELECT USING (
        auth.uid() = absent_faculty_id OR 
        auth.uid() = proxy_faculty_id OR 
        public.check_is_admin()
    );

-- Admins can manage everything
CREATE POLICY "Admins can manage substitutions" ON public.substitutions
    FOR ALL USING (public.check_is_admin());


-- ── 2. Notifications Table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notification (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications for anyone
CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (public.check_is_admin());


-- ── 3. Profile Setup Fix ────────────────────────────────
-- Ensure the check_is_admin function is solid
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
          AND role IN ('admin', 'hod')
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. Verify Tables ─────────────────────────────────────
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('substitutions', 'notifications', 'attendance', 'lecture_records');
