export function parseAddons(value) {
  if (Array.isArray(value)) return value

  if (!value) return []

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      return []
    }
  }

  return []
}

export function describePreset(preset) {
  const cycle = preset?.cycle || 'normal'
  const temperature = preset?.temperature || 'warm'
  const spin = preset?.spin_speed || '800 RPM'
  const detergent = preset?.detergent || 'standard detergent'
  const softener = preset?.softener || 'fabric softener'
  const notes = preset?.notes || ''
  const addons = parseAddons(preset?.addons)

  const joinedAddons = addons.length > 0 ? addons.join(', ') : 'no extra add-ons'

  const descriptionParts = [
    `A ${cycle.toLowerCase()} wash cycle at ${temperature.toLowerCase()} temperature`,
    `with a ${spin} spin, using ${detergent} with ${softener}.`,
    `Includes ${joinedAddons}.`,
  ]

  if (notes) {
    const trimmedNotes = notes.replace(/\.\s*$/, '')
    descriptionParts.push(`Care note: ${trimmedNotes}.`)
  }

  return descriptionParts.join(' ').replace(/\s+/g, ' ').trim()
}

export function buildProcedure(preset) {
  const category = preset?.category || 'Daily Cottons'
  const cycle = preset?.cycle || 'Normal'
  const temperature = preset?.temperature || 'Warm'
  const spin = preset?.spin_speed || '800 RPM'
  const detergent = preset?.detergent || 'standard detergent'
  const softener = preset?.softener || 'fabric softener'
  const notes = String(preset?.notes || '').trim()
  const addons = parseAddons(preset?.addons).map((item) => String(item).trim()).filter(Boolean)

  const steps = []

  const pushStep = (key, title, description, details = []) => {
    const validDetails = details.filter((detail) => Boolean(detail && String(detail).trim()))
    if (!title && !description && validDetails.length === 0) return
    steps.push({ key, title, description, details: validDetails })
  }

  pushStep(
    'intake',
    'Intake and sorting',
    'Items are grouped by care needs so the load stays consistent with the selected wash routine.',
    [
      category.includes('Delicate') ? 'Delicates and finer fabrics are separated before washing.' : 'Garments are sorted by category and fabric care needs.',
      category.includes('Baby') ? 'Sensitive items are grouped separately.' : '',
    ],
  )

  if (addons.includes('Stain Treatment')) {
    pushStep(
      'pre-treatment',
      'Pre-treatment',
      'Targeted stain treatment is applied before the main wash.',
      ['Stain Treatment included in the prep stage.'],
    )
  }

  pushStep(
    'main-wash',
    'Main wash',
    `The main wash runs on a ${cycle.toLowerCase()} cycle at ${temperature.toLowerCase()} water temperature using ${detergent}.`,
    [
      `Detergent: ${detergent}`,
      `Cycle: ${cycle}`,
      `Temperature: ${temperature}`,
    ],
  )

  const rinseDetails = []
  if (addons.includes('Extra Rinse')) rinseDetails.push('Extra rinse included.')
  if (softener && softener.toLowerCase() !== 'none') rinseDetails.push(`Fabric softener: ${softener}.`)
  else rinseDetails.push('No fabric softener added.')

  pushStep(
    'rinse',
    'Rinse and softening',
    'The wash is rinsed and softened to match the selected care profile.',
    rinseDetails,
  )

  pushStep(
    'spin',
    'Spin',
    `The load is spun at ${spin} to help reduce excess moisture.`,
    [`Spin speed: ${spin}`],
  )

  const specialTreatments = []
  if (addons.includes('Odor Removal')) specialTreatments.push('Odor Removal applied.')
  if (addons.includes('Hypoallergenic Boost')) specialTreatments.push('Hypoallergenic Boost applied.')
  if (addons.includes('Steam Finish')) specialTreatments.push('Steam Finish applied.')

  if (specialTreatments.length > 0) {
    pushStep(
      'special',
      'Special treatments',
      'Additional finishing steps are applied only where selected.',
      specialTreatments,
    )
  }

  const finishDetails = []
  if (category === 'Heavy Bedding') finishDetails.push('Large items are finished with additional handling appropriate to bedding care.')
  else if (category === 'Executive and Formal') finishDetails.push('Formal items are finished to preserve structure and presentation.')
  else if (category === 'Delicates and Silk') finishDetails.push('Delicate garments are finished with a lighter handling approach.')
  else if (category === 'Activewear Sport') finishDetails.push('Activewear is finished with the selected care routine for performance fabrics.')
  else finishDetails.push('The load is finished according to the selected cycle and category profile.')

  if (notes) finishDetails.push(`Care note: ${notes}`)

  pushStep(
    'finishing',
    'Drying and finishing',
    'The final stage follows the selected category and cycle to prepare the load for collection or next processing.',
    finishDetails,
  )

  pushStep(
    'quality',
    'Quality check and packing',
    'The finished load is checked for completeness and packed ready for the next step.',
    notes ? ['Care note reviewed before packing.'] : [],
  )

  return steps
}
