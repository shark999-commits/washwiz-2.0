import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import api from '../services/api'
import { IconUser, IconPhone, IconMail, IconClock, IconShield } from '../components/Icon'
import PrivacyPanel from '../components/customer/PrivacyPanel'

const initialForm = {
  name: '',
  phone: '',
  email: '',
}

const profileTabs = [
  { id: 'account', label: 'Account details', icon: IconUser },
  { id: 'privacy', label: 'Privacy', icon: IconShield },
]

function getValidTab(value) {
  return value === 'privacy' ? 'privacy' : 'account'
}

export default function ProfilePage() {
  const { session, setSession } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const tabRefs = useRef([])

  const user = session?.user || {}
  const activeTab = getValidTab(searchParams.get('tab'))

  const initials = useMemo(() => {
    return (user.name || 'Customer')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'W'
  }, [user.name])

  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : 'N/A'

  const updateTab = (tabId) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('tab', tabId)
      return next
    }, { replace: true })
  }

  const handleTabKeyDown = (event, index) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return
    }

    event.preventDefault()

    let nextIndex = index
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % profileTabs.length
    }
    if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + profileTabs.length) % profileTabs.length
    }
    if (event.key === 'Home') {
      nextIndex = 0
    }
    if (event.key === 'End') {
      nextIndex = profileTabs.length - 1
    }

    const nextTab = profileTabs[nextIndex]
    tabRefs.current[nextIndex]?.focus()
    updateTab(nextTab.id)
  }

  const openEditor = () => {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
    })
    setError('')
    setIsEditing(true)
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveProfile = async () => {
    const cleanedName = form.name.trim()
    const cleanedPhone = form.phone.trim()
    const cleanedEmail = form.email.trim().toLowerCase()

    if (!cleanedName || !cleanedPhone || !cleanedEmail) {
      setError('All profile fields are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        name: cleanedName,
        phone: cleanedPhone,
        email: cleanedEmail,
      }

      const res = await api.put(`/customers.php?id=${user.id}`, payload)

      const updatedCustomer = res?.data?.customer || {
        ...(session?.user || {}),
        id: user.id,
        name: cleanedName,
        phone: cleanedPhone,
        email: cleanedEmail,
      }

      setSession((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          ...updatedCustomer,
        },
      }))

      addToast('Profile updated successfully.', 'success')
      setIsEditing(false)
    } catch (saveError) {
      setError(saveError.message || 'Unable to update your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="page-header profile-page-header">
        <div className="page-header__meta">
          <span className="eyebrow">Customer portal</span>
          <h1 className="page-header__title">Profile</h1>
        </div>
      </header>

      <div className="profile-page">
        <section className="customer-panel profile-hero-panel">
          <div className="customer-panel__body profile-hero">
            <div className="profile-hero__identity">
              <span className="customer-account__avatar profile-avatar" aria-hidden="true">{initials}</span>
              <div>
                <span className="profile-hero__eyebrow">Account overview</span>
                <h2>{user.name || 'WashWhiz customer'}</h2>
                <p>{user.email || 'No email on file'}</p>
              </div>
            </div>

            <div className="profile-hero__actions">
              <button type="button" className="secondary-button" onClick={openEditor}>Edit profile</button>
            </div>
          </div>
        </section>

        <div className="profile-tablist" role="tablist" aria-label="Profile sections">
          {profileTabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                type="button"
                role="tab"
                id={`profile-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`profile-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`profile-tab ${isActive ? 'profile-tab--active' : ''}`}
                onClick={() => updateTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className="profile-tab__icon"><Icon size={16} /></span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'account' && (
          <section
            id="profile-panel-account"
            className="profile-panel"
            role="tabpanel"
            aria-labelledby="profile-tab-account"
            tabIndex={0}
          >
            <div className="customer-panel customer-panel--wide">
              <div className="customer-panel__header">
                <h2>Account details</h2>
                <button type="button" className="secondary-button" onClick={openEditor}>Edit profile</button>
              </div>
              <div className="customer-panel__body profile-details-panel">
                <div className="profile-detail-card">
                  <div className="profile-detail-card__icon"><IconUser size={18} /></div>
                  <div>
                    <span className="summary-label">Full name</span>
                    <strong>{user.name || 'Not provided'}</strong>
                  </div>
                </div>

                <div className="profile-detail-card">
                  <div className="profile-detail-card__icon"><IconPhone size={18} /></div>
                  <div>
                    <span className="summary-label">Phone</span>
                    <strong>{user.phone || 'Not provided'}</strong>
                  </div>
                </div>

                <div className="profile-detail-card">
                  <div className="profile-detail-card__icon"><IconMail size={18} /></div>
                  <div>
                    <span className="summary-label">Email</span>
                    <strong>{user.email || 'No email on file'}</strong>
                  </div>
                </div>

                <div className="profile-detail-card">
                  <div className="profile-detail-card__icon"><IconClock size={18} /></div>
                  <div>
                    <span className="summary-label">Member since</span>
                    <strong>{memberSince}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'privacy' && (
          <section
            id="profile-panel-privacy"
            className="profile-panel"
            role="tabpanel"
            aria-labelledby="profile-tab-privacy"
            tabIndex={0}
          >
            <PrivacyPanel />
          </section>
        )}
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit profile" size="medium">
        <div className="form-stack modal-form">
          <label className="field-label">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={handleFieldChange} placeholder="Enter your full name" />
          </label>

          <label className="field-label">
            <span>Phone number</span>
            <input name="phone" value={form.phone} onChange={handleFieldChange} placeholder="Enter your phone number" />
          </label>

          <label className="field-label">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleFieldChange} placeholder="Enter your email address" />
          </label>

          {error && <div className="error-box" role="alert">{error}</div>}

          <div className="modal-form__actions">
            <button type="button" className="secondary-button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="button" className="primary-button" onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </Modal>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}
