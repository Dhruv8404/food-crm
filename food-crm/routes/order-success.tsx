"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Clock, MapPin, Timer } from "lucide-react"
import Confetti from "react-confetti"
import { useApp } from "@/context/app-context"

interface OrderItem {
  id: number
  name: string
  price: number
  qty: number
  image?: string
}

interface Order {
  id: number
  items: OrderItem[]
  total: number
  status: string
  table_no: string
  created_at: string
  all_orders?: Order[]
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)
  const [paying, setPaying] = useState(false)
  const navigate = useNavigate()
  const { state, markPaid } = useApp()

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

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
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

  const handlePayBill = async () => {
    if (!order) return
    setPaying(true)
    try {
      await markPaid(order.id.toString())
      alert('Payment successful! Thank you for your order.')
      navigate('/menu')
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your delicious food is being prepared with love. We'll notify you when it's ready!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Order Info */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  Order Details
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Order ID</span>
                      <span className="text-sm font-mono font-semibold text-gray-900">#{order.id}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Date & Time</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Table</span>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">{order.table_no}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm font-semibold text-orange-600 capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  Your Order
                </h2>

                {/* Show all orders if multiple exist */}
                {order.all_orders && order.all_orders.length > 1 ? (
                  <div className="space-y-6">
                    {order.all_orders.map((singleOrder, orderIndex) => (
                      <div key={singleOrder.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Order #{singleOrder.id}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(singleOrder.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {singleOrder.items.map((item, index) => (
                            <motion.div
                              key={`${singleOrder.id}-${item.id}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + (orderIndex * 0.2) + index * 0.1, duration: 0.4 }}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center flex-1">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover mr-3 shadow-sm"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</span>
                                    <span className="text-sm text-gray-500">× {item.qty}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">Subtotal</span>
                            <span className="font-semibold text-gray-900">₹{singleOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Grand Total */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="mt-8 pt-6 border-t-2 border-gray-300 bg-gray-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">Grand Total</span>
                        <span className="text-3xl font-bold text-green-600">
                          ₹{order.all_orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  // Single order display
                  <>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center flex-1">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover mr-4 shadow-sm"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</span>
                                <span className="text-sm text-gray-500">× {item.qty}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Total */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="mt-8 pt-6 border-t-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                        <span className="text-3xl font-bold text-green-600">₹{order.total.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">What's Next?</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Preparation</p>
                    <p className="text-xs text-gray-600">Your food is being prepared</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-orange-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ready for Pickup</p>
                    <p className="text-xs text-gray-600">We'll notify you when ready</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enjoy!</p>
                    <p className="text-xs text-gray-600">Bon appétit!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/menu')}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 py-4 px-6 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Order More Food
                </button>
                <button
                  onClick={handlePayBill}
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {paying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Pay Bill Now'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Need help? Contact our staff at your table.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
