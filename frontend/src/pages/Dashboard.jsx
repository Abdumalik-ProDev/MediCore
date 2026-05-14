import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../stores/AuthContext';
import { Stethoscope, Users, ClipboardList, Activity, ArrowRight } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const counts = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: async () => {
      const [docs, pats, records] = await Promise.all([
        api.get('/doctors?limit=1'),
        api.get('/patients?limit=1'),
        api.get('/medical-records?limit=1'),
      ]);
      return {
        doctors: docs.data.pagination?.total ?? '—',
        patients: pats.data.pagination?.total ?? '—',
        diagnoses: records.data.pagination?.total ?? '—',
      };
    },
  });

  const recentPatients = useQuery({
    queryKey: ['recent-patients'],
    queryFn: async () => {
      const { data } = await api.get('/patients?limit=5');
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, <span className="font-medium text-gray-700 capitalize">{user?.role}</span>
        </p>
      </div>

      {counts.isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Stethoscope}
            label="Total Doctors"
            value={counts.data?.doctors}
            color="bg-primary-500"
            to="/doctors"
          />
          <StatCard
            icon={Users}
            label="Total Patients"
            value={counts.data?.patients}
            color="bg-accent-500"
            to="/patients"
          />
          <StatCard
            icon={ClipboardList}
            label="Total Diagnoses"
            value={counts.data?.diagnoses}
            color="bg-blue-500"
            to="/diagnoses"
          />
        </div>
      )}

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-primary-500" />
            Recent Patients
          </h2>
          <Link to="/patients" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentPatients.isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentPatients.data?.map((p) => (
              <Link
                key={p.id}
                to={`/patients/${p.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-gray-500">
                    {p.doctor?.first_name ? `Dr. ${p.doctor.first_name} ${p.doctor.last_name}` : 'Unassigned'}
                  </p>
                </div>
                <div className="text-xs text-gray-400">{p.blood_group || '—'}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
