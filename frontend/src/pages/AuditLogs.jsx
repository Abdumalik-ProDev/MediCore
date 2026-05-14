import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/DataTable';
import { formatDate } from '../utils/formatters';

export default function AuditLogs() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get('/audit-logs', { params: { page, limit: 10 } });
      return data;
    },
  });

  const columns = [
    { key: 'created_at', label: 'Timestamp', render: (r) => formatDate(r.created_at) },
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id', label: 'Entity ID', render: (r) => r.entity_id?.length > 8 ? r.entity_id.slice(0, 8) + '...' : r.entity_id || '—' },
    { key: 'user', label: 'User', render: (r) => r.user?.email || '—' },
    { key: 'details', label: 'Details', render: (r) => r.new_values ? JSON.stringify(r.new_values) : '—' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={data?.data} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
