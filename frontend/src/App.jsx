import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import Profile         from './pages/Profile'
import ForgotPassword  from './pages/ForgotPassword'
import ResetPassword   from './pages/ResetPassword'
import Dashboard       from './pages/Dashboard'
import DashboardAdmin  from './pages/DashboardAdmin'
import DashboardEtudiant from './pages/DashboardEtudiant'

// Protège les routes authentifiées
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

// Protège les routes par rôle
function RoleRoute({ role, children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })()

  // Si le rôle ne correspond pas → redirige vers le dashboard générique
  if (user?.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Pages protégées (authentification requise) */}
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Dashboards spécifiques par rôle */}
        <Route
          path="/dashboard/admin"
          element={<RoleRoute role="ADMIN"><DashboardAdmin /></RoleRoute>}
        />
        <Route
          path="/dashboard/etudiant"
          element={<RoleRoute role="ETUDIANT"><DashboardEtudiant /></RoleRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
