import { useQuery } from 'react-query'
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import { forecastAPI } from '../services/api'

export default function Forecasting() {
  const { data: reorderPoints, isLoading } = useQuery('reorder-points', () =>
    forecastAPI.getReorderPoints(7).then((res) => res.data)
  )

  const { data: pricingRecommendations } = useQuery('batch-pricing', () =>
    forecastAPI.getBatchPricing().then((res) => res.data)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Forecasting</h1>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiRefreshCw className="mr-2" /> Reorder Points
        </h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : reorderPoints?.needs_reorder?.length > 0 ? (
          <div className="space-y-3">
            {reorderPoints.needs_reorder.map((item) => (
              <div key={item.product_id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    <p className="text-sm text-gray-600">Current Stock: {item.current_quantity}</p>
                    <p className="text-sm text-gray-600">Reorder Point: {item.reorder_point}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      Order: {item.recommended_order_quantity} units
                    </p>
                    <span className="badge badge-warning mt-2">
                      {item.forecast_confidence} confidence
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">All products are well-stocked!</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiTrendingUp className="mr-2" /> Pricing Recommendations
        </h2>
        {pricingRecommendations?.needs_adjustment?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Recommended
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Change
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pricingRecommendations.needs_adjustment.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium">{item.product_name}</td>
                    <td className="px-4 py-4 text-sm">₦{item.current_price.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                      ₦{item.recommended_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={item.price_difference > 0 ? 'text-green-600' : 'text-red-600'}>
                        ₦{item.price_difference.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{item.expected_margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">All prices are optimized!</p>
        )}
      </div>
    </div>
  )
}
