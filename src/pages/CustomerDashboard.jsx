import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatCurrency } from '../utils/presetPricing'
import {
  formatOrderNumber,
  getOrderStageIndex,
  isOrderCompleted,
  isOrderInProgress,
  isOrderReady,
} from '../utils/orderStatus'
import { ORDER_STAGES } from '../constants'
import {
  IconBookOpen,
  IconArrowUpRight,
  IconLayers,
  IconReceipt,
  IconUser,
  IconClock,
  IconCheck,
} from '../components/Icon'

function getProgressClass(progress) {
  if (progress >= 100) return 'is-100'
  if (progress >= 80) return 'is-80'
  if (progress >= 60) return 'is-60'
  if (progress >= 40) return 'is-40'
  if (progress >= 20) return 'is-20'
  return 'is-0'
}

export default function CustomerDashboard() {
  const { session } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/orders.php?customer_id=${session.user.id}`)
      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your orders right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [session?.user?.id])

  const inProgressCount = useMemo(
    () => orders.filter((order) => isOrderInProgress(order.status)).length,
    [orders],
  )

  const readyCount = useMemo(
    () => orders.filter((order) => isOrderReady(order.status)).length,
    [orders],
  )

  const completedCount = useMemo(
    () => orders.filter((order) => isOrderCompleted(order.status)).length,
    [orders],
  )

  const currentOrder = useMemo(() => {
    return [...orders]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .find((order) => !isOrderCompleted(order.status)) || null
  }, [orders])

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders])

  const progressValue = useMemo(() => {
    if (!currentOrder) return 0

    const stageIndex = getOrderStageIndex(currentOrder.status)
    const percent = ((stageIndex + 1) / ORDER_STAGES.length) * 100
    return currentOrder.status === 'completed' ? 100 : Math.max(8, Math.round(percent))
  }, [currentOrder])

  const progressClass = getProgressClass(progressValue)

  return (
    <>
      <header className="page-header">
        <div className="page-header__meta">
         
          
        </div>
      </header>

      <section className="dashboard-hero">
        <div className="dashboard-hero__content">
          <span className="eyebrow eyebrow--light">Fresh laundry, tracked</span>
          <h2>Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}</h2>
          <p>Your orders are moving smoothly and your next pickup window is ready to review.</p>
          <div className="dashboard-hero__actions">
            <Link to="/book-order" className="button-primary">Book an order</Link>
            <Link to="/track-order" className="button-secondary">Track orders</Link>
          </div>
        </div>

        <div className="dashboard-hero__panel" aria-hidden="true">
          <div className="dashboard-hero__badge">Live status</div>
          <div className="dashboard-hero__meta">
            <span>Current pickup</span>
            <strong>{currentOrder ? formatOrderNumber(currentOrder.id) : 'No active order'}</strong>
          </div>
          <div className="dashboard-hero__timeline">
            <span className="is-active">Received</span>
            <span className="is-active">Washing</span>
            <span>Ready</span>
          </div>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Order overview statistics">
        <article className="stat-card">
          <div className="stat-card__topline">
            <span className="stat-card__label">In progress</span>
            <span className="stat-card__icon"><IconReceipt size={16} /></span>
          </div>
          <strong className="stat-card__value">{inProgressCount}</strong>
          <div className="stat-card__caption">{orders.length} total orders</div>
        </article>

        <article className="stat-card stat-card--ready">
          <div className="stat-card__topline">
            <span className="stat-card__label">Ready for pickup</span>
            <span className="stat-card__icon"><IconArrowUpRight size={16} /></span>
          </div>
          <strong className="stat-card__value">{readyCount}</strong>
          <div className="stat-card__caption">Ready now</div>
        </article>

        <article className="stat-card stat-card--completed">
          <div className="stat-card__topline">
            <span className="stat-card__label">Completed</span>
            <span className="stat-card__icon"><IconCheck size={16} /></span>
          </div>
          <strong className="stat-card__value">{completedCount}</strong>
          <div className="stat-card__caption">Finished orders</div>
        </article>
      </section>

      <section className="overview-layout">
        <div className="overview-main-column">
          <article className="dashboard-card dashboard-card--wide overview-current-order">
            <div className="section-header">
              <h2 className="section-header__title">Current order</h2>
              {currentOrder && <Link to="/track-order" className="link-button">View all</Link>}
            </div>

            {loading ? (
              <div className="dashboard-skeletons" aria-live="polite">
                <div className="skeleton dashboard-skeleton dashboard-skeleton--large" />
                <div className="skeleton dashboard-skeleton" />
              </div>
            ) : error ? (
              <div className="empty-state" role="alert">
                <h3 className="empty-state__title">Unable to load overview</h3>
                <p>{error}</p>
                <button type="button" className="button-primary" onClick={loadData}>Retry</button>
              </div>
            ) : currentOrder ? (
              <div className="current-order-card">
                <div className="current-order-card__top">
                  <div>
                    <span className="eyebrow">Active service</span>
                    <strong className="current-order-card__title">{currentOrder.preset_name || currentOrder.service_type}</strong>
                  </div>
                  <span className={`status-badge ${currentOrder.status && `status-badge--${currentOrder.status.toLowerCase().replace(/\s+/g, '-')}`}`}>
                    {currentOrder.status}
                  </span>
                </div>

                <div className="current-order-card__meta">
                  <span>{formatOrderNumber(currentOrder.id)}</span>
                  <span>{currentOrder.estimated_ready_at ? new Date(currentOrder.estimated_ready_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Pending estimate'}</span>
                </div>

                <div className="progress-bar">
                  <span className={`progress-bar__fill ${progressClass}`} />
                </div>

                <div className="current-order-card__footer">
                  <div>
                    <span className="summary-label">Estimated ready</span>
                    <strong>{currentOrder.estimated_ready_at ? new Date(currentOrder.estimated_ready_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Awaiting estimate'}</strong>
                  </div>
                  <Link to="/track-order" className="link-button">View details</Link>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-state__title">No active order</h3>
                <p>Your current laundry request will appear here once you place one.</p>
                <Link to="/book-order" className="button-primary">Book an order</Link>
              </div>
            )}
          </article>

          <section className="dashboard-card dashboard-card--recent overview-recent-orders">
            <div className="section-header">
              <h2 className="section-header__title">Recent orders</h2>
              <Link to="/track-order" className="link-button">View all</Link>
            </div>

            {loading ? (
              <div className="dashboard-skeletons" aria-live="polite">
                <div className="skeleton dashboard-skeleton" />
                <div className="skeleton dashboard-skeleton" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state__title">No orders yet</h3>
                <p>Your recent orders will appear here.</p>
              </div>
            ) : (
              <ul className="order-list">
                {recentOrders.map((order) => (
                  <li key={order.id} className="order-list__item">
                    <div className="order-list__content">
                      <div className="order-list__title-row">
                        <strong>{formatOrderNumber(order.id)}</strong>
                        <span className={`status-badge ${order.status && `status-badge--${order.status.toLowerCase().replace(/\s+/g, '-')}`}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="order-list__preset">{order.preset_name || order.service_type}</span>
                      <small>{order.service_type}</small>
                    </div>
                    <div className="order-list__meta">
                      <strong>{formatCurrency(order.total_amount)}</strong>
                      <span className="order-list__meta-time"><IconClock size={13} />{order.estimated_ready_at ? new Date(order.estimated_ready_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <article className="dashboard-card dashboard-card--regular overview-sidebar">
          <div className="section-header">
            <h2 className="section-header__title">Quick actions</h2>
          </div>

          <div className="quick-actions">
            <Link to="/book-order" className="quick-action">
              <span className="quick-action__icon"><IconBookOpen size={18} /></span>
              <span className="quick-action__text">
                <strong>Book an order</strong>
                <small>Schedule a fresh laundry request.</small>
              </span>
            </Link>

            <Link to="/presets" className="quick-action">
              <span className="quick-action__icon"><IconLayers size={18} /></span>
              <span className="quick-action__text">
                <strong>Wash presets</strong>
                <small>Browse your care settings.</small>
              </span>
            </Link>

            <Link to="/profile" className="quick-action">
              <span className="quick-action__icon"><IconUser size={18} /></span>
              <span className="quick-action__text">
                <strong>Profile</strong>
                <small>Review account details.</small>
              </span>
            </Link>
          </div>
        </article>
      </section>
    </>
  )
}
