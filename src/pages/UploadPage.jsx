import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import AudioUpload from '../components/AudioUpload'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiArrowLeft, FiUploadCloud, FiCpu } = FiIcons

function UploadPage() {
  const navigate = useNavigate()
  const { state } = useOrder()

  const handleBack = () => {
    navigate(-1)
  }

  if (!state.orderId) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <span>Back</span>
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-power-purple rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiUploadCloud} className="text-axim-text-primary text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-axim-text-primary mb-4">
            Upload Your Audio File
          </h1>
          <p className="text-axim-text-secondary text-lg">
            Upload your audio file to begin AI-powered transcription with Noota
          </p>
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        className="bg-axim-panel rounded-2xl shadow-lg p-8 mb-8 border border-axim-border"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-axim-text-primary mb-6">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Order ID</p>
            <p className="font-semibold text-axim-text-primary">{state.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Plan</p>
            <p className="font-semibold text-axim-text-primary">{state.selectedPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Expected Delivery</p>
            <p className="font-semibold text-axim-text-primary">Within 30 minutes</p>
          </div>
          <div>
            <p className="text-sm text-axim-text-secondary mb-1">Total Paid</p>
            <p className="font-semibold text-power-green">${state.totalPrice?.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      {/* File Upload Section */}
      <motion.div
        className="bg-axim-panel rounded-2xl shadow-lg p-8 mb-8 border border-axim-border"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <AudioUpload />
      </motion.div>

      {/* Processing Info */}
      <motion.div
        className="bg-power-purple bg-opacity-10 border border-power-purple border-opacity-30 rounded-xl p-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiCpu} className="text-power-purple text-xl mt-1" />
          <div>
            <h3 className="font-semibold text-power-purple mb-2">Powered by Noota AI</h3>
            <ul className="text-sm text-axim-text-secondary space-y-1">
              <li>• Advanced AI transcription with 99%+ accuracy</li>
              <li>• Automatic speaker identification and separation</li>
              <li>• Intelligent chapter creation and timestamps</li>
              <li>• AI-generated summary and key insights</li>
              <li>• Real-time processing status updates</li>
              <li>• Secure file handling and GDPR compliance</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadPage