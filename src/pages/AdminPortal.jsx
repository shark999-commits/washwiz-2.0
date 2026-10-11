import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SidebarShell from '../components/layout/SidebarShell'
import { formatCurrency } from '../utils/presetPricing'
import { ORDER_STAGES } from '../constants/index'
import { getStatusBadgeClass } from '../utils/orderStatus'
import api from '../services/api'
import { useToast } from '../hooks/useToast'
import NewIntakeModal from '../components/NewIntakeModal'
import PresetFormModal from '../components/PresetFormModal'
import ReceiptModal from '../components/ReceiptModal'
import PresetManager from '../components/PresetManager'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import useConfirmLogout from '../hooks/useConfirmLogout'
import { IconReceipt, IconLayers, IconLogout, IconCheck, IconPlus, IconSearch } from '../components/Icon'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'S'
}

function parseOrderDate(value) {
  if (!value) return ''
  const safeValue = value.includes(' ') ? value.replace(' ', 'T') : value
  const date = new Date(safeValue)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminPortal() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toasts, addToast, removeToast } = useToast()
  const [orders, setOrders] = useState([])
  const [presets, setPresets] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [visibleOrderCount, setVisibleOrderCount] = useState(10)
  const [newIntakeOpen, setNewIntakeOpen] = useState(false)
  const [presetFormOpen, setPresetFormOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)
  const [receiptOrderId, setReceiptOrderId] = useState(null)
  const [presetSearch, setPresetSearch] = useState('')
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingDeletePresetId, setPendingDeletePresetId] = useState(null)
  const presetManagerRef = useRef(null)
  const { open: openLogoutConfirm, dialog: logoutDialog } = useConfirmLogout({ role: 'staff' })

  const currentView = searchParams.get('view') || 'orders'

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
  ]

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, presetsRes] = await Promise.all([
        api.get('/orders.php'),
        api.get('/wash_presets.php'),
      ])

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
      const allPresets = Array.isArray(presetsRes.data) ? presetsRes.data : []
      setPresets(allPresets.filter((p) => p.customer_id === null))
    } catch (error) {
      addToast(error.message || 'Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setVisibleOrderCount(10)
  }, [filter, search])

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && order.status !== 'completed' && order.status !== 'ready for pickup') ||
      (filter === 'ready' && order.status === 'ready for pickup') ||
      (filter === 'completed' && order.status === 'completed')

    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      (order.customer_name || '').toLowerCase().includes(query) ||
      (order.phone || '').toLowerCase().includes(query) ||
      (order.preset_name || '').toLowerCase().includes(query)

    return matchesFilter && matchesSearch
  })

  const visibleOrders = filteredOrders.slice(0, visibleOrderCount)
  const hasMoreOrders = visibleOrderCount < filteredOrders.length
  const filterCounts = useMemo(() => ({
    all: orders.length,
    active: orders.filter((order) => order.status !== 'completed' && order.status !== 'ready for pickup').length,
    ready: orders.filter((order) => order.status === 'ready for pickup').length,
    completed: orders.filter((order) => order.status === 'completed').length,
  }), [orders])

  const handleAdvance = async (orderId, currentStatus) => {
    const currentIndex = ORDER_STAGES.indexOf(currentStatus)
    if (currentIndex < 0 || currentIndex >= ORDER_STAGES.length - 1) {
      addToast('Order is already completed', 'warning')
      return
    }

    const nextStage = ORDER_STAGES[currentIndex + 1]

    try {
      await api.put(`/orders.php?id=${orderId}`, {
        status: nextStage,
        note: `Moved to ${nextStage} by ${session.user.name}`,
      })

      addToast(`Order advanced to ${nextStage}`, 'success')
      await loadData()
    } catch (error) {
      addToast(error.message || 'Failed to advance order', 'error')
    }
  }

  const handleNewIntakeSubmit = async () => {
    addToast('Order created successfully!', 'success')
    setNewIntakeOpen(false)
    await loadData()
  }

  const handlePresetSubmit = async (payload) => {
    try {
      if (editingPreset) {
        await api.put(`/wash_presets.php?id=${editingPreset.id}`, payload)
        addToast('Preset updated successfully!', 'success')
      } else {
        await api.post('/wash_presets.php', payload)
        addToast('Preset created successfully!', 'success')
      }
      setPresetFormOpen(false)
      setEditingPreset(null)
      await loadData()
    } catch (error) {
      addToast(error.message || 'Failed to save preset', 'error')
    }
  }

  const handlePresetDelete = async (presetId) => {
    setPendingDeletePresetId(presetId)
    setConfirmDialogOpen(true)
  }

  const handleConfirmPresetDelete = async () => {
    if (!pendingDeletePresetId) return

    try {
      await api.del('/wash_presets.php?id=' + pendingDeletePresetId)
      addToast('Preset deleted successfully!', 'success')
      await loadData()
    } catch (error) {
      addToast(error.message || 'Failed to delete preset', 'error')
    } finally {
      setPendingDeletePresetId(null)
    }
  }

  const handleEditPreset = (preset) => {
    setEditingPreset(preset)
    setPresetFormOpen(true)
  }

  const canAdvanceStage = (status) => {
    return status !== ORDER_STAGES[ORDER_STAGES.length - 1]
  }

  const handleShowReceipt = (orderId) => {
    setReceiptOrderId(orderId)
  }

  const receiptOrder = receiptOrderId ? orders.find((o) => o.id === receiptOrderId) : null

  const staff = session?.user || {}
  const staffInitials = getInitials(staff.name)

  const navItems = useMemo(
    () => [
      {
        label: 'Order queue',
        icon: <IconReceipt size={20} />,
        to: '/admin?view=orders',
        active: currentView === 'orders',
      },
      {
        label: 'Preset manager',
        icon: <IconLayers size={20} />,
        to: '/admin?view=presets',
        active: currentView === 'presets',
      },
      {
        label: 'New intake',
        icon: <IconPlus size={20} />,
        onClick: () => setNewIntakeOpen(true),
        active: false,
        primary: true,
      },
    ],
    [currentView]
  )

  const footerBlock = (
    <div className="shell-account-block">
      <div className="shell-account-block__avatar">{staffInitials}</div>
      <div className="shell-account-block__info">
        <div className="shell-account-block__name">{staff.name}</div>
        <div className="shell-account-block__email">{staff.role || 'Staff'}</div>
      </div>
      <button
        type="button"
        className="shell-account-block__logout"
        onClick={openLogoutConfirm}
        aria-label="Log out"
        title="Log out"
      >
        <IconLogout size={20} />
      </button>
    </div>
  )

  return (
    <>
      <SidebarShell
        brand="Operations"
        navItems={navItems}
        footer={footerBlock}
      >
        <Toast toasts={toasts} removeToast={removeToast} />

        {currentView === 'orders' && (
          <>
            <header className="admin-page-header">
              <div className="admin-page-header__meta">
                <span className="eyebrow">Operations portal</span>
                <h1 className="admin-page-header__title">Order queue</h1>
                <p className="admin-page-header__subtitle">Track the active wash flow and review each order in one place.</p>
              </div>
              <div className="admin-page-header__actions">
                <button type="button" className="primary-button" onClick={() => setNewIntakeOpen(true)}>
                  New intake
                </button>
              </div>
            </header>

            <section className="admin-stat-grid">
              <div className="admin-stat-card admin-stat-card--total">
                <span className="admin-stat-card__icon"><IconReceipt size={18} /></span>
                <span className="admin-stat-card__label">Total orders</span>
                <strong className="admin-stat-card__value">{orders.length}</strong>
                <span className="admin-stat-card__caption">All orders</span>
              </div>
              <div className="admin-stat-card admin-stat-card--active">
                <span className="admin-stat-card__icon"><IconReceipt size={18} /></span>
                <span className="admin-stat-card__label">Active orders</span>
                <strong className="admin-stat-card__value">
                  {orders.filter((order) => order.status !== 'completed' && order.status !== 'ready for pickup').length}
                </strong>
                <span className="admin-stat-card__caption">Currently in progress</span>
              </div>
              <div className="admin-stat-card admin-stat-card--ready">
                <span className="admin-stat-card__icon"><IconCheck size={18} /></span>
                <span className="admin-stat-card__label">Ready</span>
                <strong className="admin-stat-card__value">
                  {orders.filter((order) => order.status === 'ready for pickup').length}
                </strong>
                <span className="admin-stat-card__caption">Ready for pickup</span>
              </div>
            </section>

            <section className="admin-filter-toolbar admin-section-card">
              <div className="admin-toolbar__search-wrap">
                <span className="admin-toolbar__search-icon"><IconSearch size={16} /></span>
                <input
                  className="admin-toolbar__search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders"
                  aria-label="Search orders"
                />
              </div>

              <div className="admin-filter-tabs" role="tablist" aria-label="Order status filters">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === option.id}
                    className={`admin-filter-tab ${filter === option.id ? 'admin-filter-tab--active' : ''}`}
                    onClick={() => setFilter(option.id)}
                  >
                    <span>{option.label}</span>
                    <span className="admin-filter-tab__count">{filterCounts[option.id] ?? 0}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="admin-table-shell admin-section-card">
              <div className="admin-table-scroll">
                <table className="admin-order-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Order</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th className="admin-table-total">Total</th>
                      <th className="admin-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="admin-order-row admin-order-row--loading">
                          <td><span className="admin-skeleton-line admin-skeleton-line--wide" /></td>
                          <td><span className="admin-skeleton-line" /></td>
                          <td><span className="admin-skeleton-line" /></td>
                          <td><span className="admin-skeleton-line admin-skeleton-line--short" /></td>
                          <td><span className="admin-skeleton-line admin-skeleton-line--short" /></td>
                          <td><span className="admin-skeleton-line admin-skeleton-line--button" /></td>
                        </tr>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="admin-empty-state admin-empty-state--table">
                          <div>
                            <h3>No orders match this filter</h3>
                            <button type="button" className="admin-button admin-button--secondary" onClick={() => { setFilter('all'); setSearch('') }}>
                              Reset filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="admin-order-row"
                          onClick={() => handleShowReceipt(order.id)}
                        >
                          <td data-label="Customer">
                            <div className="admin-table-customer">
                              <strong>{order.customer_name || 'Customer'}</strong>
                              <span>{order.phone || 'No phone'}</span>
                            </div>
                          </td>
                          <td data-label="Order">
                            <div className="admin-order-meta">
                              <strong>Order {order.id}</strong>
                              <span>{parseOrderDate(order.created_at || order.order_date || order.date)}</span>
                            </div>
                          </td>
                          <td data-label="Service">
                            <div className="admin-table-customer">
                              <strong>{order.preset_name || 'Custom wash'}</strong>
                              <span>{order.service_type || order.wash_type || 'Standard service'}</span>
                            </div>
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>{order.status || 'Queued'}</span>
                          </td>
                          <td data-label="Total" className="admin-table-amount">
                            {formatCurrency(order.total_amount ?? order.total ?? order.amount ?? 0)}
                          </td>
                          <td data-label="Actions" className="admin-actions-cell">
                            <div className="admin-actions-cell__inner">
                              <button
                                type="button"
                                className="admin-action-button admin-action-button--secondary"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleShowReceipt(order.id)
                                }}
                              >
                                Receipt
                              </button>
                              {canAdvanceStage(order.status) ? (
                                <button
                                  type="button"
                                  className="admin-action-button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleAdvance(order.id, order.status)
                                  }}
                                >
                                  Advance
                                </button>
                              ) : (
                                <span className="admin-action-complete"><IconCheck size={14} />Complete</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {hasMoreOrders && !loading && (
                <div className="admin-show-more">
                  <button type="button" className="admin-button admin-button--secondary" onClick={() => setVisibleOrderCount((count) => count + 10)}>
                    Show more
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {currentView === 'presets' && (
          <PresetManager
            ref={presetManagerRef}
            presets={presets}
            onAddClick={() => setPresetFormOpen(true)}
            onEditClick={handleEditPreset}
            onDeleteClick={handlePresetDelete}
            searchValue={presetSearch}
            onSearchChange={setPresetSearch}
            categoryFilter={presetCategoryFilter}
            onCategoryChange={setPresetCategoryFilter}
          />
        )}

        <ConfirmDialog
          isOpen={confirmDialogOpen}
          title="Delete preset?"
          message="This preset will be removed from the catalog."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleConfirmPresetDelete}
          onCancel={() => {
            setConfirmDialogOpen(false)
            setPendingDeletePresetId(null)
          }}
        />

        <ReceiptModal
          isOpen={Boolean(receiptOrder)}
          order={receiptOrder}
          onClose={() => setReceiptOrderId(null)}
        />

        <NewIntakeModal
          isOpen={newIntakeOpen}
          onClose={() => setNewIntakeOpen(false)}
          onSubmit={handleNewIntakeSubmit}
          loadData={loadData}
        />

        <PresetFormModal
          isOpen={presetFormOpen}
          onClose={() => {
            setPresetFormOpen(false)
            setEditingPreset(null)
          }}
          onSubmit={handlePresetSubmit}
          editingPreset={editingPreset}
        />
      </SidebarShell>
      {logoutDialog}
    </>
  )
}
