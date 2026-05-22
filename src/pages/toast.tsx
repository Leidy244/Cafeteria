import { useState, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

let addToastHandler: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  if (addToastHandler) {
    addToastHandler({ message, type });
  } else {
    console.warn('Toast container not mounted');
    alert(message);
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastHandler = ({ message, type }) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    return () => { addToastHandler = null; };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'success': return '¡Éxito!';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return '';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-custom toast-custom-${toast.type}`}>
          <div className="toast-custom-icon">{getIcon(toast.type)}</div>
          <div className="toast-custom-content">
            <div className="toast-custom-title">{getTitle(toast.type)}</div>
            <div className="toast-custom-message">{toast.message}</div>
          </div>
          <button className="toast-custom-close" onClick={() => removeToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};