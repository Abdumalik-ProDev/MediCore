import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../stores/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate } from '../utils/formatters';
import { SUGGESTION_STATUSES, SEVERITIES } from '../utils/constants';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const defaultForm = {
  disease_name: '', description: '', icd_code: '', severity: 'moderate', suggested_category_id: '',
};

function SuggestForm({ createMutation, categoriesData, onClose }) {
  const { register, handleSubmit } = useForm({ defaultValues: defaultForm });
  const saving = createMutation.isPending;

  const onSubmit = (formData) => {
    const body = { ...formData };
    if (!body.suggested_category_id) delete body.suggested_category_id;
    createMutation.mutate(body);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disease Name *</label>
        <input {...register('disease_name', { required: true })} className="input-field" placeholder="e.g. Influenza" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 Code</label>
          <input {...register('icd_code')} className="input-field" placeholder="e.g. J10" />
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select {...register('suggested_category_id')} className="input-field">
          <option value="">Select category...</option>
          {categoriesData?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea {...register('description')} className="input-field" rows={3} placeholder="Provide clinical details..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </div>
    </form>
  );
}

function ReviewModal({ reviewTarget, reviewMutation, onClose }) {
  const [adminNotes, setAdminNotes] = useState('');
  if (!reviewTarget) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Disease Name</span>
          <p className="font-medium">{reviewTarget.disease_name}</p>
        </div>
        <div>
          <span className="text-gray-500">ICD-10</span>
          <p className="font-medium">{reviewTarget.icd_code || '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">Severity</span>
          <p className="font-medium capitalize">{reviewTarget.severity || 'moderate'}</p>
        </div>
        <div>
          <span className="text-gray-500">Suggested By</span>
          <p className="font-medium">{reviewTarget.suggested_by?.email || '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">Status</span>
          <p className="font-medium capitalize">{reviewTarget.status}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Description</span>
          <p className="font-medium">{reviewTarget.description || '—'}</p>
        </div>
        {reviewTarget.category && (
          <div className="col-span-2">
            <span className="text-gray-500">Category</span>
            <p className="font-medium">{reviewTarget.category.name}</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
        <textarea
          className="input-field"
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Optional notes for the review decision..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant="danger"
          onClick={() => reviewMutation.mutate({ id: reviewTarget.id, body: { status: 'rejected', admin_notes: adminNotes } })}
          disabled={reviewMutation.isPending}
        >
          <XCircle size={18} />Reject
        </Button>
        <Button
          onClick={() => reviewMutation.mutate({ id: reviewTarget.id, body: { status: 'approved', admin_notes: adminNotes } })}
          disabled={reviewMutation.isPending}
        >
          <CheckCircle size={18} />Approve
        </Button>
      </div>
    </div>
  );
}

export default function DiseaseSuggestions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canSuggest = isAdmin || user?.role === 'doctor';
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['disease-suggestions', page, statusFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/disease-suggestions', { params });
      return data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['disease-categories'],
    queryFn: async () => {
      const { data } = await api.get('/disease-categories?limit=100');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/disease-suggestions', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['disease-suggestions'] }); toast('Suggestion submitted', 'success'); closeModal(); },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, body }) => api.put(`/disease-suggestions/${id}/review`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disease-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
      toast('Suggestion reviewed', 'success');
      setReviewTarget(null);
    },
    onError: (err) => toast(err.response?.data?.error?.message || 'Error', 'error'),
  });

  const openCreate = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const columns = [
    { key: 'disease_name', label: 'Disease Name', render: (r) => (
      <div><span className="font-medium">{r.disease_name}</span>{r.icd_code && <span className="text-xs text-gray-400 ml-2">({r.icd_code})</span>}</div>
    )},
    { key: 'icd_code', label: 'ICD-10', render: (r) => r.icd_code || '—' },
    { key: 'suggested_by', label: 'Suggested By', render: (r) => r.suggested_by?.email || '—' },
    { key: 'severity', label: 'Severity', render: (r) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        r.severity === 'severe' || r.severity === 'critical' ? 'bg-red-100 text-red-800' :
        r.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {r.severity || 'moderate'}
      </span>
    )},
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>
        {r.status}
      </span>
    )},
    { key: 'created_at', label: 'Created At', render: (r) => formatDate(r.created_at) },
    {
      key: 'actions', label: '', sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {isAdmin && r.status === 'pending' && (
            <button onClick={() => setReviewTarget(r)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">
              <Eye size={16} />Review
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterTabs = ['', ...SUGGESTION_STATUSES];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Disease Suggestions</h1>
        {canSuggest && (
          <Button onClick={openCreate}><Plus size={18} />Suggest New Disease</Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {filterTabs.map((s) => (
          <button
            key={s}
            onClick={() => { setPage(1); setStatusFilter(s); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Suggest New Disease" size="md">
        <SuggestForm createMutation={createMutation} categoriesData={categoriesData} onClose={closeModal} />
      </Modal>
      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Review Suggestion" size="md">
        <ReviewModal reviewTarget={reviewTarget} reviewMutation={reviewMutation} onClose={() => setReviewTarget(null)} />
      </Modal>
    </div>
  );
}
