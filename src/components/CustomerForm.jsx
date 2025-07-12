import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiBuilding, FiPhone, FiTag } = FiIcons;

function CustomerForm() {
  const { state, dispatch } = useOrder();
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    dispatch({ 
      type: 'SET_CUSTOMER_INFO', 
      payload: { [field]: value }
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePromoCodeChange = (value) => {
    dispatch({ type: 'SET_PROMO_CODE', payload: value });
    
    // Apply discount logic for student plan
    if (state.selectedPlan.id === 'student' && value.toLowerCase() === 'student2025') {
      dispatch({ type: 'SET_DISCOUNT', payload: 0.1 }); // 10% discount
    } else {
      dispatch({ type: 'SET_DISCOUNT', payload: 0 });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!state.customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!state.customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(state.customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (state.selectedPlan.id === 'student' && !state.promoCode.trim()) {
      newErrors.promoCode = 'Promo code is required for student plan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
        <p className="text-gray-600">
          Please provide your contact details for order confirmation and delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={state.customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              value={state.customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company/Organization
          </label>
          <div className="relative">
            <SafeIcon icon={FiBuilding} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={state.customerInfo.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <SafeIcon icon={FiPhone} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="tel"
              value={state.customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Promo Code {state.selectedPlan.id === 'student' && '*'}
        </label>
        <div className="relative max-w-md">
          <SafeIcon icon={FiTag} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={state.promoCode}
            onChange={(e) => handlePromoCodeChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.promoCode ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={state.selectedPlan.id === 'student' ? 'Required for student plan' : 'Optional'}
          />
        </div>
        {errors.promoCode && (
          <p className="mt-1 text-sm text-red-600">{errors.promoCode}</p>
        )}
        {state.selectedPlan.id === 'student' && (
          <p className="mt-2 text-sm text-blue-600">
            Try: STUDENT2025 for additional discount
          </p>
        )}
      </div>

      {/* Discount Applied */}
      {state.discount > 0 && (
        <motion.div 
          className="bg-green-50 border border-green-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-green-700 font-medium">
            🎉 Promo code applied! {(state.discount * 100)}% discount
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default CustomerForm;