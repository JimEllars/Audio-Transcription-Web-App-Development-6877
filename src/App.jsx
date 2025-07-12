import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import PricingPage from './pages/PricingPage';
import OrderPage from './pages/OrderPage';
import PaymentPage from './pages/PaymentPage';
import UploadPage from './pages/UploadPage';
import SuccessPage from './pages/SuccessPage';
import ComparisonPage from './pages/ComparisonPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    <OrderProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <Header />
          <motion.main 
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<PricingPage />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/order/:plan" element={<OrderPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/success" element={<SuccessPage />} />
            </Routes>
          </motion.main>
          <Footer />
        </div>
      </Router>
    </OrderProvider>
  );
}

export default App;