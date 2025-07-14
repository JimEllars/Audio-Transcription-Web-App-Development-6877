import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiClock, FiStar } = FiIcons;

function PricingCard({ plan }) {
  const colorClasses = {
    blue: 'border-power-purple border-opacity-50 bg-axim-panel',
    green: 'border-power-green border-opacity-50 bg-axim-panel'
  };
  
  const buttonClasses = {
    blue: 'bg-power-purple hover:bg-opacity-90',
    green: 'bg-power-green hover:bg-opacity-90 text-axim-bg'
  };

  return (
    <motion.div
      className={`relative bg-axim-panel rounded-2xl border-2 ${
        plan.popular ? 'border-power-yellow shadow-neon-yellow' : 'border-axim-border shadow-lg'
      } p-8 h-full flex flex-col`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-power-yellow text-axim-bg px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
            <SafeIcon icon={FiStar} className="text-xs" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-axim-text-primary mb-2">{plan.name}</h3>
        <p className="text-axim-text-secondary text-sm mb-4">{plan.description}</p>
        <div className="mb-4">
          <span className="text-4xl font-bold text-power-green">{plan.price}</span>
          <span className="text-axim-text-secondary ml-2">{plan.period}</span>
        </div>

        {plan.requirement && (
          <div className="bg-axim-bg border border-power-yellow border-opacity-30 rounded-lg p-3 mb-4">
            <p className="text-power-yellow text-sm font-medium">{plan.requirement}</p>
          </div>
        )}
      </div>

      <div className="flex-1 mb-8">
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <SafeIcon icon={FiCheck} className="text-power-green text-lg mt-0.5 flex-shrink-0" />
              <span className="text-axim-text-primary">{feature}</span>
            </li>
          ))}
          
          {plan.excludedFeatures.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3 opacity-50">
              <SafeIcon icon={FiX} className="text-axim-text-secondary text-lg mt-0.5 flex-shrink-0" />
              <span className="text-axim-text-secondary line-through">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-axim-text-secondary">
          <SafeIcon icon={FiClock} />
          <span>Target: &lt; 1 hour</span>
        </div>

        <Link to={`/order/${plan.id}`}>
          <motion.button
            className={`w-full ${buttonClasses[plan.color]} text-axim-text-primary py-4 px-6 rounded-xl font-semibold transition-all duration-200`}
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