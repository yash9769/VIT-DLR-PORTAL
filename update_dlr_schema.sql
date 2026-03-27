-- Update lecture_records table to match OG DLR specifications
ALTER TABLE public.lecture_records 
ADD COLUMN IF NOT EXISTS attendance INTEGER,
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
ADD COLUMN IF NOT EXISTS total_batch_strength INTEGER;

-- Ensure constraints and defaults are set correctly
ALTER TABLE public.lecture_records ALTER COLUMN attendance SET DEFAULT 0;
ALTER TABLE public.lecture_records ALTER COLUMN lecture_capture_done SET DEFAULT FALSE;
ALTER TABLE public.lecture_records ALTER COLUMN smart_board_uploaded SET DEFAULT FALSE;
ALTER TABLE public.lecture_records ALTER COLUMN assignments_last_week SET DEFAULT 0;
ALTER TABLE public.lecture_records ALTER COLUMN assignments_given SET DEFAULT 0;
ALTER TABLE public.lecture_records ALTER COLUMN assignments_graded SET DEFAULT 0;
