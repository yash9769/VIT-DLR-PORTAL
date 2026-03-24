// Demo data used when Supabase is not configured
export const DEMO_USER_FACULTY = {
  id: 'demo-faculty-001',
  email: 'faculty@vit.edu',
  full_name: 'Dr. Priya Sharma',
  role: 'faculty',
  department: 'Information Technology',
}

export const DEMO_USER_ADMIN = {
  id: 'demo-admin-001',
  email: 'admin@vit.edu',
  full_name: 'Prof. Rajesh Patil',
  role: 'admin',
  department: 'Information Technology',
}

export const DEMO_TIME_SLOTS = [
  { id: 'ts1', slot_label: '8:00 - 9:00',   start_time: '08:00', end_time: '09:00',  slot_order: 1, is_break: false },
  { id: 'ts2', slot_label: '9:00 - 10:00',  start_time: '09:00', end_time: '10:00',  slot_order: 2, is_break: false },
  { id: 'ts3', slot_label: '10:15 - 11:15', start_time: '10:15', end_time: '11:15',  slot_order: 4, is_break: false },
  { id: 'ts4', slot_label: '11:15 - 12:15', start_time: '11:15', end_time: '12:15',  slot_order: 5, is_break: false },
  { id: 'ts5', slot_label: '13:00 - 14:00', start_time: '13:00', end_time: '14:00',  slot_order: 7, is_break: false },
  { id: 'ts6', slot_label: '14:00 - 15:00', start_time: '14:00', end_time: '15:00',  slot_order: 8, is_break: false },
]

export const DEMO_SUBJECTS = [
  { id: 'sub1', subject_code: 'IT601', subject_name: 'Information Security',       short_name: 'IS',   semester: 6 },
  { id: 'sub2', subject_code: 'IT603', subject_name: 'Cloud Computing',            short_name: 'CC',   semester: 6 },
  { id: 'sub3', subject_code: 'IT605', subject_name: 'Machine Learning',           short_name: 'ML',   semester: 6 },
  { id: 'sub4', subject_code: 'IT607', subject_name: 'Web Technology',             short_name: 'WT',   semester: 6 },
  { id: 'sub5', subject_code: 'IT609', subject_name: 'Data Science Lab',           short_name: 'DSL',  semester: 6 },
]

export const DEMO_DIVISIONS = [
  { id: 'div1', division_name: 'IT-A', year: 3, semester: 6, department: 'IT', strength: 60 },
  { id: 'div2', division_name: 'IT-B', year: 3, semester: 6, department: 'IT', strength: 58 },
  { id: 'div3', division_name: 'IT-A1', year: 3, semester: 6, department: 'IT', strength: 30 },
]

export const DEMO_ROOMS = [
  { id: 'r1', room_number: 'A-301', building: 'A', floor: 3, capacity: 60, has_smartboard: true },
  { id: 'r2', room_number: 'A-302', building: 'A', floor: 3, capacity: 60, has_smartboard: true },
  { id: 'r3', room_number: 'B-101', building: 'B', floor: 1, capacity: 30, has_smartboard: false },
  { id: 'r4', room_number: 'IT-Lab-1', building: 'C', floor: 2, capacity: 30, has_smartboard: false },
]

export const DEMO_FACULTY_LIST = [
  { id: 'demo-faculty-001', full_name: 'Dr. Priya Sharma',    department: 'IT', role: 'faculty' },
  { id: 'demo-faculty-002', full_name: 'Prof. Anand Kulkarni', department: 'IT', role: 'faculty' },
  { id: 'demo-faculty-003', full_name: 'Dr. Meera Joshi',      department: 'IT', role: 'faculty' },
  { id: 'demo-faculty-004', full_name: 'Prof. Vikram Desai',   department: 'IT', role: 'faculty' },
]

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

