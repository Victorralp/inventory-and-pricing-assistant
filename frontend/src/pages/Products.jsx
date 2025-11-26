import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productsAPI } from '../services/api'
import ProductModal from '../components/ProductModal'

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery('products', () =>
    productsAPI.list({ search: searchQuery }).then((res) => res.data)
  )

  const deleteMutation = useMutation(
    (id) => productsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
        toast.success('Product deleted successfully')
      },
      onError: () => {
        toast.error('Failed to delete product')
      },
    }
  )

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id)
    }
  }

  const getStockStatusBadge = (product) => {
    if (product.quantity === 0) {
      return <span className="badge badge-danger">Out of Stock</span>
    }
    if (product.reorder_point && product.quantity <= product.reorder_point) {
      return <span className="badge badge-warning">Low Stock</span>
    }
    return <span className="badge badge-success">In Stock</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link
                        to={`/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {product.name}
                      </Link>
                      {product.sku && (
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      ₦{product.selling_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="px-4 py-4">{getStockStatusBadge(product)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product)
                            setIsModalOpen(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
      />
    </div>
  )
}
