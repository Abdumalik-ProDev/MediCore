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
import { SEVERITIES } from '../utils/constants';

const defaultForm = {
  category_id: '', name: '', description: '', icd_code: '', severity: 'moderate',
};

export default function Diseases() {
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
    queryKey: ['diseases', search, page],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await api.get('/diseases', { params });
      return data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['disease-categories'],
    queryFn: async () => {
      const { data } = await api.get('/disease-categories', { params: { limit: 100 } });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/diseases', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
      toast('Disease created', 'success');
      closeModal();
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/diseases/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
      toast('Disease updated', 'success');
      closeModal();
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/diseases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
      toast('Disease deleted', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const categories = categoriesData?.data || [];

  function DiseaseForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: editing ? { ...defaultForm, ...editing, category_id: editing.category?.id || editing.category_id } : defaultForm,
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select {...register('category_id', { required: true })} className="input-field">
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input {...register('name', { required: true })} className="input-field" />
          {errors.name && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} className="input-field" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Code</label>
            <input {...register('icd_code')} className="input-field" placeholder="e.g. A00.0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select {...register('severity')} className="input-field">
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Disease' : 'Create Disease'}
          </Button>
        </div>
      </form>
    );
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'icd_code', label: 'ICD-10 Code', render: (r) => r.icd_code || '—' },
    { key: 'category', label: 'Category', render: (r) => r.category?.name || '—' },
    {
      key: 'severity',
      label: 'Severity',
      render: (r) => <Badge variant={r.severity}>{r.severity}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge variant={r.is_active ? 'active' : 'resolved'}>{r.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
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
        <h1 className="text-2xl font-bold text-gray-900">Disease Registry</h1>
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus size={18} />
            Add Disease
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search diseases..." />
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Disease' : 'Add Disease'}>
        <DiseaseForm />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Disease"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
