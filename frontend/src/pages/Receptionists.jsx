import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

const defaultForm = {
  first_name: '', last_name: '', phone: '', email: '',
};

export default function Receptionists() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['receptionists', search, page],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get('/receptionists', { params });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/receptionists', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] });
      toast('Receptionist created', 'success');
      closeModal();
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/receptionists/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] });
      toast('Receptionist updated', 'success');
      closeModal();
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/receptionists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] });
      toast('Receptionist deleted', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  function ReceptionistForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: editing || defaultForm,
    });
    const saving = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (formData) => {
      if (editing) {
        updateMutation.mutate({ id: editing.id, body: formData });
      } else {
        createMutation.mutate(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input {...register('first_name', { required: true })} className="input-field" />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input {...register('last_name', { required: true })} className="input-field" />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input {...register('phone')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} className="input-field" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Receptionist' : 'Create Receptionist'}
          </Button>
        </div>
      </form>
    );
  }

  const columns = [
    { key: 'first_name', label: 'Name', render: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', render: (r) => r.email || '—' },
    { key: 'status', label: 'Status', render: (r) => {
      const active = r.status !== 'inactive';
      return <Badge variant={active ? 'success' : 'secondary'}>{active ? 'Active' : 'Inactive'}</Badge>;
    }},
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) =>
        canEdit ? (
          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => openEdit(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary-600">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Receptionists</h1>
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus size={18} />
            Add Receptionist
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search receptionists..." />
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Receptionist' : 'Add Receptionist'}>
        <ReceptionistForm />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Receptionist"
        message={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
