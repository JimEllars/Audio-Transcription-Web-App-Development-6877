import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Function to initialize the widget
function initTranscriptionWidget() {
  // Find all widget containers
  const widgetContainers = document.querySelectorAll('.axim-transcription-widget');
  
  widgetContainers.forEach(container => {
    const defaultPlan = container.dataset.defaultPlan || 'basic';
    
    // Create root for each instance
    const root = createRoot(container);
    root.render(
      <App 
        defaultPlan={defaultPlan} 
        containerId={container.id} 
      />
    );
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTranscriptionWidget);
} else {
  initTranscriptionWidget();
}