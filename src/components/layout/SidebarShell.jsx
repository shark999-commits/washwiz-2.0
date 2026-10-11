import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconMenu, IconClose } from '../Icon'

export default function SidebarShell({ brand, navItems, footer, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const firstNavItemRef = useRef(null)
  const lastNavItemRef = useRef(null)
  const toggleRef = useRef(null)

  // Close drawer on mobile when a link is clicked
  const handleNavItemClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Handle Esc key and overlay click
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    if (sidebarOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [sidebarOpen])

  // Focus trap on drawer
  useEffect(() => {
    if (!sidebarOpen) return
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return
      const focusableElements = sidebarRef.current?.querySelectorAll(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [sidebarOpen])

  // Close mobile drawer when logout is confirmed
  useEffect(() => {
    const handleCloseDrawer = () => setSidebarOpen(false)
    window.addEventListener('washwhiz:close-mobile-drawer', handleCloseDrawer)
    return () => window.removeEventListener('washwhiz:close-mobile-drawer', handleCloseDrawer)
  }, [])

  return (
    <div className="shell-wrapper">
      {/* Desktop sidebar */}
      <aside className="shell-sidebar shell-sidebar--desktop">
        <div className="shell-sidebar__top">
          <div className="shell-brand">{brand}</div>
          <nav className="shell-nav" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = item.active
              const Item = item.to ? Link : 'button'
              const itemProps = item.to
                ? { to: item.to }
                : { onClick: item.onClick, type: 'button' }

              return (
                <Item
                  key={item.label}
                  {...itemProps}
                  className={[
                    'shell-nav-item',
                    isActive ? 'shell-nav-item--active' : '',
                    item.primary ? 'shell-nav-item--primary' : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    handleNavItemClick()
                    item.onClick?.()
                  }}
                >
                  <span className="shell-nav-item__icon">{item.icon}</span>
                  <span className="shell-nav-item__label">{item.label}</span>
                </Item>
              )
            })}
          </nav>
        </div>

        <div className="shell-sidebar__bottom">{footer}</div>
      </aside>

      {/* Mobile top bar */}
      <div className="shell-mobile-top-bar">
        <button
          ref={toggleRef}
          className="shell-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-expanded={sidebarOpen}
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
        </button>
        <div className="shell-mobile-top-bar__brand">{brand}</div>
        <div className="shell-mobile-top-bar__account">{footer}</div>
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="shell-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar as drawer */}
      <aside
        ref={sidebarRef}
        className={
          sidebarOpen
            ? 'shell-sidebar shell-sidebar--mobile shell-sidebar--open'
            : 'shell-sidebar shell-sidebar--mobile'
        }
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!sidebarOpen}
      >
        <div className="shell-sidebar__top">
          <nav className="shell-nav" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = item.active
              const Item = item.to ? Link : 'button'
              const itemProps = item.to
                ? { to: item.to }
                : { onClick: item.onClick, type: 'button' }

              return (
                <Item
                  key={item.label}
                  {...itemProps}
                  className={[
                    'shell-nav-item',
                    isActive ? 'shell-nav-item--active' : '',
                    item.primary ? 'shell-nav-item--primary' : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    handleNavItemClick()
                    item.onClick?.()
                  }}
                >
                  <span className="shell-nav-item__icon">{item.icon}</span>
                  <span className="shell-nav-item__label">{item.label}</span>
                </Item>
              )
            })}
          </nav>
        </div>

        <div className="shell-sidebar__bottom">{footer}</div>
      </aside>

      {/* Main content area */}
      <main className="shell-main">
        <div className="shell-content">{children}</div>
      </main>
    </div>
  )
}
