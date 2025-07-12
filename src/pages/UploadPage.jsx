import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUploadCloud, FiCheck, FiClock, FiFile } = FiIcons;

function UploadPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useOrder();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!state.audioFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload with progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Wait for upload to complete
      await new Promise(resolve => {
        const checkProgress = () => {
          if (uploadProgress >= 100) {
            resolve();
          } else {
            setTimeout(checkProgress, 100);
          }
        };
        checkProgress();
      });

      // Update order status
      dispatch({ type: 'SET_STATUS', payload: 'processing' });
      
      // Navigate to success page
      navigate('/success');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!state.orderId) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheck} className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 text-lg">
          Now let's upload your audio file to start the transcription process.
        </p>
      </motion.div>

      {/* Order Details */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-semibold text-gray-900">{state.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Plan</p>
            <p className="font-semibold text-gray-900">{state.selectedPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
            <p className="font-semibold text-gray-900">
              {state.selectedPlan.id === 'business' ? 'Within 48 hours' : 'Within 72 hours'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Paid</p>
            <p className="font-semibold text-green-600">${state.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      {/* File Upload Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Audio File</h2>
        
        {/* File Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <SafeIcon icon={FiFile} className="text-blue-500 text-2xl" />
            <div>
              <p className="font-semibold text-gray-900">{state.audioFile?.name}</p>
              <p className="text-sm text-gray-600">
                {state.audioDuration} minutes • {state.audioFile ? (state.audioFile.size / (1024 * 1024)).toFixed(2) : 0} MB
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-primary-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={isUploading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          whileHover={!isUploading ? { scale: 1.02 } : {}}
          whileTap={!isUploading ? { scale: 0.98 } : {}}
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Uploading File...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <SafeIcon icon={FiUploadCloud} />
              <span>Start Upload & Processing</span>
            </div>
          )}
        </motion.button>

        {/* Processing Info */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiClock} className="text-blue-500 text-xl mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your file will be securely uploaded to our processing servers</li>
                <li>• Our AI will begin transcribing your audio immediately</li>
                <li>• You'll receive an email notification when processing is complete</li>
                <li>• The final transcript will be delivered to {state.customerInfo.email}</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UploadPage;