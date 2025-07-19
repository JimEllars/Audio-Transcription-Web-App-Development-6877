import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiUser, FiMail, FiBuilding, FiPhone, FiTag, FiPercent, FiCheck } = FiIcons;

function CustomerForm() {
  const { state, dispatch } = useOrder();
  const [errors, setErrors] = useState({});
  const [discountValidating, setDiscountValidating] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);

  const handleInputChange = (field, value) => {
    dispatch({ type: 'SET_CUSTOMER_INFO', payload: { [field]: value } });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePromoCodeChange = async (value) => {
    dispatch({ type: 'SET_PROMO_CODE', payload: value });
    setDiscountApplied(false);
    
    // Clear existing discount
    dispatch({ type: 'SET_DISCOUNT', payload: 0 });
    dispatch({ type: 'SET_DISCOUNT_CODE', payload: '' });
    dispatch({ type: 'SET_DISCOUNT_AMOUNT', payload: 0 });
    
    // Validate discount code if entered and discount codes are enabled
    if (value.trim() && window.aximAppData?.discountCodesEnabled) {
      await validateDiscountCode(value.trim());
    }
  };

  const validateDiscountCode = async (code) => {
    if (!code || discountValidating) return;

    setDiscountValidating(true);
    
    try {
      const formData = new FormData();
      formData.append('action', 'axim_validate_discount');
      formData.append('nonce', window.aximAppData.nonce);
      formData.append('code', code);
      formData.append('plan_id', state.selectedPlan?.id || '');

      const response = await fetch(window.aximAppData.ajaxUrl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data.valid) {
        // Apply discount
        const discountPercent = result.data.discount_percent;
        const basePrice = (state.audioDuration || 0) * (state.selectedPlan?.price || 0);
        const addOnPrice = (state.addOns || []).reduce((total, item) => {
          return total + (item.price * (state.audioDuration || 0));
        }, 0);
        const subtotal = basePrice + addOnPrice;
        const discountAmount = (subtotal * discountPercent) / 100;
        const finalPrice = Math.max(0, subtotal - discountAmount);

        dispatch({ type: 'SET_DISCOUNT', payload: discountPercent / 100 });
        dispatch({ type: 'SET_DISCOUNT_CODE', payload: code });
        dispatch({ type: 'SET_DISCOUNT_AMOUNT', payload: discountAmount });
        dispatch({ type: 'SET_TOTAL_PRICE', payload: finalPrice });
        
        setDiscountApplied(true);
        toast.success(result.data.message || 'Discount code applied!');
      } else {
        const errorMessage = result.data?.message || 'Invalid discount code';
        setErrors(prev => ({ ...prev, promoCode: errorMessage }));
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      toast.error('Error validating discount code');
    } finally {
      setDiscountValidating(false);
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

    if (state.selectedPlan?.id === 'student' && !state.promoCode.trim()) {
      newErrors.promoCode = 'Promo code is required for student plan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-axim-text-primary mb-2">Your Information</h2>
        <p className="text-axim-text-secondary">
          Please provide your contact details for order confirmation and delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-axim-text-primary mb-2">
            Full Name *
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-axim-text-secondary" />
            <input
              type="text"
              value={state.customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-axim-bg border rounded-lg focus:ring-2 focus:ring-power-purple focus:border-power-purple text-axim-text-primary ${
                errors.name ? 'border-power-red' : 'border-axim-border'
              }`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-power-red">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-axim-text-primary mb-2">
            Email Address *
          </label>
          <div className="relative">
            <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-axim-text-secondary" />
            <input
              type="email"
              value={state.customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-axim-bg border rounded-lg focus:ring-2 focus:ring-power-purple focus:border-power-purple text-axim-text-primary ${
                errors.email ? 'border-power-red' : 'border-axim-border'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-power-red">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-axim-text-primary mb-2">
            Company/Organization
          </label>
          <div className="relative">
            <SafeIcon icon={FiBuilding} className="absolute left-3 top-3 text-axim-text-secondary" />
            <input
              type="text"
              value={state.customerInfo.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-axim-bg border border-axim-border rounded-lg focus:ring-2 focus:ring-power-purple focus:border-power-purple text-axim-text-primary"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-axim-text-primary mb-2">
            Phone Number
          </label>
          <div className="relative">
            <SafeIcon icon={FiPhone} className="absolute left-3 top-3 text-axim-text-secondary" />
            <input
              type="tel"
              value={state.customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-axim-bg border border-axim-border rounded-lg focus:ring-2 focus:ring-power-purple focus:border-power-purple text-axim-text-primary"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Promo Code - Only show if discount codes are enabled */}
      {window.aximAppData?.discountCodesEnabled && (
        <div>
          <label className="block text-sm font-medium text-axim-text-primary mb-2">
            Discount Code {state.selectedPlan?.id === 'student' && '*'}
          </label>
          <div className="relative max-w-md">
            <SafeIcon icon={FiTag} className="absolute left-3 top-3 text-axim-text-secondary" />
            <input
              type="text"
              value={state.promoCode}
              onChange={(e) => handlePromoCodeChange(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 bg-axim-bg border rounded-lg focus:ring-2 focus:ring-power-purple focus:border-power-purple text-axim-text-primary ${
                errors.promoCode ? 'border-power-red' : discountApplied ? 'border-power-green' : 'border-axim-border'
              }`}
              placeholder={state.selectedPlan?.id === 'student' ? 'Required for student plan' : 'Enter discount code'}
              disabled={discountValidating}
            />
            
            {/* Loading/Success indicator */}
            <div className="absolute right-3 top-3">
              {discountValidating ? (
                <div className="animate-spin w-5 h-5 border-2 border-power-purple border-t-transparent rounded-full" />
              ) : discountApplied ? (
                <SafeIcon icon={FiCheck} className="text-power-green" />
              ) : null}
            </div>
          </div>
          
          {errors.promoCode && (
            <p className="mt-1 text-sm text-power-red">{errors.promoCode}</p>
          )}
          
          {state.selectedPlan?.id === 'student' && (
            <p className="mt-2 text-sm text-power-purple">
              Try: STUDENT2025 for additional discount
            </p>
          )}
          
          {/* Popular discount codes hint */}
          {!discountApplied && !state.promoCode && (
            <div className="mt-2 text-sm text-axim-text-secondary">
              <p>Popular codes: WELCOME10, SAVE20, FIRSTTIME</p>
            </div>
          )}
        </div>
      )}

      {/* Discount Applied */}
      {discountApplied && state.discount > 0 && (
        <motion.div
          className="bg-power-green bg-opacity-10 border border-power-green border-opacity-30 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiPercent} className="text-power-green" />
            <p className="text-power-green font-medium">
              🎉 Discount Applied: {state.discountCode}
            </p>
          </div>
          <div className="text-sm text-axim-text-secondary">
            <p>Discount: {(state.discount * 100).toFixed(0)}% off</p>
            <p>You save: ${state.discountAmount?.toFixed(2) || '0.00'}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CustomerForm;