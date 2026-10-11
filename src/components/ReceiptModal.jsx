import { useEffect } from 'react'
import Modal from './Modal'
import { formatCurrency } from '../utils/presetPricing'

export default function ReceiptModal({ isOpen, onClose, order }) {
  useEffect(() => {
    if (!isOpen || !order) {
      document.title = document.title.replace(/^WashWhiz-Receipt-Order-\d+/, '') || document.title
      return
    }

    const previousTitle = document.title
    document.title = `WashWhiz-Receipt-Order-${order.id}`

    return () => {
      document.title = previousTitle
    }
  }, [isOpen, order])

  if (!isOpen || !order) return null

  const createdDate = order.created_at ? new Date(order.created_at).toLocaleString('en-PH') : 'N/A'
  const readyDate = order.estimated_ready_at
    ? new Date(order.estimated_ready_at).toLocaleString('en-PH')
    : 'N/A'

  const printOnlyCopy = (
    <div key={order.id} className="receipt-container print-receipt-only">
      <div className="receipt-header">
        <h1>WASHWHIZ</h1>
        <p>Laundry Management System</p>
      </div>

      <div className="receipt-order-number">Order {order.id}</div>

      <div className="receipt-line-group">
        <div className="receipt-line">
          <span className="receipt-label">Customer:</span>
          <span>{order.customer_name || 'N/A'}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Phone:</span>
          <span>{order.phone || 'N/A'}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Service Type:</span>
          <span>{order.service_type || 'N/A'}</span>
        </div>
      </div>

      <div className="receipt-line-group">
        <div className="receipt-line">
          <span className="receipt-label">Preset:</span>
          <span>{order.preset_name || 'N/A'}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Weight:</span>
          <span>{order.weight_kg} kg</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Items:</span>
          <span>{order.items_count}</span>
        </div>
        {order.special_instructions && (
          <div className="receipt-line">
            <span className="receipt-label">Instructions:</span>
            <span className="receipt-pre-wrap">{order.special_instructions}</span>
          </div>
        )}
      </div>

      <div className="receipt-line-group">
        <div className="receipt-line">
          <span className="receipt-label">Created:</span>
          <span>{createdDate}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Est. Ready:</span>
          <span>{readyDate}</span>
        </div>
        <div className="receipt-line">
          <span className="receipt-label">Status:</span>
          <span className="receipt-capitalize">{order.status}</span>
        </div>
      </div>

      <div className="receipt-line receipt-line--total">
        <span className="receipt-label">Total Amount:</span>
        <span>{formatCurrency(order.total_amount ?? order.total ?? order.amount ?? 0)}</span>
      </div>
    </div>
  )

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Order Receipt" size="large">
        <div className="receipt-container">
          <div className="receipt-header">
            <h1>WASHWHIZ</h1>
            <p>Laundry Management System</p>
          </div>

          <div className="receipt-order-number">Order {order.id}</div>

          <div className="receipt-line-group">
            <div className="receipt-line">
              <span className="receipt-label">Customer:</span>
              <span>{order.customer_name || 'N/A'}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Phone:</span>
              <span>{order.phone || 'N/A'}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Service Type:</span>
              <span>{order.service_type || 'N/A'}</span>
            </div>
          </div>

          <div className="receipt-line-group">
            <div className="receipt-line">
              <span className="receipt-label">Preset:</span>
              <span>{order.preset_name || 'N/A'}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Weight:</span>
              <span>{order.weight_kg} kg</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Items:</span>
              <span>{order.items_count}</span>
            </div>
            {order.special_instructions && (
              <div className="receipt-line">
                <span className="receipt-label">Instructions:</span>
                <span className="receipt-pre-wrap">{order.special_instructions}</span>
              </div>
            )}
          </div>

          <div className="receipt-line-group">
            <div className="receipt-line">
              <span className="receipt-label">Created:</span>
              <span>{createdDate}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Est. Ready:</span>
              <span>{readyDate}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Status:</span>
              <span className="receipt-capitalize">{order.status}</span>
            </div>
          </div>

          <div className="receipt-line receipt-line--total">
            <span className="receipt-label">Total Amount:</span>
            <span>{formatCurrency(order.total_amount ?? order.total ?? order.amount ?? 0)}</span>
          </div>

          <div className="receipt-actions modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Close</button>
            <button type="button" className="primary-button" onClick={() => window.print()}>Print Receipt</button>
          </div>
        </div>
      </Modal>

      {printOnlyCopy}
    </>
  )
}
