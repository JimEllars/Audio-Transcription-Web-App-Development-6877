import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingPage } from './LoadingSpinner'

function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Checking authentication..." />
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute