import { useQuery } from 'react-query'
import { salesAPI, inventoryAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const { data: analytics } = useQuery('sales-analytics', () =>
    salesAPI.getAnalytics(30).then((res) => res.data)
  )

  const { data: summary } = useQuery('inventory-summary', () =>
    inventoryAPI.getSummary().then((res) => res.data)
  )

  const categoryData = analytics?.sales_by_category
    ? Object.entries(analytics.sales_by_category).map(([name, revenue]) => ({
        name,
        revenue,
      }))
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Revenue (30d)</p>
          <p className="text-3xl font-bold text-green-600">
            ₦{(analytics?.total_revenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Profit (30d)</p>
          <p className="text-3xl font-bold text-blue-600">
            ₦{(analytics?.total_profit || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Average Order Value</p>
          <p className="text-3xl font-bold text-purple-600">
            ₦{(analytics?.average_order_value || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#6366f1" name="Revenue (₦)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {summary?.slow_moving_products?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Slow Moving Products</h2>
          <div className="space-y-2">
            {summary.slow_moving_products.map((product) => (
              <div key={product.product_id} className="p-3 bg-gray-50 rounded flex justify-between">
                <div>
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Value: ₦{product.cost_value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
