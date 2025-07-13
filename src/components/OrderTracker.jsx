import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGuestOrders } from '../hooks/useGuestOrders'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const { FiSearch, FiMail, FiKey, FiEye } = FiIcons

const OrderTracker = React.memo(() => {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [orderData, setOrderData] = useState(null)
  const { trackGuestOrder, loading, error } = useGuestOrders()

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    
    if (!orderId.trim() || !email.trim()) {
      toast.error('Please enter both Order ID and email address')
      return
    }

    const { data, error } = await trackGuestOrder(orderId.trim(), email.trim())
    
    if (error) {
      toast.error('Order not found or email does not match')
      setOrderData(null)
    } else {
      setOrderData(data)
      toast.success('Order found!')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <SafeIcon icon={FiSearch} className="text-primary-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h2>
        <p className="text-gray-600">
          Enter your order details to check the status of your transcription
        </p>
      </div>

      <form onSubmit={handleTrackOrder} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <div className="relative">
            <SafeIcon icon={FiKey} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your order ID"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiEye} />
              <span>Track Order</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Order Results */}
      {orderData && (
        <motion.div
          className="mt-6 p-6 bg-gray-50 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold text-gray-900">{orderData.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orderData.status)}`}>
                {orderData.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(orderData.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{orderData.guest_email}</p>
            </div>
          </div>

          {orderData.status === 'completed' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                ✅ Your transcription is complete! Check your email for the download link.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-700">
            Order not found. Please check your Order ID and email address.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
})

OrderTracker.displayName = 'OrderTracker'

export default OrderTracker