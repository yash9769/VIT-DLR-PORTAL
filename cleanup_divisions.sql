-- DLR Portal Cleanup: Removing deprecated divisions and their dependencies
-- INFT-4-A, INFT-4-B, INFT-4-C, INFT-6-A, INFT-6-B, INFT-6-C, INFT-8-A, INFT-8-B, INFT-8-C

BEGIN;

-- 1. Create a temporary table to store the IDs of the divisions to be deleted
-- This persists for the entire transaction, unlike a CTE (WITH clause)
CREATE TEMP TABLE temp_div_ids AS 
SELECT id FROM public.divisions 
WHERE division_name IN (
  'INFT-4-A', 'INFT-4-B', 'INFT-4-C', 
  'INFT-6-A', 'INFT-6-B', 'INFT-6-C', 
  'INFT-8-A', 'INFT-8-B', 'INFT-8-C'
);

-- 2. Delete all related data to avoid foreign key violations
-- Deleting attendance for records in these divisions
DELETE FROM public.attendance 
WHERE lecture_record_id IN (
  SELECT id FROM public.lecture_records 
  WHERE division_id IN (SELECT id FROM temp_div_ids)
);

-- Deleting lecture records
DELETE FROM public.lecture_records 
WHERE division_id IN (SELECT id FROM temp_div_ids);

-- Deleting timetable entries
DELETE FROM public.timetable 
WHERE division_id IN (SELECT id FROM temp_div_ids);

-- Deleting student entries
DELETE FROM public.students 
WHERE division_id IN (SELECT id FROM temp_div_ids);

-- 3. Finally, delete the divisions themselves
DELETE FROM public.divisions 
WHERE id IN (SELECT id FROM temp_div_ids);

-- Optional: cleanup temp table (it will automatically drop at the end of transaction)
DROP TABLE temp_div_ids;

COMMIT;
