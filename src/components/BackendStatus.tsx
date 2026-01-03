import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Loader } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setStatus(data.status === 'ok' ? 'online' : 'offline');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('offline');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all ${
          status === 'online'
            ? 'bg-green-100 border-green-300 text-green-800'
            : status === 'offline'
            ? 'bg-red-100 border-red-300 text-red-800'
            : 'bg-gray-100 border-gray-300 text-gray-800'
        }`}
      >
        {status === 'checking' && <Loader className="w-4 h-4 animate-spin" />}
        {status === 'online' && <CheckCircle className="w-4 h-4" />}
        {status === 'offline' && <XCircle className="w-4 h-4" />}
        <span className="text-sm">
          Backend {status === 'checking' ? 'Checking' : status === 'online' ? 'Online' : 'Offline'}
        </span>
      </button>

      {/* Expanded Info */}
      {expanded && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Backend Status
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${
                status === 'online' ? 'text-green-600' : 
                status === 'offline' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Project ID</span>
              <span className="font-mono text-xs">{projectId.slice(0, 8)}...</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">API Base</span>
              <span className="font-mono text-xs">make-server-d45a5820</span>
            </div>

            <div className="pt-2">
              <button
                onClick={checkBackend}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh Status
              </button>
            </div>

            {status === 'offline' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                  <strong>Backend Offline</strong><br />
                  The backend server is not responding. Check your Supabase configuration.
                </p>
              </div>
            )}

            {status === 'online' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>Backend Online</strong><br />
                  All systems operational.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
