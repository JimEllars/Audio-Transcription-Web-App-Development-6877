import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { orderSchema } from '../lib/validations'
import { useAuth } from '../hooks/useAuth'

const OrderContext = createContext()

// Function to load state from sessionStorage
const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem('aximOrderState')
    if (serializedState === null) {
      return undefined // No state in storage
    }
    const state = JSON.parse(serializedState)
    
    // Don't restore audioFile from sessionStorage (File objects can't be serialized)
    if (state.audioFile) {
      state.audioFile = null
      state.audioDuration = 0
    }
    
    return state
  } catch (error) {
    console.error("Error loading state from sessionStorage:", error)
    return undefined
  }
}

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
  isProcessing: false,
  isGuestMode: false
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
    
    case 'SET_GUEST_MODE':
      return { ...state, isGuestMode: action.payload }
    
    case 'RESET_ORDER':
      // Clear sessionStorage when resetting
      sessionStorage.removeItem('aximOrderState')
      return { ...initialState }
    
    default:
      return state
  }
}

export const OrderProvider = React.memo(({ children }) => {
  // Initialize state from sessionStorage or use initial state
  const [state, dispatch] = useReducer(orderReducer, loadState() || initialState)
  const { user } = useAuth()

  // Effect to save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      // Don't save audioFile to sessionStorage (File objects can't be serialized)
      const stateToSave = { ...state }
      if (stateToSave.audioFile) {
        stateToSave.audioFile = null
      }
      
      const serializedState = JSON.stringify(stateToSave)
      sessionStorage.setItem('aximOrderState', serializedState)
    } catch (error) {
      console.error("Error saving state to sessionStorage:", error)
    }
  }, [state])

  // Auto-fill customer info from user profile
  useEffect(() => {
    if (user && !state.customerInfo.email && !state.isGuestMode) {
      dispatch({
        type: 'SET_CUSTOMER_INFO',
        payload: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        }
      })
    }
  }, [user, state.customerInfo.email, state.isGuestMode])

  // Validate order data with better error handling
  const validateOrder = React.useCallback(() => {
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
  }, [state.selectedPlan, state.customerInfo, state.audioFile, state.audioDuration, state.addOns, state.promoCode])

  // Calculate pricing with memoization
  const calculateTotalPrice = React.useCallback(() => {
    if (!state.selectedPlan || !state.audioDuration) return

    const basePrice = state.audioDuration * state.selectedPlan.price
    const addOnPrice = (state.addOns || []).reduce((total, item) => {
      return total + (item.price * state.audioDuration)
    }, 0)

    const subtotal = basePrice + addOnPrice
    const discountAmount = subtotal * state.discount
    const finalPrice = Math.max(0, subtotal - discountAmount)

    dispatch({ type: 'SET_TOTAL_PRICE', payload: finalPrice })
  }, [state.selectedPlan, state.audioDuration, state.addOns, state.discount])

  // Auto-calculate price when dependencies change
  useEffect(() => {
    calculateTotalPrice()
  }, [calculateTotalPrice])

  const value = React.useMemo(() => ({
    state,
    dispatch,
    validateOrder,
    calculateTotalPrice
  }), [state, validateOrder, calculateTotalPrice])

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
})

OrderProvider.displayName = 'OrderProvider'

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}