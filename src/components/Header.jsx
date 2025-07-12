import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiMic, FiFileText, FiUser, FiLogOut, FiSettings } = FiIcons

function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      navigate('/')
    }
  }

  return (
    <motion.header 
      className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-xl">
              <SafeIcon icon={FiMic} className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AXiM</h1>
              <p className="text-sm text-gray-500">Transcription Service</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link 
              to="/compare" 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              Compare Plans
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiFileText} className="text-lg" />
              <span>Powered by AI</span>
            </div>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-gray-900">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Dashboard"
                  >
                    <SafeIcon icon={FiUser} className="text-lg" />
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Sign Out"
                  >
                    <SafeIcon icon={FiLogOut} className="text-lg" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <motion.button
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header