import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheckCircle, FiMail, FiClock, FiHome, FiRefreshCw, FiCpu } = FiIcons

function SuccessPage() {
  const { state, dispatch } = useOrder()

  const handleNewOrder = () => {
    dispatch({ type: 'RESET_ORDER' })
  }

  const estimatedCompletion = new Date()
  estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + 30) // Noota typically processes within 30 minutes

  // Track page view
  useEffect(() => {
    if (window.aximAppData) {
      const trackData = new FormData()
      trackData.append('action', 'axim_track_event')
      trackData.append('nonce', window.aximAppData.nonce)
      trackData.append('event_type', 'success_page_view')
      trackData.append('event_data', JSON.stringify({
        order_id: state.orderId,
        plan: state.selectedPlan?.id
      }))
      
      fetch(window.aximAppData.ajaxUrl, {
        method: 'POST',
        body: trackData
      })
    }
  }, [state.orderId, state.selectedPlan])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="text-center mb-12"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-20 h-20 bg-power-green rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SafeIcon icon={FiCheckCircle} className="text-axim-bg text-3xl" />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold text-axim-text-primary mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Order Successful!
        </motion.h1>
        <motion.p
          className="text-xl text-axim-text-secondary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Your payment has been processed and your transcription order is confirmed.
        </motion.p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        className="bg-axim-panel rounded-2xl shadow-lg p-8 mb-8 border border-axim-border"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-axim-text-primary">Order Status</h2>
          <div className="flex items-center space-x-2 text-power-yellow">
            <div className="w-3 h-3 bg-power-yellow rounded-full animate-pulse"></div>
            <span className="font-medium">Awaiting Upload</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Order ID</p>
            <p className="font-semibold text-axim-text-primary">{state.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Plan</p>
            <p className="font-semibold text-axim-text-primary">{state.selectedPlan?.name}</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Duration</p>
            <p className="font-semibold text-axim-text-primary">{state.audioDuration} minutes</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Total Paid</p>
            <p className="font-semibold text-power-green">${state.totalPrice?.toFixed(2)}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-power-green rounded-full flex items-center justify-center">
              <SafeIcon icon={FiCheckCircle} className="text-axim-bg text-sm" />
            </div>
            <div>
              <p className="font-medium text-axim-text-primary">Payment Confirmed</p>
              <p className="text-sm text-axim-text-secondary">Your payment has been processed successfully</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-power-yellow rounded-full flex items-center justify-center">
              <SafeIcon icon={FiRefreshCw} className="text-axim-bg text-sm animate-spin" />
            </div>
            <div>
              <p className="font-medium text-axim-text-primary">Ready for Upload</p>
              <p className="text-sm text-axim-text-secondary">Upload your audio file to begin processing</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-axim-border rounded-full flex items-center justify-center">
              <SafeIcon icon={FiCpu} className="text-axim-text-secondary text-sm" />
            </div>
            <div>
              <p className="font-medium text-axim-text-secondary">AI Processing</p>
              <p className="text-sm text-axim-text-secondary">Powered by Noota AI transcription service</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-axim-border rounded-full flex items-center justify-center">
              <SafeIcon icon={FiMail} className="text-axim-text-secondary text-sm" />
            </div>
            <div>
              <p className="font-medium text-axim-text-secondary">Delivery</p>
              <p className="text-sm text-axim-text-secondary">
                Estimated completion: {estimatedCompletion.toLocaleDateString()} at {estimatedCompletion.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        className="bg-power-purple bg-opacity-10 border border-power-purple border-opacity-30 rounded-2xl p-8 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <h3 className="text-lg font-semibold text-axim-text-primary mb-4">Next Steps</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiRefreshCw} className="text-power-purple text-lg mt-1" />
            <div>
              <p className="font-medium text-axim-text-primary">Upload Your Audio File</p>
              <p className="text-sm text-axim-text-secondary">
                Click the button below to upload your audio file and start the transcription process
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiCpu} className="text-power-purple text-lg mt-1" />
            <div>
              <p className="font-medium text-axim-text-primary">AI Processing</p>
              <p className="text-sm text-axim-text-secondary">
                Our Noota AI will process your audio with advanced features like speaker detection, 
                chapter creation, and intelligent summarization
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiMail} className="text-power-purple text-lg mt-1" />
            <div>
              <p className="font-medium text-axim-text-primary">Email Notification</p>
              <p className="text-sm text-axim-text-secondary">
                We'll send your complete transcription to {state.customerInfo?.email} when ready
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        <Link to="/upload">
          <motion.button
            className="w-full sm:w-auto bg-power-green hover:bg-opacity-90 text-axim-bg px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Upload Audio File</span>
          </motion.button>
        </Link>
        
        <Link to="/" onClick={handleNewOrder}>
          <motion.button
            className="w-full sm:w-auto border border-axim-border hover:bg-axim-bg text-axim-text-primary px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiHome} />
            <span>New Order</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Features Reminder */}
      <motion.div
        className="mt-12 bg-axim-bg border border-axim-border rounded-xl p-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <h3 className="text-lg font-semibold text-axim-text-primary mb-4">What You'll Receive</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="text-power-green text-sm" />
            <span className="text-sm text-axim-text-secondary">Complete AI-powered transcript</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="text-power-green text-sm" />
            <span className="text-sm text-axim-text-secondary">Automatic chapter labels</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="text-power-green text-sm" />
            <span className="text-sm text-axim-text-secondary">Intelligent summary</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="text-power-green text-sm" />
            <span className="text-sm text-axim-text-secondary">Speaker identification</span>
          </div>
          {state.selectedPlan?.id === 'basic' && (
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCheckCircle} className="text-power-green text-sm" />
              <span className="text-sm text-axim-text-secondary">Email summary report</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SuccessPage