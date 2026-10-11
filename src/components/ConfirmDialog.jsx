import { useEffect, useRef } from 'react'
import Modal from './Modal'

const iconStyles = {
  width: '1.125rem',
  height: '1.125rem',
  stroke: 'currentColor',
  strokeWidth: 2,
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyles}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.1-1.9A2.4 2.4 0 0 1 14.5 11c-.7.7-1.5 1.2-1.9 2.1-.2.4-.3.8-.3 1.1" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyles}>
      <path d="M12 4.5 3.7 18a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L12 4.5Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ ...iconStyles, animation: 'confirm-dialog-spin 0.9s linear infinite' }}>
      <path d="M12 3a9 9 0 1 1-9 9" />
    </svg>
  )
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cancelButtonRef = useRef(null)
  const confirmButtonRef = useRef(null)
  const descriptionId = useRef(`confirm-dialog-description-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    if (!isOpen || loading) return

    const targetButton = variant === 'danger' ? cancelButtonRef.current : confirmButtonRef.current
    if (targetButton) {
      targetButton.focus()
    }
  }, [isOpen, variant, loading])

  const handleKeyDown = (event) => {
    if (!isOpen || loading) return

    if (event.key === 'Enter' && document.activeElement === confirmButtonRef.current) {
      event.preventDefault()
      onConfirm?.()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onConfirm])

  const handleCancel = () => {
    if (loading) return
    onCancel?.()
  }

  const handleConfirm = () => {
    if (loading) return
    onConfirm?.()
  }

  const isDanger = variant === 'danger'

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="small"
      ariaDescribedBy={message ? descriptionId.current : undefined}
      className="confirm-dialog"
    >
      <div className="confirm-dialog__body">
        <div className="confirm-dialog__content">
          <div className={`confirm-dialog__icon ${isDanger ? 'confirm-dialog__icon--danger' : ''}`} aria-hidden="true">
            {isDanger ? <WarningIcon /> : <QuestionIcon />}
          </div>

          <div className="confirm-dialog__text">
            <p id={descriptionId.current} className="confirm-dialog__message">{message}</p>
            {children}
          </div>
        </div>
      </div>

      <div className="confirm-dialog__footer">
        <button
          ref={cancelButtonRef}
          type="button"
          className="secondary-button"
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelLabel}
        </button>

        <button
          ref={confirmButtonRef}
          type="button"
          className={isDanger ? 'danger-button' : 'primary-button'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <SpinnerIcon />
              <span>Please wait...</span>
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  )
}
