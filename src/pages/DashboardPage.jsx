import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import LoadingSpinner from '../components/LoadingSpinner'
import StatsCard from '../components/StatsCard'
import QuickActions from '../components/QuickActions'
import OrdersTable from '../components/OrdersTable'
import * as FiIcons from 'react-icons/fi'

const { FiFile, FiCheck, FiDollarSign } = FiIcons

function DashboardPage() {
  const { user } = useAuth()
  const { orders, loading, error } = useOrders()

  // Memoize expensive calculations
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_price || 0), 0)
    const completedOrders = orders.filter(order => order.status === 'completed').length
    
    return {
      totalOrders: orders.length,
      completedOrders,
      totalSpent
    }
  }, [orders])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Manage your transcription orders and track their progress
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={FiFile}
          title="Total Orders"
          value={stats.totalOrders}
          delay={0.1}
        />
        <StatsCard
          icon={FiCheck}
          title="Completed"
          value={stats.completedOrders}
          delay={0.2}
        />
        <StatsCard
          icon={FiDollarSign}
          title="Total Spent"
          value={`$${stats.totalSpent.toFixed(2)}`}
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions delay={0.4} />

      {/* Recent Orders */}
      <OrdersTable 
        orders={orders}
        loading={loading}
        error={error}
        delay={0.5}
      />
    </div>
  )
}

export default DashboardPage