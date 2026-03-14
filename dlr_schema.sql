-- ============================================================
-- VIT DLR Portal — PostgreSQL Schema (Supabase-compatible)
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('faculty', 'admin', 'hod');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lcs_status') THEN
        CREATE TYPE lcs_status AS ENUM ('covered', 'not_covered', 'partially_covered');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'locked');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lecture_type') THEN
        CREATE TYPE lecture_type AS ENUM ('theory', 'practical', 'tutorial');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_of_week') THEN
        CREATE TYPE day_of_week AS ENUM ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');
    END IF;
END $$;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'faculty',
  department TEXT,
  employee_id TEXT UNIQUE,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty profiles (extended info for faculty role)
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  designation TEXT,
  qualification TEXT,
  specialization TEXT,
  joining_date DATE,
  cabin_number TEXT,
  is_hod BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL UNIQUE,
  building TEXT,
  floor INTEGER,
  capacity INTEGER,
  has_smartboard BOOLEAN DEFAULT FALSE,
  has_projector BOOLEAN DEFAULT FALSE,
  room_type TEXT DEFAULT 'classroom', -- classroom, lab, seminar_hall
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_code TEXT NOT NULL UNIQUE,
  subject_name TEXT NOT NULL,
  short_name TEXT,
  department TEXT,
  semester INTEGER,
  credits INTEGER,
  lecture_type lecture_type DEFAULT 'theory',
  hours_per_week INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Divisions / Batches
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_name TEXT NOT NULL,  -- e.g., "IT-A", "IT-B", "IT-A1" (batch)
  year INTEGER NOT NULL,         -- 1,2,3,4
  semester INTEGER NOT NULL,
  department TEXT NOT NULL,
  strength INTEGER DEFAULT 60,
  class_teacher_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(division_name, department, year)
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Slots
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_label TEXT NOT NULL,   -- e.g., "8:00 - 9:00"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INTEGER NOT NULL,
  is_break BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(start_time, end_time)
);

-- Master Timetable
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES public.users(id),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  room_id UUID REFERENCES public.rooms(id),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  day_of_week day_of_week NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LECTURE RECORDS
-- ============================================================

-- Daily Lecture Records (DLR)
CREATE TABLE IF NOT EXISTS public.lecture_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timetable_id UUID REFERENCES public.timetable(id),
  faculty_id UUID NOT NULL REFERENCES public.users(id),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  room_id UUID REFERENCES public.rooms(id),
  lecture_date DATE NOT NULL,
  
  -- Scheduled times (from timetable)
  scheduled_start TIME,
  scheduled_end TIME,
  
  -- Actual times (faculty entered)
  actual_start TIME,
  actual_end TIME,
  
  -- Content
  topic_covered TEXT NOT NULL,
  subtopics TEXT,
  unit_number INTEGER,
  
  -- Attendance
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  absent_count INTEGER DEFAULT 0,
  
  -- Status flags
  lcs_status lcs_status DEFAULT 'covered',
  smartboard_pdf_uploaded BOOLEAN DEFAULT FALSE,
  smartboard_pdf_url TEXT,
  
  -- Substitution
  is_substitution BOOLEAN DEFAULT FALSE,
  original_faculty_id UUID REFERENCES public.users(id),
  
  -- Room change
  room_changed BOOLEAN DEFAULT FALSE,
  original_room_id UUID REFERENCES public.rooms(id),
  
  -- Remarks
  remarks TEXT,
  
  -- Workflow
  approval_status approval_status DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES public.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(faculty_id, lecture_date, scheduled_start, division_id)
);

-- Attendance Records (per student)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecture_record_id UUID NOT NULL REFERENCES public.lecture_records(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  is_present BOOLEAN DEFAULT FALSE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lecture_record_id, student_id)
);

-- ============================================================
-- AUDIT & NOTIFICATIONS
-- ============================================================

-- Audit status per day (admin locks a day)
CREATE TABLE IF NOT EXISTS public.audit_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_date DATE NOT NULL UNIQUE,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES public.users(id),
  locked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, warning, error, success
  is_read BOOLEAN DEFAULT FALSE,
  related_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_timetable_faculty ON public.timetable(faculty_id);
