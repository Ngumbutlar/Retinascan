import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Pages (create these as empty components for now)
import Dashboard     from './pages/Dashboard';
import NewScreening  from './pages/NewScreening';
import Records       from './pages/Records';
// import Processing    from './pages/Processing';
// import Results       from './pages/Results';
import PatientRecord from './pages/PatientRecord';
import Login         from './pages/Login';

export default function App() {
  return (
    <Routes>
      {/* Login sits outside AppLayout — full page, no navbar */}
      <Route path="/login" element={<Login />} />

      {/* All other pages share the layout automatically */}
      <Route element={<AppLayout />}>
        <Route path="/"                element={<Dashboard />} />
        <Route path="/new-screening"   element={<NewScreening />} />
        <Route path="/records"         element={<Records />} />
        <Route path="/records/:id"     element={<PatientRecord />} /> 
        {/* <Route path="/new-screening"   element={<NewScreening />} />
        <Route path="/processing"      element={<Processing />} />
        <Route path="/results"         element={<Results />} />
        <Route path="/records"         element={<Records />} />
       */}
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}