export const DEMO_TIMETABLE = [
  { id: 'tt1', faculty_id: 'demo-faculty-001', division_id: 'div1', subject_id: 'sub1', room_id: 'r1', time_slot_id: 'ts1', day_of_week: 'Monday',    is_active: true, subjects: DEMO_SUBJECTS[0], divisions: DEMO_DIVISIONS[0], rooms: DEMO_ROOMS[0], time_slots: DEMO_TIME_SLOTS[0] },
  { id: 'tt2', faculty_id: 'demo-faculty-001', division_id: 'div2', subject_id: 'sub2', room_id: 'r2', time_slot_id: 'ts2', day_of_week: 'Monday',    is_active: true, subjects: DEMO_SUBJECTS[1], divisions: DEMO_DIVISIONS[1], rooms: DEMO_ROOMS[1], time_slots: DEMO_TIME_SLOTS[1] },
  { id: 'tt3', faculty_id: 'demo-faculty-001', division_id: 'div1', subject_id: 'sub3', room_id: 'r1', time_slot_id: 'ts3', day_of_week: 'Tuesday',   is_active: true, subjects: DEMO_SUBJECTS[2], divisions: DEMO_DIVISIONS[0], rooms: DEMO_ROOMS[0], time_slots: DEMO_TIME_SLOTS[2] },
  { id: 'tt4', faculty_id: 'demo-faculty-001', division_id: 'div3', subject_id: 'sub5', room_id: 'r4', time_slot_id: 'ts5', day_of_week: 'Wednesday', is_active: true, subjects: DEMO_SUBJECTS[4], divisions: DEMO_DIVISIONS[2], rooms: DEMO_ROOMS[3], time_slots: DEMO_TIME_SLOTS[4] },
  { id: 'tt5', faculty_id: 'demo-faculty-001', division_id: 'div1', subject_id: 'sub4', room_id: 'r1', time_slot_id: 'ts4', day_of_week: 'Thursday',  is_active: true, subjects: DEMO_SUBJECTS[3], divisions: DEMO_DIVISIONS[0], rooms: DEMO_ROOMS[0], time_slots: DEMO_TIME_SLOTS[3] },
  { id: 'tt6', faculty_id: 'demo-faculty-001', division_id: 'div2', subject_id: 'sub1', room_id: 'r2', time_slot_id: 'ts1', day_of_week: 'Friday',    is_active: true, subjects: DEMO_SUBJECTS[0], divisions: DEMO_DIVISIONS[1], rooms: DEMO_ROOMS[1], time_slots: DEMO_TIME_SLOTS[0] },
]

export const DEMO_LECTURE_RECORDS = [
  {
    id: 'lr1', faculty_id: 'demo-faculty-001', division_id: 'div1', subject_id: 'sub1', room_id: 'r1',
    lecture_date: yesterday, scheduled_start: '08:00', scheduled_end: '09:00',
    actual_start: '08:02', actual_end: '09:00', topic_covered: 'Introduction to AES Encryption',
    total_students: 60, present_count: 54, absent_count: 6,
    lcs_status: 'covered', smartboard_pdf_uploaded: true, approval_status: 'approved',
    submitted_at: yesterday + 'T09:05:00Z',
    subjects: DEMO_SUBJECTS[0], divisions: DEMO_DIVISIONS[0], rooms: DEMO_ROOMS[0],
  },
  {
    id: 'lr2', faculty_id: 'demo-faculty-001', division_id: 'div2', subject_id: 'sub2', room_id: 'r2',
    lecture_date: yesterday, scheduled_start: '09:00', scheduled_end: '10:00',
    actual_start: '09:05', actual_end: '10:00', topic_covered: 'AWS EC2 Instances and Types',
    total_students: 58, present_count: 50, absent_count: 8,
    lcs_status: 'covered', smartboard_pdf_uploaded: false, approval_status: 'pending',
    submitted_at: yesterday + 'T10:10:00Z',
    subjects: DEMO_SUBJECTS[1], divisions: DEMO_DIVISIONS[1], rooms: DEMO_ROOMS[1],
  },
]

