import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './stores/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import Diagnoses from './pages/Diagnoses';
import Diseases from './pages/Diseases';
import DiseaseSuggestions from './pages/DiseaseSuggestions';
import MedicalRecords from './pages/MedicalRecords';
import Appointments from './pages/Appointments';
import Receptionists from './pages/Receptionists';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <AuthLayout><Login /></AuthLayout>}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientProfile />} />
          <Route path="diagnoses" element={<Diagnoses />} />
          <Route path="diseases" element={<Diseases />} />
          <Route path="disease-suggestions" element={<DiseaseSuggestions />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="receptionists" element={<Receptionists />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
