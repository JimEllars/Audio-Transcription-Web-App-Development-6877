import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiClock, FiStar } = FiIcons;

function PricingCard({ plan }) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <motion.div 
      className={`relative bg-white rounded-2xl border-2 ${plan.popular ? 'border-primary-300 shadow-xl' : 'border-gray-200 shadow-lg'} p-8 h-full flex flex-col`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
            <SafeIcon icon={FiStar} className="text-xs" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
        
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-gray-600 ml-2">{plan.period}</span>
        </div>

        {plan.requirement && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4">
            <p className="text-warning-600 text-sm font-medium">{plan.requirement}</p>
          </div>
        )}
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <SafeIcon icon={FiCheck} className="text-green-500 text-lg mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
          {plan.excludedFeatures.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3 opacity-50">
              <SafeIcon icon={FiX} className="text-gray-400 text-lg mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 line-through">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <SafeIcon icon={FiClock} />
          <span>
            {plan.id === 'business' ? 'Target: < 30 minutes' : 'Target: < 1 hour'}
          </span>
        </div>
        
        <Link to={`/order/${plan.id}`}>
          <motion.button 
            className={`w-full ${buttonClasses[plan.color]} text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Choose {plan.name} Plan
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default PricingCard;