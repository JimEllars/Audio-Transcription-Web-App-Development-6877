import React from 'react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFile, FiUser, FiClock, FiDollarSign, FiCheck } = FiIcons;

function OrderSummary() {
  const { state } = useOrder();

  const basePrice = state.audioDuration * state.selectedPlan.price;
  const addOnPrice = (state.addOns || []).reduce((total, item) => {
    return total + (item.price * state.audioDuration);
  }, 0);
  const subtotal = basePrice + addOnPrice;
  const discountAmount = subtotal * state.discount;

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h2>
        <p className="text-gray-600">
          Please review all details before proceeding to payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Plan</span>
                <span className="font-semibold">{state.selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate</span>
                <span className="font-semibold">${state.selectedPlan.price}/minute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Turnaround Time</span>
                <span className="font-semibold">
                  {state.selectedPlan.id === 'business' ? '< 48 hours' : '< 72 hours'}
                </span>
              </div>
            </div>
          </div>

          {/* Audio File */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio File</h3>
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiFile} className="text-blue-500 text-xl mt-1" />
              <div>
                <p className="font-medium text-gray-900">{state.audioFile?.name}</p>
                <p className="text-sm text-gray-600">
                  Duration: {formatDuration(state.audioDuration)}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {state.audioFile ? (state.audioFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUser} className="text-gray-500" />
                <span>{state.customerInfo.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUser} className="text-gray-500" />
                <span>{state.customerInfo.email}</span>
              </div>
              {state.customerInfo.company && (
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUser} className="text-gray-500" />
                  <span>{state.customerInfo.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Price Breakdown</h3>
            
            <div className="space-y-4">
              {/* Base Price */}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Base transcription ({state.audioDuration} min × ${state.selectedPlan.price})
                </span>
                <span className="font-semibold">${basePrice.toFixed(2)}</span>
              </div>

              {/* Add-ons */}
              {state.addOns && state.addOns.length > 0 && (
                <>
                  {state.addOns.map(addOn => (
                    <div key={addOn.id} className="flex justify-between">
                      <span className="text-gray-600">
                        {addOn.name} ({state.audioDuration} min × ${addOn.price})
                      </span>
                      <span className="font-semibold">
                        +${(addOn.price * state.audioDuration).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Subtotal */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount */}
              {state.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({(state.discount * 100)}%)</span>
                  <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-green-600">
                    ${state.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheck} className="text-green-500" />
                <span className="text-gray-700">AI-Powered Transcript</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheck} className="text-green-500" />
                <span className="text-gray-700">Chapter Labels</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheck} className="text-green-500" />
                <span className="text-gray-700">Audio Summary Report</span>
              </div>
              {state.selectedPlan.id === 'business' && (
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="text-green-500" />
                  <span className="text-gray-700">Email Summary</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;