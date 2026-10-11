export function parseDbDate(value) {
  if (value === null || value === undefined || value === '') return null

  const raw = String(value).trim()
  if (!raw) return null

  const candidate = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  const parsed = new Date(candidate)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const parseDateValue = parseDbDate

export function formatDateTime(value, locale = 'en-PH') {
  const date = parseDbDate(value)
  if (!date) return ''

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatRelative(value) {
  const date = parseDbDate(value)
  if (!date) return 'N/A'

  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)

  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes >= 0 ? `in about ${Math.abs(diffMinutes)} minutes` : `${Math.abs(diffMinutes)} minutes ago`
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return diffHours >= 0 ? `in about ${Math.abs(diffHours)} hours` : `${Math.abs(diffHours)} hours ago`
  }

  const diffDays = Math.round(diffHours / 24)
  return diffDays >= 0 ? `in about ${Math.abs(diffDays)} days` : `${Math.abs(diffDays)} days ago`
}
