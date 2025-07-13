import React from 'react'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiRefreshCw } = FiIcons

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-axim-bg flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-axim-panel rounded-2xl shadow-lg p-8 text-center border border-axim-border">
            <SafeIcon icon={FiAlertTriangle} className="text-power-red text-4xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-axim-text-primary mb-4">
              Something went wrong
            </h2>
            <p className="text-axim-text-secondary mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span>Refresh Page</span>
            </button>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-axim-text-secondary hover:text-axim-text-primary">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-axim-bg p-3 rounded overflow-auto text-axim-text-secondary">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary