import React from 'react'
import { Toaster } from 'react-hot-toast'

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1C1C1C',
          color: '#F5F5F5',
          border: '1px solid #333333',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500'
        },
        success: {
          style: {
            background: 'rgba(68, 221, 160, 0.1)',
            border: '1px solid #44DDA0',
          },
          iconTheme: {
            primary: '#44DDA0',
            secondary: '#1C1C1C',
          },
        },
        error: {
          style: {
            background: 'rgba(255, 23, 68, 0.1)',
            border: '1px solid #FF1744',
          },
          iconTheme: {
            primary: '#FF1744',
            secondary: '#1C1C1C',
          },
        },
      }}
    />
  )
}

export default ToastProvider