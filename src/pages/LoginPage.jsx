import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordField from '../components/PasswordField'

const initialForm = {
  email: '',
  password: '',
  name: '',
  phone: '',
  register: false,
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const submitLogin = async (payload) => {
    const response = await fetch('http://localhost/washwiz/php-api/customers.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', ...payload }),
    })

    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        email: form.email,
        password: form.password,
      }

      if (form.register) {
        const registerResponse = await fetch('http://localhost/washwiz/php-api/customers.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
          }),
        })

        const registerData = await registerResponse.json()
        if (!registerResponse.ok || !registerData.success) {
          throw new Error(registerData.message || 'Registration failed')
        }
      }

      const authData = await submitLogin(payload)
      setSession({
        role: 'customer',
        user: authData.data.customer,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-block">
          <span className="eyebrow eyebrow--light">Laundry management</span>
          <Link to="/" className="brand-block__wordmark" aria-label="Back to WashWhiz home page">
            <h1 className="brand-block__wordmark">WashWhiz</h1>
          </Link>
          <p className="brand-block__tagline">Book, track, and manage your laundry with a simple customer portal.</p>

          <ul className="feature-list" aria-label="WashWhiz features">
            <li className="feature-item"><span className="feature-item__icon">01</span><span>Book recurring and one-off wash orders</span></li>
            <li className="feature-item"><span className="feature-item__icon">02</span><span>Monitor progress with live status updates</span></li>
            <li className="feature-item"><span className="feature-item__icon">03</span><span>Pickup schedules and order history in one place</span></li>
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-header-row">
            <h2>{form.register ? 'Create account' : 'Customer login'}</h2>
            <button
              type="button"
              className="link-button"
              onClick={() => setForm((current) => ({ ...current, register: !current.register }))}
            >
              {form.register ? 'Already have an account?' : 'Need an account?'}
            </button>
          </div>

          {form.register && (
            <>
              <label className="field-label">
                <span>Full name</span>
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label className="field-label">
                <span>Phone number</span>
                <input name="phone" value={form.phone} onChange={handleChange} required />
              </label>
            </>
          )}

          <label className="field-label">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
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

          <div className="auth-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Please wait...' : form.register ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
