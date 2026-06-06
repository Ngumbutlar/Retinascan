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

      {/* Protected routes: Wrapped by ProtectedRoute, then AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Screening flow */}
          <Route path="/new-screening" element={<NewScreening />} />
          <Route path="/results" element={<Results />} />
          <Route path="/records" element={<Records />} />
          <Route path="/patients/:recordId" element={<PatientRecord />} />
        </Route>
      </Route>

      {/* Default redirect for the root path and any unmatched routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}