import React from 'react';
import { motion } from 'framer-motion';
import PricingCard from '../components/PricingCard';
import CompareButton from '../components/CompareButton';

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
    price: '$0.50',
    period: 'per minute',
    description: 'Great for professionals and small teams',
    features: [
      'AI-Powered Transcript',
      'Chapter Labels',
      'Complete in 72 Hours or Less',
      'Audio Summary Report'
    ],
    excludedFeatures: ['Email Summary'],
    popular: true,
    color: 'green'
  },
  {
    id: 'business',
    name: 'Business',
    price: '$0.75',
    period: 'per minute',
    description: 'Premium solution for enterprises',
    features: [
      'AI-Powered Transcript',
      'Chapter Labels',
      'Complete in 48 Hours or Less',
      'Audio Summary Report',
      'Email Summary'
    ],
    excludedFeatures: [],
    popular: false,
    color: 'purple'
  }
];

function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="text-center mb-16"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Professional Audio Transcription
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Transform your audio into accurate, searchable text with our AI-powered transcription service. 
          Choose the plan that fits your needs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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

      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <CompareButton />
        <p className="text-sm text-gray-500 mt-6">
          * Student discount codes available for verified students and educators
        </p>
      </motion.div>
    </div>
  );
}

export default PricingPage;