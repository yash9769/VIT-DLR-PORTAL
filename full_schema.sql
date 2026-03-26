-- ============================================================
-- VIT DLR PORTAL — COMPLETE DATABASE SCHEMA (UP-TO-DATE)
-- ============================================================

-- ============================================================
-- 1. ENUMS (Custom Data Types)
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('admin', 'faculty');
CREATE TYPE public.day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
CREATE TYPE public.lecture_status AS ENUM ('conducted', 'skipped', 'substituted', 'pending');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.sub_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- ============================================================
-- 2. BASE ENTITIES (No dependencies)
-- ============================================================

-- USERS (Faculty & Admins)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'faculty',
    full_name TEXT NOT NULL,
    initials TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- DIVISIONS (Classes)
CREATE TABLE public.divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_name TEXT UNIQUE NOT NULL, -- e.g., 'INFT-4-A'
    year INTEGER NOT NULL,              -- 2, 3, 4
    semester INTEGER NOT NULL,          -- 4, 6, 8
    department TEXT NOT NULL,           -- 'IT'
    strength INTEGER DEFAULT 60         -- No. of students
);

-- SUBJECTS
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code TEXT UNIQUE NOT NULL,
    short_name TEXT NOT NULL,           -- e.g., 'OS', 'DBMS'
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    lecture_type TEXT DEFAULT 'theory'  -- 'theory', 'practical', 'tutorial'
);

-- ROOMS & LABS
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT UNIQUE NOT NULL,   -- e.g., 'E201', 'L07C'
    building TEXT,                      -- 'E-Block', 'L-Block'
    floor INTEGER,                      -- 1, 2, 0
    room_type TEXT NOT NULL,            -- 'classroom', 'lab', 'seminar_hall'
    has_smartboard BOOLEAN DEFAULT false,
    has_projector BOOLEAN DEFAULT true
);

-- TIME SLOTS (The Grid)
CREATE TABLE public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_label TEXT UNIQUE NOT NULL,    -- e.g., '09:00 - 10:00'
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    slot_order INTEGER NOT NULL         -- For sorting (1 to 9)
);

-- ============================================================
-- 3. SECONDARY ENTITIES (Depends on Base Entities)
-- ============================================================

-- STUDENTS
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
    roll_number INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE (division_id, roll_number)
);

-- THE TIMETABLE (The core schedule linking everything)
CREATE TABLE public.timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.users(id),
    division_id UUID NOT NULL REFERENCES public.divisions(id),
    subject_id UUID NOT NULL REFERENCES public.subjects(id),
    room_id UUID REFERENCES public.rooms(id), -- Nullable for Open Projects
    time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
    day_of_week public.day_of_week NOT NULL,
    batch_no INTEGER,                         -- NULL for theory. 1, 2, 3 for lab batches
    is_ditto BOOLEAN DEFAULT false,           -- Determines if it's the 2nd hour of a 2-hour slot
    UNIQUE (faculty_id, day_of_week, time_slot_id) -- Faculty cannot be double-booked
);

-- ============================================================
-- 4. TRANSACTIONS & RECORDS (Depends on Timetable)
-- ============================================================

-- SUBSTITUTIONS (Temp Schedule Changes)
CREATE TABLE public.substitutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    absent_faculty_id UUID NOT NULL REFERENCES public.users(id),
    original_timetable_id UUID NOT NULL REFERENCES public.timetable(id),
    assigned_faculty_id UUID REFERENCES public.users(id),
    reason TEXT,
    status public.sub_status DEFAULT 'pending',
    assigned_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- LECTURE RECORDS (The actual DLR submissions)
CREATE TABLE public.lecture_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.users(id),
    timetable_id UUID REFERENCES public.timetable(id), -- Nullable for extra lectures
    date DATE NOT NULL,
    status public.lecture_status NOT NULL DEFAULT 'conducted',
    actual_start_time TIME WITHOUT TIME ZONE,
    actual_end_time TIME WITHOUT TIME ZONE,
    topics_covered TEXT,
    room_id UUID REFERENCES public.rooms(id),
    smartboard_used BOOLEAN DEFAULT false,
    substitution_id UUID REFERENCES public.substitutions(id),
    is_extra_lecture BOOLEAN DEFAULT false,
    is_ditto BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ATTENDANCE (Linked to DLR Submissions)
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID NOT NULL REFERENCES public.lecture_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status public.attendance_status NOT NULL DEFAULT 'present',
    UNIQUE (lecture_id, student_id)
);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) Configuration Example
-- ============================================================
-- Tables have RLS enabled and policies defined for Supabase Auth,
-- typically ensuring faculties can only view/edit their own records,
-- while Admins have blanket access.
