-- Fix lecture_records table to support the new standardized DLR system
ALTER TABLE public.lecture_records 
ADD COLUMN IF NOT EXISTS attendance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lecture_capture_done BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS smart_board_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS assignments_last_week INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assignments_given INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assignments_graded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS timetable_from TIME,
ADD COLUMN IF NOT EXISTS timetable_to TIME,
ADD COLUMN IF NOT EXISTS actual_from TIME,
ADD COLUMN IF NOT EXISTS actual_to TIME,
ADD COLUMN IF NOT EXISTS actual_faculty_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS total_batch_strength INTEGER,
ADD COLUMN IF NOT EXISTS is_substitution BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Rename date to lecture_date if needed, or just let the code use date
-- The code uses lecture_date in insert, but the table has date.
-- Let's check SubmitLecture.jsx line 251: lecture_date: form.lecture_date
-- If the table has 'date', we should either rename it or change the code.
-- 'date' is a reserved keyword in some SQL, so lecture_date is better.

ALTER TABLE public.lecture_records RENAME COLUMN date TO lecture_date;
ALTER TABLE public.lecture_records ALTER COLUMN lecture_date SET NOT NULL;
