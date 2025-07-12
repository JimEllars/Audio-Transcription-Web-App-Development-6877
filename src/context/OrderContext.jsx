import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { orderSchema } from '../lib/validations'
import { useAuth } from '../hooks/useAuth'

const OrderContext = createContext()

const initialState = {
  selectedPlan: null,
  customerInfo: {
    name: '',
    email: '',
    company: '',
    phone: ''
  },
  promoCode: '',
  audioFile: null,
  audioDuration: 0,
  addOns: [],
  totalPrice: 0,
  discount: 0,
  orderId: null,
  status: 'pending',
  uploadProgress: 0,
  errors: {},
  isProcessing: false
}

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, selectedPlan: action.payload }
    
    case 'SET_CUSTOMER_INFO':
      return { 
        ...state, 
        customerInfo: { ...state.customerInfo, ...action.payload },
        errors: { ...state.errors, customerInfo: null }
      }
    
    case 'SET_PROMO_CODE':
      return { 
        ...state, 
        promoCode: action.payload,
        errors: { ...state.errors, promoCode: null }
      }
    
    case 'SET_AUDIO_FILE':
      return { 
        ...state, 
        audioFile: action.payload,
        errors: { ...state.errors, audioFile: null }
      }
    
    case 'SET_AUDIO_DURATION':
      return { ...state, audioDuration: action.payload }
    
    case 'SET_ADD_ONS':
      return { ...state, addOns: action.payload }
    
    case 'SET_TOTAL_PRICE':
      return { ...state, totalPrice: action.payload }
    
    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload }
    
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload }
    
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload }
    
    case 'SET_ERRORS':
      return { ...state, errors: { ...state.errors, ...action.payload } }
    
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }
    
    case 'RESET_ORDER':
      return { ...initialState }
    
    default:
      return state
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState)
  const { user } = useAuth()

  // Auto-fill customer info from user profile
  useEffect(() => {
    if (user && !state.customerInfo.email) {
      dispatch({
        type: 'SET_CUSTOMER_INFO',
        payload: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        }
      })
    }
  }, [user, state.customerInfo.email])

  // Validate order data
  const validateOrder = () => {
    try {
      orderSchema.parse({
        planId: state.selectedPlan?.id,
        customerInfo: state.customerInfo,
        audioFile: state.audioFile,
        audioDuration: state.audioDuration,
        addOns: state.addOns,
        promoCode: state.promoCode
      })
      
      dispatch({ type: 'SET_ERRORS', payload: {} })
      return true
    } catch (error) {
      const fieldErrors = {}
      error.errors.forEach(err => {
        const field = err.path.join('.')
        fieldErrors[field] = err.message
      })
      
      dispatch({ type: 'SET_ERRORS', payload: fieldErrors })
      return false
    }
  }

  // Calculate pricing with validation
  const calculateTotalPrice = () => {
    if (!state.selectedPlan || !state.audioDuration) return

    const basePrice = state.audioDuration * state.selectedPlan.price
    const addOnPrice = (state.addOns || []).reduce((total, item) => {
      return total + (item.price * state.audioDuration)
    }, 0)
    
    const subtotal = basePrice + addOnPrice
    const discountAmount = subtotal * state.discount
    const finalPrice = Math.max(0, subtotal - discountAmount)
    
    dispatch({ type: 'SET_TOTAL_PRICE', payload: finalPrice })
  }

  // Auto-calculate price when dependencies change
  useEffect(() => {
    calculateTotalPrice()
  }, [state.selectedPlan, state.audioDuration, state.addOns, state.discount])

  const value = {
    state,
    dispatch,
    validateOrder,
    calculateTotalPrice
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}