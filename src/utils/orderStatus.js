import { ORDER_STAGES } from '../constants'

export const CUSTOMER_FILTERS = ['all', 'in-progress', 'ready', 'completed']

export function normalizeStatus(status = '') {
  return String(status || '').trim().toLowerCase()
}

export function isOrderInProgress(status) {
  const normalized = normalizeStatus(status)
  return normalized !== 'ready for pickup' && normalized !== 'completed'
}

export function isOrderReady(status) {
  return normalizeStatus(status) === 'ready for pickup'
}

export function isOrderCompleted(status) {
  return normalizeStatus(status) === 'completed'
}

export function getOrderStageIndex(status) {
  const normalized = normalizeStatus(status)
  const index = ORDER_STAGES.indexOf(normalized)
  return index >= 0 ? index : 0
}

export function formatOrderNumber(orderId) {
  return `Order ${Number(orderId ?? 0)}`
}

export function getStatusBadgeClass(status) {
  const normalized = normalizeStatus(status)

  if (normalized === 'ready for pickup') return 'status-badge--ready'
  if (normalized === 'completed') return 'status-badge--completed'
  if (normalized === 'received') return 'status-badge--received'
  if (normalized === 'sorting') return 'status-badge--sorting'
  if (normalized === 'washing') return 'status-badge--washing'
  if (normalized === 'drying') return 'status-badge--drying'
  if (normalized === 'folding') return 'status-badge--folding'

  return 'status-badge--received'
}

export function matchesCustomerFilter(order, filter) {
  const status = normalizeStatus(order?.status)

  if (filter === 'all') return true
  if (filter === 'in-progress') return isOrderInProgress(status)
  if (filter === 'ready') return isOrderReady(status)
  if (filter === 'completed') return isOrderCompleted(status)
  return true
}
