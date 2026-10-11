import { useCallback, useState, createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function useConfirmLogout({ role = 'customer' } = {}) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    logout()
    navigate(role === 'staff' ? '/staff-login' : '/login', { replace: true })
  }, [logout, navigate, role])

  const dialog = createElement(ConfirmDialog, {
    isOpen,
    title: 'Log out?',
    message:
      role === 'staff'
        ? 'You will need to sign in again to access the operations portal.'
        : 'You will need to sign in again to access your account.',
    confirmLabel: 'Log out',
    cancelLabel: 'Cancel',
    variant: 'danger',
    onConfirm: handleConfirm,
    onCancel: close,
  })

  return {
    open,
    close,
    dialog,
  }
}
