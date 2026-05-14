import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import Spinner from './ui/Spinner';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export default function DataTable({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  sortable = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No records found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-gray-500 ${
                  sortable && col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''
                }`}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {sortable && col.sortable !== false && (
                    sortKey === col.key ? (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={14} className="text-gray-300" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && pagination.totalPages > 1 && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
