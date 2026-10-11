import { formatCurrency } from '../utils/presetPricing'

export default function PresetCard({ preset, onEdit, onDelete }) {
  const addons = Array.isArray(preset.addons)
    ? preset.addons
    : typeof preset.addons === 'string'
      ? (() => {
          try {
            return JSON.parse(preset.addons)
          } catch (error) {
            return []
          }
        })()
      : []

  const safeAddons = addons.filter(Boolean)

  return (
    <article className="admin-preset-card">
      <header className="admin-preset-card__header">
        <div className="admin-preset-card__title-wrap">
          <h3 className="admin-preset-card__title">{preset.name}</h3>
          <span className="admin-badge admin-badge--soft">{preset.category}</span>
        </div>

        <div className="admin-preset-card__actions">
          <button
            type="button"
            className="admin-icon-button"
            onClick={() => onEdit(preset)}
            aria-label={`Edit ${preset.name}`}
            title={`Edit ${preset.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="admin-icon-button admin-icon-button--danger"
            onClick={() => onDelete(preset.id)}
            aria-label={`Delete ${preset.name}`}
            title={`Delete ${preset.name}`}
          >
            Delete
          </button>
        </div>
      </header>

      <div className="admin-preset-card__body">
        <dl className="admin-preset-specs">
          <div className="admin-preset-spec">
            <dt>Cycle</dt>
            <dd>{preset.cycle || 'Standard'}</dd>
          </div>
          <div className="admin-preset-spec">
            <dt>Temperature</dt>
            <dd>{preset.temperature || 'Cold'}</dd>
          </div>
          <div className="admin-preset-spec">
            <dt>Spin</dt>
            <dd>{preset.spin_speed || 'Normal'}</dd>
          </div>
          <div className="admin-preset-spec">
            <dt>Detergent</dt>
            <dd>{preset.detergent || 'Standard'}</dd>
          </div>
          <div className="admin-preset-spec">
            <dt>Softener</dt>
            <dd>{preset.softener || 'None'}</dd>
          </div>
        </dl>

        <div className="admin-preset-addons">
          {safeAddons.length > 0 ? safeAddons.map((addon) => (
            <span key={addon} className="admin-preset-chip">{addon}</span>
          )) : <span className="admin-preset-chip admin-preset-chip--muted">None</span>}
        </div>

        {preset.notes && <p className="admin-preset-notes">{preset.notes}</p>}
      </div>

      <footer className="admin-preset-card__footer">
        <div className="admin-preset-price-wrap">
          <strong className="admin-preset-price">{formatCurrency(preset.price_per_kg)}</strong>
          <span className="admin-preset-price-unit">/kg</span>
        </div>
        <span className="admin-badge admin-badge--default">Standard</span>
      </footer>
    </article>
  )
}
