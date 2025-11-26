import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiShoppingCart, FiTrendingUp, FiAlertCircle, FiFileText, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Products', href: '/products', icon: FiPackage },
  { name: 'Sales', href: '/sales', icon: FiShoppingCart },
  { name: 'Forecasting', href: '/forecasting', icon: FiTrendingUp },
  { name: 'Inventory', href: '/inventory', icon: FiAlertCircle },
  { name: 'Reports', href: '/reports', icon: FiFileText },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-primary-600">Retail Assistant</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <button onClick={() => setSidebarOpen(true)}>
                <FiMenu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold">Retail Assistant</h1>
              <div className="w-6"></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
