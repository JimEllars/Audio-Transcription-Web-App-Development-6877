import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiArrowLeft } = FiIcons;

const comparisonData = [
  {
    feature: 'Price per minute',
    student: '$0.25',
    basic: '$0.50',
    business: '$0.75'
  },
  {
    feature: 'AI-Powered Transcript',
    student: true,
    basic: true,
    business: true
  },
  {
    feature: 'Chapter Labels',
    student: true,
    basic: true,
    business: true
  },
  {
    feature: 'Audio Summary Report',
    student: true,
    basic: true,
    business: true
  },
  {
    feature: 'Email Summary',
    student: false,
    basic: false,
    business: true
  },
  {
    feature: 'Turnaround Time',
    student: '< 72 hours',
    basic: '< 72 hours',
    business: '< 48 hours'
  },
  {
    feature: 'Target Processing',
    student: '< 1 hour',
    basic: '< 1 hour',
    business: '< 30 minutes'
  },
  {
    feature: 'Special Requirements',
    student: 'Discount code required',
    basic: 'None',
    business: 'None'
  }
];

function ComparisonPage() {
  const renderCell = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <SafeIcon icon={FiCheck} className="text-green-500 text-xl mx-auto" />
      ) : (
        <SafeIcon icon={FiX} className="text-gray-400 text-xl mx-auto" />
      );
    }
    return <span className="text-gray-900 font-medium">{value}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6">
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Pricing</span>
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Compare All Plans
        </h1>
        <p className="text-gray-600 text-lg">
          See the detailed differences between our transcription plans
        </p>
      </motion.div>

      <motion.div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Features
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                  Student
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                  Basic
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">
                  Business
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparisonData.map((row, index) => (
                <motion.tr 
                  key={row.feature}
                  className="hover:bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {renderCell(row.student)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {renderCell(row.basic)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {renderCell(row.business)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/order/student">
              <motion.button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Student
              </motion.button>
            </Link>
            <Link to="/order/basic">
              <motion.button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Basic
              </motion.button>
            </Link>
            <Link to="/order/business">
              <motion.button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Business
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ComparisonPage;