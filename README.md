# VIT DLR Portal - Full Stack Academic Management System

A production-ready Daily Lecture Record (DLR) system built with a **Security-First** mindset. This portal streamlines academic logging for faculty and rigorous review workflows for administrators, leveraging enterprise-grade security patterns.

## 🛡️ Security Architecture & Cybersec Focus

This project was designed to demonstrate proficiency in secure application development and defense-in-depth strategies.

### 1. Robust Access Control
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Faculty`, `HOD`, and `Admin`.
- **Identity & Access Management (IAM)**: Integrated with Supabase Auth (JWT-based) for secure session management and stateless authentication.
- **Row-Level Security (RLS)**: Database-level policies ensure "Principle of Least Privilege." Faculty can ONLY read/write their own records, while Admins have scoped management access.

### 2. Database & Data Integrity
- **Anti-Enumeration**: All primary keys utilize **UUID v4** to prevent ID guessing and enumeration attacks.
- **Audit Logging**: Implemented a "Locking" mechanism where records become immutable after administrative approval, ensuring a tamper-proof audit trail for institutional compliance.
- **Strict State Machines**: Utilizes PostgreSQL `ENUM` types for approval flows, protecting against invalid state transitions or logical bypasses.

### 3. Secure Backend logic
- **Recursive Security Definers**: Custom PL/pgSQL functions run with `SECURITY DEFINER` to securely perform role checks without exposing underlying sensitive tables.
- **Conflict Detection Engine**: A specialized server-side function prevents double-booking and data overlaps, ensuring logical consistency and preventing race conditions during high-concurrency submissions.

---

## 🚀 Technical Stack

### Frontend
- **React 18 + Vite**: Dynamic UI with optimized build performance.
- **Tailwind CSS**: Modern, responsive design system.
- **Lucide Icons**: Crisp, professional iconography.
- **Context API**: Secure, centralized state management for authentication.

### Backend (BaaS)
- **Supabase / PostgreSQL**: Scalable relational database with advanced security features.
- **Edge Notifications**: Real-time feedback loop for record status changes.

---

## 🛠️ Core Features

- **Faculty Dashboard**: Real-time overview of teaching load and submission status.
- **Smart Attendance**: Bulk roll-call system with persistence and logical validation.
- **Admin Command Center**: 
  - Comprehensive review of all records.
  - Individual student-level attendance verification.
  - Multi-export capability (Excel/PDF) for official reporting.
- **Academic Management**: Full CRUD for Faculty, Subjects, Rooms, and Timetables.

---

## 🔒 Cybersec Implementation Details

### RLS Policy Examples:
```sql
-- Secure isolation: Faculty can only update their own PENDING records.
CREATE POLICY "Faculty can update own pending records" ON public.lecture_records
  FOR UPDATE USING (
    faculty_id = auth.uid() AND approval_status = 'pending' AND is_locked = FALSE
  );
```

### Security Checklist Implemented:
- [x] Input Sanitization & Type Safety.
- [x] JWT Token Validation.
- [x] Secure Environment Variable Handling (Vite `.env`).
- [x] Granular Database Policies (No `SELECT *` without RLS).

---

## 👨‍💻 Author
**Yashodhan Rajapkar**
*Aspiring Cybersecurity Professional & Full Stack Developer*
**Kaivalya Gharat**
*Unity and C# Specialist & Full Stack Developer*
