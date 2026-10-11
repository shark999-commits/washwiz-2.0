import { formatCurrency } from '../../utils/presetPricing'
import { parseAddons } from '../../utils/presets'
import {
  IconArrowUpRight,
  IconBookOpen,
  IconHome,
  IconLayers,
  IconReceipt,
  IconSparkles,
  IconShield,
  IconBriefcase,
  IconEdit,
  IconTrash,
} from '../Icon'

const CATEGORY_META = {
  'Daily Cottons': { tint: 'ocean', icon: IconHome },
  'Delicates and Silk': { tint: 'sky', icon: IconSparkles },
  'Heavy Bedding': { tint: 'sand', icon: IconLayers },
  'Activewear Sport': { tint: 'teal', icon: IconReceipt },
  'Hypoallergenic and Baby': { tint: 'mist', icon: IconShield },
  'Executive and Formal': { tint: 'slate', icon: IconBriefcase },
}

export default function PresetCard({ preset, onSelect, onEdit, onDelete }) {
  const addonList = parseAddons(preset?.addons)
  const preview = preset?.notes || 'No extra notes added.'
  const meta = CATEGORY_META[preset?.category] || { tint: 'ocean', icon: IconBookOpen }
  const Icon = meta.icon

  return (
    <div className="preset-card preset-card--customer" onClick={() => onSelect(preset)}>
      <div className="preset-card__header">
        <div className={`preset-card__icon preset-card__icon--${meta.tint}`}>
          <Icon size={20} />
        </div>
        <div className="preset-card__actions">
          {onEdit && (
            <button
              type="button"
              className="icon-button preset-card__action-button"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(preset)
              }}
              aria-label="Edit preset"
              title="Edit preset"
            >
              <IconEdit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="icon-button preset-card__action-button preset-card__action-button--danger"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(preset)
              }}
              aria-label="Delete preset"
              title="Delete preset"
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="preset-card__content">
        <div className="preset-card__eyebrow-row">
          <span className="preset-card__eyebrow">{preset?.category || 'General care'}</span>
          <span className="preset-card__badge">{preset?.customer_id ? 'Custom' : 'Standard'}</span>
        </div>
        <h3>{preset?.name || 'Preset name'}</h3>
      </div>

      <p className="preset-card__description">{preview}</p>

      <div className="preset-card__specs">
        <span>{String(preset?.cycle || 'Normal')}</span>
        <span>{String(preset?.temperature || 'Warm')}</span>
        <span>{String(preset?.spin_speed || '800 RPM')}</span>
      </div>

      <div className="preset-card__footer">
        <div className="preset-card__meta">
          <span>{addonList.length} add-ons</span>
          <strong>
            {formatCurrency(preset?.price_per_kg || 0)}
            <small>/kg</small>
          </strong>
        </div>
        <span className="preset-card__link">
          View details
          <IconArrowUpRight size={14} />
        </span>
      </div>
    </div>
  )
}
