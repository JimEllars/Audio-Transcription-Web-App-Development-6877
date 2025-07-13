import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingPage } from './LoadingSpinner'

const ProtectedRoute = React.memo(({ children, requireAuth = true }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage message="Checking authentication..." />
  }

  // Check for guest mode in URL params
  const searchParams = new URLSearchParams(location.search)
  const isGuestMode = searchParams.get('guest') === 'true'

  // Allow guest access for order flow
  if (requireAuth && !user && !isGuestMode) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!requireAuth && user) {
    // Redirect authenticated users away from auth pages
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return children
})

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute