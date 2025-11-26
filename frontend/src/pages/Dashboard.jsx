import { useQuery } from 'react-query'
import { FiPackage, FiShoppingCart, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { inventoryAPI, salesAPI } from '../services/api'
import useAuthStore from '../store/authStore'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  
  const { data: inventorySummary, isLoading: inventoryLoading } = useQuery(
    'inventory-summary',
    () => inventoryAPI.getSummary().then((res) => res.data)
  )

  const { data: alerts, isLoading: alertsLoading } = useQuery(
    'inventory-alerts',
    () => inventoryAPI.getAlerts().then((res) => res.data)
  )

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    'sales-analytics',
    () => salesAPI.getAnalytics(30).then((res) => res.data)
  )

  const stats = [
    {
      name: 'Total Products',
      value: inventorySummary?.total_products || 0,
      icon: FiPackage,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Sales (30d)',
      value: analytics?.total_sales || 0,
      icon: FiShoppingCart,
      color: 'bg-green-500',
    },
    {
      name: 'Total Revenue',
      value: `₦${(analytics?.total_revenue || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Alerts',
      value: alerts?.total_alerts || 0,
      icon: FiAlertTriangle,
      color: 'bg-red-500',
    },
  ]

  const categoryData = inventorySummary?.categories
    ? Object.entries(inventorySummary.categories).map(([name, data]) => ({
        name,
        value: data.count,
        quantity: data.quantity,
      }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts && alerts.total_alerts > 0 && (
        <div className="card bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Inventory Alerts
              </h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                {alerts.out_of_stock_count > 0 && (
                  <p>• {alerts.out_of_stock_count} products out of stock</p>
                )}
                {alerts.low_stock_count > 0 && (
                  <p>• {alerts.low_stock_count} products low on stock</p>
                )}
                {alerts.expiring_soon_count > 0 && (
                  <p>• {alerts.expiring_soon_count} products expiring soon</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend (Last 30 Days)
          </h2>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.sales_trend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" name="Revenue (₦)" />
                <Line type="monotone" dataKey="sales" stroke="#22c55e" name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Product Categories
          </h2>
          {inventoryLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No products yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products
          </h2>
          {analyticsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : analytics?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_products.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    ₦{product.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales data yet</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Fast Moving Products
          </h2>
          {inventoryLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : inventorySummary?.fast_moving_products?.length > 0 ? (
            <div className="space-y-3">
              {inventorySummary.fast_moving_products.slice(0, 5).map((product) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {product.turnover} units sold (30d)
                    </p>
                  </div>
                  <span className="badge badge-success">
                    {product.current_quantity} in stock
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No fast-moving products yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
