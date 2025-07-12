import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from 'react-query'

// Pages
import PricingPage from './pages/PricingPage'
import OrderPage from './pages/OrderPage'
import PaymentPage from './pages/PaymentPage'
import UploadPage from './pages/UploadPage'
import SuccessPage from './pages/SuccessPage'
import ComparisonPage from './pages/ComparisonPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import ToastProvider from './components/Toast'
import { LoadingPage } from './components/LoadingSpinner'

// Context
import { OrderProvider } from './context/OrderContext'

// Hooks
import { useAuth } from './hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function AppContent() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Initializing application..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Header />
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PricingPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route 
            path="/auth" 
            element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order/:plan" 
            element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/success" 
            element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </motion.main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OrderProvider>
          <Router>
            <ToastProvider />
            <AppContent />
          </Router>
        </OrderProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App