import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize when DOM is ready
function initApp() {
  const container = document.getElementById('axim-app');
  if (container) {
    const root = createRoot(container);
    const plan = container.dataset.plan || 'basic';
    
    root.render(
      <React.StrictMode>
        <App defaultPlan={plan} />
      </React.StrictMode>
    );
  }
}

// Check if the DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}