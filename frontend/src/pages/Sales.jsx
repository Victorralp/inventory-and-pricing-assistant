import { useState } from 'react'
import { useQuery } from 'react-query'
import { FiPlus } from 'react-icons/fi'
import { salesAPI } from '../services/api'
import { format } from 'date-fns'
import SaleModal from '../components/SaleModal'

export default function Sales() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: sales, isLoading } = useQuery('sales', () =>
    salesAPI.list().then((res) => res.data)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <FiPlus className="mr-2" />
          Record Sale
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-center py-12">Loading sales...</p>
        ) : sales?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      {format(new Date(sale.sale_date), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {sale.items.length} item(s)
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      ₦{sale.total_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm capitalize">
                      {sale.payment_method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-12">No sales recorded yet</p>
        )}
      </div>

      <SaleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
