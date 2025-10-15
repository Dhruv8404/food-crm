"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Clock, MapPin } from "lucide-react"
import { useApp } from "@/context/app-context"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: number
  items: OrderItem[]
  total: number
  status: string
  table_no: string
  created_at: string
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { state } = useApp()

  useEffect(() => {
    // Fetch the current order for the user
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/orders/current/?phone=${state.user.phone}`, {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        } else {
          // If no current order, redirect to menu
          navigate('/menu')
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
        navigate('/menu')
      } finally {
        setLoading(false)
      }
    }

    if (state.user.phone && state.token) {
      fetchOrder()
    } else {
      navigate('/menu')
    }
  }, [state.user.phone, state.token, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Order Found</h1>
          <button
            onClick={() => navigate('/menu')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Your order has been received and is being prepared.</p>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Order ID</span>
                <span className="text-sm font-mono">#{order.id}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Table</span>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm">{order.table_no}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-orange-500" />
                  <span className="text-sm text-orange-600 capitalize">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => navigate('/menu')}
                className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Order More
              </button>
              <button
                onClick={() => {
                  // TODO: Implement payment functionality
                  alert('Payment functionality will be implemented here')
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Pay Bill
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
