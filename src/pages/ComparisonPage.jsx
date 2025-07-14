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
    basic: '$0.39'
  },
  {
    feature: 'AI-Powered Transcript',
    student: true,
    basic: true
  },
  {
    feature: 'Chapter Labels',
    student: true,
    basic: true
  },
  {
    feature: 'Audio Summary Report',
    student: true,
    basic: true
  },
  {
    feature: 'Email Summary',
    student: false,
    basic: true
  },
  {
    feature: 'Turnaround Time',
    student: '< 72 hours',
    basic: '< 72 hours'
  },
  {
    feature: 'Target Processing',
    student: '< 1 hour',
    basic: '< 1 hour'
  },
  {
    feature: 'Special Requirements',
    student: 'Discount code required',
    basic: 'None'
  }
];

function ComparisonPage() {
  const renderCell = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <SafeIcon icon={FiCheck} className="text-power-green text-xl mx-auto" />
      ) : (
        <SafeIcon icon={FiX} className="text-axim-text-secondary text-xl mx-auto" />
      );
    }
    return <span className="text-axim-text-primary font-medium">{value}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        className="mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-power-green hover:text-power-green hover:opacity-80 mb-6"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back to Pricing</span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-axim-text-primary mb-4">
          Compare All Plans
        </h1>
        <p className="text-axim-text-secondary text-lg">
          See the detailed differences between our transcription plans
        </p>
      </motion.div>

      <motion.div
        className="bg-axim-panel rounded-2xl shadow-lg overflow-hidden border border-axim-border"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-axim-bg">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-axim-text-primary">
                  Features
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-power-purple">
                  Student
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-power-green">
                  Basic
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axim-border">
              {comparisonData.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  className="hover:bg-axim-bg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-axim-text-primary">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {renderCell(row.student)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {renderCell(row.basic)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-axim-bg px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link to="/order/student">
              <motion.button
                className="w-full bg-power-purple hover:bg-opacity-90 text-axim-text-primary py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Student
              </motion.button>
            </Link>
            <Link to="/order/basic">
              <motion.button
                className="w-full bg-power-green hover:bg-opacity-90 text-axim-bg py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Basic
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ComparisonPage;