import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import AudioUpload from '../components/AudioUpload'
import CustomerForm from '../components/CustomerForm'
import AddOnSelector from '../components/AddOnSelector'
import OrderSummary from '../components/OrderSummary'

const plans = {
  student: {
    name: 'Student',
    price: 0.25,
    color: 'blue'
  },
  basic: {
    name: 'Basic',
    price: 0.39,
    color: 'green'
  }
}

const OrderPage = React.memo(() => {
  const { plan: planId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, dispatch } = useOrder()
  const [currentStep, setCurrentStep] = useState(1)
  const isGuest = searchParams.get('guest') === 'true'
  const plan = plans[planId]

  // Memoize steps configuration
  const steps = useMemo(() => [
    { number: 1, title: 'Upload Audio', component: AudioUpload },
    { number: 2, title: 'Your Information', component: CustomerForm },
    { number: 3, title: 'Add-ons', component: AddOnSelector },
    { number: 4, title: 'Review Order', component: OrderSummary }
  ], [])

  useEffect(() => {
    if (!plan) {
      navigate('/')
      return
    }
    dispatch({ type: 'SET_PLAN', payload: { ...plan, id: planId } })

    // Set guest mode in context
    dispatch({ type: 'SET_GUEST_MODE', payload: isGuest })
  }, [planId, plan, dispatch, navigate, isGuest])

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      navigate('/payment')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      navigate('/')
    }
  }

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return state.audioFile && state.audioDuration > 0
      case 2:
        return state.customerInfo.name && state.customerInfo.email
      case 3:
        return true // Add-ons are optional
      case 4:
        return true
      default:
        return false
    }
  }

  if (!plan) return null
  const CurrentComponent = steps[currentStep - 1].component

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-axim-text-primary mb-2">
          {plan.name} Plan Order {isGuest && '(Guest)'}
        </h1>
        <p className="text-axim-text-secondary">
          Complete your order in {steps.length} simple steps
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
                  ${
                    currentStep >= step.number
                      ? 'bg-power-purple border-power-purple text-axim-text-primary'
                      : isStepComplete(step.number)
                      ? 'bg-power-green border-power-green text-axim-bg'
                      : 'border-axim-border text-axim-text-secondary'
                  }
                `}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-power-purple' : 'text-axim-text-secondary'
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-power-purple' : 'bg-axim-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        className="bg-axim-panel rounded-2xl shadow-lg p-8 mb-8 border border-axim-border"
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
          className="px-6 py-3 border border-axim-border rounded-lg text-axim-text-primary hover:bg-axim-bg transition-colors duration-200"
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
              ? 'bg-power-green hover:bg-opacity-90 text-axim-bg'
              : 'bg-axim-border text-axim-text-secondary cursor-not-allowed'
          }`}
          whileHover={isStepComplete(currentStep) ? { scale: 1.02 } : {}}
          whileTap={isStepComplete(currentStep) ? { scale: 0.98 } : {}}
        >
          {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
        </motion.button>
      </div>
    </div>
  )
})

OrderPage.displayName = 'OrderPage'
export default OrderPage