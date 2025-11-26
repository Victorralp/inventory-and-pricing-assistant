import { useQuery } from 'react-query'
import { FiAlertCircle, FiAlertTriangle, FiClock, FiTrendingUp } from 'react-icons/fi'
import { inventoryAPI } from '../services/api'

export default function Inventory() {
  const { data: alerts, isLoading } = useQuery('inventory-alerts', () =>
    inventoryAPI.getAlerts().then((res) => res.data)
  )

  const { data: summary } = useQuery('inventory-summary', () =>
    inventoryAPI.getSummary().then((res) => res.data)
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Alerts</h1>

      {alerts?.out_of_stock_count > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="flex items-start">
            <FiAlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-3">
                Out of Stock ({alerts.out_of_stock_count})
              </h2>
              <div className="space-y-2">
                {alerts.out_of_stock.map((item) => (
                  <div key={item.product_id} className="p-3 bg-red-50 rounded">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts?.low_stock_count > 0 && (
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-start">
            <FiAlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                Low Stock ({alerts.low_stock_count})
              </h2>
              <div className="space-y-2">
                {alerts.low_stock.map((item) => (
                  <div key={item.product_id} className="p-3 bg-yellow-50 rounded">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {item.quantity} | Reorder at: {item.reorder_point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts?.expiring_soon_count > 0 && (
        <div className="card border-l-4 border-orange-500">
          <div className="flex items-start">
            <FiClock className="w-6 h-6 text-orange-600 mr-3 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-orange-900 mb-3">
                Expiring Soon ({alerts.expiring_soon_count})
              </h2>
              <div className="space-y-2">
                {alerts.expiring_soon.map((item) => (
                  <div key={item.product_id} className="p-3 bg-orange-50 rounded">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      Expires in {item.days_until_expiry} days | Quantity: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {alerts?.total_alerts === 0 && (
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <FiTrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <p className="text-green-800 font-medium">
              All good! No inventory alerts at this time.
            </p>
          </div>
        </div>
      )}

      {summary && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Inventory Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{summary.total_products}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold">{summary.total_quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">₦{summary.total_value.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Slow Moving</p>
              <p className="text-2xl font-bold">{summary.slow_moving_count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
