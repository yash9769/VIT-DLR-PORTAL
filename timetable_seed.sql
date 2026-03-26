-- ============================================================
-- VIT DLR PORTAL — TIMETABLE SEED (Sem 4, 6, 8 — IT Dept)
-- Run this in the Supabase SQL Editor
-- ============================================================

BEGIN;

-- ── STEP 1: Add missing columns to timetable ──────────────────
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS batch_number INTEGER;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS custom_room TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS custom_subject TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS custom_division TEXT;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS custom_time_slot TEXT;

-- ── STEP 2: Add missing time slots ────────────────────────────
INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
  ('12:15 - 13:15', '12:15', '13:15', 7),
  ('13:45 - 14:45', '13:45', '14:45', 8),
  ('14:45 - 15:45', '14:45', '15:45', 9),
  ('15:45 - 16:45', '15:45', '16:45', 10),
  ('16:45 - 17:45', '16:45', '17:45', 11)
ON CONFLICT (start_time, end_time) DO NOTHING;

-- ── STEP 3: Add rooms ─────────────────────────────────────────
INSERT INTO public.rooms (room_number, room_type, has_smartboard) VALUES
  ('E101','classroom',true), ('E201','classroom',true), ('E204','classroom',true),
  ('E301','classroom',true), ('E303','classroom',true), ('E30','classroom',false),
  ('B203','classroom',false), ('B301','classroom',false),
  ('F102','classroom',false), ('F201','classroom',false),
  ('M202','classroom',false), ('M309','classroom',false), ('M310A','classroom',false),
  ('M315','classroom',false), ('M414A','classroom',false), ('M512A','classroom',false),
  ('M516A','classroom',false), ('M302','classroom',false),
  ('L07A','lab',false), ('L07B','lab',false), ('L07C','lab',false),
  ('L07D','lab',false), ('L07E','lab',false),
  ('L11A','lab',false), ('L11B','lab',false),
  ('CC02','lab',true), ('CC03','lab',true),
  ('IT-PROJ','seminar_hall',false), ('E-PROJ','seminar_hall',false),
  ('M-PROJ','seminar_hall',false), ('VIRTUAL','seminar_hall',false)
ON CONFLICT (room_number) DO NOTHING;

-- ── STEP 4: Add divisions ─────────────────────────────────────
INSERT INTO public.divisions (division_name, year, semester, department, strength) VALUES
  ('INFT-4-A', 2, 4, 'INFT', 80), ('INFT-4-B', 2, 4, 'INFT', 75), ('INFT-4-C', 2, 4, 'INFT', 75),
  ('INFT-6-A', 3, 6, 'INFT', 80), ('INFT-6-B', 3, 6, 'INFT', 80), ('INFT-6-C', 3, 6, 'INFT', 75),
  ('INFT-8-A', 4, 8, 'INFT', 75), ('INFT-8-B', 4, 8, 'INFT', 75)
ON CONFLICT (division_name, department, year) DO NOTHING;

-- ── STEP 5: Add subjects ──────────────────────────────────────
INSERT INTO public.subjects (subject_code, subject_name, short_name, department, lecture_type) VALUES
  ('S-TEST',    'Test / Examination Period',            'TEST',     'INFT', 'theory'),
  ('S-ADSBI',   'Advanced Databases & Business Intel',  'ADSBI',    'IT', 'practical'),
  ('S-SPD',     'Soft Skills & Personality Dev',        'SPD',      'IT', 'practical'),
  ('S-MVRP',    'Mini / Research Project',              'MVRP',     'IT', 'practical'),
  ('S-AT',      'Aptitude Training',                    'AT',       'IT', 'theory'),
  ('S-DBMS',    'Database Management Systems',          'DBMS',     'IT', 'theory'),
  ('S-OS',      'Operating Systems',                    'OS',       'IT', 'theory'),
  ('S-CN',      'Computer Networks',                    'CN',       'IT', 'theory'),
  ('S-PY',      'Python Programming',                   'PY',       'IT', 'theory'),
  ('S-FBET',    'Foreign Business English Training',    'FBET',     'IT', 'theory'),
  ('S-EM4',     'Engineering Mathematics IV',           'EM 4',     'IT', 'theory'),
  ('S-PCD1',    'Project / Course Design 1',            'PCD1',     'IT', 'theory'),
  ('S-OSLAB',   'Operating Systems Lab',                'OS LAB',   'IT', 'practical'),
  ('S-CNLAB',   'Computer Networks Lab',                'CN LAB',   'IT', 'practical'),
  ('S-DBMSLAB', 'Database Management Systems Lab',      'DBMS LAB', 'IT', 'practical'),
  ('S-STQA',    'Software Testing & QA',                'STQA',     'IT', 'theory'),
  ('S-STQALAB', 'Software Testing Lab',                 'STQA LAB', 'IT', 'practical'),
  ('S-SC',      'Security & Cloud',                     'SC',       'IT', 'theory'),
  ('S-SCLAB',   'Security & Cloud Lab',                 'SC LAB',   'IT', 'practical'),
  ('S-CC',      'Cloud Computing',                      'CC',       'IT', 'theory'),
  ('S-CCLAB',   'Cloud Computing Lab',                  'CC LAB',   'IT', 'practical'),
  ('S-DEVOPS',  'DevOps',                               'DEVOPS',   'IT', 'theory'),
  ('S-DVLAB',   'DevOps Lab',                           'DEVOPS LAB','IT','practical'),
  ('S-BI',      'Business Intelligence',                'BI',       'IT', 'theory'),
  ('S-UIUX',    'UI/UX Design',                         'UI/UX',    'IT', 'practical'),
  ('S-DFE',     'Data Forensics & Ethics',              'DFE',      'IT', 'theory'),
  ('S-DFELAB',  'Data Forensics & Ethics Lab',          'DFE LAB',  'IT', 'practical'),
  ('S-DF',      'Digital Forensics',                    'DF',       'IT', 'theory'),
  ('S-DFLAB',   'Digital Forensics Lab',                'DF LAB',   'IT', 'practical'),
  ('S-SSEH',    'Social Science Ethics & Humanity',     'SSEH',     'IT', 'theory'),
  ('S-SSEHLAB', 'SSEH Lab',                             'SSEH LAB', 'IT', 'practical'),
  ('S-PGM',     'Programming',                          'PGM',      'IT', 'theory'),
  ('S-PGMLAB',  'Programming Lab',                      'PGM LAB',  'IT', 'practical'),
  ('S-PROJ1',   'Minor Project Phase 1',                'PROJECT-1','IT', 'practical'),
  ('S-PROJ2',   'Major Project Phase 2',                'PROJECT-2','IT', 'practical'),
  ('S-ADSBI',   'Advanced Databases & Business Intel',  'ADSBI',    'INFT', 'practical'),
  ('S-SPD',     'Soft Skills & Personality Dev',        'SPD',      'INFT', 'practical'),
  ('S-MVRP',    'Mini / Research Project',              'MVRP',     'INFT', 'practical'),
  ('S-AT',      'Aptitude Training',                    'AT',       'INFT', 'theory'),
  ('S-DBMS',    'Database Management Systems',          'DBMS',     'INFT', 'theory'),
  ('S-OS',      'Operating Systems',                    'OS',       'INFT', 'theory'),
  ('S-CN',      'Computer Networks',                    'CN',       'INFT', 'theory'),
  ('S-PY',      'Python Programming',                   'PY',       'INFT', 'theory'),
  ('S-FBET',    'Foreign Business English Training',    'FBET',     'INFT', 'theory'),
  ('S-EM4',     'Engineering Mathematics IV',           'EM 4',     'INFT', 'theory'),
  ('S-PCD1',    'Project / Course Design 1',            'PCD1',     'INFT', 'theory'),
  ('S-OSLAB',   'Operating Systems Lab',                'OS LAB',   'INFT', 'practical'),
  ('S-CNLAB',   'Computer Networks Lab',                'CN LAB',   'INFT', 'practical'),
  ('S-DBMSLAB', 'Database Management Systems Lab',      'DBMS LAB', 'INFT', 'practical'),
  ('S-STQA',    'Software Testing & QA',                'STQA',     'INFT', 'theory'),
  ('S-STQALAB', 'Software Testing Lab',                 'STQA LAB', 'INFT', 'practical'),
  ('S-SC',      'Security & Cloud',                     'SC',       'INFT', 'theory'),
  ('S-SCLAB',   'Security & Cloud Lab',                 'SC LAB',   'INFT', 'practical'),
  ('S-CC',      'Cloud Computing',                      'CC',       'INFT', 'theory'),
  ('S-CCLAB',   'Cloud Computing Lab',                  'CC LAB',   'INFT', 'practical'),
  ('S-DEVOPS',  'DevOps',                               'DEVOPS',   'INFT', 'theory'),
  ('S-DVLAB',   'DevOps Lab',                           'DEVOPS LAB','INFT','practical'),
  ('S-BI',      'Business Intelligence',                'BI',       'INFT', 'theory'),
  ('S-UIUX',    'UI/UX Design',                         'UI/UX',    'INFT', 'practical'),
  ('S-DFE',     'Data Forensics & Ethics',              'DFE',      'INFT', 'theory'),
  ('S-DFELAB',  'Data Forensics & Ethics Lab',          'DFE LAB',  'INFT', 'practical'),
  ('S-DF',      'Digital Forensics',                    'DF',       'INFT', 'theory'),
  ('S-DFLAB',   'Digital Forensics Lab',                'DF LAB',   'INFT', 'practical'),
  ('S-SSEH',    'Social Science Ethics & Humanity',     'SSEH',     'INFT', 'theory'),
  ('S-SSEHLAB', 'SSEH Lab',                             'SSEH LAB', 'INFT', 'practical'),
  ('S-PGM',     'Programming',                          'PGM',      'INFT', 'theory'),
  ('S-PGMLAB',  'Programming Lab',                      'PGM LAB',  'INFT', 'practical'),
  ('S-PROJ1',   'Minor Project Phase 1',                'PROJECT-1','INFT', 'practical'),
  ('S-PROJ2',   'Major Project Phase 2',                'PROJECT-2','INFT', 'practical'),
  ('S-SBPROJ',  'Startup / Business Project',           'SB_PROJECT','INFT','practical'),
  ('S-SCD',     'Seminar / Course Design',              'SCD',      'INFT', 'theory'),
  ('S-NGAIML',  'Next Gen AI/ML',                       'NG-AIML',  'INFT', 'practical'),
  ('S-NGAIML1', 'Next Gen AI/ML Lab 1',                 'NG-AIML-1','INFT', 'practical'),
  ('S-NGAIML2', 'Next Gen AI/ML Lab 2',                 'NG-AIML-2','INFT', 'practical'),
  ('S-NGAIML3', 'Next Gen AI/ML Lab 3',                 'NG-AIML-3','INFT', 'practical'),
  ('S-NGCS',    'Next Gen Cyber Security',              'NG-CS',    'INFT', 'practical'),
  ('S-NGDS',    'Next Gen Data Science',                'NG-DS',    'INFT', 'practical')
ON CONFLICT (subject_code) DO NOTHING;

-- ── STEP 6: Placeholder faculty for unknown codes ─────────────
INSERT INTO public.users (id, email, full_name, role, department, initials, is_active) VALUES
  (gen_random_uuid(),'test.period@placeholder.vit','Test / Exam Period',   'faculty','INFT','TEST',true),
  (gen_random_uuid(),'ex1@placeholder.vit',         'External Faculty EX1', 'faculty','INFT','EX1', true),
  (gen_random_uuid(),'ex2@placeholder.vit',         'External Faculty EX2', 'faculty','INFT','EX2', true),
  (gen_random_uuid(),'gn@placeholder.vit',          'Faculty GN',           'faculty','INFT','GN',  true),
  (gen_random_uuid(),'sam@placeholder.vit',         'Faculty SAM',          'faculty','INFT','SAM', true),
  (gen_random_uuid(),'et1@placeholder.vit',         'External Trainer ET1', 'faculty','INFT','ET1', true),
  (gen_random_uuid(),'et2@placeholder.vit',         'External Trainer ET2', 'faculty','INFT','ET2', true),
  (gen_random_uuid(),'sm@placeholder.vit',          'Faculty SM',           'faculty','INFT','SM',  true),
  (gen_random_uuid(),'usk@placeholder.vit',         'Faculty USK',          'faculty','INFT','USK', true),
  (gen_random_uuid(),'ank@placeholder.vit',         'Faculty ANK',          'faculty','INFT','ANK', true),
  (gen_random_uuid(),'ras@placeholder.vit',         'Faculty RAS',          'faculty','INFT','RAS', true),
  (gen_random_uuid(),'swa@placeholder.vit',         'Faculty SWA',          'faculty','INFT','SWA', true),
  (gen_random_uuid(),'it1@placeholder.vit',         'Project Mentor INFT1',   'faculty','INFT','INFT1', true),
  (gen_random_uuid(),'it2@placeholder.vit',         'Project Mentor INFT2',   'faculty','INFT','INFT2', true),
  (gen_random_uuid(),'it3@placeholder.vit',         'Project Mentor INFT3',   'faculty','INFT','INFT3', true),
  (gen_random_uuid(),'it4@placeholder.vit',         'Project Mentor INFT4',   'faculty','INFT','INFT4', true),
  (gen_random_uuid(),'it5@placeholder.vit',         'Project Mentor INFT5',   'faculty','INFT','INFT5', true),
  (gen_random_uuid(),'it6@placeholder.vit',         'Project Mentor INFT6',   'faculty','INFT','INFT6', true),
  (gen_random_uuid(),'it7@placeholder.vit',         'Project Mentor INFT7',   'faculty','INFT','INFT7', true),
  (gen_random_uuid(),'it8@placeholder.vit',         'Project Mentor INFT8',   'faculty','INFT','INFT8', true)
