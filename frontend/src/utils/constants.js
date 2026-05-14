export const ROLES = {
  admin: 'Administrator',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
};

export const SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];
export const STATUSES = ['active', 'resolved', 'chronic'];
export const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
export const SUGGESTION_STATUSES = ['pending', 'approved', 'rejected'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Doctors', path: '/doctors', roles: ['admin', 'receptionist'] },
  { label: 'Patients', path: '/patients', roles: ['admin', 'doctor', 'receptionist'] },
  { label: 'Medical Records', path: '/medical-records', roles: ['admin', 'doctor'] },
  { label: 'Disease Registry', path: '/diseases', roles: ['admin', 'doctor'] },
  { label: 'Disease Suggestions', path: '/disease-suggestions', roles: ['admin', 'doctor'] },
  { label: 'Appointments', path: '/appointments', roles: ['admin', 'receptionist', 'doctor'] },
  { label: 'Receptionists', path: '/receptionists', roles: ['admin'] },
  { label: 'Audit Logs', path: '/audit-logs', roles: ['admin'] },
];
