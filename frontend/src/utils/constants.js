export const ROLES = {
  admin: 'Administrator',
  clinician: 'Clinician',
  receptionist: 'Receptionist',
};

export const SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];
export const STATUSES = ['active', 'resolved', 'chronic'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', roles: ['admin', 'clinician', 'receptionist'] },
  { label: 'Doctors', path: '/doctors', roles: ['admin', 'receptionist'] },
  { label: 'Patients', path: '/patients', roles: ['admin', 'clinician', 'receptionist'] },
  { label: 'Diagnoses', path: '/diagnoses', roles: ['admin', 'clinician', 'receptionist'] },
];
