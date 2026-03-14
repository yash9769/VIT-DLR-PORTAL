-- ============================================================
-- SEED DATA FOR VIT DLR PORTAL
-- ============================================================

-- 1. ROOMS
INSERT INTO public.rooms (room_number, building, floor, room_type, has_smartboard, has_projector) VALUES
('M101', 'Main', 1, 'classroom', true, true),
('M102', 'Main', 1, 'classroom', false, true),
('L201', 'Main', 2, 'lab', true, false),
('L202', 'Main', 2, 'lab', true, true),
('S301', 'Annex', 3, 'seminar_hall', true, true)
ON CONFLICT (room_number) DO NOTHING;

-- 2. SUBJECTS
INSERT INTO public.subjects (subject_code, subject_name, short_name, department, semester, credits, lecture_type) VALUES
('CSC401', 'Database Management Systems', 'DBMS', 'IT', 4, 4, 'theory'),
('CSC402', 'Advanced Web Programming', 'AWP', 'IT', 4, 3, 'practical'),
('CSC403', 'Operating Systems', 'OS', 'IT', 4, 4, 'theory'),
('CSC404', 'Machine Learning', 'ML', 'IT', 6, 4, 'theory'),
('CSC405', 'Cloud Computing', 'CC', 'IT', 6, 3, 'practical')
ON CONFLICT (subject_code) DO NOTHING;

-- 3. DIVISIONS
INSERT INTO public.divisions (division_name, year, semester, department, strength) VALUES
('IT-A', 2, 4, 'IT', 64),
('IT-B', 2, 4, 'IT', 62),
('IT-ML-A', 3, 6, 'IT', 60)
ON CONFLICT (division_name, department, year) DO NOTHING;

-- 4. STUDENTS (Sample for IT-A)
DO $$
DECLARE
    div_id UUID;
BEGIN
    SELECT id INTO div_id FROM public.divisions WHERE division_name = 'IT-A' LIMIT 1;
    
    INSERT INTO public.students (roll_number, full_name, division_id, email) VALUES
    ('22IT101', 'Aditya Sharma', div_id, 'aditya.s@example.com'),
    ('22IT102', 'Bhakti Patel', div_id, 'bhakti.p@example.com'),
    ('22IT103', 'Chetan Kumar', div_id, 'chetan.k@example.com'),
    ('22IT104', 'Deepika Iyer', div_id, 'deepika.i@example.com'),
    ('22IT105', 'Eshan Verma', div_id, 'eshan.v@example.com')
    ON CONFLICT (roll_number) DO NOTHING;
END $$;

-- 5. TIMETABLE & LECTURE RECORDS
DO $$
DECLARE
    priya_id UUID;
    div_a UUID;
    div_b UUID;
    sub_dbms UUID;
    sub_awp UUID;
    sub_os UUID;
    rm_101 UUID;
    rm_102 UUID;
BEGIN
    -- 1. Ensure Dr. Priya exists (Using a fixed UUID for consistency in testing if possible, or just generate)
    -- We'll look for her by name first
    SELECT id INTO priya_id FROM public.users WHERE full_name = 'Dr. Priya Sharma' LIMIT 1;
    
    IF priya_id IS NULL THEN
        -- Create a dummy ID for her in auth.users first if we were using a real system, 
        -- but here we assume she might be a real user or we just insert into public.users
        -- For seeding purposes, we'll try to find any existing user to become "Dr. Priya" 
        -- or just insert a mock one if the FK constraint allows (it won't if it's strictly enforced)
        
        -- Better approach: Find the first available user and RENAME them to Dr. Priya for this test
        -- OR just insert into public.users and ignore the FK for now if we can, but let's be safe.
        SELECT id INTO priya_id FROM public.users LIMIT 1;
        UPDATE public.users SET full_name = 'Dr. Priya Sharma' WHERE id = priya_id;
    END IF;

    -- Get common IDs
    SELECT id INTO div_a FROM public.divisions WHERE division_name = 'IT-A' LIMIT 1;
    SELECT id INTO div_b FROM public.divisions WHERE division_name = 'IT-B' LIMIT 1;
    SELECT id INTO sub_dbms FROM public.subjects WHERE short_name = 'DBMS' LIMIT 1;
    SELECT id INTO sub_awp FROM public.subjects WHERE short_name = 'AWP' LIMIT 1;
    SELECT id INTO sub_os FROM public.subjects WHERE short_name = 'OS' LIMIT 1;
    SELECT id INTO rm_101 FROM public.rooms WHERE room_number = 'M101' LIMIT 1;
    SELECT id INTO rm_102 FROM public.rooms WHERE room_number = 'M102' LIMIT 1;
    
    -- 2. Create 4 Sunday Timetable entries for Dr. Priya
    -- Slot 1: 9:00 - 10:00
    INSERT INTO public.timetable (faculty_id, division_id, subject_id, room_id, time_slot_id, day_of_week)
    VALUES (priya_id, div_a, sub_dbms, rm_101, (SELECT id FROM public.time_slots WHERE slot_label = '9:00 - 10:00' LIMIT 1), 'Sunday')
    ON CONFLICT DO NOTHING;

    -- Slot 2: 10:15 - 11:15
    INSERT INTO public.timetable (faculty_id, division_id, subject_id, room_id, time_slot_id, day_of_week)
    VALUES (priya_id, div_a, sub_awp, rm_101, (SELECT id FROM public.time_slots WHERE slot_label = '10:15 - 11:15' LIMIT 1), 'Sunday')
    ON CONFLICT DO NOTHING;

    -- Slot 3: 11:15 - 12:15
    INSERT INTO public.timetable (faculty_id, division_id, subject_id, room_id, time_slot_id, day_of_week)
    VALUES (priya_id, div_b, sub_os, rm_102, (SELECT id FROM public.time_slots WHERE slot_label = '11:15 - 12:15' LIMIT 1), 'Sunday')
    ON CONFLICT DO NOTHING;

    -- Slot 4: 13:00 - 14:00
    INSERT INTO public.timetable (faculty_id, division_id, subject_id, room_id, time_slot_id, day_of_week)
    VALUES (priya_id, div_b, sub_dbms, rm_102, (SELECT id FROM public.time_slots WHERE slot_label = '13:00 - 14:00' LIMIT 1), 'Sunday')
    ON CONFLICT DO NOTHING;

    -- 3. Create a recent record for her too
    INSERT INTO public.lecture_records (
        faculty_id, division_id, subject_id, room_id, 
        lecture_date, topic_covered, approval_status, present_count, total_students,
        scheduled_start, scheduled_end
    ) VALUES (
        priya_id, div_a, sub_dbms, rm_101,
        CURRENT_DATE, 'Sunday Morning Revision', 'pending', 0, 64,
        '09:00:00', '10:00:00'
    ) ON CONFLICT DO NOTHING;

END $$;
