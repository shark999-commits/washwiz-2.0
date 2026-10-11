import { useRef, forwardRef } from 'react'
import { PRESET_CATEGORIES } from '../constants/index'
import { IconSearch, IconChevronDown, IconLayers } from '../components/Icon'
import PresetCard from './PresetCard'

const PresetManager = forwardRef(function PresetManager({
  presets,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchValue,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  loading = false,
  onClearFilters,
}, ref) {
  const searchInputRef = useRef(null)
  const sectionRef = ref || useRef(null)

  const filteredPresets = presets.filter((preset) => {
    const matchesSearch =
      !searchValue ||
      (preset.name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
      (preset.category || '').toLowerCase().includes(searchValue.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const clearFilters = () => {
    if (onSearchChange) onSearchChange('')
    if (onCategoryChange) onCategoryChange('all')
    if (onClearFilters) onClearFilters()
  }

  return (
    <section className="admin-preset-manager admin-section-card" ref={sectionRef}>
      <div className="admin-preset-toolbar">
        <div className="admin-preset-search">
          <span className="admin-preset-search__icon"><IconSearch size={16} /></span>
          <input
            ref={searchInputRef}
            className="admin-field admin-field--search"
            type="text"
            placeholder="Search presets by name or category..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search presets"
          />
        </div>

        <div className="admin-preset-select">
          <select
            className="admin-field admin-field--select"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter presets by category"
          >
            <option value="all">All categories</option>
            {PRESET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="admin-preset-select__icon"><IconChevronDown size={16} /></span>
        </div>

        <span className="admin-preset-count">{filteredPresets.length} presets</span>
      </div>

      {loading ? (
        <div className="admin-preset-grid">
          {[1, 2, 3].map((index) => (
            <div key={index} className="admin-preset-card admin-preset-card--skeleton" aria-hidden="true">
              <div className="admin-preset-card__header">
                <div className="admin-preset-card__title-wrap">
                  <span className="admin-preset-skeleton-line admin-preset-skeleton-line--wide" />
                  <span className="admin-preset-skeleton-line admin-preset-skeleton-line--badge" />
                </div>
                <div className="admin-preset-card__actions">
                  <span className="admin-preset-skeleton-icon" />
                  <span className="admin-preset-skeleton-icon" />
                </div>
              </div>
              <div className="admin-preset-card__body">
                <span className="admin-preset-skeleton-line" />
                <span className="admin-preset-skeleton-line" />
                <span className="admin-preset-skeleton-line" />
                <span className="admin-preset-skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="admin-empty-state">
          <span className="admin-empty-state__icon"><IconLayers size={24} /></span>
          <h3 className="admin-empty-state__heading">No presets match</h3>
          <p className="admin-empty-state__text">Try changing your search or category filter to find a preset.</p>
          <button type="button" className="admin-button admin-button--secondary" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="admin-preset-grid">
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onEdit={onEditClick}
              onDelete={onDeleteClick}
            />
          ))}
        </div>
      )}
    </section>
  )
})

export default PresetManager
