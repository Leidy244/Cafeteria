import { useToast } from '../contexts';

const icons: Record<string, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

const titles: Record<string, string> = {
  success: '¡Éxito!',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-custom toast-custom-${toast.type}`}>
          <div className="toast-custom-icon">{icons[toast.type] || '•'}</div>
          <div className="toast-custom-content">
            <div className="toast-custom-title">{titles[toast.type] || ''}</div>
            <div className="toast-custom-message">{toast.message}</div>
          </div>
          <button className="toast-custom-close" onClick={() => removeToast(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
