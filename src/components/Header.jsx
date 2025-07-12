import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMic, FiFileText } = FiIcons;

function Header() {
  return (
    <motion.header 
      className="bg-white shadow-sm border-b border-gray-100"
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
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SafeIcon icon={FiFileText} className="text-lg" />
              <span>Powered by AI</span>
            </div>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;