import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productsAPI, salesAPI } from '../services/api'

export default function SaleModal({ isOpen, onClose }) {
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const queryClient = useQueryClient()

  const { data: products } = useQuery('products', () =>
    productsAPI.list().then((res) => res.data)
  )

  const mutation = useMutation(
    (data) => salesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales')
        queryClient.invalidateQueries('products')
        toast.success('Sale recorded successfully')
        onClose()
        setItems([{ product_id: '', quantity: 1 }])
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to record sale')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const saleItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)
      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: parseInt(item.quantity),
        unit_price: product.selling_price,
        total_price: product.selling_price * parseInt(item.quantity),
      }
    })

    const totalAmount = saleItems.reduce((sum, item) => sum + item.total_price, 0)

    mutation.mutate({
      items: saleItems,
      total_amount: totalAmount,
      payment_method: paymentMethod,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Record Sale</h2>
            <button onClick={onClose}><FiX size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <select
                  required
                  className="input flex-1"
                  value={item.product_id}
                  onChange={(e) => {
                    const newItems = [...items]
                    newItems[index].product_id = e.target.value
                    setItems(newItems)
                  }}
                >
                  <option value="">Select product</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₦{p.selling_price}) - {p.quantity} in stock
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  required
                  className="input w-24"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items]
                    newItems[index].quantity = e.target.value
                    setItems(newItems)
                  }}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                    className="p-2 text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}
              className="btn btn-secondary w-full"
            >
              <FiPlus className="mr-2" /> Add Item
            </button>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isLoading} className="btn btn-primary flex-1">
                {mutation.isLoading ? 'Recording...' : 'Record Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
