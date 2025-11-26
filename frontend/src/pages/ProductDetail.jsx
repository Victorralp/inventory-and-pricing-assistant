import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { FiTrendingUp, FiDollarSign } from 'react-icons/fi'
import { productsAPI, forecastAPI } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()

  const { data: product } = useQuery(['product', id], () =>
    productsAPI.get(id).then((res) => res.data)
  )

  const { data: forecast } = useQuery(['forecast', id], () =>
    forecastAPI.getDemand(id, 30).then((res) => res.data)
  )

  const { data: pricing } = useQuery(['pricing', id], () =>
    forecastAPI.getPricing(id).then((res) => res.data)
  )

  if (!product) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Product Details</h2>
          <div className="space-y-3">
            <div><span className="font-medium">Category:</span> {product.category}</div>
            <div><span className="font-medium">Current Stock:</span> {product.quantity}</div>
            <div><span className="font-medium">Selling Price:</span> ₦{product.selling_price}</div>
            <div><span className="font-medium">Cost Price:</span> ₦{product.cost_price}</div>
          </div>
        </div>

        {pricing && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiDollarSign className="mr-2" /> Price Recommendation
            </h2>
            <div className="space-y-3">
              <div><span className="font-medium">Recommended:</span> ₦{pricing.recommended_price}</div>
              <div><span className="font-medium">Min Price:</span> ₦{pricing.min_price}</div>
              <div><span className="font-medium">Max Price:</span> ₦{pricing.max_price}</div>
              <div><span className="font-medium">Expected Margin:</span> {pricing.expected_margin_percent}%</div>
            </div>
          </div>
        )}
      </div>

      {forecast && forecast.forecast && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" /> Demand Forecast (Next 30 Days)
          </h2>
          <div className="mb-4">
            <p><span className="font-medium">Total Predicted Demand:</span> {forecast.total_predicted_demand} units</p>
            <p><span className="font-medium">Confidence:</span> {forecast.confidence}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-right">Predicted Demand</th>
                </tr>
              </thead>
              <tbody>
                {forecast.forecast.slice(0, 10).map((f) => (
                  <tr key={f.date} className="border-t">
                    <td className="px-4 py-2">{f.date}</td>
                    <td className="px-4 py-2 text-right">{f.predicted_demand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
