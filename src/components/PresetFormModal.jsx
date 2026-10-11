import { useEffect, useState } from 'react'
import Modal from './Modal'
import { ADDON_OPTIONS, PRESET_CATEGORIES, CYCLES, TEMPERATURES, SPIN_SPEEDS } from '../constants/index'
import { calculatePresetPrice } from '../utils/presetPricing'

export default function PresetFormModal({ isOpen, onClose, onSubmit, initialData, editingPreset }) {
  const [form, setForm] = useState({
    name: '',
    category: PRESET_CATEGORIES[0],
    cycle: CYCLES[0],
    temperature: TEMPERATURES[0],
    spinSpeed: SPIN_SPEEDS[3],
    detergent: '',
    softener: '',
    addons: [],
    notes: '',
    pricePerKg: '',
    customerId: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const presetData = editingPreset ?? initialData

  useEffect(() => {
    if (presetData) {
      let addons = []
      if (Array.isArray(presetData.addons)) {
        addons = presetData.addons
      } else if (typeof presetData.addons === 'string') {
        try {
          addons = JSON.parse(presetData.addons)
          if (!Array.isArray(addons)) addons = []
        } catch (e) {
          addons = []
        }
      }

      setForm({
        name: presetData.name || '',
        category: presetData.category || PRESET_CATEGORIES[0],
        cycle: presetData.cycle || CYCLES[0],
        temperature: presetData.temperature || TEMPERATURES[0],
        spinSpeed: presetData.spin_speed || SPIN_SPEEDS[3],
        detergent: presetData.detergent || '',
        softener: presetData.softener || '',
        addons,
        notes: presetData.notes || '',
        pricePerKg: String(presetData.price_per_kg || ''),
        customerId: presetData.customer_id ?? null,
      })
    } else {
      setForm({
        name: '',
        category: PRESET_CATEGORIES[0],
        cycle: CYCLES[0],
        temperature: TEMPERATURES[0],
        spinSpeed: SPIN_SPEEDS[3],
        detergent: '',
        softener: '',
        addons: [],
        notes: '',
        pricePerKg: '',
        customerId: null,
      })
    }
    setError('')
  }, [isOpen, presetData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleAddonChange = (addon) => {
    setForm((current) => {
      const newAddons = current.addons.includes(addon)
        ? current.addons.filter((a) => a !== addon)
        : [...current.addons, addon]
      return { ...current, addons: newAddons }
    })
  }

  const handleSuggestPrice = () => {
    const suggested = calculatePresetPrice({
      baseRate: 75,
      temperature: form.temperature,
      cycle: form.cycle,
      addOns: form.addons,
    })
    setForm((current) => ({ ...current, pricePerKg: suggested }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!form.name || !form.category || !form.cycle || !form.temperature || !form.spinSpeed) {
        throw new Error('Name, category, cycle, temperature, and spin speed are required.')
      }

      const price = Number(form.pricePerKg || '0')
      if (price < 0) {
        throw new Error('Price per kg must be 0 or greater.')
      }

      const payload = {
        name: form.name,
        category: form.category,
        cycle: form.cycle,
        temperature: form.temperature,
        spin_speed: form.spinSpeed,
        detergent: form.detergent,
        softener: form.softener,
        addons: form.addons,
        notes: form.notes,
        price_per_kg: price,
        customer_id: form.customerId,
      }

      if (onSubmit) {
        await onSubmit(payload)
      }

      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save preset.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={presetData ? 'Edit Preset' : 'Add Preset'} size="large">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          Preset name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Everyday Refresh"
            required
          />
        </label>

        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {PRESET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-form__field-grid">
          <label>
            Wash cycle
            <select name="cycle" value={form.cycle} onChange={handleChange}>
              {CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Water temperature
            <select name="temperature" value={form.temperature} onChange={handleChange}>
              {TEMPERATURES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Spin speed
          <select name="spinSpeed" value={form.spinSpeed} onChange={handleChange}>
            {SPIN_SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-form__field-grid">
          <label>
            Detergent formula
            <input
              type="text"
              name="detergent"
              value={form.detergent}
              onChange={handleChange}
              placeholder="e.g. Standard Laundry Detergent"
            />
          </label>

          <label>
            Fabric softener
            <input
              type="text"
              name="softener"
              value={form.softener}
              onChange={handleChange}
              placeholder="e.g. Softener Blend"
            />
          </label>
        </div>

        <fieldset>
          <legend>Add-ons</legend>
          <div className="modal-form__checkbox-grid">
            {ADDON_OPTIONS.map((addon) => (
              <label key={addon} className="modal-form__checkbox-item">
                <input
                  type="checkbox"
                  checked={form.addons.includes(addon)}
                  onChange={() => handleAddonChange(addon)}
                />
                <span>{addon}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Care notes
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Special care instructions..."
            rows="3"
          />
        </label>

        <label>
          Price per kilogram (PHP)
          <div className="modal-form__price-row">
            <input
              type="number"
              name="pricePerKg"
              value={form.pricePerKg}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
            <button
              type="button"
              className="secondary-button"
              onClick={handleSuggestPrice}
              disabled={submitting}
            >
              Estimate Price
            </button>
          </div>
        </label>

        {error && <div className="error-box">{error}</div>}

        <div className="modal-form__actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Please wait...' : presetData ? 'Update preset' : 'Create preset'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
