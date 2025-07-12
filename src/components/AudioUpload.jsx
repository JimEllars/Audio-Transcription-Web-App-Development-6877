import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiFile, FiClock, FiDollarSign } = FiIcons;

function AudioUpload() {
  const { state, dispatch } = useOrder();
  const [isDragging, setIsDragging] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const fileInputRef = useRef(null);

  const calculateDuration = (file) => {
    return new Promise((resolve, reject) => {
      setIsCalculating(true);
      
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      
      // Create audio element
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(objectUrl); // Clean up
        setIsCalculating(false);
        
        if (duration && !isNaN(duration)) {
          resolve(duration);
        } else {
          reject(new Error('Could not determine audio duration'));
        }
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        setIsCalculating(false);
        reject(new Error('Error loading audio file'));
      });
      
      // Set source and load
      audio.src = objectUrl;
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    try {
      const duration = await calculateDuration(file);
      const durationMinutes = Math.ceil(duration / 60); // Round up to nearest minute
      const price = durationMinutes * state.selectedPlan.price;

      dispatch({ type: 'SET_AUDIO_FILE', payload: file });
      dispatch({ type: 'SET_AUDIO_DURATION', payload: durationMinutes });
      dispatch({ type: 'SET_TOTAL_PRICE', payload: price });
    } catch (error) {
      console.error('Error calculating duration:', error);
      alert('Error processing audio file. Please try again.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Audio File</h2>
        <p className="text-gray-600">
          Select an audio file to get started. We support MP3, WAV, M4A, AAC, and OGG formats.
        </p>
      </div>

      {/* File Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging 
            ? 'border-primary-400 bg-primary-50' 
            : state.audioFile 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isCalculating ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Analyzing audio file...</p>
          </div>
        ) : state.audioFile ? (
          <div className="space-y-4">
            <SafeIcon icon={FiFile} className="text-green-500 text-4xl mx-auto" />
            <div>
              <p className="font-semibold text-gray-900">{state.audioFile.name}</p>
              <p className="text-sm text-gray-600">
                {(state.audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <SafeIcon icon={FiUpload} className="text-gray-400 text-4xl mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your audio file here, or click to browse
              </p>
              <p className="text-sm text-gray-600">
                Maximum file size: 500MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Select File
            </button>
          </div>
        )}
      </motion.div>

      {/* Price Calculation */}
      {state.audioFile && state.audioDuration > 0 && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Calculation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiClock} className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{formatDuration(state.audioDuration)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiDollarSign} className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Rate</p>
                <p className="font-semibold">${state.selectedPlan.price}/minute</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiDollarSign} className="text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-green-600">
                  ${state.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AudioUpload;