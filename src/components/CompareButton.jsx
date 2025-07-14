import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart3 } = FiIcons;

function CompareButton() {
  return (
    <Link to="/compare">
      <motion.button
        className="inline-flex items-center space-x-2 bg-axim-panel hover:bg-axim-bg border border-axim-border text-axim-text-primary px-6 py-3 rounded-xl font-medium transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <SafeIcon icon={FiBarChart3} />
        <span>Compare All Plans</span>
      </motion.button>
    </Link>
  );
}

export default CompareButton;