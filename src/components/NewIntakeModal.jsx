import { useEffect, useState } from 'react'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import api from '../services/api'
import { formatCurrency } from '../utils/presetPricing'
import { SERVICE_TYPES } from '../constants/index'

const generateWalkinEmail = () => `walkin-${Date.now()}@washwhiz.local`

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(8)
  crypto.getRandomValues(arr)
  let pwd = ''
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(arr[i] % chars.length)
  }
  return pwd
}

const getLocalDatetimeString = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

export default function NewIntakeModal({ isOpen, onClose, onSubmit, staffId }) {
  const [customers, setCustomers] = useState([])
  const [presets, setPresets] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const defaultDateTime = getLocalDatetimeString(new Date(Date.now() + 24 * 60 * 60 * 1000))

  const [form, setForm] = useState({
    customerId: '',
    newCustomerName: '',
    newCustomerPhone: '',
    newCustomerEmail: '',
    serviceType: SERVICE_TYPES[0],
    presetId: '',
    weightKg: '',
    itemsCount: '1',
    specialInstructions: '',
    estimatedReadyAt: defaultDateTime,
  })

  useEffect(() => {
    if (!isOpen) return
    setForm({
      customerId: '',
      newCustomerName: '',
      newCustomerPhone: '',
      newCustomerEmail: '',
      serviceType: SERVICE_TYPES[0],
      presetId: '',
      weightKg: '',
      itemsCount: '1',
      specialInstructions: '',
      estimatedReadyAt: getLocalDatetimeString(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    })
    setCustomerSearch('')
    setShowNewCustomer(false)
    setErrors({})
    setConfirmOpen(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        setCustomersLoading(true)
        const customersRes = await api.get('/customers.php')
        const presetsRes = await api.get('/wash_presets.php')
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : [])
        const allPresets = Array.isArray(presetsRes.data) ? presetsRes.data : []
        setPresets(allPresets.filter((p) => p.customer_id === null))
      } catch (err) {
        setErrors({ general: err.message })
      } finally {
        setCustomersLoading(false)
      }
    }

    loadData()
  }, [isOpen])

  const filteredCustomers = customers.filter((c) => {
    const search = customerSearch.toLowerCase()
    return !search || c.name.toLowerCase().includes(search) || c.phone.includes(search)
  })

  const selectedPreset = presets.find((p) => String(p.id) === String(form.presetId)) || null
  const weight = Number(form.weightKg || 0)
  const rate = Number(selectedPreset?.price_per_kg || 0)
  const estimatedTotal = weight > 0 && rate > 0 ? weight * rate : 0

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (showNewCustomer) {
      if (!form.newCustomerName?.trim()) {
        newErrors.newCustomerName = 'Name is required'
      }
      if (!form.newCustomerPhone?.trim()) {
        newErrors.newCustomerPhone = 'Phone is required'
      } else {
        const existingPhone = customers.find((c) => c.phone === form.newCustomerPhone.trim())
        if (existingPhone) {
          newErrors.newCustomerPhone = `A customer with this phone already exists: ${existingPhone.name}`
        }
      }
    } else {
      if (!form.customerId) {
        newErrors.customerId = 'Please select a customer'
      }
    }

    if (!form.serviceType) {
      newErrors.serviceType = 'Service type is required'
    }

    if (!form.presetId) {
      newErrors.presetId = 'Please select a preset'
    }

    if (!form.weightKg || Number(form.weightKg) <= 0) {
      newErrors.weightKg = 'Weight must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenConfirm = (event) => {
    event.preventDefault()
    if (submitting) return

    if (!validateForm()) {
      return
    }

    setErrors({})
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (submitting) return

    setSubmitting(true)

    try {
      let customerId = form.customerId ? Number(form.customerId) : null

      if (showNewCustomer) {
        const email = form.newCustomerEmail?.trim() || generateWalkinEmail()
        const password = generateRandomPassword()

        const registerRes = await api.post('/customers.php', {
          action: 'register',
          name: form.newCustomerName,
          phone: form.newCustomerPhone,
          email,
          password,
        })

        if (!registerRes.data?.customer?.id) {
          throw new Error('Failed to create customer account.')
        }

        customerId = registerRes.data.customer.id
      }

      const payload = {
        customer_id: customerId,
        staff_id: staffId,
        service_type: form.serviceType,
        preset_id: Number(selectedPreset.id),
        preset_name: selectedPreset.name,
        weight_kg: weight,
        items_count: Number(form.itemsCount || 1),
        special_instructions: form.specialInstructions,
        status: 'received',
        total_amount: estimatedTotal,
        estimated_ready_at: form.estimatedReadyAt ? `${form.estimatedReadyAt}:00` : null,
      }

      const result = await api.post('/orders.php', payload)

      if (onSubmit) {
        onSubmit(result.data)
      }

      setConfirmOpen(false)
      onClose()
    } catch (err) {
      setConfirmOpen(false)
      setErrors({ general: err.message || 'Failed to create order.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="New Intake" size="large">
        <form className="modal-form" onSubmit={handleOpenConfirm}>
          {!showNewCustomer ? (
            <label>
              Customer
              {errors.customerId && <span className="field-error">{errors.customerId}</span>}
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                disabled={customersLoading}
              >
                <option value="">Select a customer...</option>
                {filteredCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowNewCustomer(true)}
              >
                Add new customer (walk-in)
              </button>
            </label>
          ) : (
            <>
              <label>
                Customer name
                {errors.newCustomerName && <span className="field-error">{errors.newCustomerName}</span>}
                <input
                  type="text"
                  name="newCustomerName"
                  value={form.newCustomerName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </label>
              <label>
                Phone number
                {errors.newCustomerPhone && <span className="field-error">{errors.newCustomerPhone}</span>}
                <input
                  type="tel"
                  name="newCustomerPhone"
                  value={form.newCustomerPhone}
                  onChange={handleChange}
                  placeholder="09xxxxxxxxx"
                />
              </label>
              <label>
                Email (optional)
                <input
                  type="email"
                  name="newCustomerEmail"
                  value={form.newCustomerEmail}
                  onChange={handleChange}
                  placeholder="Leave blank for walk-in"
                />
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowNewCustomer(false)}
              >
                Back to customer list
              </button>
            </>
          )}

          <label>
            Service type
            {errors.serviceType && <span className="field-error">{errors.serviceType}</span>}
            <select name="serviceType" value={form.serviceType} onChange={handleChange}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Wash preset
            {errors.presetId && <span className="field-error">{errors.presetId}</span>}
            <select name="presetId" value={form.presetId} onChange={handleChange}>
              <option value="">Select a preset...</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} - {formatCurrency(preset.price_per_kg)}/kg
                </option>
              ))}
            </select>
          </label>

          <div className="modal-form__field-grid">
            <label>
              Weight (kg)
              {errors.weightKg && <span className="field-error">{errors.weightKg}</span>}
              <input
                type="number"
                name="weightKg"
                value={form.weightKg}
                onChange={handleChange}
                min="0"
                step="0.1"
                placeholder="0.0"
              />
            </label>
            <label>
              Items count
              <input
                type="number"
                name="itemsCount"
                value={form.itemsCount}
                onChange={handleChange}
                min="1"
              />
            </label>
          </div>

          <label>
            Estimated ready date/time
            <input
              type="datetime-local"
              name="estimatedReadyAt"
              value={form.estimatedReadyAt}
              onChange={handleChange}
            />
          </label>

          <label>
            Special instructions
            <textarea
              name="specialInstructions"
              value={form.specialInstructions}
              onChange={handleChange}
              placeholder="Stains, special handling, preferences..."
              rows="3"
            />
          </label>

          <div className="modal-total">
            <span>Estimated total:</span>
            <strong>{formatCurrency(estimatedTotal)}</strong>
          </div>

          {errors.general && <div className="error-box">{errors.general}</div>}

          <div className="modal-form__actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Please wait...' : 'Create order'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Create this order?"
        message="Please review the order before creating it."
        confirmLabel="Create order"
        cancelLabel="Review form"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      >
        <div className="confirm-dialog__summary">
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Customer</span>
            <span className="confirm-dialog__summary-value">
              {showNewCustomer ? `${form.newCustomerName} · ${form.newCustomerPhone}` : (customers.find((customer) => String(customer.id) === String(form.customerId))?.name || '')}
            </span>
          </div>
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
          <div className="confirm-dialog__summary-row">
            <span className="confirm-dialog__summary-label">Estimated ready time</span>
            <span className="confirm-dialog__summary-value">{form.estimatedReadyAt ? new Date(form.estimatedReadyAt).toLocaleString() : 'Not set'}</span>
          </div>
          <div className="confirm-dialog__summary-total">
            <span className="confirm-dialog__summary-label">Estimated total</span>
            <span className="confirm-dialog__summary-value confirm-dialog__summary-value--total">{formatCurrency(estimatedTotal)}</span>
          </div>
        </div>
      </ConfirmDialog>
    </>
  )
}
