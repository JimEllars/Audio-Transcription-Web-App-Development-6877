import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'

const StatsCard = React.memo(({ icon, title, value, delay = 0 }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="flex items-center">
        <SafeIcon icon={icon} className="text-2xl" />
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  )
})

StatsCard.displayName = 'StatsCard'

export default StatsCard