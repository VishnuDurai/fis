import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught rendering error:', error, errorInfo);
  }

  handleReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('Cache purge on reload error:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#e11d48', fontSize: '1.4rem', marginBottom: '12px' }}>An error occurred while loading this view</h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {this.state.error?.message || 'Unexpected rendering error.'}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={this.handleReload}
            style={{ padding: '8px 20px', fontWeight: 600 }}
          >
            Reload Application Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
