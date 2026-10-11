import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import CustomerLayout from './components/customer/CustomerLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import CustomerDashboard from './pages/CustomerDashboard'
import StaffLoginPage from './pages/StaffLoginPage'
import AdminPortal from './pages/AdminPortal'
import BookOrderPage from './pages/BookOrderPage'
import TrackOrderPage from './pages/TrackOrderPage'
import PresetsPage from './pages/PresetsPage'
import ProfilePage from './pages/ProfilePage'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/customer.css'
import './styles/landing.css'
import './styles/shell.css'
import './styles/admin.css'
import './styles/presets.css'
import './styles/confirm.css'
import './styles/profile.css'
import './styles/admin-polish.css'
import './styles/responsive.css'

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isCustomer, isStaff } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={role === 'staff' ? '/staff-login' : '/login'} replace />
  }

  if (role === 'customer' && !isCustomer) {
    return <Navigate to="/login" replace />
  }

  if (role === 'staff' && !isStaff) {
    return <Navigate to="/staff-login" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />

      <Route
        element={
          <ProtectedRoute role="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/book-order" element={<BookOrderPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/presets" element={<PresetsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="staff">
            <AdminPortal />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
