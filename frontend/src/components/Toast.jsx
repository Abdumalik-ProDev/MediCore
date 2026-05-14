import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error: <XCircle size={20} className="text-red-500" />,
  info: <AlertCircle size={20} className="text-blue-500" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px] animate-slide-up"
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm text-gray-800">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
