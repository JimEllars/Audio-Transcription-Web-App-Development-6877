import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import { useAuth } from '../hooks/useAuth'
import StripeCheckout from '../components/StripeCheckout'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiArrowLeft, FiShield, FiCheck } = FiIcons

function PaymentPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useOrder()
  const { user } = useAuth()
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleBack = () => {
    navigate(-1)
  }

  const handlePaymentSuccess = (paymentIntent) => {
    // Update order with payment details
    dispatch({ type: 'SET_ORDER_ID', payload: paymentIntent.metadata.order_id })
    dispatch({ type: 'SET_STATUS', payload: 'paid' })
    
    setPaymentSuccess(true)
    
    // Navigate to success page after a short delay
    setTimeout(() => {
      navigate('/success')
    }, 2000)
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    // Error handling is done in the StripeCheckout component
  }

  if (!state.selectedPlan || !state.audioFile) {
    navigate('/')
    return null
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-power-green rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiCheck} className="text-axim-bg text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-axim-text-primary mb-4">
            Payment Successful!
          </h1>
          <p className="text-axim-text-secondary text-lg">
            Redirecting you to upload your audio file...
          </p>
        </motion.div>
      </div>
    )
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
          className="inline-flex items-center space-x-2 text-power-green hover:text-power-green hover:opacity-80 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Order Review</span>
        </button>
        
        <h1 className="text-3xl font-bold text-axim-text-primary mb-2">
          Secure Payment {state.isGuestMode && '(Guest Checkout)'}
        </h1>
        <p className="text-axim-text-secondary">
          Complete your payment to start processing your transcription
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <motion.div
            className="bg-axim-panel rounded-2xl shadow-lg p-8 border border-axim-border"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Security Notice */}
            <div className="bg-power-green bg-opacity-10 border border-power-green border-opacity-30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiShield} className="text-power-green" />
                <span className="text-power-green font-medium">
                  Secure SSL encrypted payment processing
                </span>
              </div>
            </div>

            {/* Guest Notice */}
            {state.isGuestMode && (
              <div className="bg-power-purple bg-opacity-10 border border-power-purple border-opacity-30 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-power-purple mb-2">Guest Checkout</h4>
                <p className="text-sm text-axim-text-secondary">
                  You're checking out as a guest. Your order confirmation will be sent to{' '}
                  <strong className="text-axim-text-primary">{state.customerInfo.email}</strong>
                </p>
              </div>
            )}

            <StripeCheckout
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            className="bg-axim-bg rounded-2xl p-6 sticky top-8 border border-axim-border"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-axim-text-primary mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-axim-text-secondary">{state.selectedPlan.name} Plan</span>
                <span className="font-medium text-axim-text-primary">${state.selectedPlan.price}/min</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-axim-text-secondary">Duration</span>
                <span className="font-medium text-axim-text-primary">{state.audioDuration} minutes</span>
              </div>

              {state.addOns && state.addOns.length > 0 && (
                <>
                  {state.addOns.map(addOn => (
                    <div key={addOn.id} className="flex justify-between text-sm">
                      <span className="text-axim-text-secondary">{addOn.name}</span>
                      <span className="font-medium text-axim-text-primary">
                        +${(addOn.price * state.audioDuration).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {state.discount > 0 && (
                <div className="flex justify-between text-power-green">
                  <span>Discount ({(state.discount * 100)}%)</span>
                  <span className="font-medium">
                    -${(state.totalPrice * state.discount / (1 - state.discount)).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-axim-border pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-axim-text-primary">Total</span>
                <span className="text-power-green">${state.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-power-purple bg-opacity-10 border border-power-purple border-opacity-30 rounded-lg">
              <p className="text-sm text-axim-text-secondary">
                <SafeIcon icon={FiShield} className="inline mr-1 text-power-green" />
                Your payment is secured with 256-bit SSL encryption and processed by Stripe
              </p>
            </div>

            {/* What's Included */}
            <div className="mt-6">
              <h4 className="font-semibold text-axim-text-primary mb-3">What's Included</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="text-power-green text-sm" />
                  <span className="text-sm text-axim-text-secondary">AI-Powered Transcript</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="text-power-green text-sm" />
                  <span className="text-sm text-axim-text-secondary">Chapter Labels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="text-power-green text-sm" />
                  <span className="text-sm text-axim-text-secondary">Audio Summary Report</span>
                </div>
                {state.selectedPlan.id === 'basic' && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="text-power-green text-sm" />
                    <span className="text-sm text-axim-text-secondary">Email Summary</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage