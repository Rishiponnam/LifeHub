import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to indicate an error has occurred
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details (optional)
    console.error('Error occurred:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any fallback UI here
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong. Please try again later.</h1>
          {/* Optionally, you can log the error to an error tracking service */}
        </div>
      );
    }

    // If no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;