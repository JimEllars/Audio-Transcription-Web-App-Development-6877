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
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const AppContent = React.memo(({ defaultPlan, theme, version }) => {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Initializing application..." />
  }

  return (
    <div className={`min-h-screen bg-axim-bg flex flex-col ${theme}`}>
      <Header version={version} />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PricingPage defaultPlan={defaultPlan} />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false}>
              <AuthPage />
            </ProtectedRoute>
          } />

          {/* Protected/Guest Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Order flow - supports both authenticated and guest users */}
          <Route path="/order/:plan" element={<OrderPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </motion.main>
      <Footer version={version} />
    </div>
  )
})

AppContent.displayName = 'AppContent'

function App({ defaultPlan = 'basic', theme = 'dark', version = '1.2.0', containerId, instanceId }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OrderProvider>
          <Router>
            <ToastProvider />
            <AppContent 
              defaultPlan={defaultPlan} 
              theme={theme} 
              version={version}
              containerId={containerId}
              instanceId={instanceId}
            />
          </Router>
        </OrderProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App