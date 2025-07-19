import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key from WordPress
let stripePromise = null

export const getStripe = () => {
  if (!stripePromise && window.aximAppData?.stripePublishableKey) {
    stripePromise = loadStripe(window.aximAppData.stripePublishableKey)
  }
  return stripePromise
}

// Create payment intent via WordPress AJAX
export const createPaymentIntent = async (amount, currency, customerEmail, orderData) => {
  try {
    const formData = new FormData()
    formData.append('action', 'axim_create_payment_intent')
    formData.append('nonce', window.aximAppData.nonce)
    formData.append('amount', amount.toString())
    formData.append('currency', currency)
    formData.append('customer_email', customerEmail)
    formData.append('order_data', JSON.stringify(orderData))

    const response = await fetch(window.aximAppData.ajaxUrl, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.data || 'Failed to create payment intent')
    }

    return result.data
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    throw error
  }
}

// Confirm payment via WordPress AJAX
export const confirmPayment = async (paymentIntentId, orderData) => {
  try {
    const formData = new FormData()
    formData.append('action', 'axim_confirm_payment')
    formData.append('nonce', window.aximAppData.nonce)
    formData.append('payment_intent_id', paymentIntentId)
    formData.append('order_data', JSON.stringify(orderData))

    const response = await fetch(window.aximAppData.ajaxUrl, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.data || 'Failed to confirm payment')
    }

    return result.data
  } catch (error) {
    console.error('Payment confirmation failed:', error)
    throw error
  }
}

export default { getStripe, createPaymentIntent, confirmPayment }