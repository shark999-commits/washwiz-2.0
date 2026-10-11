import { useMemo } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SidebarShell from '../layout/SidebarShell'
import useConfirmLogout from '../../hooks/useConfirmLogout'
import {
  IconUser,
  IconLayers,
  IconReceipt,
  IconLogout,
  IconBookOpen,
  IconHome,
} from '../Icon'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'W'
}

export default function CustomerLayout() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { open: openLogoutConfirm, dialog: logoutDialog } = useConfirmLogout({ role: 'customer' })

  const currentUserName = session?.user?.name || 'Customer'
  const currentUserEmail = session?.user?.email || ''

  const navItems = useMemo(
    () => [
      {
        label: 'Overview',
        icon: <IconHome size={20} />,
        to: '/dashboard',
        active: location.pathname === '/dashboard',
      },
      {
        label: 'Book an order',
        icon: <IconBookOpen size={20} />,
        to: '/book-order',
        active: location.pathname === '/book-order',
      },
      {
        label: 'My orders',
        icon: <IconReceipt size={20} />,
        to: '/track-order',
        active: location.pathname === '/track-order',
      },
      {
        label: 'Wash presets',
        icon: <IconLayers size={20} />,
        to: '/presets',
        active: location.pathname === '/presets',
      },
      {
        label: 'Profile',
        icon: <IconUser size={20} />,
        to: '/profile',
        active: location.pathname === '/profile',
      },
    ],
    [location.pathname]
  )

  const footerBlock = (
    <div className="shell-account-block">
      <div className="shell-account-block__avatar">{getInitials(currentUserName)}</div>
      <div className="shell-account-block__info">
        <div className="shell-account-block__name">{currentUserName}</div>
        <div className="shell-account-block__email">{currentUserEmail}</div>
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
        brand="WashWhiz"
        navItems={navItems}
        footer={footerBlock}
      >
        <Outlet />
      </SidebarShell>
      {logoutDialog}
    </>
  )
}
