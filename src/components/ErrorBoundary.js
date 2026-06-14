'use client';
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#111', color: '#ff4444', height: '100vh', overflow: 'auto', fontFamily: 'monospace' }}>
          <h2>Aplikasi Crash 😭</h2>
          <p>Tolong screenshot layar ini dan kirimkan ke developer:</p>
          <hr />
          <p><strong>Error:</strong> {this.state.error?.toString()}</p>
          <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap', color: '#aaa' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', marginTop: '20px' }}>
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
