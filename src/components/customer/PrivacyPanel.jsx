import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PasswordField from '../PasswordField'
import { useToast } from '../../hooks/useToast'
import api from '../../services/api'
import { IconCheck, IconLock } from '../Icon'

const initialForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function getPasswordScore(password) {
  if (!password) return { score: 0, label: 'Weak' }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) return { score: 1, label: 'Weak' }
  if (score === 2) return { score: 2, label: 'Fair' }
  if (score === 3) return { score: 3, label: 'Good' }
  return { score: 4, label: 'Strong' }
}

export default function PrivacyPanel() {
  const { session } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const passwordStrength = useMemo(() => getPasswordScore(form.newPassword), [form.newPassword])
  const matches = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword
  const hasMinLength = form.newPassword.length >= 8
  const isDifferent = !!form.currentPassword && !!form.newPassword && form.currentPassword !== form.newPassword

  const validate = () => {
    const nextErrors = {}
    if (!form.currentPassword.trim()) nextErrors.currentPassword = 'Current password is required.'
    if (!form.newPassword.trim()) nextErrors.newPassword = 'New password is required.'
    else if (form.newPassword.length < 8) nextErrors.newPassword = 'New password must be at least 8 characters long.'
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Please confirm your new password.'
    else if (form.newPassword !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = 'New password must be different from your current password.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmitError('')
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!session?.user?.id) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        name: session.user.name,
        phone: session.user.phone,
        email: session.user.email,
        current_password: form.currentPassword,
        password: form.newPassword,
      }

      await api.put(`/customers.php?id=${session.user.id}`, payload)

      addToast('Password updated', 'success')
      setForm(initialForm)
      setPasswordVisible({ current: false, new: false, confirm: false })
    } catch (error) {
      const message = error?.message || 'Unable to update password.'
      setSubmitError(message)
      setForm((current) => ({ ...current, currentPassword: '' }))
      setPasswordVisible((current) => ({ ...current, current: false }))
    } finally {
      setSubmitting(false)
    }
  }

  const isValid =
    form.currentPassword &&
    form.newPassword &&
    form.confirmPassword &&
    form.newPassword.length >= 8 &&
    form.newPassword === form.confirmPassword &&
    form.currentPassword !== form.newPassword

  return (
    <div className="customer-panel customer-panel--wide">
      <div className="customer-panel__header">
        <h2>Password</h2>
      </div>
      <div className="customer-panel__body profile-password-panel">
        <p className="profile-password-helper">Choose a strong password you do not use anywhere else.</p>

        <div className="profile-password-fields">
          <PasswordField
            label="Current password"
            value={form.currentPassword}
            onChange={(event) => handleFieldChange('currentPassword', event.target.value)}
            visible={passwordVisible.current}
            onToggleVisible={() => setPasswordVisible((current) => ({ ...current, current: !current.current }))}
            placeholder="Current password"
            error={errors.currentPassword}
          />

          <PasswordField
            label="New password"
            value={form.newPassword}
            onChange={(event) => handleFieldChange('newPassword', event.target.value)}
            visible={passwordVisible.new}
            onToggleVisible={() => setPasswordVisible((current) => ({ ...current, new: !current.new }))}
            placeholder="New password"
            error={errors.newPassword}
          />

          <PasswordField
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
            visible={passwordVisible.confirm}
            onToggleVisible={() => setPasswordVisible((current) => ({ ...current, confirm: !current.confirm }))}
            placeholder="Confirm password"
            error={errors.confirmPassword}
          />
        </div>

        <div className="profile-password-meter" aria-live="polite">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={`profile-password-meter__segment ${segment <= passwordStrength.score ? 'is-active' : ''}`}
            />
          ))}
          <span className="profile-password-meter__label">{passwordStrength.label}</span>
        </div>

        <div className="profile-password-checks">
          <div className={`profile-password-check ${matches ? 'is-met' : ''}`}>
            <span className="profile-password-check__icon">{matches ? <IconCheck size={14} /> : null}</span>
            <span>Passwords match</span>
          </div>
          <div className={`profile-password-check ${hasMinLength ? 'is-met' : ''}`}>
            <span className="profile-password-check__icon">{hasMinLength ? <IconCheck size={14} /> : null}</span>
            <span>At least 8 characters</span>
          </div>
        </div>

        <div className="profile-password-rule">{isDifferent ? <IconCheck size={14} /> : null} New password must differ from the current one.</div>

        {submitError && <div className="error-box" role="alert">{submitError}</div>}

        <div className="profile-password-actions">
          <button type="button" className="primary-button" onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? <span className="profile-password-spinner" aria-hidden="true" /> : null}
            {submitting ? 'Please wait...' : 'Update password'}
          </button>
        </div>

        <p className="profile-password-note">Your password is stored securely and is never shown.</p>
      </div>
    </div>
  )
}
