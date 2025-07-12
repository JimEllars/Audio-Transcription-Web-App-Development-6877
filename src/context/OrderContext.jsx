import React, { createContext, useContext, useReducer } from 'react';

const OrderContext = createContext();

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
  status: 'pending'
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, selectedPlan: action.payload };
    case 'SET_CUSTOMER_INFO':
      return { ...state, customerInfo: { ...state.customerInfo, ...action.payload } };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.payload };
    case 'SET_AUDIO_FILE':
      return { ...state, audioFile: action.payload };
    case 'SET_AUDIO_DURATION':
      return { ...state, audioDuration: action.payload };
    case 'SET_ADD_ONS':
      return { ...state, addOns: action.payload };
    case 'SET_TOTAL_PRICE':
      return { ...state, totalPrice: action.payload };
    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload };
    case 'SET_ORDER_ID':
      return { ...state, orderId: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'RESET_ORDER':
      return initialState;
    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}