import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrder } from '../context/OrderContext';
import AudioUpload from '../components/AudioUpload';
import CustomerForm from '../components/CustomerForm';
import AddOnSelector from '../components/AddOnSelector';
import OrderSummary from '../components/OrderSummary';

const plans = {
  student: { name: 'Student', price: 0.25, color: 'blue' },
  basic: { name: 'Basic', price: 0.50, color: 'green' },
  business: { name: 'Business', price: 0.75, color: 'purple' }
};

function OrderPage() {
  const { plan: planId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useOrder();
  const [currentStep, setCurrentStep] = useState(1);

  const plan = plans[planId];

  useEffect(() => {
    if (!plan) {
      navigate('/');
      return;
    }
    dispatch({ type: 'SET_PLAN', payload: { ...plan, id: planId } });
  }, [planId, plan, dispatch, navigate]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/payment');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1: return state.audioFile && state.audioDuration > 0;
      case 2: return state.customerInfo.name && state.customerInfo.email;
      case 3: return true; // Add-ons are optional
      case 4: return true;
      default: return false;
    }
  };

  if (!plan) return null;

  const steps = [
    { number: 1, title: 'Upload Audio', component: AudioUpload },
    { number: 2, title: 'Your Information', component: CustomerForm },
    { number: 3, title: 'Add-ons', component: AddOnSelector },
    { number: 4, title: 'Review Order', component: OrderSummary }
  ];

  const CurrentComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {plan.name} Plan Order
        </h1>
        <p className="text-gray-600">
          Complete your order in {steps.length} simple steps
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
                ${currentStep >= step.number 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : isStepComplete(step.number)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }
              `}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-primary-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div 
        key={currentStep}
        className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CurrentComponent />
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          onClick={handleBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentStep === 1 ? 'Back to Pricing' : 'Previous'}
        </motion.button>

        <motion.button
          onClick={handleNext}
          disabled={!isStepComplete(currentStep)}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isStepComplete(currentStep)
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={isStepComplete(currentStep) ? { scale: 1.02 } : {}}
          whileTap={isStepComplete(currentStep) ? { scale: 0.98 } : {}}
        >
          {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
        </motion.button>
      </div>
    </div>
  );
}

export default OrderPage;