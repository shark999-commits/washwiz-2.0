import {
  PRESET_CATEGORIES,
  TEMP_SURCHARGES,
  CYCLE_SURCHARGES,
  ADDON_FEES,
} from '../utils/presetPricing'

export const ORDER_STAGES = [
  'received',
  'sorting',
  'washing',
  'drying',
  'folding',
  'ready for pickup',
  'completed',
]

export const SERVICE_TYPES = [
  'Wash and Fold',
  'Wash and Dry',
  'Wash and Press',
  'Delicate Care',
  'Bulk Laundry',
]

export const CYCLES = Object.keys(CYCLE_SURCHARGES)
export const TEMPERATURES = Object.keys(TEMP_SURCHARGES)
export const ADDON_OPTIONS = Object.keys(ADDON_FEES)
export const SPIN_SPEEDS = ['500 RPM', '600 RPM', '700 RPM', '800 RPM', '900 RPM']
export { PRESET_CATEGORIES, TEMP_SURCHARGES, CYCLE_SURCHARGES, ADDON_FEES }
