import React from 'react'
import { motion } from 'framer-motion'

function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} spinner ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-axim-bg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-axim-text-secondary text-lg">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner