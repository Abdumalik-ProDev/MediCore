import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';
import { formatDate, fullName } from '../utils/formatters';
import { ArrowLeft, Calendar, Phone, Mail, MapPin, Droplets, AlertTriangle, User, Stethoscope, ClipboardList } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={18} className="text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function PatientProfile() {
  const { id } = useParams();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-profile', id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}/profile`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!patient) {
    return <EmptyState message="Patient not found" />;
  }

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User size={28} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
            <p className="text-sm text-gray-500">Patient ID: {patient.id?.slice(0, 8)}...</p>
          </div>
          <Badge variant={patient.blood_group ? 'active' : 'mild'}>{patient.blood_group || 'No血型'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-primary-500" />
              Diagnosis History ({patient.diagnoses?.length || 0})
            </h2>
            {!patient.diagnoses || patient.diagnoses.length === 0 ? (
              <EmptyState message="No diagnoses recorded" />
            ) : (
              <div className="space-y-3">
                {patient.diagnoses.map((dx) => (
                  <div key={dx.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{dx.diagnosis_name}</p>
                        {dx.diagnosis_code && <p className="text-xs text-gray-500">ICD-10: {dx.diagnosis_code}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={dx.severity}>{dx.severity}</Badge>
                        <Badge variant={dx.status}>{dx.status}</Badge>
                      </div>
                    </div>
                    {dx.description && <p className="text-sm text-gray-600 mb-2">{dx.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Diagnosed: {formatDate(dx.diagnosed_date)}</span>
                      {dx.doctor && <span>By: Dr. {fullName(dx.doctor)}</span>}
                    </div>
                    {dx.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <span className="font-medium">Notes:</span> {dx.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-500" />
              Personal Info
            </h2>
            <div className="divide-y divide-gray-100">
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(patient.date_of_birth)} />
              <InfoRow icon={User} label="Gender" value={patient.gender} />
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={MapPin} label="Address" value={patient.address} />
              <InfoRow icon={Droplets} label="Blood Group" value={patient.blood_group} />
              <InfoRow icon={AlertTriangle} label="Allergies" value={patient.allergies || 'None'} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-accent-500" />
              Assigned Doctor
            </h2>
            {patient.doctor?.id ? (
              <div>
                <p className="font-medium text-gray-900">Dr. {fullName(patient.doctor)}</p>
                <p className="text-sm text-gray-500">{patient.doctor.specialization}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No doctor assigned</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <InfoRow icon={User} label="Name" value={patient.emergency_contact} />
            <InfoRow icon={Phone} label="Phone" value={patient.emergency_phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
