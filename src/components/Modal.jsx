import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconClose } from './Icon'

const FOCUSABLE_SELECTORS =
  'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'

const getFirstFocusableElement = (container) => {
  if (!container) return null
  return container.querySelector(FOCUSABLE_SELECTORS)
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  ariaDescribedBy,
  className = '',
}) {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`)
  const previousActiveElementRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    previousActiveElementRef.current = document.activeElement

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    setTimeout(() => {
      const firstFocusable = getFirstFocusableElement(modalRef.current)
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handleOverlayMouseDown = (event) => {
      if (event.target === overlayRef.current) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    if (overlayRef.current) {
      overlayRef.current.addEventListener('mousedown', handleOverlayMouseDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (overlayRef.current) {
        overlayRef.current.removeEventListener('mousedown', handleOverlayMouseDown)
      }
      document.body.style.overflow = originalOverflow

      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = {
    small: 'modal-sm',
    medium: 'modal-md',
    large: 'modal-lg',
  }[size] || 'modal-md'

  return createPortal(
    <div className="modal-overlay" ref={overlayRef}>
      <div
        ref={modalRef}
        className={`modal-content ${sizeClass} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId.current : undefined}
        aria-describedby={ariaDescribedBy || undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2 id={titleId.current} className="modal-title">
              {title}
            </h2>
            <button
              className="modal-close-button"
              type="button"
              onClick={onClose}
              aria-label="Close"
            >
              <IconClose size={18} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
