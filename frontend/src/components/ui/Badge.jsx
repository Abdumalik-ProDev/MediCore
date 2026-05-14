const variants = {
  active: 'bg-green-100 text-green-800',
  resolved: 'bg-blue-100 text-blue-800',
  chronic: 'bg-yellow-100 text-yellow-800',
  mild: 'bg-gray-100 text-gray-700',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
  admin: 'bg-purple-100 text-purple-800',
  clinician: 'bg-blue-100 text-blue-800',
  receptionist: 'bg-cyan-100 text-cyan-800',
};

export default function Badge({ children, variant = 'active', className = '' }) {
  const cls = variants[variant] || variants.active;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}
    >
      {children}
    </span>
  );
}
