import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import toast from 'react-hot-toast'

const { FiMic, FiFileText, FiUser, FiLogOut } = FiIcons

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
      className="bg-axim-panel border-b border-axim-border sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-power-purple rounded-xl">
              <SafeIcon icon={FiMic} className="text-axim-text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-axim-text-primary">AXiM</h1>
              <p className="text-sm text-axim-text-secondary">Transcription Service</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-axim-text-secondary hover:text-power-green transition-colors duration-200">
              Pricing
            </Link>
            <Link to="/compare" className="text-axim-text-secondary hover:text-power-green transition-colors duration-200">
              Compare Plans
            </Link>
            {user && (
              <Link to="/dashboard" className="text-axim-text-secondary hover:text-power-green transition-colors duration-200">
                Dashboard
              </Link>
            )}
            <div className="flex items-center space-x-2 text-sm text-axim-text-secondary">
              <SafeIcon icon={FiFileText} className="text-power-green text-lg" />
              <span>Powered by AI</span>
            </div>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-axim-text-primary">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-axim-text-secondary">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="p-2 text-axim-text-secondary hover:text-power-green transition-colors duration-200"
                    title="Dashboard"
                  >
                    <SafeIcon icon={FiUser} className="text-lg" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-axim-text-secondary hover:text-power-red transition-colors duration-200"
                    title="Sign Out"
                  >
                    <SafeIcon icon={FiLogOut} className="text-lg" />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <motion.button
                  className="btn-primary"
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