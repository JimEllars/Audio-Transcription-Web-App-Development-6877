import React from 'react';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiZap, FiClock, FiMail, FiFileText } = FiIcons;

const addOns = [
  {
    id: 'rush',
    name: 'Rush Processing',
    description: 'Priority processing - completed within 1 hour',
    price: 0.25,
    icon: FiZap,
    color: 'orange'
  },
  {
    id: 'timestamps',
    name: 'Detailed Timestamps',
    description: 'Timestamps every 30 seconds for precise navigation',
    price: 0.10,
    icon: FiClock,
    color: 'blue'
  },
  {
    id: 'custom-format',
    name: 'Custom Formatting',
    description: 'Specific formatting requirements and styling',
    price: 0.15,
    icon: FiFileText,
    color: 'purple'
  }
];

function AddOnSelector() {
  const { state, dispatch } = useOrder();

  const handleAddOnToggle = (addOn) => {
    const currentAddOns = state.addOns || [];
    const isSelected = currentAddOns.some(item => item.id === addOn.id);
    
    let newAddOns;
    if (isSelected) {
      newAddOns = currentAddOns.filter(item => item.id !== addOn.id);
    } else {
      newAddOns = [...currentAddOns, addOn];
    }
    
    dispatch({ type: 'SET_ADD_ONS', payload: newAddOns });
    
    // Recalculate total price
    const basePrice = state.audioDuration * state.selectedPlan.price;
    const addOnPrice = newAddOns.reduce((total, item) => {
      return total + (item.price * state.audioDuration);
    }, 0);
    
    const subtotal = basePrice + addOnPrice;
    const discountAmount = subtotal * state.discount;
    const finalPrice = subtotal - discountAmount;
    
    dispatch({ type: 'SET_TOTAL_PRICE', payload: finalPrice });
  };

  const isSelected = (addOnId) => {
    return state.addOns?.some(item => item.id === addOnId) || false;
  };

  const getColorClasses = (color, selected) => {
    const colors = {
      orange: selected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-300',
      blue: selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      purple: selected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Optional Add-ons</h2>
        <p className="text-gray-600">
          Enhance your transcription with these premium features. All add-ons are priced per minute.
        </p>
      </div>

      <div className="space-y-4">
        {addOns.map((addOn, index) => {
          const selected = isSelected(addOn.id);
          
          return (
            <motion.div
              key={addOn.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                getColorClasses(addOn.color, selected)
              }`}
              onClick={() => handleAddOnToggle(addOn)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    selected 
                      ? `bg-${addOn.color}-500 text-white` 
                      : `bg-${addOn.color}-100 text-${addOn.color}-600`
                  }`}>
                    <SafeIcon icon={addOn.icon} className="text-xl" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {addOn.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{addOn.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-gray-900">
                        +${addOn.price}/minute
                      </span>
                      {state.audioDuration > 0 && (
                        <span className="text-sm text-gray-500">
                          (+${(addOn.price * state.audioDuration).toFixed(2)} total)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected 
                    ? `bg-${addOn.color}-500 border-${addOn.color}-500` 
                    : 'border-gray-300'
                }`}>
                  {selected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {state.addOns && state.addOns.length > 0 && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Add-ons</h3>
          <div className="space-y-2">
            {state.addOns.map(addOn => (
              <div key={addOn.id} className="flex justify-between items-center">
                <span className="text-gray-700">{addOn.name}</span>
                <span className="font-semibold">
                  +${(addOn.price * state.audioDuration).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AddOnSelector;