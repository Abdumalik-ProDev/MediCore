import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate, fullName } from '../utils/formatters';
import { SEVERITIES, STATUSES } from '../utils/constants';

const defaultForm = {
  patient_id: '', doctor_id: '', diagnosis_code: '',
  diagnosis_name: '', description: '', severity: 'moderate',
  status: 'active', diagnosed_date: '', notes: '',
};

export default function Diagnoses() {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'clinician';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['diagnoses', page],
    queryFn: async () => {
      const { data } = await api.get('/diagnoses', { params: { page, limit: 10 } });
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
    mutationFn: (body) => api.post('/diagnoses', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['diagnoses'] }); toast('Diagnosis created', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/diagnoses/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['diagnoses'] }); toast('Diagnosis updated', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/diagnoses/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['diagnoses'] }); toast('Diagnosis deleted', 'success'); setDeleteTarget(null); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (d) => {
    setEditing({ ...d, diagnosed_date: d.diagnosed_date?.split('T')[0] || '', patient_id: d.patient?.id || '', doctor_id: d.doctor?.id || '' });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  function DiagnosisForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: editing || defaultForm,
    });
    const saving = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData) => {
      const body = { ...formData };
      if (!body.doctor_id) body.doctor_id = null;
      if (editing) updateMutation.mutate({ id: editing.id, body });
      else createMutation.mutate(body);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select {...register('patient_id', { required: true })} className="input-field">
              <option value="">Select patient...</option>
              {patientsData?.map((p) => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select {...register('doctor_id')} className="input-field">
              <option value="">Select doctor...</option>
              {doctorsData?.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Name *</label>
            <input {...register('diagnosis_name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Code</label>
            <input {...register('diagnosis_code')} className="input-field" placeholder="e.g. I10" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} className="input-field" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select {...register('severity')} className="input-field">
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="input-field">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" {...register('diagnosed_date')} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea {...register('notes')} className="input-field" rows={2} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Diagnosis' : 'Add Diagnosis'}
          </Button>
        </div>
      </form>
    );
  }

  const columns = [
    { key: 'diagnosis_name', label: 'Diagnosis', render: (r) => (
      <div><span className="font-medium">{r.diagnosis_name}</span>{r.diagnosis_code && <span className="text-xs text-gray-400 ml-2">({r.diagnosis_code})</span>}</div>
    )},
    { key: 'patient', label: 'Patient', render: (r) => r.patient ? (
      <Link to={`/patients/${r.patient.id}`} className="text-primary-600 hover:text-primary-700">{fullName(r.patient)}</Link>
    ) : '—' },
    { key: 'severity', label: 'Severity', render: (r) => <Badge variant={r.severity}>{r.severity}</Badge> },
    { key: 'status', label: 'Status', render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    { key: 'diagnosed_date', label: 'Date', render: (r) => formatDate(r.diagnosed_date) },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {canCreate && (
            <>
              <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary-600">
                <Pencil size={16} />
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Diagnoses</h1>
        {canCreate && (
          <Button onClick={openCreate}><Plus size={18} />Add Diagnosis</Button>
        )}
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Diagnosis' : 'Add Diagnosis'} size="lg">
        <DiagnosisForm />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Diagnosis"
        message={`Delete ${deleteTarget?.diagnosis_name}?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
