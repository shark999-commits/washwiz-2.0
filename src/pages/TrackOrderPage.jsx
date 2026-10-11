import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { ORDER_STAGES } from '../constants'
import { formatCurrency } from '../utils/presetPricing'
import { formatDateTime, formatRelative, parseDateValue } from '../utils/dates'
import {
  matchesCustomerFilter,
  formatOrderNumber,
  getStatusBadgeClass,
  isOrderCompleted,
  isOrderReady,
  normalizeStatus,
} from '../utils/orderStatus'
import { IconCheck, IconRefreshCw, IconSearch, IconChevronDown, IconClock } from '../components/Icon'

const filterMeta = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
]

export default function TrackOrderPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedOrders, setExpandedOrders] = useState({})
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const loadOrders = async (showLoading = true) => {
    if (!session?.user?.id) return

    try {
      if (showLoading) setLoading(true)
      const response = await api.get(`/orders.php?customer_id=${session.user.id}`)
      setOrders(Array.isArray(response.data) ? response.data : [])
      setLastUpdated(new Date())
      setError('')
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your orders.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(true)
  }, [session?.user?.id])

  useEffect(() => {
    if (!session?.user?.id) return

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadOrders(false)
      }
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [session?.user?.id])

  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      'in-progress': orders.filter((order) => matchesCustomerFilter(order, 'in-progress')).length,
      ready: orders.filter((order) => matchesCustomerFilter(order, 'ready')).length,
      completed: orders.filter((order) => matchesCustomerFilter(order, 'completed')).length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...orders]
      .filter((order) => matchesCustomerFilter(order, filter))
      .filter((order) => {
        if (!query) return true

        const haystack = [order.id, order.preset_name, order.service_type, order.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return haystack.includes(query)
      })
      .sort((a, b) => {
        const aPriority = isOrderCompleted(a.status) ? 2 : 1
        const bPriority = isOrderCompleted(b.status) ? 2 : 1
        if (aPriority !== bPriority) return aPriority - bPriority
        return Number(b.id) - Number(a.id)
      })
  }, [orders, filter, search])

  const toggleExpanded = (orderId) => {
    setExpandedOrders((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }))
  }

  const renderTimeline = (order) => {
    const status = normalizeStatus(order.status)
    const activeIndex = ORDER_STAGES.indexOf(status)
    const currentIndex = activeIndex >= 0 ? activeIndex : 0
    const historyByStage = new Map((order.stage_history || []).map((entry) => [normalizeStatus(entry.stage), entry]))

    return (
      <div className="order-timeline" aria-label={`${formatOrderNumber(order.id)} progress timeline`}>
        {ORDER_STAGES.map((stage, index) => {
          const historyEntry = historyByStage.get(stage)
          const timestamp = historyEntry?.timestamp || historyEntry?.created_at
          const hasDate = Boolean(timestamp && parseDateValue(timestamp))
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div
              key={`${order.id}-${stage}`}
              className={['timeline-step', isComplete ? 'is-complete' : '', isCurrent ? 'is-current' : '', isUpcoming ? 'is-upcoming' : ''].join(' ')}
            >
              <div className="timeline-step__dot">{isComplete ? <IconCheck size={10} /> : null}</div>
              <div className="timeline-step__meta">
                <span>{stage}</span>
                {hasDate && <small>{formatDateTime(timestamp)}</small>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderReadyMessage = (order) => {
    if (isOrderCompleted(order.status)) return null

    const readyAt = parseDateValue(order.estimated_ready_at)
    if (!readyAt) return null

    const text = order.status === 'ready for pickup'
      ? 'Your laundry is ready for pickup.'
      : formatRelative(order.estimated_ready_at)

    return <div className="order-ready-message"><strong>{text}</strong></div>
  }

  if (!session?.user?.id) return null

  return (
    <>
      <header className="page-header">
        <div className="page-header__meta">
          <span className="eyebrow">Customer portal</span>
          <h1 className="page-header__title">My orders</h1>
        </div>
        <div className="page-header__actions">
          <button type="button" className="button-secondary" onClick={() => loadOrders(true)}>
            <IconRefreshCw size={15} />
            Refresh
          </button>
          <span className="tiny-meta">Last updated {lastUpdated ? formatDateTime(lastUpdated) : ''}</span>
        </div>
      </header>

      <section className="track-orders-panel">
        <div className="track-orders-panel__toolbar">
          <label className="order-search" htmlFor="order-search">
            <span className="order-search__icon"><IconSearch size={16} /></span>
            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders or presets"
            />
          </label>

          <div className="filter-pills" role="tablist" aria-label="Order status filters">
            {filterMeta.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={filter === value ? 'filter-pill is-active' : 'filter-pill'}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                <span>{label}</span>
                <span className="filter-pill__count">{orderCounts[value] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="dashboard-skeletons" aria-live="polite">
            <div className="skeleton dashboard-skeleton dashboard-skeleton--large" />
            <div className="skeleton dashboard-skeleton" />
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <h3 className="empty-state__title">Unable to load orders</h3>
            <p>{error}</p>
            <button type="button" className="button-primary" onClick={() => loadOrders(true)}>Retry</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          orders.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state__title">No orders yet</h3>
              <p>Your order history will appear here once you place your first laundry request.</p>
              <button type="button" className="button-primary" onClick={() => window.location.assign('/book-order')}>Book an order</button>
            </div>
          ) : (
            <div className="empty-state">
              <h3 className="empty-state__title">No orders match this filter</h3>
              <p>Try a different status or clear your search to see everything in one place.</p>
              <button type="button" className="button-secondary" onClick={() => { setFilter('all'); setSearch('') }}>Reset filters</button>
            </div>
          )
        ) : (
          <div className="order-cards">
            {filteredOrders.map((order) => {
              const isExpanded = Boolean(expandedOrders[order.id])
              const readyAt = parseDateValue(order.estimated_ready_at)
              const statusClass = getStatusBadgeClass(order.status)
              const currentStageIndex = ORDER_STAGES.indexOf(normalizeStatus(order.status))
              const percentage = order.status === 'completed'
                ? 100
                : Math.max(10, ((currentStageIndex + 1) / ORDER_STAGES.length) * 100)

              return (
                <article key={order.id} className="order-card">
                  {order.status === 'ready for pickup' && <div className="order-card__banner">Your laundry is ready for pickup.</div>}

                  <div className="order-card__header">
                    <div>
                      <span className="eyebrow">Service</span>
                      <strong>{formatOrderNumber(order.id)}</strong>
                    </div>
                    <div className="order-card__meta-wrap">
                      <span>{order.service_type}</span>
                      <span className={`status-badge ${statusClass}`}>{order.status}</span>
                    </div>
                  </div>

                  <div className="order-card__summary">
                    <div>
                      <span className="summary-label">Preset</span>
                      <strong>{order.preset_name || 'Custom order'}</strong>
                    </div>
                    <div className="order-card__total">
                      <span className="summary-label">Total</span>
                      <strong>{formatCurrency(order.total_amount)}</strong>
                    </div>
                  </div>

                  <div className="order-card__progress">
                    <div className="order-card__progress-labels">
                      <span className="summary-label">Progress</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="progress-bar">
                      <span className="progress-bar__fill" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>

                  {renderReadyMessage(order)}
                  {renderTimeline(order)}

                  <div className="order-card__footer">
                    <div>
                      <span className="summary-label">Estimated ready</span>
                      <strong>{readyAt ? formatDateTime(order.estimated_ready_at) : 'Pending estimate'}</strong>
                      {readyAt && !isOrderCompleted(order.status) && <span className="helper-text">{formatRelative(order.estimated_ready_at)}</span>}
                    </div>

                    <button type="button" className="link-button" aria-expanded={isExpanded} onClick={() => toggleExpanded(order.id)}>
                      Details and history
                      <span aria-hidden="true"><IconChevronDown size={14} /></span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="order-card__details">
                      <div className="order-card__detail-grid">
                        <div>
                          <span className="summary-label">Weight</span>
                          <strong>{order.weight_kg} kg</strong>
                        </div>
                        <div>
                          <span className="summary-label">Items</span>
                          <strong>{order.items_count}</strong>
                        </div>
                        <div className="order-card__detail-grid--full">
                          <span className="summary-label">Special instructions</span>
                          <strong>{order.special_instructions || 'No special instructions'}</strong>
                        </div>
                      </div>

                      <div className="activity-log">
                        {(order.stage_history || []).map((entry) => {
                          const entryTimestamp = entry.timestamp || entry.created_at
                          const hasEntryDate = Boolean(entryTimestamp && parseDateValue(entryTimestamp))

                          if (!hasEntryDate) return null

                          return (
                            <div key={`${order.id}-${entry.id || entry.stage}-${entryTimestamp}`} className="activity-log__item">
                              <div className="activity-log__dot" aria-hidden="true" />
                              <div className="activity-log__content">
                                <strong>{entry.note || entry.stage}</strong>
                                <small>{formatDateTime(entryTimestamp)}</small>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
