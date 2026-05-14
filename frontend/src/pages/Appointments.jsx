import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate } from '../utils/formatters';
import { APPOINTMENT_STATUSES } from '../utils/constants';

const defaultForm = {
  patient_id: '', doctor_id: '', appointment_date: '',
  reason: '', notes: '', status: 'scheduled',
};

export default function Appointments() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'receptionist';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', search, page],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get('/appointments', { params });
      return data;
    },
  });

  const { data: patientsData } = useQuery({
    queryKey: ['patients-select'],
    queryFn: async () => {
      const { data } = await api.get('/patients?limit=100');
      return data.data;
    },
  });

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-select'],
    queryFn: async () => {
      const { data } = await api.get('/doctors?limit=100');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/appointments', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast('Appointment created', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/appointments/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast('Appointment updated', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/appointments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast('Appointment deleted', 'success'); setDeleteTarget(null); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const statusBadgeVariant = {
    scheduled: 'info',
    confirmed: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };

  function AppointmentForm() {
    const defaultValues = editing ? {
      ...editing,
      appointment_date: editing.appointment_date?.slice(0, 16) || '',
      patient_id: editing.patient_id || editing.patient?.id || '',
      doctor_id: editing.doctor_id || editing.doctor?.id || '',
    } : defaultForm;
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
    const saving = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData) => {
      const body = { ...formData };
      if (editing) updateMutation.mutate({ id: editing.id, body });
      else createMutation.mutate(body);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select {...register('patient_id', { required: true })} className="input-field">
              <option value="">Select patient...</option>
              {patientsData?.map((p) => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select {...register('doctor_id', { required: true })} className="input-field">
              <option value="">Select doctor...</option>
              {doctorsData?.map((doc) => (
                <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name} ({doc.specialization})</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date / Time</label>
          <input type="datetime-local" {...register('appointment_date', { required: true })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea {...register('reason')} className="input-field" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select {...register('status')} className="input-field">
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} className="input-field" rows={3} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Appointment' : 'Create Appointment'}
          </Button>
        </div>
      </form>
    );
  }

  const columns = [
    { key: 'patient', label: 'Patient', render: (r) => r.patient ? (
      <Link to={`/patients/${r.patient.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
        {r.patient.first_name} {r.patient.last_name}
      </Link>
    ) : '—' },
    { key: 'doctor', label: 'Doctor', render: (r) => r.doctor ? `Dr. ${r.doctor.first_name} ${r.doctor.last_name}` : '—' },
    { key: 'appointment_date', label: 'Date / Time', render: (r) => {
      try { return new Date(r.appointment_date).toLocaleString(); } catch { return r.appointment_date || '—'; }
    }},
    { key: 'reason', label: 'Reason', render: (r) => r.reason || '—' },
    { key: 'status', label: 'Status', render: (r) => (
      <Badge variant={statusBadgeVariant[r.status] || 'info'}>{r.status?.replace('_', ' ')}</Badge>
    )},
    { key: 'notes', label: 'Notes', render: (r) => r.notes ? (
      <span className="text-sm text-gray-500 truncate max-w-[200px] inline-block">{r.notes}</span>
    ) : '—' },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {canManage && (
            <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary-600">
              <Pencil size={16} />
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        {canManage && (
          <Button onClick={openCreate}><Plus size={18} />Add Appointment</Button>
        )}
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Appointment' : 'New Appointment'} size="lg">
        <AppointmentForm />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Appointment"
        message={`Delete appointment for ${deleteTarget?.patient?.first_name || ''} ${deleteTarget?.patient?.last_name || ''} on ${deleteTarget?.appointment_date ? new Date(deleteTarget.appointment_date).toLocaleDateString() : ''}?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
