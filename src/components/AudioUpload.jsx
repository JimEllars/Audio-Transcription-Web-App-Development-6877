import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import { useFileUpload } from '../hooks/useFileUpload'
import { fileUploadSchema } from '../lib/validations'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiUpload, FiFile, FiClock, FiDollarSign, FiX } = FiIcons

function AudioUpload() {
  const { state, dispatch } = useOrder()
  const { uploadFile, uploading, progress } = useFileUpload()
  const [isDragging, setIsDragging] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const fileInputRef = useRef(null)

  const calculateDuration = (file) => {
    return new Promise((resolve, reject) => {
      setIsCalculating(true)
      try {
        const objectUrl = URL.createObjectURL(file)
        const audio = document.createElement('audio')
        audio.preload = 'metadata'

        const cleanup = () => {
          URL.revokeObjectURL(objectUrl)
          setIsCalculating(false)
        }

        audio.addEventListener('loadedmetadata', () => {
          const duration = audio.duration
          cleanup()
          if (duration && !isNaN(duration) && duration > 0) {
            resolve(duration)
          } else {
            reject(new Error('Could not determine audio duration'))
          }
        })

        audio.addEventListener('error', () => {
          cleanup()
          reject(new Error('Error loading audio file'))
        })

        // Set a timeout for very large files
        setTimeout(() => {
          cleanup()
          reject(new Error('File processing timeout'))
        }, 10000)

        audio.src = objectUrl
      } catch (error) {
        setIsCalculating(false)
        reject(error)
      }
    })
  }

  const validateFile = (file) => {
    try {
      fileUploadSchema.parse({ file })
      return { valid: true }
    } catch (error) {
      return { valid: false, error: error.errors[0]?.message || 'Invalid file' }
    }
  }

  const handleFileSelect = async (file) => {
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      // Calculate duration
      const duration = await calculateDuration(file)
      const durationMinutes = Math.ceil(duration / 60)

      // Store file temporarily (will upload later during order submission)
      dispatch({ type: 'SET_AUDIO_FILE', payload: file })
      dispatch({ type: 'SET_AUDIO_DURATION', payload: durationMinutes })
      toast.success('Audio file processed successfully!')
    } catch (error) {
      console.error('Error processing audio file:', error)
      toast.error(error.message || 'Error processing audio file. Please try again.')
    }
  }

  const removeFile = () => {
    dispatch({ type: 'SET_AUDIO_FILE', payload: null })
    dispatch({ type: 'SET_AUDIO_DURATION', payload: 0 })
    dispatch({ type: 'SET_TOTAL_PRICE', payload: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-axim-text-primary mb-2">Upload Your Audio File</h2>
        <p className="text-axim-text-secondary">
          Select an audio file to get started. We support MP3, WAV, M4A, AAC, and OGG formats up to 500MB.
        </p>
      </div>

      {/* File Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 relative
          ${
            isDragging
              ? 'border-power-purple bg-axim-bg'
              : state.audioFile
              ? 'border-power-green bg-axim-bg'
              : 'border-axim-border bg-axim-bg hover:border-power-purple'
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
          disabled={isCalculating || uploading}
        />

        {isCalculating ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-power-purple border-t-transparent rounded-full mx-auto"></div>
            <p className="text-axim-text-secondary">Analyzing audio file...</p>
          </div>
        ) : state.audioFile ? (
          <div className="space-y-4">
            <SafeIcon icon={FiFile} className="text-power-green text-4xl mx-auto" />
            <div>
              <p className="font-semibold text-axim-text-primary">{state.audioFile.name}</p>
              <p className="text-sm text-axim-text-secondary">
                {formatFileSize(state.audioFile.size)} • {formatDuration(state.audioDuration)}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-power-purple hover:text-opacity-80 font-medium"
                disabled={uploading}
              >
                Choose different file
              </button>
              <button
                onClick={removeFile}
                className="text-power-red hover:text-opacity-80 font-medium flex items-center space-x-1"
                disabled={uploading}
              >
                <SafeIcon icon={FiX} className="text-sm" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <SafeIcon icon={FiUpload} className="text-axim-text-secondary text-4xl mx-auto" />
            <div>
              <p className="text-lg font-medium text-axim-text-primary mb-2">
                Drop your audio file here, or click to browse
              </p>
              <p className="text-sm text-axim-text-secondary">
                Supported formats: MP3, WAV, M4A, AAC, OGG • Maximum size: 500MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-power-purple hover:bg-opacity-90 text-axim-text-primary px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-axim-border"
              disabled={isCalculating || uploading}
            >
              Select File
            </button>
          </div>
        )}
      </motion.div>

      {/* Price Calculation */}
      {state.audioFile && state.audioDuration > 0 && state.selectedPlan && (
        <motion.div
          className="bg-axim-bg border border-axim-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-axim-text-primary mb-4">Price Calculation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiClock} className="text-power-purple" />
              <div>
                <p className="text-sm text-axim-text-secondary">Duration</p>
                <p className="font-semibold text-axim-text-primary">{formatDuration(state.audioDuration)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiDollarSign} className="text-power-purple" />
              <div>
                <p className="text-sm text-axim-text-secondary">Rate</p>
                <p className="font-semibold text-axim-text-primary">${state.selectedPlan.price}/minute</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiDollarSign} className="text-power-green" />
              <div>
                <p className="text-sm text-axim-text-secondary">Base Total</p>
                <p className="text-xl font-bold text-power-green">
                  ${(state.audioDuration * state.selectedPlan.price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Progress (if uploading) */}
      {uploading && (
        <motion.div
          className="bg-axim-bg border border-power-yellow border-opacity-30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-axim-text-primary">Uploading file...</span>
            <span className="text-sm font-medium text-axim-text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-axim-border rounded-full h-2">
            <motion.div
              className="bg-power-purple h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AudioUpload