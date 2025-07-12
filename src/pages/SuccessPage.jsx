import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiMail, FiClock, FiHome, FiRefreshCw } = FiIcons;

function SuccessPage() {
  const { state, dispatch } = useOrder();

  const handleNewOrder = () => {
    dispatch({ type: 'RESET_ORDER' });
  };

  const estimatedCompletion = new Date();
  if (state.selectedPlan?.id === 'business') {
    estimatedCompletion.setHours(estimatedCompletion.getHours() + 48);
  } else {
    estimatedCompletion.setHours(estimatedCompletion.getHours() + 72);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SafeIcon icon={FiCheckCircle} className="text-white text-3xl" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Upload Successful!
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Your audio file is now being processed by our AI transcription service.
        </motion.p>
      </motion.div>

      {/* Status Card */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Order Status</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Processing</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-semibold text-gray-900">{state.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Plan</p>
            <p className="font-semibold text-gray-900">{state.selectedPlan?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">File</p>
            <p className="font-semibold text-gray-900">{state.audioFile?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="font-semibold text-gray-900">{state.audioDuration} minutes</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiCheckCircle} className="text-white text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Payment Confirmed</p>
              <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiCheckCircle} className="text-white text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900">File Uploaded</p>
              <p className="text-sm text-gray-600">Your audio file has been securely uploaded</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiRefreshCw} className="text-white text-sm animate-spin" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Processing</p>
              <p className="text-sm text-gray-600">Our AI is transcribing your audio file</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiMail} className="text-gray-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-500">Delivery</p>
              <p className="text-sm text-gray-500">
                Estimated completion: {estimatedCompletion.toLocaleDateString()} at {estimatedCompletion.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiClock} className="text-blue-500 text-lg mt-1" />
            <div>
              <p className="font-medium text-gray-900">Processing Time</p>
              <p className="text-sm text-gray-600">
                {state.selectedPlan?.id === 'business' 
                  ? 'Your Business plan transcript will be ready within 48 hours (target: 30 minutes)'
                  : 'Your transcript will be ready within 72 hours (target: 1 hour)'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiMail} className="text-blue-500 text-lg mt-1" />
            <div>
              <p className="font-medium text-gray-900">Email Notification</p>
              <p className="text-sm text-gray-600">
                We'll send a notification to {state.customerInfo?.email} when your transcript is ready
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
        <Link to="/" onClick={handleNewOrder}>
          <motion.button 
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Start New Order</span>
          </motion.button>
        </Link>
        
        <Link to="/">
          <motion.button 
            className="w-full sm:w-auto border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiHome} />
            <span>Back to Home</span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

export default SuccessPage;