ON CONFLICT (email) DO NOTHING;

-- ── STEP 7: Clear existing timetable ──────────────────────────
UPDATE public.lecture_records SET timetable_id = NULL WHERE timetable_id IS NOT NULL;
DELETE FROM public.timetable;

-- ── STEP 8: Helper insert function ────────────────────────────
CREATE OR REPLACE FUNCTION _tt(
  p_sem INT, p_div TEXT, p_day TEXT, p_time TEXT,
  p_sub TEXT, p_fac TEXT, p_room TEXT, p_batch INT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_year  INT := CASE p_sem WHEN 4 THEN 2 WHEN 6 THEN 3 WHEN 8 THEN 4 END;
  v_div   UUID; v_sub UUID; v_fac UUID; v_rm UUID; v_ts UUID;
  v_start TIME := SPLIT_PART(p_time, '-', 1)::TIME;
  v_div_name TEXT := 'INFT-' || p_sem || '-' || p_div;
BEGIN
  SELECT id INTO v_div FROM public.divisions   WHERE division_name = v_div_name AND year = v_year LIMIT 1;
  SELECT id INTO v_sub FROM public.subjects    WHERE short_name = p_sub              LIMIT 1;
  SELECT id INTO v_fac FROM public.users       WHERE initials   = COALESCE(p_fac,'TEST') LIMIT 1;
  SELECT id INTO v_rm  FROM public.rooms       WHERE room_number = p_room            LIMIT 1;
  SELECT id INTO v_ts  FROM public.time_slots  WHERE start_time  = v_start           LIMIT 1;

  IF v_div IS NULL OR v_sub IS NULL OR v_fac IS NULL OR v_ts IS NULL THEN
    RAISE WARNING 'Skipping sem=% div=% % % sub=% fac=% (lookup failed)',
      p_sem, p_div, p_day, p_time, p_sub, p_fac;
    RETURN;
  END IF;

  INSERT INTO public.timetable
    (faculty_id, division_id, subject_id, room_id, time_slot_id,
     day_of_week, batch_number, custom_room, is_active)
  VALUES
    (v_fac, v_div, v_sub, v_rm, v_ts,
     p_day::day_of_week, p_batch, p_room, TRUE);
END;
$$;

-- ── STEP 9: INSERT ALL TIMETABLE ROWS ─────────────────────────
DO $$ BEGIN

/* ═══════════════ SEM 4 — DIVISION A ════════════════════════ */
-- MONDAY
PERFORM _tt(4,'A','Monday','09:00-10:00','TEST',  'TEST',NULL,  NULL);
PERFORM _tt(4,'A','Monday','11:15-12:15','ADSBI', 'AVL', 'E201',1);
PERFORM _tt(4,'A','Monday','11:15-12:15','SPD',   'EX1', 'F102',2);
PERFORM _tt(4,'A','Monday','11:15-12:15','MVRP',  'GN',  'B301',3);
PERFORM _tt(4,'A','Monday','13:45-14:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'A','Monday','13:45-14:45','MVRP',  'GN',  'B301',2);
PERFORM _tt(4,'A','Monday','14:45-15:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'A','Monday','14:45-15:45','MVRP',  'GN',  'M414A',2);
PERFORM _tt(4,'A','Monday','15:45-16:45','MVRP',  'GN',  'M414A',1);
PERFORM _tt(4,'A','Monday','15:45-16:45','MVRP',  'SAM', 'M414A',2);
-- TUESDAY
PERFORM _tt(4,'A','Tuesday','09:00-10:00','AT',      'ST', 'E101',NULL);
PERFORM _tt(4,'A','Tuesday','11:15-12:15','DBMS',    'VB', 'E101',NULL);
PERFORM _tt(4,'A','Tuesday','13:45-14:45','OS LAB',  'RSR','L07B',1);
PERFORM _tt(4,'A','Tuesday','13:45-14:45','CN LAB',  'ARK','L11A',2);
PERFORM _tt(4,'A','Tuesday','13:45-14:45','DBMS LAB','AVL','L07D',3);
PERFORM _tt(4,'A','Tuesday','14:45-15:45','MVRP',    'GN', 'M414A',NULL);
PERFORM _tt(4,'A','Tuesday','15:45-16:45','FBET',    'ET1','M315',NULL);
-- WEDNESDAY
PERFORM _tt(4,'A','Wednesday','09:00-10:00','CN',      'KGD','E101',NULL);
PERFORM _tt(4,'A','Wednesday','11:15-12:15','OS',      'RSR','E101',NULL);
PERFORM _tt(4,'A','Wednesday','13:45-14:45','PY',      'BGT','CC03',1);
PERFORM _tt(4,'A','Wednesday','13:45-14:45','OS LAB',  'RSR','L07B',2);
PERFORM _tt(4,'A','Wednesday','13:45-14:45','CN LAB',  'ARK','L11A',3);
PERFORM _tt(4,'A','Wednesday','15:45-16:45','FBET',    'ET1','M315',NULL);
-- THURSDAY
PERFORM _tt(4,'A','Thursday','09:00-10:00','DBMS LAB','VB', 'L07D',1);
PERFORM _tt(4,'A','Thursday','09:00-10:00','PY',      'PCK','CC03',2);
PERFORM _tt(4,'A','Thursday','09:00-10:00','OS LAB',  'RSR','L07B',3);
PERFORM _tt(4,'A','Thursday','11:15-12:15','EM 4',    'USK','E101',NULL);
PERFORM _tt(4,'A','Thursday','13:45-14:45','PY',      'PCK','E101',NULL);
PERFORM _tt(4,'A','Thursday','15:45-16:45','ADSBI',   'AVL','E201',1);
PERFORM _tt(4,'A','Thursday','15:45-16:45','MVRP',    'SAM','M414A',2);
-- FRIDAY
PERFORM _tt(4,'A','Friday','09:00-10:00','CN LAB',  'VVB','L11A',1);
PERFORM _tt(4,'A','Friday','09:00-10:00','DBMS LAB','VB', 'L07D',2);
PERFORM _tt(4,'A','Friday','09:00-10:00','PY',      'PCK','CC03',3);
PERFORM _tt(4,'A','Friday','11:15-12:15','EM 4',    'USK','E101',NULL);
PERFORM _tt(4,'A','Friday','12:15-13:15','AT',      'ST', 'E101',NULL);
PERFORM _tt(4,'A','Friday','13:45-14:45','PCD1',    'IT6','E101',NULL);

/* ═══════════════ SEM 4 — DIVISION B ════════════════════════ */
-- MONDAY
PERFORM _tt(4,'B','Monday','09:00-10:00','TEST',  'TEST',NULL,  NULL);
PERFORM _tt(4,'B','Monday','11:15-12:15','ADSBI', 'AVL', 'E201',1);
PERFORM _tt(4,'B','Monday','11:15-12:15','SPD',   'EX1', 'F102',2);
PERFORM _tt(4,'B','Monday','11:15-12:15','MVRP',  'GN',  'B301',3);
PERFORM _tt(4,'B','Monday','13:45-14:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'B','Monday','13:45-14:45','MVRP',  'GN',  'B301',2);
PERFORM _tt(4,'B','Monday','14:45-15:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'B','Monday','14:45-15:45','MVRP',  'GN',  'M414A',2);
PERFORM _tt(4,'B','Monday','15:45-16:45','MVRP',  'GN',  'M414A',1);
PERFORM _tt(4,'B','Monday','15:45-16:45','MVRP',  'SAM', 'M414A',2);
-- TUESDAY
PERFORM _tt(4,'B','Tuesday','09:00-10:00','CN LAB',  'ARK','L11A',1);
PERFORM _tt(4,'B','Tuesday','09:00-10:00','DBMS LAB','AVL','L07D',2);
PERFORM _tt(4,'B','Tuesday','09:00-10:00','PY',      'PCK','CC03',3);
PERFORM _tt(4,'B','Tuesday','11:15-12:15','OS',      'RSR','E204',NULL);
PERFORM _tt(4,'B','Tuesday','13:45-14:45','AT',      'ST', 'E204',NULL);
PERFORM _tt(4,'B','Tuesday','14:45-15:45','EM 4',    'USK','E204',NULL);
PERFORM _tt(4,'B','Tuesday','15:45-16:45','FBET',    'ET1','M315',NULL);
-- WEDNESDAY
PERFORM _tt(4,'B','Wednesday','09:00-10:00','OS LAB',  'RSR','L07B',1);
PERFORM _tt(4,'B','Wednesday','09:00-10:00','CN LAB',  'VVB','L11A',2);
PERFORM _tt(4,'B','Wednesday','09:00-10:00','DBMS LAB','VDC','L07D',3);
PERFORM _tt(4,'B','Wednesday','11:15-12:15','DBMS',    'VDC','E204',NULL);
PERFORM _tt(4,'B','Wednesday','13:45-14:45','PY',      'PCK','E204',NULL);
PERFORM _tt(4,'B','Wednesday','15:45-16:45','FBET',    'ET1','M315',NULL);
-- THURSDAY
PERFORM _tt(4,'B','Thursday','09:00-10:00','AT',      'ST', 'E303',NULL);
PERFORM _tt(4,'B','Thursday','11:15-12:15','DBMS LAB','AVL','L07D',1);
PERFORM _tt(4,'B','Thursday','11:15-12:15','PY',      'PCK','CC03',2);
PERFORM _tt(4,'B','Thursday','11:15-12:15','OS LAB',  'RSR','L07B',3);
PERFORM _tt(4,'B','Thursday','13:45-14:45','EM 4',    'USK','E204',NULL);
PERFORM _tt(4,'B','Thursday','15:45-16:45','ADSBI',   'AVL','E201',1);
PERFORM _tt(4,'B','Thursday','15:45-16:45','MVRP',    'SAM','M414A',2);
-- FRIDAY
PERFORM _tt(4,'B','Friday','09:00-10:00','PCD1',  'IT6','E101',NULL);
PERFORM _tt(4,'B','Friday','11:15-12:15','PY',    'PCK','CC03',1);
PERFORM _tt(4,'B','Friday','11:15-12:15','OS LAB','RSR','L07B',2);
PERFORM _tt(4,'B','Friday','11:15-12:15','CN LAB','VVB','L11A',3);
PERFORM _tt(4,'B','Friday','13:45-14:45','CN',    'KGD','E204',NULL);

/* ═══════════════ SEM 4 — DIVISION C ════════════════════════ */
-- MONDAY
PERFORM _tt(4,'C','Monday','09:00-10:00','TEST',  'TEST',NULL,  NULL);
PERFORM _tt(4,'C','Monday','11:15-12:15','ADSBI', 'AVL', 'E201',1);
PERFORM _tt(4,'C','Monday','11:15-12:15','SPD',   'EX1', 'F102',2);
PERFORM _tt(4,'C','Monday','11:15-12:15','MVRP',  'GN',  'B301',3);
PERFORM _tt(4,'C','Monday','13:45-14:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'C','Monday','13:45-14:45','MVRP',  'GN',  'B301',2);
PERFORM _tt(4,'C','Monday','14:45-15:45','SPD',   'EX1', 'F102',1);
PERFORM _tt(4,'C','Monday','14:45-15:45','MVRP',  'GN',  'M414A',2);
PERFORM _tt(4,'C','Monday','15:45-16:45','MVRP',  'GN',  'M414A',1);
PERFORM _tt(4,'C','Monday','15:45-16:45','MVRP',  'SAM', 'M414A',2);
-- TUESDAY
PERFORM _tt(4,'C','Tuesday','09:00-10:00','PCD1','IT6','E301',NULL);
PERFORM _tt(4,'C','Tuesday','11:15-12:15','DBMS','VDC','E301',NULL);
PERFORM _tt(4,'C','Tuesday','13:45-14:45','CN',  'KGD','E301',NULL);
PERFORM _tt(4,'C','Tuesday','15:45-16:45','FBET','ET1','M315',NULL);
-- WEDNESDAY
PERFORM _tt(4,'C','Wednesday','09:00-10:00','PY',      'PCK','CC03',1);
PERFORM _tt(4,'C','Wednesday','09:00-10:00','OS LAB',  'SM', 'L07A',2);
PERFORM _tt(4,'C','Wednesday','09:00-10:00','CN LAB',  'ARK','L11B',3);
PERFORM _tt(4,'C','Wednesday','11:15-12:15','DBMS LAB','AVL','L07D',1);
PERFORM _tt(4,'C','Wednesday','11:15-12:15','PY',      'PCK','CC03',2);
PERFORM _tt(4,'C','Wednesday','11:15-12:15','OS LAB',  'SM', 'L07B',3);
PERFORM _tt(4,'C','Wednesday','13:45-14:45','EM 4',    'USK','E301',NULL);
PERFORM _tt(4,'C','Wednesday','15:45-16:45','FBET',    'ET1','M315',NULL);
-- THURSDAY
PERFORM _tt(4,'C','Thursday','09:00-10:00','CN LAB',  'VVB','L11A',1);
PERFORM _tt(4,'C','Thursday','09:00-10:00','DBMS LAB','VDC','L07A',2);
PERFORM _tt(4,'C','Thursday','09:00-10:00','PY',      'BGT','L11B',3);
PERFORM _tt(4,'C','Thursday','11:15-12:15','AT',      'ST', 'E301',NULL);
PERFORM _tt(4,'C','Thursday','13:45-14:45','OS',      'RSR','E301',NULL);
PERFORM _tt(4,'C','Thursday','15:45-16:45','ADSBI',   'AVL','E201',1);
PERFORM _tt(4,'C','Thursday','15:45-16:45','MVRP',    'SAM','M414A',2);
-- FRIDAY
PERFORM _tt(4,'C','Friday','09:00-10:00','OS LAB',  'RSR','L07B',1);
PERFORM _tt(4,'C','Friday','09:00-10:00','CN LAB',  'ARK','L11B',2);
PERFORM _tt(4,'C','Friday','09:00-10:00','DBMS LAB','AVL','L07A',3);
PERFORM _tt(4,'C','Friday','11:15-12:15','AT',      'ST', 'E301',NULL);
PERFORM _tt(4,'C','Friday','12:15-13:15','EM 4',    'USK','E301',NULL);
PERFORM _tt(4,'C','Friday','13:45-14:45','PY',      'PCK','E301',NULL);

/* ═══════════════ SEM 6 — DIVISION A ════════════════════════ */
-- MONDAY
PERFORM _tt(6,'A','Monday','09:00-10:00','TEST','TEST',NULL,  NULL);
PERFORM _tt(6,'A','Monday','11:15-12:15','FBET','ET2','M309',NULL);
PERFORM _tt(6,'A','Monday','13:45-14:45','FBET','ET2','M315',NULL);
PERFORM _tt(6,'A','Monday','15:45-16:45','FBET','ET2','M315',NULL);
-- TUESDAY
PERFORM _tt(6,'A','Tuesday','09:00-10:00','STQA LAB',  'DSJ','L07C',1);
PERFORM _tt(6,'A','Tuesday','09:00-10:00','SC LAB',    'SM', 'CC02',2);
PERFORM _tt(6,'A','Tuesday','09:00-10:00','PROJECT-1', 'IT1','IT-PROJ',3);
PERFORM _tt(6,'A','Tuesday','09:00-10:00','SB_PROJECT','IT2','E-PROJ',4);
PERFORM _tt(6,'A','Tuesday','11:15-12:15','STQA',      'DSJ','E201',NULL);
PERFORM _tt(6,'A','Tuesday','13:45-14:45','CC',        'DG', 'E201',NULL);
PERFORM _tt(6,'A','Tuesday','15:45-16:45','MVRP',      'ANK','B203',1);
PERFORM _tt(6,'A','Tuesday','15:45-16:45','ADSBI',     'AVL','M202',2);
PERFORM _tt(6,'A','Tuesday','16:45-17:45','ADSBI',     'AVL','M202',NULL);
-- WEDNESDAY
PERFORM _tt(6,'A','Wednesday','09:00-10:00','DEVOPS LAB','DST','E201',1);
PERFORM _tt(6,'A','Wednesday','09:00-10:00','PROJECT-1', 'IT1','IT-PROJ',2);
PERFORM _tt(6,'A','Wednesday','09:00-10:00','SB_PROJECT','IT2','E-PROJ',3);
PERFORM _tt(6,'A','Wednesday','11:15-12:15','DEVOPS LAB','DST','CC02',1);
PERFORM _tt(6,'A','Wednesday','11:15-12:15','PROJECT-1', 'IT1','IT-PROJ',2);
PERFORM _tt(6,'A','Wednesday','11:15-12:15','CC LAB',    'KGD','L11B',3);
PERFORM _tt(6,'A','Wednesday','11:15-12:15','STQA LAB',  'DSJ','L07C',4);
PERFORM _tt(6,'A','Wednesday','13:45-14:45','CC LAB',    'ST', 'L07C',1);
PERFORM _tt(6,'A','Wednesday','13:45-14:45','DEVOPS LAB','DST','CC02',2);
PERFORM _tt(6,'A','Wednesday','13:45-14:45','PGM LAB',   'NKR','L07E',3);
PERFORM _tt(6,'A','Wednesday','13:45-14:45','CC LAB',    'KGD','L11B',4);
PERFORM _tt(6,'A','Wednesday','15:45-16:45','ADSBI',     'AVL','M202',1);
PERFORM _tt(6,'A','Wednesday','15:45-16:45','FBET',      'ET2','M309',2);
PERFORM _tt(6,'A','Wednesday','15:45-16:45','MVRP',      'ANK','B203',3);
-- THURSDAY
PERFORM _tt(6,'A','Thursday','09:00-10:00','SC',         'SM', 'E201',1);
PERFORM _tt(6,'A','Thursday','09:00-10:00','DFE',        'NKR','E101',2);
PERFORM _tt(6,'A','Thursday','09:00-10:00','SSEH',       'DM', 'E204',3);
PERFORM _tt(6,'A','Thursday','11:15-12:15','PGM',        'NKR','E201',1);
PERFORM _tt(6,'A','Thursday','11:15-12:15','SSEH LAB',   'DM', 'L07C',2);
PERFORM _tt(6,'A','Thursday','13:45-14:45','SC LAB',     'SM', 'L07B',1);
PERFORM _tt(6,'A','Thursday','13:45-14:45','CC LAB',     'KGD','L11B',2);
PERFORM _tt(6,'A','Thursday','13:45-14:45','STQA LAB',   'DSJ','L07C',3);
PERFORM _tt(6,'A','Thursday','13:45-14:45','DEVOPS LAB', 'DST','CC02',4);
PERFORM _tt(6,'A','Thursday','15:45-16:45','SPD',        'EX2','F201',1);
PERFORM _tt(6,'A','Thursday','15:45-16:45','MVRP',       'RAS','M310A',2);
PERFORM _tt(6,'A','Thursday','15:45-16:45','MVRP',       'SWA','M516A',3);
-- FRIDAY
PERFORM _tt(6,'A','Friday','09:00-10:00','PGM LAB',   'DG', 'L07C',1);
PERFORM _tt(6,'A','Friday','09:00-10:00','SB_PROJECT','IT2','E-PROJ',2);
PERFORM _tt(6,'A','Friday','09:00-10:00','PROJECT-1', 'IT1','IT-PROJ',3);
PERFORM _tt(6,'A','Friday','09:00-10:00','DF',         'DM', 'E204',4);
PERFORM _tt(6,'A','Friday','11:15-12:15','PROJECT-1', 'IT1','IT-PROJ',1);
PERFORM _tt(6,'A','Friday','11:15-12:15','STQA LAB',  'DSJ','L07D',2);
PERFORM _tt(6,'A','Friday','11:15-12:15','DEVOPS LAB','DST','CC02',3);
PERFORM _tt(6,'A','Friday','11:15-12:15','DF LAB',    'DM', 'L07C',4);
PERFORM _tt(6,'A','Friday','13:45-14:45','SB_PROJECT','IT2','E-PROJ',1);
PERFORM _tt(6,'A','Friday','13:45-14:45','PGM LAB',   'DG', 'L11A',2);
PERFORM _tt(6,'A','Friday','13:45-14:45','DFE LAB',   'NKR','L11B',3);
PERFORM _tt(6,'A','Friday','13:45-14:45','PROJECT-1', 'IT1','IT-PROJ',4);
PERFORM _tt(6,'A','Friday','15:45-16:45','SPD',        'EX2','F201',1);
PERFORM _tt(6,'A','Friday','15:45-16:45','MVRP',       'SWA','M512A',2);
-- SATURDAY
PERFORM _tt(6,'A','Saturday','09:00-10:00','SCD','IT6','E101',NULL);

/* ═══════════════ SEM 6 — DIVISION B ════════════════════════ */
-- MONDAY
PERFORM _tt(6,'B','Monday','09:00-10:00','TEST','TEST',NULL,  NULL);
PERFORM _tt(6,'B','Monday','11:15-12:15','FBET','ET2','M309',NULL);
PERFORM _tt(6,'B','Monday','13:45-14:45','FBET','ET2','M315',NULL);
PERFORM _tt(6,'B','Monday','15:45-16:45','FBET','ET2','M315',NULL);
-- TUESDAY
PERFORM _tt(6,'B','Tuesday','09:00-10:00','DEVOPS LAB','DST','E201',1);
PERFORM _tt(6,'B','Tuesday','09:00-10:00','CC LAB',    'ST', 'CC02',2);
PERFORM _tt(6,'B','Tuesday','09:00-10:00','SB_PROJECT','IT2','E-PROJ',3);
PERFORM _tt(6,'B','Tuesday','09:00-10:00','PROJECT-1', 'IT1','IT-PROJ',4);
PERFORM _tt(6,'B','Tuesday','11:15-12:15','CC LAB',    'ST', 'L11B',1);
PERFORM _tt(6,'B','Tuesday','11:15-12:15','SC LAB',    'SM', 'L07B',2);
PERFORM _tt(6,'B','Tuesday','11:15-12:15','DEVOPS LAB','DST','CC02',3);
PERFORM _tt(6,'B','Tuesday','11:15-12:15','CC LAB',    'KGD','L07C',4);
PERFORM _tt(6,'B','Tuesday','13:45-14:45','PROJECT-1', 'IT1','IT-PROJ',1);
PERFORM _tt(6,'B','Tuesday','13:45-14:45','PGM LAB',   'NKR','L07A',2);
PERFORM _tt(6,'B','Tuesday','13:45-14:45','STQA LAB',  'SDG','L07C',3);
PERFORM _tt(6,'B','Tuesday','13:45-14:45','SB_PROJECT','IT2','E-PROJ',4);
PERFORM _tt(6,'B','Tuesday','15:45-16:45','MVRP',      'ANK','B203',1);
PERFORM _tt(6,'B','Tuesday','15:45-16:45','ADSBI',     'AVL','M202',2);
PERFORM _tt(6,'B','Tuesday','16:45-17:45','ADSBI',     'AVL','M202',NULL);
-- WEDNESDAY
PERFORM _tt(6,'B','Wednesday','09:00-10:00','STQA LAB','SDG','L07C',NULL);
PERFORM _tt(6,'B','Wednesday','11:15-12:15','CC',      'DG', 'E201',NULL);
PERFORM _tt(6,'B','Wednesday','13:45-14:45','STQA',    'DSJ','E201',NULL);
PERFORM _tt(6,'B','Wednesday','15:45-16:45','ADSBI',   'AVL','M202',1);
PERFORM _tt(6,'B','Wednesday','15:45-16:45','FBET',    'ET2','M309',2);
PERFORM _tt(6,'B','Wednesday','15:45-16:45','MVRP',    'ANK','B203',3);
-- THURSDAY
PERFORM _tt(6,'B','Thursday','09:00-10:00','SC',         'SM', 'E201',1);
PERFORM _tt(6,'B','Thursday','09:00-10:00','DEVOPS LAB', 'DST','CC02',2);
PERFORM _tt(6,'B','Thursday','09:00-10:00','DFE',        'NKR','E101',3);
PERFORM _tt(6,'B','Thursday','09:00-10:00','SSEH',       'DM', 'E204',4);
PERFORM _tt(6,'B','Thursday','11:15-12:15','SC LAB',     'SM', 'L11A',1);
PERFORM _tt(6,'B','Thursday','11:15-12:15','STQA LAB',   'DSJ','L07E',2);
PERFORM _tt(6,'B','Thursday','11:15-12:15','PGM LAB',    'DG', 'L07A',3);
PERFORM _tt(6,'B','Thursday','11:15-12:15','SSEH LAB',   'DM', 'L07C',4);
PERFORM _tt(6,'B','Thursday','13:45-14:45','PGM LAB',    'NKR','L11A',1);
PERFORM _tt(6,'B','Thursday','13:45-14:45','SB_PROJECT', 'IT2','E-PROJ',2);
PERFORM _tt(6,'B','Thursday','13:45-14:45','PROJECT-1',  'IT1','IT-PROJ',3);
PERFORM _tt(6,'B','Thursday','13:45-14:45','DEVOPS LAB', 'DST','CC02',4);
PERFORM _tt(6,'B','Thursday','15:45-16:45','SPD',        'EX2','F201',1);
PERFORM _tt(6,'B','Thursday','15:45-16:45','MVRP',       'RAS','M310A',2);
PERFORM _tt(6,'B','Thursday','15:45-16:45','MVRP',       'SWA','M516A',3);
-- FRIDAY
PERFORM _tt(6,'B','Friday','09:00-10:00','DEVOPS LAB','DST','CC02',1);
PERFORM _tt(6,'B','Friday','09:00-10:00','SC',        'SM', 'E303',2);
PERFORM _tt(6,'B','Friday','09:00-10:00','CC LAB',    'KGD','L07E',3);
PERFORM _tt(6,'B','Friday','09:00-10:00','DF',        'DM', 'E204',4);
PERFORM _tt(6,'B','Friday','11:15-12:15','PGM',       'NKR','E303',NULL);
PERFORM _tt(6,'B','Friday','11:15-12:15','DF LAB',    'DM', 'L07C',NULL);
PERFORM _tt(6,'B','Friday','13:45-14:45','SB_PROJECT','IT3','M-PROJ',1);
PERFORM _tt(6,'B','Friday','13:45-14:45','PROJECT-1', 'IT4','VIRTUAL',2);
PERFORM _tt(6,'B','Friday','13:45-14:45','DFE LAB',   'NKR','L11B',3);
PERFORM _tt(6,'B','Friday','13:45-14:45','STQA LAB',  'DSJ','L07C',4);
PERFORM _tt(6,'B','Friday','15:45-16:45','SPD',       'EX2','F201',1);
PERFORM _tt(6,'B','Friday','15:45-16:45','MVRP',      'SWA','M512A',2);
-- SATURDAY
PERFORM _tt(6,'B','Saturday','09:00-10:00','SCD','IT7','E201',NULL);

/* ═══════════════ SEM 6 — DIVISION C ════════════════════════ */
-- MONDAY
PERFORM _tt(6,'C','Monday','09:00-10:00','TEST','TEST',NULL,  NULL);
PERFORM _tt(6,'C','Monday','11:15-12:15','FBET','ET2','M309',NULL);
PERFORM _tt(6,'C','Monday','13:45-14:45','FBET','ET2','M315',NULL);
PERFORM _tt(6,'C','Monday','15:45-16:45','FBET','ET2','M315',NULL);
-- TUESDAY
PERFORM _tt(6,'C','Tuesday','09:00-10:00','CC',        'DG', 'E204',NULL);
PERFORM _tt(6,'C','Tuesday','11:15-12:15','PROJECT-1', 'IT1','IT-PROJ',1);
PERFORM _tt(6,'C','Tuesday','11:15-12:15','PGM LAB',   'NKR','L07D',2);
PERFORM _tt(6,'C','Tuesday','11:15-12:15','DEVOPS LAB','DST','CC02',3);
PERFORM _tt(6,'C','Tuesday','11:15-12:15','CC LAB',    'KGD','L07C',4);
PERFORM _tt(6,'C','Tuesday','13:45-14:45','DEVOPS LAB','DST','E101',1);
PERFORM _tt(6,'C','Tuesday','13:45-14:45','PROJECT-1', 'IT1','IT-PROJ',2);
PERFORM _tt(6,'C','Tuesday','13:45-14:45','PGM LAB',   'NKR','L07E',3);
PERFORM _tt(6,'C','Tuesday','13:45-14:45','FBET',      'ET2','M315',4);
PERFORM _tt(6,'C','Tuesday','15:45-16:45','MVRP',      'ANK','B203',1);
PERFORM _tt(6,'C','Tuesday','15:45-16:45','ADSBI',     'AVL','M202',2);
PERFORM _tt(6,'C','Tuesday','16:45-17:45','ADSBI',     'AVL','M202',NULL);
-- WEDNESDAY
PERFORM _tt(6,'C','Wednesday','09:00-10:00','STQA',    'DSJ','E301',NULL);
PERFORM _tt(6,'C','Wednesday','11:15-12:15','PGM',     'NKR','E301',NULL);
PERFORM _tt(6,'C','Wednesday','13:45-14:45','SC LAB',    'SM', 'L07A',1);
PERFORM _tt(6,'C','Wednesday','13:45-14:45','PROJECT-1', 'IT1','IT-PROJ',2);
PERFORM _tt(6,'C','Wednesday','13:45-14:45','PGM LAB',   'NKR','L07E',3);
PERFORM _tt(6,'C','Wednesday','13:45-14:45','SB_PROJECT','IT2','E-PROJ',4);
PERFORM _tt(6,'C','Wednesday','15:45-16:45','ADSBI',     'AVL','M202',1);
PERFORM _tt(6,'C','Wednesday','15:45-16:45','FBET',      'ET2','M309',2);
PERFORM _tt(6,'C','Wednesday','15:45-16:45','MVRP',      'ANK','B203',3);
-- THURSDAY
PERFORM _tt(6,'C','Thursday','09:00-10:00','CC LAB',    'KGD','L07E',1);
PERFORM _tt(6,'C','Thursday','09:00-10:00','STQA LAB',  'DSJ','L07C',2);
PERFORM _tt(6,'C','Thursday','09:00-10:00','DFE',       'NKR','E101',3);
PERFORM _tt(6,'C','Thursday','09:00-10:00','SSEH',      'DM', 'E204',4);
PERFORM _tt(6,'C','Thursday','11:15-12:15','DEVOPS LAB','DST','CC02',1);
PERFORM _tt(6,'C','Thursday','11:15-12:15','CC LAB',    'KGD','L11B',2);
PERFORM _tt(6,'C','Thursday','11:15-12:15','PROJECT-1', 'IT1','IT-PROJ',3);
PERFORM _tt(6,'C','Thursday','11:15-12:15','SSEH LAB',  'DM', 'L07C',4);
PERFORM _tt(6,'C','Thursday','13:45-14:45','STQA LAB',  'SDG','L07E',1);
PERFORM _tt(6,'C','Thursday','13:45-14:45','SB_PROJECT','IT3','M-PROJ',2);
PERFORM _tt(6,'C','Thursday','13:45-14:45','PROJECT-1', 'IT4','VIRTUAL',3);
PERFORM _tt(6,'C','Thursday','13:45-14:45','DEVOPS LAB','DST','CC02',4);
PERFORM _tt(6,'C','Thursday','15:45-16:45','SPD',       'EX2','F201',1);
PERFORM _tt(6,'C','Thursday','15:45-16:45','MVRP',      'RAS','M310A',2);
PERFORM _tt(6,'C','Thursday','15:45-16:45','MVRP',      'SWA','M516A',3);
-- FRIDAY
PERFORM _tt(6,'C','Friday','09:00-10:00','SC',        'SM', 'E303',1);
PERFORM _tt(6,'C','Friday','09:00-10:00','CC LAB',    'KGD','L07E',2);
PERFORM _tt(6,'C','Friday','09:00-10:00','DF',        'DM', 'E204',3);
PERFORM _tt(6,'C','Friday','11:15-12:15','PGM LAB',   'DG', 'L07A',1);
PERFORM _tt(6,'C','Friday','11:15-12:15','SC LAB',    'SM', 'L11B',2);
PERFORM _tt(6,'C','Friday','11:15-12:15','STQA LAB',  'SDG','L07E',3);
PERFORM _tt(6,'C','Friday','11:15-12:15','DF LAB',    'DM', 'L07C',4);
PERFORM _tt(6,'C','Friday','13:45-14:45','SB_PROJECT','IT5','E-PROJ',1);
PERFORM _tt(6,'C','Friday','13:45-14:45','DEVOPS LAB','DST','CC02',2);
PERFORM _tt(6,'C','Friday','13:45-14:45','DFE LAB',   'NKR','L11B',3);
PERFORM _tt(6,'C','Friday','13:45-14:45','STQA LAB',  'DSJ','L07C',4);
PERFORM _tt(6,'C','Friday','15:45-16:45','SPD',       'EX2','F201',1);
PERFORM _tt(6,'C','Friday','15:45-16:45','MVRP',      'SWA','M512A',2);
-- SATURDAY
PERFORM _tt(6,'C','Saturday','09:00-10:00','SCD','IT8','E204',NULL);

/* ═══════════════ SEM 8 — DIVISION A ════════════════════════ */
-- MONDAY
PERFORM _tt(8,'A','Monday','09:00-10:00','TEST',    'TEST',NULL,  NULL);
PERFORM _tt(8,'A','Monday','11:15-12:15','BI',      'SAM', 'M202',NULL);
PERFORM _tt(8,'A','Monday','13:45-14:45','BI',      'SAM', 'M202',NULL);
PERFORM _tt(8,'A','Monday','14:45-15:45','UI/UX',   'SDG', 'E204',1);
PERFORM _tt(8,'A','Monday','14:45-15:45','NG-AIML', 'DG',  'E30', 2);
PERFORM _tt(8,'A','Monday','14:45-15:45','NG-CS',   'VVB', 'E303',3);
PERFORM _tt(8,'A','Monday','14:45-15:45','NG-DS',   'IT1', 'E201',4);
PERFORM _tt(8,'A','Monday','16:45-17:45','NG-AIML-2','DG', 'L07A',NULL);
-- TUESDAY
PERFORM _tt(8,'A','Tuesday','11:15-12:15','NG-AIML-3','DG','L07A',NULL);
-- WEDNESDAY
PERFORM _tt(8,'A','Wednesday','09:00-10:00','PROJECT-2','IT3','E204',NULL);
PERFORM _tt(8,'A','Wednesday','11:15-12:15','PROJECT-2','IT3','L07A',NULL);
PERFORM _tt(8,'A','Wednesday','13:45-14:45','PROJECT-2','IT3','E303',NULL);
PERFORM _tt(8,'A','Wednesday','15:45-16:45','PROJECT-2','IT1','E301',NULL);

/* ═══════════════ SEM 8 — DIVISION B ════════════════════════ */
-- MONDAY
PERFORM _tt(8,'B','Monday','09:00-10:00','TEST',    'TEST',NULL,  NULL);
PERFORM _tt(8,'B','Monday','11:15-12:15','UI/UX',   'SDG', 'CC02',1);
PERFORM _tt(8,'B','Monday','11:15-12:15','NG-AIML-1','DG', 'L07A',2);
PERFORM _tt(8,'B','Monday','11:15-12:15','NG-CS',   'VVB', 'L07C',3);
PERFORM _tt(8,'B','Monday','11:15-12:15','NG-DS',   'IT1', 'L11A',4);
PERFORM _tt(8,'B','Monday','14:45-15:45','UI/UX',   'SDG', 'E204',1);
PERFORM _tt(8,'B','Monday','14:45-15:45','NG-AIML', 'DG',  'E301',2);
PERFORM _tt(8,'B','Monday','14:45-15:45','NG-CS',   'VVB', 'E303',3);
PERFORM _tt(8,'B','Monday','14:45-15:45','NG-DS',   'IT1', 'E201',4);
-- TUESDAY
PERFORM _tt(8,'B','Tuesday','09:00-10:00','PROJECT-2','IT3','E303',NULL);
PERFORM _tt(8,'B','Tuesday','11:15-12:15','PROJECT-2','IT2','E303',NULL);
PERFORM _tt(8,'B','Tuesday','13:45-14:45','PROJECT-2','IT3','E303',NULL);
PERFORM _tt(8,'B','Tuesday','15:45-16:45','PROJECT-2','IT1','E201',NULL);
-- WEDNESDAY
PERFORM _tt(8,'B','Wednesday','09:00-10:00','BI','SAM','M302',NULL);
PERFORM _tt(8,'B','Wednesday','11:15-12:15','BI','SAM','M302',NULL);

END $$;

-- ── STEP 10: Drop helper function ─────────────────────────────
DROP FUNCTION IF EXISTS _tt(INT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,INT);

-- ── STEP 11: Summary verification ────────────────────────────
SELECT
  d.division_name, d.semester, d.year,
  COUNT(t.id) AS timetable_rows
FROM public.timetable t
JOIN public.divisions d ON d.id = t.division_id
GROUP BY d.division_name, d.semester, d.year
ORDER BY d.year, d.division_name;

COMMIT;
