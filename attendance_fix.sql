-- ============================================================
-- VIT DLR PORTAL — ATTENDANCE FIX
-- Run this in Supabase SQL Editor to fix attendance list loading
-- ============================================================

-- ── 1. Allow all authenticated users to READ students ─────────
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
CREATE POLICY "Authenticated users can view students" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage students
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (public.check_is_admin());

-- ── 2. Enable RLS on students (if not already) ────────────────
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ── 3. Allow authenticated users to READ divisions ────────────
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view divisions" ON public.divisions;
CREATE POLICY "Authenticated users can view divisions" ON public.divisions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage divisions" ON public.divisions;
CREATE POLICY "Admins can manage divisions" ON public.divisions
  FOR ALL USING (public.check_is_admin());

-- ── 4. Allow authenticated users to READ subjects ─────────────
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.subjects;
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (public.check_is_admin());

-- ── 5. Allow authenticated users to READ rooms ────────────────
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
CREATE POLICY "Authenticated users can view rooms" ON public.rooms
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL USING (public.check_is_admin());

-- ── 6. Allow authenticated users to READ time_slots ──────────
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view time_slots" ON public.time_slots;
CREATE POLICY "Authenticated users can view time_slots" ON public.time_slots
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── 7. Attendance RLS — faculty can insert/read for their lectures
DROP POLICY IF EXISTS "Faculty can insert attendance" ON public.attendance;
CREATE POLICY "Faculty can insert attendance" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lecture_records lr
      WHERE lr.id = attendance.lecture_record_id
        AND lr.faculty_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Faculty can view attendance for their lectures" ON public.attendance;
CREATE POLICY "Faculty can view attendance for their lectures" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lecture_records lr
      WHERE lr.id = attendance.lecture_record_id
      AND (lr.faculty_id = auth.uid() OR public.check_is_admin())
    )
  );

DROP POLICY IF EXISTS "Faculty can update attendance for their lectures" ON public.attendance;
CREATE POLICY "Faculty can update attendance for their lectures" ON public.attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lecture_records lr
      WHERE lr.id = attendance.lecture_record_id
        AND lr.faculty_id = auth.uid()
        AND lr.is_locked = FALSE
    )
  );

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (public.check_is_admin());

-- ── 8. Verify students are populated ─────────────────────────
SELECT d.division_name, d.semester, d.year, COUNT(s.id) AS student_count
FROM public.divisions d
LEFT JOIN public.students s ON s.division_id = d.id
GROUP BY d.division_name, d.semester, d.year
ORDER BY d.year, d.division_name;
