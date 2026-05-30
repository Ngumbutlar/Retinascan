import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (create these as empty components for now)
import Dashboard from './pages/Dashboard';
import NewScreening from './pages/NewScreening';
import Records from './pages/Records';
import Results from './pages/Results';
import PatientRecord from './pages/PatientRecord';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      {/* Public route: Login page */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes: Wrapped by ProtectedRoute, and then by AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}> {/* AppLayout provides the common UI for protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/screening" element={<NewScreening />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/:id" element={<PatientRecord />} />
          <Route path="/results" element={<Results />} />
        </Route>
      </Route>

      {/* Default redirect for the root path and any unmatched routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}