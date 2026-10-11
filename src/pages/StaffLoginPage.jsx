import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'

const initialForm = { identifier: '', password: '' }

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost/washwiz/php-api/staff.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          identifier: form.identifier,
          password: form.password,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Staff login failed')
      }

      setSession({ role: 'staff', user: data.data.staff })
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card--staff">
        <div className="brand-block brand-block--staff">
          <span className="eyebrow eyebrow--light">Staff access</span>
          <span className="brand-block__restricted">Restricted access</span>
          <h1 className="brand-block__wordmark">WashWhiz Admin</h1>
          <p className="brand-block__tagline">Manage orders, stages, and wash presets from the operations portal.</p>

          <ul className="feature-list" aria-label="Staff features">
            <li className="feature-item"><span className="feature-item__icon">01</span><span>Review active service queues</span></li>
            <li className="feature-item"><span className="feature-item__icon">02</span><span>Update order stages and fulfillment status</span></li>
            <li className="feature-item"><span className="feature-item__icon">03</span><span>Maintain preset catalog and operational settings</span></li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-header-row">
            <h2>Staff login</h2>
          </div>

          <label className="field-label">
            <span>Staff ID or email</span>
            <input
              name="identifier"
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
              required
            />
          </label>

          <PasswordField
            label="Password"
            value={form.password}
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            visible={showPassword}
            onToggleVisible={() => setShowPassword((current) => !current)}
            placeholder="Enter your password"
          />

          {error && <div className="error-box" role="alert">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Checking credentials...' : 'Access portal'}
          </button>
        </form>
      </section>
    </main>
  )
}
