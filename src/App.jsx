import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard, PublicGuard } from './components/shared/AuthGuard'
import { LoadingScreen, ToastProvider } from './components/ui'
import LoginPage from './pages/Login'

const FacultyLayout = lazy(() => import('./pages/faculty/FacultyLayout'))
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'))
const SubmitLecture = lazy(() => import('./pages/faculty/SubmitLecture'))
const AttendancePage = lazy(() => import('./pages/faculty/AttendancePage'))
const HistoryPage = lazy(() => import('./pages/faculty/HistoryPage'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const TimetablePage = lazy(() => import('./pages/admin/TimetablePage'))
const ApprovalsPage = lazy(() => import('./pages/admin/ApprovalsPage'))
const FacultyPage = lazy(() => import('./pages/admin/FacultyPage'))
const SubjectsPage = lazy(() => import('./pages/admin/SubjectsPage'))
const RoomsPage = lazy(() => import('./pages/admin/RoomsPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<PublicGuard><LoginPage /></PublicGuard>} />
            <Route path="/faculty" element={<AuthGuard requireRole="faculty"><FacultyLayout /></AuthGuard>}>
              <Route index element={<FacultyDashboard />} />
              <Route path="submit" element={<SubmitLecture />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>
            <Route path="/admin" element={<AuthGuard requireRole="admin"><AdminLayout /></AuthGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="records" element={<ApprovalsPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
