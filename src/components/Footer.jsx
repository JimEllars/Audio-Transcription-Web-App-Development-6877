import React from 'react'
import { motion } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield, FiLock, FiGlobe } = FiIcons

function Footer() {
  return (
    <motion.footer
      className="bg-axim-panel text-axim-text-primary mt-20 border-t border-axim-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AXiM Transcription</h3>
            <p className="text-axim-text-secondary text-sm leading-relaxed">
              Professional AI-powered transcription service with enterprise-grade security
              and lightning-fast turnaround times.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium mb-4">Security & Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-axim-text-secondary">
                <SafeIcon icon={FiShield} className="text-power-green" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-axim-text-secondary">
                <SafeIcon icon={FiLock} className="text-power-green" />
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-axim-text-secondary">
                <SafeIcon icon={FiGlobe} className="text-power-green" />
                <span>EU Data Centers</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium mb-4">Contact</h4>
            <div className="text-sm text-axim-text-secondary space-y-2">
              <p>support@aximsystems.com</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-axim-border mt-8 pt-8 text-center text-sm text-axim-text-secondary">
          <p>&copy; 2025 AXiM Systems. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer