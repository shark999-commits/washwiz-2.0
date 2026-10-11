export const PRESET_CATEGORIES = [
  'Daily Cottons',
  'Delicates and Silk',
  'Heavy Bedding',
  'Activewear Sport',
  'Hypoallergenic and Baby',
  'Executive and Formal',
]

export const TEMP_SURCHARGES = {
  Cold: 0,
  Warm: 18,
  Hot: 36,
  'Very Hot': 54,
}

export const CYCLE_SURCHARGES = {
  'Normal': 0,
  'Delicate': 22,
  'Heavy Duty': 38,
  'Quick Wash': 14,
}

export const ADDON_FEES = {
  'Stain Treatment': 25,
  'Fabric Softener': 12,
  'Odor Removal': 20,
  'Extra Rinse': 15,
  'Hypoallergenic Boost': 18,
  'Steam Finish': 30,
}

export function calculatePresetPrice({
  baseRate = 75,
  temperature = 'Warm',
  cycle = 'Normal',
  addOns = [],
}) {
  const tempSurcharge = TEMP_SURCHARGES[temperature] ?? 0
  const cycleSurcharge = CYCLE_SURCHARGES[cycle] ?? 0
  const addOnCost = (Array.isArray(addOns) ? addOns : []).reduce((sum, addOn) => {
    return sum + (ADDON_FEES[addOn] ?? 0)
  }, 0)

  return Number(baseRate + tempSurcharge + cycleSurcharge + addOnCost).toFixed(2)
}

export function formatCurrency(value) {
  const numeric = Number(value || 0)
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(numeric)
}
