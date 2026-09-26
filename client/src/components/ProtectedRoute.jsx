import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

export default function ProtectedRoute({ children, requireInstructor = false }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">      <Spinner size={32} />
    </div>
  )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireInstructor && user.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />
  }

  return children || <Outlet />
}
