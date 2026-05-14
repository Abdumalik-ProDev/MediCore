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
import SearchInput from '../components/SearchInput';
import { Plus, Pencil, Trash2, Eye, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate, fullName } from '../utils/formatters';
import { BLOOD_GROUPS } from '../utils/constants';

const defaultForm = {
  first_name: '', last_name: '', date_of_birth: '',
  gender: '', phone: '', email: '', address: '',
  blood_group: '', allergies: '', emergency_contact: '', emergency_phone: '',
  doctor_id: '',
};

export default function Patients() {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'receptionist';
  const canEdit = user?.role === 'admin' || user?.role === 'clinician';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get('/patients', { params });
      return data;
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
    mutationFn: (body) => api.post('/patients', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['patients'] }); toast('Patient created', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/patients/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['patients'] }); toast('Patient updated', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/patients/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['patients'] }); toast('Patient deleted', 'success'); setDeleteTarget(null); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  function PatientForm() {
    const defaultValues = editing ? {
      ...editing,
      date_of_birth: editing.date_of_birth?.split('T')[0] || '',
      doctor_id: editing.doctor_id || editing.doctor?.id || '',
    } : defaultForm;
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
    const saving = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData) => {
      const body = { ...formData };
      if (!body.doctor_id) body.doctor_id = null;
      if (editing) updateMutation.mutate({ id: editing.id, body });
      else createMutation.mutate(body);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input {...register('first_name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input {...register('last_name', { required: true })} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" {...register('date_of_birth', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select {...register('gender')} className="input-field">
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea {...register('address')} className="input-field" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select {...register('blood_group')} className="input-field">
              <option value="">Select...</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            <input {...register('allergies')} className="input-field" placeholder="None" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Doctor</label>
          <select {...register('doctor_id')} className="input-field">
            <option value="">Unassigned</option>
            {doctorsData?.map((doc) => (
              <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name} ({doc.specialization})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input {...register('emergency_contact')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
            <input {...register('emergency_phone')} className="input-field" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Patient' : 'Create Patient'}
          </Button>
        </div>
      </form>
    );
  }

  const columns = [
    { key: 'first_name', label: 'Name', render: (r) => (
      <Link to={`/patients/${r.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
        {r.first_name} {r.last_name}
      </Link>
    )},
    { key: 'blood_group', label: 'Blood' },
    { key: 'doctor', label: 'Doctor', render: (r) => r.doctor ? `Dr. ${r.doctor.first_name} ${r.doctor.last_name}` : '—' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'created_at', label: 'Registered', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          <Link to={`/patients/${r.id}`} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary-600">
            <Eye size={16} />
          </Link>
          {canEdit && (
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
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        {(canCreate || user?.role === 'admin') && (
          <Button onClick={openCreate}><Plus size={18} />Add Patient</Button>
        )}
      </div>
      <div className="max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients..." />
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Patient' : 'Register Patient'} size="lg">
        <PatientForm />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Patient"
        message={`Delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This also removes their diagnoses.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
