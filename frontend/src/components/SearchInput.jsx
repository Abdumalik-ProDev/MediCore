import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({ value = '', onChange, placeholder = 'Search...', debounceMs = 300 }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [local, debounceMs]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="input-field pl-10"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  );
}
