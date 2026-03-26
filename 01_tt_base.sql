-- ============================================================
-- BLOCK 1: BASE INFRASTRUCTURE (Rooms, Subjects, Divisions)
-- ============================================================

BEGIN;

TRUNCATE public.attendance, public.lecture_records, public.substitutions, 
         public.timetable, public.students, public.divisions, 
         public.subjects, public.rooms, public.time_slots CASCADE;

INSERT INTO public.rooms (room_number, room_type, has_smartboard) VALUES
  ('E101','classroom',true), ('E201','classroom',true), ('E204','classroom',true),
  ('E301','classroom',false),('E303','classroom',true), ('M101','classroom',true),
  ('M202','classroom',false),('M302','classroom',false),('M309','classroom',false),
  ('M315','classroom',true), ('M414A','classroom',false),('B203','classroom',false),
  ('B301','classroom',false),('B303A','classroom',false),
  ('F102','lab',true),('F201','lab',true),
  ('L07A','lab',false),('L07B','lab',false),('L07C','lab',false),('L07D','lab',false),('L07E','lab',false),
  ('L11A','lab',false),('L11B','lab',false),('CC02','lab',false),('CC03','lab',false);

INSERT INTO public.time_slots (slot_label, start_time, end_time, slot_order) VALUES
  ('08:00 - 09:00', '08:00:00', '09:00:00', 1), ('09:00 - 10:00', '09:00:00', '10:00:00', 2),
  ('10:00 - 11:00', '10:00:00', '11:00:00', 3), ('11:15 - 12:15', '11:15:00', '12:15:00', 4),
  ('12:15 - 13:15', '12:15:00', '13:15:00', 5), ('13:45 - 14:45', '13:45:00', '14:45:00', 6),
  ('14:45 - 15:45', '14:45:00', '15:45:00', 7), ('16:00 - 17:00', '16:00:00', '17:00:00', 8),
  ('17:00 - 18:00', '17:00:00', '18:00:00', 9);

INSERT INTO public.subjects (subject_code, short_name, subject_name, department, semester) VALUES
  ('S401','AT','Aptitude Training','IT',4),('S402','CN','Computer Networks','IT',4),
  ('S403','OS','Operating Systems','IT',4),('S404','DBMS','DBMS','IT',4),
  ('S405','EM 4','Engineering Math 4','IT',4),('S406','MVRP','MVRP / Value Added','IT',4),
  ('S407','SPD','Software Project Dev','IT',4),('S408','ADSBI','ADSBI','IT',4),
  ('S409','FBET','FBET','IT',4),('S410','PCD1','PCD 1','IT',4),
  ('S411','PY','Python','IT',4),('S412','OS LAB','OS Lab','IT',4),
  ('S413','DBMS LAB','DBMS Lab','IT',4),('S414','CN LAB','CN Lab','IT',4),
  ('S601','SC','Software Config','IT',6),('S602','PGM','Prog Gen Methods','IT',6),
  ('S603','DEVOPS LAB','DevOps Lab','IT',6),('S604','STQA','STQA','IT',6),
  ('S605','DF','Design Fundamentals','IT',6),('S606','SSEH','Software Ethics','IT',6),
  ('S607','DFE','Data Formats','IT',6),('S608','CC','Cloud Computing','IT',6),
  ('S609','SCD','Software Change','IT',6),('S610','STQA LAB','STQA Lab','IT',6),
  ('S611','PGM LAB','PGM Lab','IT',6),('S612','SC LAB','SC Lab','IT',6),
  ('S613','CC LAB','CC Lab','IT',6),('S614','PROJECT-1','Project 1','IT',6),
  ('S615','SB_PROJECT','SB Project','IT',6),('S616','DF LAB','DF Lab','IT',6),
  ('S617','DFE LAB','DFE Lab','IT',6),('S618','SSEH LAB','SSEH Lab','IT',6),
  ('S801','UI/UX','UI/UX Design','IT',8),('S802','NG-AIML','Next Gen AI/ML','IT',8),
  ('S803','NG-DS','Next Gen Data Science','IT',8),('S804','NG-CS','Next Gen Cyber Security','IT',8),
  ('S808','BI','Business Intelligence','IT',8),('S809','PROJECT-2','Project 2','IT',8),
  ('S000','TEST','Testing Period','IT',4);

INSERT INTO public.divisions (division_name, year, semester, department) VALUES
  ('INFT-4-A', 2, 4, 'IT'), ('INFT-4-B', 2, 4, 'IT'), ('INFT-4-C', 2, 4, 'IT'),
  ('INFT-6-A', 3, 6, 'IT'), ('INFT-6-B', 3, 6, 'IT'), ('INFT-6-C', 3, 6, 'IT'),
  ('INFT-8-A', 4, 8, 'IT'), ('INFT-8-B', 4, 8, 'IT');

COMMIT;
