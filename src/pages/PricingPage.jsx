import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import PricingCard from '../components/PricingCard'
import CompareButton from '../components/CompareButton'
import GuestCheckoutOption from '../components/GuestCheckoutOption'
import OrderTracker from '../components/OrderTracker'

const plans = [
  {
    id: 'student',
    name: 'Student',
    price: '$0.25',
    period: 'per minute',
    description: 'Perfect for students and researchers',
    features: [
      'AI-Powered Transcript',
      'Chapter Labels',
      'Complete in 72 Hours or Less',
      'Audio Summary Report'
    ],
    excludedFeatures: ['Email Summary'],
    requirement: 'Discount Code Required*',
    popular: false,
    color: 'blue'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$0.39',
    period: 'per minute',
    description: 'Great for professionals and teams',
    features: [
      'AI-Powered Transcript',
      'Chapter Labels',
      'Complete in 72 Hours or Less',
      'Audio Summary Report',
      'Email Summary'
    ],
    excludedFeatures: [],
    popular: true,
    color: 'green'
  }
]

function PricingPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="text-center mb-16"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-axim-text-primary mb-6">
          Professional Audio Transcription
        </h1>
        <p className="text-xl text-axim-text-secondary max-w-3xl mx-auto leading-relaxed">
          Transform your audio into accurate, searchable text with our AI-powered transcription service.
          Choose the plan that fits your needs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 mx-auto max-w-4xl">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <PricingCard plan={plan} />
          </motion.div>
        ))}
      </div>

      {/* Guest vs Account Options */}
      {!user && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-axim-text-primary mb-2">
              New to AXiM?
            </h2>
            <p className="text-axim-text-secondary">
              Choose how you'd like to proceed with your order
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Compare Plans */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <CompareButton />
        </motion.div>

        {/* Order Tracker for Guests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <OrderTracker />
        </motion.div>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p className="text-sm text-axim-text-secondary">
          * Student discount codes available for verified students and educators
        </p>
      </motion.div>
    </div>
  )
}

export default PricingPage