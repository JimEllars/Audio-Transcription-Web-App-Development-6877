import React, { useState, useEffect } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { getStripe, createPaymentIntent, confirmPayment } from '../lib/stripe'
import { useOrder } from '../context/OrderContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiLock, FiCreditCard, FiShield } = FiIcons

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#1C1C1C',
      '::placeholder': {
        color: '#A9A9A9',
      },
      iconColor: '#44DDA0',
    },
    invalid: {
      color: '#FF1744',
      iconColor: '#FF1744',
    },
  },
  hidePostalCode: false,
}

function CheckoutForm({ clientSecret, paymentIntentId, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const { state } = useOrder()
  const [processing, setProcessing] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: state.customerInfo.name,
            email: state.customerInfo.email,
          },
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm with our backend
        const orderData = {
          orderId: state.orderId || `AXM-${Date.now()}`,
          planId: state.selectedPlan.id,
          customerInfo: state.customerInfo,
          audioDuration: state.audioDuration,
          addOns: state.addOns,
          totalPrice: state.totalPrice,
          promoCode: state.promoCode,
          discount: state.discount
        }

        await confirmPayment(paymentIntent.id, orderData)
        
        toast.success('Payment successful!')
        onSuccess(paymentIntent)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setCardError(error.message)
      onError(error)
      toast.error(error.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleCardChange = (event) => {
    setCardComplete(event.complete)
    setCardError(event.error ? event.error.message : null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-axim-panel border border-axim-border rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiCreditCard} className="text-power-purple" />
          <h3 className="text-lg font-semibold text-axim-text-primary">Payment Details</h3>
        </div>
        
        <div className="bg-axim-bg border border-axim-border rounded-lg p-4">
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
        
        {cardError && (
          <p className="mt-2 text-sm text-power-red">{cardError}</p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={!stripe || processing || !cardComplete}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
          !stripe || processing || !cardComplete
            ? 'bg-axim-border text-axim-text-secondary cursor-not-allowed'
            : 'bg-power-green hover:bg-opacity-90 text-axim-bg'
        }`}
        whileHover={!stripe || processing || !cardComplete ? {} : { scale: 1.02 }}
        whileTap={!stripe || processing || !cardComplete ? {} : { scale: 0.98 }}
      >
        {processing ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-axim-bg border-t-transparent rounded-full" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <SafeIcon icon={FiLock} />
            <span>Pay ${state.totalPrice?.toFixed(2)}</span>
          </>
        )}
      </motion.button>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-axim-text-secondary">
          <SafeIcon icon={FiShield} className="text-power-green" />
          <span>Secured by Stripe • 256-bit SSL encryption</span>
        </div>
      </div>
    </form>
  )
}

function StripeCheckout({ onSuccess, onError }) {
  const { state } = useOrder()
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentIntentId, setPaymentIntentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!state.totalPrice || !state.customerInfo.email) {
          throw new Error('Missing required payment information')
        }

        const orderData = {
          orderId: state.orderId || `AXM-${Date.now()}`,
          planId: state.selectedPlan.id,
          customerInfo: state.customerInfo,
          audioDuration: state.audioDuration,
          addOns: state.addOns,
          totalPrice: state.totalPrice,
          promoCode: state.promoCode,
          discount: state.discount
        }

        const result = await createPaymentIntent(
          state.totalPrice,
          'usd',
          state.customerInfo.email,
          orderData
        )

        setClientSecret(result.client_secret)
        setPaymentIntentId(result.payment_intent_id)
      } catch (err) {
        console.error('Payment initialization error:', err)
        setError(err.message)
        onError?.(err)
      } finally {
        setLoading(false)
      }
    }

    initializePayment()
  }, [state.totalPrice, state.customerInfo.email, state.selectedPlan, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-power-purple border-t-transparent rounded-full" />
        <span className="ml-3 text-axim-text-secondary">Initializing secure payment...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-power-red bg-opacity-10 border border-power-red rounded-xl p-6">
        <p className="text-power-red font-medium">Payment initialization failed</p>
        <p className="text-axim-text-secondary text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="bg-axim-panel border border-axim-border rounded-xl p-6">
        <p className="text-axim-text-secondary">Unable to initialize payment. Please try again.</p>
      </div>
    )
  }

  return (
    <Elements stripe={getStripe()}>
      <CheckoutForm
        clientSecret={clientSecret}
        paymentIntentId={paymentIntentId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}

export default StripeCheckout