import Modal from '../Modal'
import { formatCurrency } from '../../utils/presetPricing'
import { buildProcedure, parseAddons } from '../../utils/presets'
import {
  IconBookOpen,
  IconCheck,
  IconChevronRight,
  IconDroplet,
  IconLayers,
  IconMoon,
  IconSparkles,
  IconThermometer,
  IconShield,
  IconBriefcase,
  IconHome,
} from '../Icon'

const CATEGORY_META = {
  'Daily Cottons': { icon: IconHome, tint: 'ocean' },
  'Delicates and Silk': { icon: IconSparkles, tint: 'sky' },
  'Heavy Bedding': { icon: IconLayers, tint: 'sand' },
  'Activewear Sport': { icon: IconDroplet, tint: 'teal' },
  'Hypoallergenic and Baby': { icon: IconShield, tint: 'mist' },
  'Executive and Formal': { icon: IconBriefcase, tint: 'slate' },
}

export default function PresetDetailModal({ preset, isOpen, onClose, onBook }) {
  if (!isOpen || !preset) return null

  const addons = parseAddons(preset.addons)
  const meta = CATEGORY_META[preset.category] || { icon: IconBookOpen, tint: 'ocean' }
  const Icon = meta.icon
  const procedure = buildProcedure(preset)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={preset.name} size="large">
      <div className="preset-detail-modal">
        <div className={`preset-detail-modal__hero preset-detail-modal__hero--${meta.tint}`}>
          <div className="preset-detail-modal__hero-badge">
            <Icon size={18} />
          </div>
          <div>
            <div className="preset-detail-modal__eyebrow">{preset.category}</div>
            <h3>{preset.name}</h3>
          </div>
          <span className="preset-detail-modal__badge">{preset.customer_id ? 'Custom' : 'Standard'}</span>
        </div>

        <div className="preset-detail-modal__body">
          <div className="preset-detail-modal__price-card">
            <span>Price per kilogram</span>
            <strong>{formatCurrency(preset.price_per_kg)}</strong>
            <small>/kg</small>
          </div>

          <div className="preset-detail-modal__section">
            <h4>About this preset</h4>
            <p>{preset.notes || 'This preset is tailored to your preferred care routine.'}</p>
          </div>

          <div className="preset-detail-modal__spec-grid">
            <div className="preset-detail-modal__spec-item">
              <span className="preset-detail-modal__spec-icon"><IconMoon size={16} /></span>
              <div>
                <small>Wash cycle</small>
                <strong>{preset.cycle || 'Normal'}</strong>
              </div>
            </div>
            <div className="preset-detail-modal__spec-item">
              <span className="preset-detail-modal__spec-icon"><IconThermometer size={16} /></span>
              <div>
                <small>Water temperature</small>
                <strong>{preset.temperature || 'Warm'}</strong>
              </div>
            </div>
            <div className="preset-detail-modal__spec-item">
              <span className="preset-detail-modal__spec-icon"><IconDroplet size={16} /></span>
              <div>
                <small>Spin speed</small>
                <strong>{preset.spin_speed || '800 RPM'}</strong>
              </div>
            </div>
            <div className="preset-detail-modal__spec-item">
              <span className="preset-detail-modal__spec-icon"><IconSparkles size={16} /></span>
              <div>
                <small>Detergent</small>
                <strong>{preset.detergent || 'Standard detergent'}</strong>
              </div>
            </div>
            <div className="preset-detail-modal__spec-item">
              <span className="preset-detail-modal__spec-icon"><IconShield size={16} /></span>
              <div>
                <small>Fabric softener</small>
                <strong>{preset.softener || 'Standard softener'}</strong>
              </div>
            </div>
          </div>

          {addons.length > 0 && (
            <div className="preset-detail-modal__section">
              <h4>Add-ons</h4>
              <div className="preset-detail-modal__chips">
                {addons.map((addon) => (
                  <span key={addon} className="preset-detail-modal__chip">
                    <IconCheck size={12} />
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {procedure.length > 0 && (
            <div className="preset-detail-modal__section">
              <h4>Wash procedure</h4>
              <div className="preset-detail-modal__procedure">
                {procedure.map((step, index) => (
                  <div key={step.key || `${step.title}-${index}`} className="preset-detail-modal__procedure-step">
                    <div className="preset-detail-modal__procedure-index">{index + 1}</div>
                    <div className="preset-detail-modal__procedure-copy">
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                      {step.details?.length > 0 && (
                        <ul className="preset-detail-modal__procedure-list">
                          {step.details.map((detail) => (
                            <li key={`${step.key}-${detail}`} className="preset-detail-modal__procedure-item">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="preset-detail-modal__care-callout">
            <strong>Care notes</strong>
            <p>{preset.notes || 'No additional care notes are listed.'}</p>
          </div>
        </div>

        <div className="modal-footer preset-detail-modal__footer">
          <button type="button" className="secondary-button" onClick={onClose}>Close</button>
          <button type="button" className="primary-button" onClick={onBook}>
            Book with this preset
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  )
}
