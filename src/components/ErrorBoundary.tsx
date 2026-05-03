import React from 'react';

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    try { window.location.reload(); } catch (e) { /* ignore */ }
  };

  render() {
    if (!this.state.hasError) return this.props.children as any;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 border rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-semibold text-red-600">Something went wrong</div>
          <div className="mt-3 text-sm text-gray-600">An unexpected error occurred while rendering this page.</div>
          <div className="mt-4 text-xs text-gray-500">{this.state.error?.message}</div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={this.handleRetry} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Reload</button>
            <a href={`mailto:support@findmed.example?subject=Admin%20Error&body=${encodeURIComponent(String(this.state.error))}`} className="px-4 py-2 border rounded text-sm">Report</a>
          </div>
        </div>
      </div>
    );
  }
}