export const DEMO_STUDENTS = [
  { id: 's1',  roll_number: 'IT2021001', full_name: 'Aarav Shah',      division_id: 'div1' },
  { id: 's2',  roll_number: 'IT2021002', full_name: 'Ananya Reddy',    division_id: 'div1' },
  { id: 's3',  roll_number: 'IT2021003', full_name: 'Arjun Mehta',     division_id: 'div1' },
  { id: 's4',  roll_number: 'IT2021004', full_name: 'Bhavna Patel',    division_id: 'div1' },
  { id: 's5',  roll_number: 'IT2021005', full_name: 'Chirag Desai',    division_id: 'div1' },
  { id: 's6',  roll_number: 'IT2021006', full_name: 'Deepika Nair',    division_id: 'div1' },
  { id: 's7',  roll_number: 'IT2021007', full_name: 'Dev Kapoor',      division_id: 'div1' },
  { id: 's8',  roll_number: 'IT2021008', full_name: 'Diya Sharma',     division_id: 'div1' },
  { id: 's9',  roll_number: 'IT2021009', full_name: 'Farhan Khan',     division_id: 'div1' },
  { id: 's10', roll_number: 'IT2021010', full_name: 'Gauri Joshi',     division_id: 'div1' },
  { id: 's11', roll_number: 'IT2021011', full_name: 'Harsh Agarwal',   division_id: 'div1' },
  { id: 's12', roll_number: 'IT2021012', full_name: 'Isha Verma',      division_id: 'div1' },
  { id: 's13', roll_number: 'IT2021013', full_name: 'Jay Malhotra',    division_id: 'div1' },
  { id: 's14', roll_number: 'IT2021014', full_name: 'Kavya Singh',     division_id: 'div1' },
  { id: 's15', roll_number: 'IT2021015', full_name: 'Krish Trivedi',   division_id: 'div1' },
  { id: 's16', roll_number: 'IT2021016', full_name: 'Lakshmi Iyer',    division_id: 'div1' },
  { id: 's17', roll_number: 'IT2021017', full_name: 'Manav Gupta',     division_id: 'div1' },
  { id: 's18', roll_number: 'IT2021018', full_name: 'Meera Pillai',    division_id: 'div1' },
  { id: 's19', roll_number: 'IT2021019', full_name: 'Nikhil Jain',     division_id: 'div1' },
  { id: 's20', roll_number: 'IT2021020', full_name: 'Priya Bansal',    division_id: 'div1' },
]

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', title: 'DLR Pending', message: 'You have 1 pending DLR submission for yesterday.', type: 'warning', is_read: false, created_at: new Date().toISOString() },
  { id: 'n2', title: 'Record Approved', message: 'Your lecture record for IS (IT-A) has been approved by HOD.', type: 'success', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
]

export const DEMO_SUBSTITUTIONS = [
  {
    id: 'sub1',
    substitution_date: today,
    absent_faculty_id: 'demo-faculty-002',
    proxy_faculty_id: 'demo-faculty-001', // DEMO_USER_FACULTY is the proxy
    timetable_id: 'tt3',
    reason: 'Faculty Absent',
    status: 'active',
    created_by: 'demo-faculty-002',
    created_at: new Date().toISOString(),
    absent_faculty: { id: 'demo-faculty-002', full_name: 'Prof. Anand Kulkarni' },
    proxy_faculty: { id: 'demo-faculty-001', full_name: 'Dr. Priya Sharma' },
    timetable: {
      id: 'tt3',
      faculty_id: 'demo-faculty-002',
      subjects: DEMO_SUBJECTS[2],   // Machine Learning
      divisions: DEMO_DIVISIONS[0], // IT-A
      rooms: DEMO_ROOMS[0],         // A-301
      time_slots: DEMO_TIME_SLOTS[2], // 10:15 - 11:15
    },
  },
  {
    id: 'sub2',
    substitution_date: today,
    absent_faculty_id: 'demo-faculty-001', // DEMO_USER_FACULTY is absent (self-assigned)
    proxy_faculty_id: 'demo-faculty-003',
    timetable_id: 'tt6',
    reason: 'Medical Leave',
    status: 'active',
    created_by: 'demo-faculty-001',
    created_at: new Date().toISOString(),
    absent_faculty: { id: 'demo-faculty-001', full_name: 'Dr. Priya Sharma' },
    proxy_faculty: { id: 'demo-faculty-003', full_name: 'Dr. Meera Joshi' },
    timetable: {
      id: 'tt6',
      faculty_id: 'demo-faculty-001',
      subjects: DEMO_SUBJECTS[0],   // Information Security
      divisions: DEMO_DIVISIONS[1], // IT-B
      rooms: DEMO_ROOMS[1],         // A-302
      time_slots: DEMO_TIME_SLOTS[0], // 8:00 - 9:00
    },
  },
]
