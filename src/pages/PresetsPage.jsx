import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import PresetCard from '../components/customer/PresetCard'
import PresetDetailModal from '../components/customer/PresetDetailModal'
import PresetFormModal from '../components/PresetFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PRESET_CATEGORIES } from '../constants'
import { parseAddons } from '../utils/presets'
import { IconSearch, IconSparkles, IconX } from '../components/Icon'

const categoryOptions = ['All', ...PRESET_CATEGORIES]

export default function PresetsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [presets, setPresets] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [presetFormOpen, setPresetFormOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadPresets = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const response = await api.get(`/wash_presets.php?customer_id=${session.user.id}`)
      setPresets(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (loadError) {
      setError(loadError.message || 'Unable to load presets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPresets()
  }, [session?.user?.id])

  const filteredPresets = useMemo(() => {
    const query = search.trim().toLowerCase()

    return presets.filter((preset) => {
      const matchesCategory = selectedCategory === 'All' || preset.category === selectedCategory
      const haystack = [
        preset.name,
        preset.category,
        preset.cycle,
        preset.temperature,
        preset.spin_speed,
        preset.notes,
        parseAddons(preset.addons).join(' '),
      ].join(' ').toLowerCase()

      const matchesSearch = !query || haystack.includes(query)
      return matchesCategory && matchesSearch
    })
  }, [presets, search, selectedCategory])

  const lowestPrice = useMemo(() => {
    if (!presets.length) return '₱0.00'
    const prices = presets.map((preset) => Number(preset.price_per_kg || 0))
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Math.min(...prices))
  }, [presets])

  const highestPrice = useMemo(() => {
    if (!presets.length) return '₱0.00'
    const prices = presets.map((preset) => Number(preset.price_per_kg || 0))
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Math.max(...prices))
  }, [presets])

  const openPreset = (preset) => setSelectedPreset(preset)

  const handleBookPreset = () => {
    if (!selectedPreset) return
    navigate('/book-order', { state: { presetId: selectedPreset.id } })
  }

  const handlePresetSubmit = async (payload) => {
    const fullPayload = {
      ...payload,
      customer_id: session?.user?.id ?? null,
    }

    if (editingPreset) {
      await api.put(`/wash_presets.php?id=${editingPreset.id}`, fullPayload)
    } else {
      await api.post('/wash_presets.php', fullPayload)
    }

    setPresetFormOpen(false)
    setEditingPreset(null)
    await loadPresets()
  }

  const handleEditPreset = (preset) => {
    setEditingPreset(preset)
    setPresetFormOpen(true)
  }

  const handleDeletePreset = async (preset) => {
    if (!preset?.id) return
    setDeleteTarget(preset)
  }

  const confirmDeletePreset = async () => {
    if (!deleteTarget?.id) return

    await api.del(`/wash_presets.php?id=${deleteTarget.id}`)
    setDeleteTarget(null)
    await loadPresets()
  }

  return (
    <div className="preset-page">
      <section className="preset-hero">
        <div className="preset-hero__content">
          <span className="preset-hero__eyebrow">Wash presets</span>
          <h1>Choose the right care for every load</h1>
          <p className="preset-hero__subtitle">Custom wash routines for everyday essentials, activewear, soft fabrics, and specialist garments.</p>

          <label className="preset-hero__search" htmlFor="preset-search">
            <IconSearch size={16} />
            <input
              id="preset-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search presets"
            />
          </label>

          <div className="preset-hero__stats">
            <div className="preset-stat">
              <span className="preset-stat__label">Presets</span>
              <strong>{presets.length}</strong>
            </div>
            <div className="preset-stat">
              <span className="preset-stat__label">Lowest</span>
              <strong>{lowestPrice}</strong>
            </div>
            <div className="preset-stat">
              <span className="preset-stat__label">Highest</span>
              <strong>{highestPrice}</strong>
            </div>
          </div>

          <button
            type="button"
            className="primary-button preset-page__cta"
            onClick={() => {
              setEditingPreset(null)
              setPresetFormOpen(true)
            }}
          >
            + Add custom preset
          </button>
        </div>
      </section>

      <section className="customer-panel preset-toolbar">
        <div className="customer-panel__body">
          <div className="category-chips" aria-label="Preset categories">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'category-chip is-active' : 'category-chip'}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="preset-skeleton-grid" aria-live="polite">
          <div className="preset-skeleton-card" />
          <div className="preset-skeleton-card" />
          <div className="preset-skeleton-card" />
        </div>
      ) : error ? (
        <div className="empty-preset-state" role="alert">
          <div className="empty-preset-state__icon"><IconSparkles size={28} /></div>
          <h3>Unable to load presets</h3>
          <p>{error}</p>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="empty-preset-state">
          <div className="empty-preset-state__icon"><IconX size={28} /></div>
          <h3>No presets found</h3>
          <p>Try another category or clear the search to browse the whole collection.</p>
          <button type="button" className="primary-button" onClick={() => { setSearch(''); setSelectedCategory('All') }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="preset-grid">
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={openPreset}
              onEdit={preset.customer_id ? handleEditPreset : undefined}
              onDelete={preset.customer_id ? handleDeletePreset : undefined}
            />
          ))}
        </div>
      )}

      <PresetDetailModal
        preset={selectedPreset}
        isOpen={Boolean(selectedPreset)}
        onClose={() => setSelectedPreset(null)}
        onBook={handleBookPreset}
      />

      <PresetFormModal
        isOpen={presetFormOpen}
        initialData={editingPreset}
        onClose={() => {
          setPresetFormOpen(false)
          setEditingPreset(null)
        }}
        onSubmit={handlePresetSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete preset"
        message="Are you sure you want to delete this custom preset?"
        confirmText="Delete"
        cancelText="Cancel"
        isDanger
        onConfirm={confirmDeletePreset}
      />
    </div>
  )
}
