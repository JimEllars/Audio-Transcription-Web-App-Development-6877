import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { trackEvent } from './lib/supabase';

// Initialize when DOM is ready
function initApp() {
  // Find all widget containers
  const containers = document.querySelectorAll('.axim-transcription-widget');
  
  containers.forEach((container, index) => {
    const plan = container.dataset.plan || 'basic';
    const theme = container.dataset.theme || 'dark';
    const version = container.dataset.version || '1.2.0';
    
    // Create root for each instance
    const root = createRoot(container);
    
    root.render(
      <React.StrictMode>
        <App 
          defaultPlan={plan}
          theme={theme}
          version={version}
          containerId={container.id}
          instanceId={index}
        />
      </React.StrictMode>
    );

    // Track widget initialization
    trackEvent('widget_initialized', {
      plan,
      theme,
      version,
      containerId: container.id,
      instanceId: index
    });
  });

  // Track page view
  trackEvent('widget_view', {
    page: window.location.href,
    widgetCount: containers.length,
    version: window.aximAppData?.version || '1.2.0'
  });
}

// Check if the DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Also initialize when WordPress loads widgets dynamically
if (window.jQuery) {
  window.jQuery(document).ready(initApp);
}