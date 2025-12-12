import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Global error handling for React component tree
 * Catches errors in child components and displays fallback UI
 * Logs errors to console and optionally to Sentry in production
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service in production (Sentry, etc)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo correu mal
            </h1>
            <p className="text-gray-600 mb-4">
              Desculpa! Ocorreu um erro inesperado. Tenta novamente ou contacta o suporte.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 p-4 rounded border border-gray-200">
                <summary className="cursor-pointer font-mono text-sm text-red-600 font-semibold">
                  Detalhes do Erro (Dev Only)
                </summary>
                <pre className="mt-2 text-xs overflow-auto bg-gray-900 text-gray-100 p-3 rounded font-mono max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-acredita-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-acredita-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Ir para Home
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Código do erro: {this.state.error?.name || 'UNKNOWN'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
