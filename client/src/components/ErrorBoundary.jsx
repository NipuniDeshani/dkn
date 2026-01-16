import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
                        <p className="text-slate-600 mb-6">
                            We encountered an unexpected error while loading this page.
                        </p>
                        <div className="bg-slate-100 p-4 rounded text-left mb-6 overflow-auto max-h-40 text-xs font-mono text-slate-700">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
