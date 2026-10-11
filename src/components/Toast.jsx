import { IconClose } from './Icon'

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            <IconClose size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