CREATE INDEX idx_timetable_division ON public.timetable(division_id);
CREATE INDEX idx_timetable_room ON public.timetable(room_id);
CREATE INDEX idx_timetable_day ON public.timetable(day_of_week);
CREATE INDEX idx_lecture_records_faculty ON public.lecture_records(faculty_id);
CREATE INDEX idx_lecture_records_date ON public.lecture_records(lecture_date);
CREATE INDEX idx_lecture_records_division ON public.lecture_records(division_id);
CREATE INDEX idx_lecture_records_status ON public.lecture_records(approval_status);
CREATE INDEX idx_attendance_record ON public.attendance(lecture_record_id);
CREATE INDEX idx_students_division ON public.students(division_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper for checking roles without recursion
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'hod')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.check_is_admin());

CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL USING (public.check_is_admin());

-- Timetable RLS
CREATE POLICY "Faculty can view own timetable" ON public.timetable
  FOR SELECT USING (
    faculty_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','hod'))
  );

CREATE POLICY "Admins can manage timetable" ON public.timetable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','hod'))
  );

-- Lecture Records RLS
CREATE POLICY "Faculty can view own records" ON public.lecture_records
  FOR SELECT USING (
    faculty_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','hod'))
  );

CREATE POLICY "Faculty can insert own records" ON public.lecture_records
  FOR INSERT WITH CHECK (faculty_id = auth.uid() AND is_locked = FALSE);

CREATE POLICY "Faculty can update own pending records" ON public.lecture_records
  FOR UPDATE USING (
    faculty_id = auth.uid() AND approval_status = 'pending' AND is_locked = FALSE
  );

CREATE POLICY "Admins can manage all records" ON public.lecture_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','hod'))
  );

-- Notifications RLS
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- SEED DATA — Time Slots
-- ============================================================

INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
('8:00 - 9:00',   '08:00', '09:00', 1),
('9:00 - 10:00',  '09:00', '10:00', 2),
('10:00 - 10:15', '10:00', '10:15', 3), -- Break
('10:15 - 11:15', '10:15', '11:15', 4),
('11:15 - 12:15', '11:15', '12:15', 5),
('12:15 - 13:00', '12:15', '13:00', 6), -- Lunch
('13:00 - 14:00', '13:00', '14:00', 7),
('14:00 - 15:00', '14:00', '15:00', 8),
('15:00 - 16:00', '15:00', '16:00', 9),
('16:00 - 17:00', '16:00', '17:00', 10);

UPDATE public.time_slots SET is_break = TRUE WHERE slot_label IN ('10:00 - 10:15', '12:15 - 13:00');

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at BEFORE UPDATE ON public.timetable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecture_records_updated_at BEFORE UPDATE ON public.lecture_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conflict detection function
CREATE OR REPLACE FUNCTION check_timetable_conflicts(
  p_faculty_id UUID,
  p_room_id UUID,
  p_division_id UUID,
  p_time_slot_id UUID,
  p_day day_of_week,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(conflict_type TEXT, conflict_detail TEXT) AS $$
BEGIN
  -- Faculty double booking
  RETURN QUERY
  SELECT 'faculty_conflict'::TEXT,
    'Faculty already scheduled at this time'::TEXT
  FROM public.timetable t
  WHERE t.faculty_id = p_faculty_id
    AND t.time_slot_id = p_time_slot_id
    AND t.day_of_week = p_day
    AND t.is_active = TRUE
    AND (p_exclude_id IS NULL OR t.id != p_exclude_id);

  -- Room double booking
  RETURN QUERY
  SELECT 'room_conflict'::TEXT,
    'Room already booked at this time'::TEXT
  FROM public.timetable t
  WHERE t.room_id = p_room_id
    AND t.time_slot_id = p_time_slot_id
    AND t.day_of_week = p_day
    AND t.is_active = TRUE
    AND p_room_id IS NOT NULL
    AND (p_exclude_id IS NULL OR t.id != p_exclude_id);

  -- Division overlap
  RETURN QUERY
  SELECT 'division_conflict'::TEXT,
    'Division already has a class at this time'::TEXT
  FROM public.timetable t
  WHERE t.timetable.division_id = p_division_id
    AND t.time_slot_id = p_time_slot_id
    AND t.day_of_week = p_day
    AND t.is_active = TRUE
    AND (p_exclude_id IS NULL OR t.id != p_exclude_id);
END;
$$ LANGUAGE plpgsql;

-- Profile management trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed Faculty'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'faculty'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

