import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import { useGuestOrders } from '../hooks/useGuestOrders'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiCreditCard, FiLock, FiShield, FiArrowLeft } = FiIcons

function PaymentPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useOrder()
  const { createGuestOrder } = useGuestOrders()
  const { createOrder } = useOrders()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate order ID
      const orderId = `AXM-${Date.now()}`
      
      // Prepare order data
      const orderData = {
        plan_id: state.selectedPlan.id,
        customer_info: state.customerInfo,
        file_name: state.audioFile?.name,
        duration: state.audioDuration,
        add_ons: state.addOns,
        total_price: state.totalPrice,
        promo_code: state.promoCode,
        discount: state.discount
      }

      let result
      if (state.isGuestMode || !user) {
        // Create guest order
        result = await createGuestOrder(orderData)
      } else {
        // Create authenticated user order
        result = await createOrder(orderData)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      dispatch({ type: 'SET_ORDER_ID', payload: orderId })
      dispatch({ type: 'SET_STATUS', payload: 'paid' })
      
      toast.success('Payment successful!')
      navigate('/upload')
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (!state.selectedPlan || !state.audioFile) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Order Review</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Secure Payment {state.isGuestMode && '(Guest Checkout)'}
        </h1>
        <p className="text-gray-600">
          Complete your payment to start processing your transcription
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiShield} className="text-green-500" />
                <span className="text-green-700 font-medium">
                  Secure SSL encrypted payment processing
                </span>
              </div>
            </div>

            {/* Guest Notice */}
            {state.isGuestMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Guest Checkout</h4>
                <p className="text-sm text-blue-700">
                  You're checking out as a guest. Your order confirmation will be sent to{' '}
                  <strong>{state.customerInfo.email}</strong>
                </p>
              </div>
            )}

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={FiCreditCard} className="text-2xl mx-auto mb-2" />
                  <span className="text-sm font-medium">Credit Card</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    paymentMethod === 'paypal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mx-auto mb-2">💳</div>
                  <span className="text-sm font-medium">PayPal</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* CVC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Pay Button */}
            <motion.button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              whileHover={!isProcessing ? { scale: 1.02 } : {}}
              whileTap={!isProcessing ? { scale: 0.98 } : {}}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <SafeIcon icon={FiLock} />
                  <span>Pay ${state.totalPrice.toFixed(2)}</span>
                </div>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-gray-50 rounded-2xl p-6 sticky top-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{state.selectedPlan.name} Plan</span>
                <span className="font-medium">${state.selectedPlan.price}/min</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{state.audioDuration} minutes</span>
              </div>

              {state.addOns && state.addOns.length > 0 && (
                <>
                  {state.addOns.map(addOn => (
                    <div key={addOn.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addOn.name}</span>
                      <span className="font-medium">
                        +${(addOn.price * state.audioDuration).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {state.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -${(state.totalPrice * state.discount / (1 - state.discount)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">${state.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <SafeIcon icon={FiShield} className="inline mr-1" />
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage