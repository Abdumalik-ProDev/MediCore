const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizes[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
