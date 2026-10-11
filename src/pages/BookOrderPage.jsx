import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatCurrency } from '../utils/presetPricing'
import { describePreset } from '../utils/presets'
import { IconSearch, IconArrowUpRight } from '../components/Icon'
import ConfirmDialog from '../components/ConfirmDialog'

const serviceOptions = [
  'Wash and Fold',
  'Wash and Dry',
  'Wash and Press',
  'Delicate Care',
  'Bulk Laundry',
]

const initialForm = {
  serviceType: serviceOptions[0],
  presetId: '',
  weightKg: '',
  itemsCount: '1',
  specialInstructions: '',
}

export default function BookOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  const [presets, setPresets] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedPreset = useMemo(
    () => presets.find((preset) => String(preset.id) === String(form.presetId)) || null,
    [form.presetId, presets],
  )

  const estimatedTotal = useMemo(() => {
    const weight = Number(form.weightKg || 0)
    const rate = Number(selectedPreset?.price_per_kg || 0)
    return weight > 0 && rate > 0 ? weight * rate : 0
  }, [form.weightKg, selectedPreset])

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/wash_presets.php?customer_id=${session?.user?.id ?? 0}`)
        const nextPresets = Array.isArray(response.data) ? response.data : []
        setPresets(nextPresets)

        const routePresetId = location.state?.presetId ?? new URLSearchParams(location.search).get('preset')
        if (routePresetId) {
          const matched = nextPresets.find((preset) => String(preset.id) === String(routePresetId))
          if (matched) {
            setForm((current) => ({ ...current, presetId: String(matched.id) }))
            return
          }
        }

        if (nextPresets.length > 0 && !form.presetId) {
          setForm((current) => ({ ...current, presetId: String(nextPresets[0].id) }))
        }
      } catch (err) {
        setError(err.message || 'Unable to load presets')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      loadPresets()
    }
  }, [session?.user?.id, location.search, location.state])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const validateOrder = () => {
    const selected = presets.find((preset) => String(preset.id) === String(form.presetId))

    if (!selected) {
      throw new Error('Please choose a wash preset before submitting.')
    }

    if (!Number(form.weightKg) || Number(form.weightKg) <= 0) {
      throw new Error('Please enter a valid weight greater than zero.')
    }

    if (!Number(form.itemsCount) || Number(form.itemsCount) <= 0) {
      throw new Error('Please enter a valid item count greater than zero.')
    }

    return { selected }
  }

  const handlePlaceOrderClick = (event) => {
    if (event) {
      event.preventDefault()
    }

    if (submitting || loading) {
      return
    }

    try {
      validateOrder()
      setError('')
      setSuccess('')
      setConfirmOpen(true)
    } catch (err) {
      setError(err.message || 'Unable to create your order')
      setConfirmOpen(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (submitting) {
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const { selected } = validateOrder()
      const payload = {
        customer_id: session.user.id,
        service_type: form.serviceType,
        preset_id: Number(selected.id),
        preset_name: selected.name,
        weight_kg: Number(form.weightKg),
        items_count: Number(form.itemsCount),
        special_instructions: form.specialInstructions,
        status: 'received',
        total_amount: Number(estimatedTotal),
      }

      await api.post('/orders.php', payload)
      setConfirmOpen(false)
      setSuccess('Order placed successfully. Redirecting to My orders...')
      setTimeout(() => navigate('/track-order'), 1500)
    } catch (err) {
      setConfirmOpen(false)
      setError(err.message || 'Unable to create your order')
    } finally {
      setSubmitting(false)
    }
  }

  const summaryRows = [
    { label: 'Preset', value: selectedPreset?.name || 'No preset selected' },
    { label: 'Rate', value: selectedPreset ? `${formatCurrency(selectedPreset.price_per_kg)}/kg` : 'Select a preset' },
    { label: 'Weight', value: form.weightKg ? `${form.weightKg} kg` : '0.0 kg' },
    { label: 'Items', value: form.itemsCount || '1' },
  ]

  return (
    <>
      <header className="page-header">
        <div className="page-header__meta">
          <span className="eyebrow">Customer order</span>
          <h1 className="page-header__title">Book an order</h1>
        </div>
      </header>

      <section className="book-order-page">
        <div className="book-order-page__content">
          <form className="book-form" onSubmit={handlePlaceOrderClick}>
            <div className="book-form__step">
              <div className="book-step-marker">1</div>
              <div className="book-step__content">
                <div className="book-step__header">
                  <h2>Service</h2>
                </div>

                <div className="service-picker desktop-only" aria-label="Choose a service type">
                  {serviceOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={form.serviceType === option ? 'service-option is-active' : 'service-option'}
                      onClick={() => setForm((current) => ({ ...current, serviceType: option }))}
                      aria-pressed={form.serviceType === option}
                    >
                      <span>{option}</span>
                    </button>
                  ))}
                </div>

                <label className="field-label mobile-only" htmlFor="serviceTypeSelect">
                  <span>Service type</span>
                  <select id="serviceTypeSelect" name="serviceType" value={form.serviceType} onChange={handleChange}>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="book-form__step">
              <div className="book-step-marker">2</div>
              <div className="book-step__content">
                <div className="book-step__header">
                  <h2>Preset</h2>
                </div>

                {loading ? (
                  <div className="booking-skeletons" aria-live="polite">
                    <div className="skeleton booking-skeleton" />
                    <div className="skeleton booking-skeleton" />
                  </div>
                ) : (
                  <div className="preset-picker" role="radiogroup" aria-label="Wash preset choices">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={form.presetId === String(preset.id) ? 'preset-option is-active' : 'preset-option'}
                        onClick={() => setForm((current) => ({ ...current, presetId: String(preset.id) }))}
                        aria-pressed={form.presetId === String(preset.id)}
                      >
                        <span className="preset-option__title-row">
                          <strong>{preset.name}</strong>
                          <span>{formatCurrency(preset.price_per_kg)}/kg</span>
                        </span>
                        <span className="preset-option__desc">{describePreset(preset)}</span>
                        <span className="preset-option__meta">
                          <span>{preset.category}</span>
                          <span>{preset.cycle}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="book-form__step">
              <div className="book-step-marker">3</div>
              <div className="book-step__content">
                <div className="book-step__header">
                  <h2>Load details</h2>
                </div>

                <div className="book-form__fields">
                  <label className="field-label" htmlFor="weightKg">
                    <span>Weight</span>
                    <div className="weight-stepper">
                      <button type="button" className="stepper-button" onClick={() => setForm((current) => ({ ...current, weightKg: String(Math.max(0, Number(current.weightKg || 0) - 0.5)) }))} aria-label="Decrease weight">-</button>
                      <input id="weightKg" name="weightKg" type="number" min="0" step="0.5" value={form.weightKg} onChange={handleChange} placeholder="0.0" />
                      <button type="button" className="stepper-button" onClick={() => setForm((current) => ({ ...current, weightKg: String((Number(current.weightKg || 0) + 0.5).toFixed(1)) }))} aria-label="Increase weight">+</button>
                    </div>
                  </label>

                  <label className="field-label" htmlFor="itemsCount">
                    <span>Items count</span>
                    <div className="weight-stepper">
                      <button type="button" className="stepper-button" onClick={() => setForm((current) => ({ ...current, itemsCount: String(Math.max(1, Number(current.itemsCount || 1) - 1)) }))} aria-label="Decrease item count">-</button>
                      <input id="itemsCount" name="itemsCount" type="number" min="1" value={form.itemsCount} onChange={handleChange} />
                      <button type="button" className="stepper-button" onClick={() => setForm((current) => ({ ...current, itemsCount: String((Number(current.itemsCount || 1) + 1)) }))} aria-label="Increase item count">+</button>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="book-form__step">
              <div className="book-step-marker">4</div>
              <div className="book-step__content">
                <div className="book-step__header">
                  <h2>Notes</h2>
                </div>

                <label className="field-label" htmlFor="specialInstructions">
                  <span>Special instructions</span>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={form.specialInstructions}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add stain notes, fabric care details, or any pickup preferences"
                  />
                </label>
              </div>
            </div>

            {error && <div className="error-box" role="alert">{error}</div>}
            {success && (
              <div className="success-panel" role="status">
                <div className="success-panel__icon"><IconArrowUpRight size={18} /></div>
                <div>
                  <strong>Order placed</strong>
                  <p>{success}</p>
                </div>
                <Link to="/track-order" className="button-primary">My orders</Link>
              </div>
            )}
          </form>

          <aside className="book-summary" aria-label="Order summary">
            <div className="book-summary__card">
              <div className="section-header">
                <h2 className="section-header__title">Order summary</h2>
              </div>

              <div className="book-summary__rows">
                {summaryRows.map((row) => (
                  <div key={row.label} className="book-summary__row">
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>

              <div className="book-summary__total">
                <span>Estimated total</span>
                <strong>{formatCurrency(estimatedTotal)}</strong>
              </div>

              <button type="button" className="button-primary book-summary__submit" onClick={handlePlaceOrderClick} disabled={loading || submitting || presets.length === 0}>
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </aside>
        </div>

        <div className="mobile-order-bar">
          <div className="mobile-order-bar__total">
            <span>Total</span>
            <strong>{formatCurrency(estimatedTotal)}</strong>
          </div>
          <button type="button" className="button-primary mobile-order-bar__button" onClick={handlePlaceOrderClick} disabled={loading || submitting || presets.length === 0}>
            {submitting ? 'Please wait...' : 'Place order'}
          </button>
        </div>
      </section>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm your order"
        message="Please review your order details before continuing."
        confirmLabel="Confirm order"
        cancelLabel="Review order"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmOrder}
        onCancel={() => setConfirmOpen(false)}
      >
        <div className="confirm-dialog__summary">
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Service</span>
            <span className="confirm-dialog__summary-value">{form.serviceType}</span>
          </div>
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Preset</span>
            <span className="confirm-dialog__summary-value">{selectedPreset?.name || 'No preset selected'}</span>
          </div>
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Weight</span>
            <span className="confirm-dialog__summary-value">{form.weightKg ? `${form.weightKg} kg` : '0.0 kg'}</span>
          </div>
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Items</span>
            <span className="confirm-dialog__summary-value">{form.itemsCount || '1'}</span>
          </div>
          {form.specialInstructions && (
            <div className="confirm-dialog__summary-row confirm-dialog__summary-row--stacked">
              <span className="confirm-dialog__summary-label">Special instructions</span>
              <span className="confirm-dialog__summary-value confirm-dialog__summary-value--multiline">{form.specialInstructions}</span>
            </div>
          )}
          <div className="confirm-dialog__summary-total">
            <span className="confirm-dialog__summary-label">Estimated total</span>
            <span className="confirm-dialog__summary-value confirm-dialog__summary-value--total">{formatCurrency(estimatedTotal)}</span>
          </div>
        </div>
        <p className="confirm-dialog__note">You can track this order under My orders.</p>
      </ConfirmDialog>
    </>
  )
}
