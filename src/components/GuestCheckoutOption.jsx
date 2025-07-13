import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiUserPlus, FiShoppingCart } = FiIcons

const GuestCheckoutOption = React.memo(({ planId }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        How would you like to proceed?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guest Checkout */}
        <Link to={`/order/${planId}?guest=true`}>
          <motion.div
            className="border-2 border-gray-200 hover:border-primary-300 rounded-xl p-6 cursor-pointer transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <SafeIcon icon={FiShoppingCart} className="text-primary-500 text-3xl mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Continue as Guest</h4>
              <p className="text-sm text-gray-600 mb-4">
                Quick checkout without creating an account
              </p>
              <div className="text-xs text-gray-500">
                ✓ Faster checkout<br/>
                ✓ Email order confirmation<br/>
                ✗ No order history
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Create Account */}
        <Link to="/auth">
          <motion.div
            className="border-2 border-primary-200 bg-primary-50 hover:border-primary-300 rounded-xl p-6 cursor-pointer transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <SafeIcon icon={FiUserPlus} className="text-primary-500 text-3xl mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Create Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Sign up for order history and faster future checkouts
              </p>
              <div className="text-xs text-gray-500">
                ✓ Order history<br/>
                ✓ Faster future orders<br/>
                ✓ Account dashboard
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
})

GuestCheckoutOption.displayName = 'GuestCheckoutOption'

export default GuestCheckoutOption