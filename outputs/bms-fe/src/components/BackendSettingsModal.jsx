import React, { useState } from 'react';
import { X, Server, Activity, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { api, setBaseUrl } from '../api/client';

export default function BackendSettingsModal({ onClose, onToast, onStatusChange }) {
  const currentBase = localStorage.getItem('BANK_API_BASE_URL') || '';
  const [customUrl, setCustomUrl] = useState(currentBase);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await api.checkHealth();
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        message: 'Backend server is healthy and responding.',
        latency,
        data: res,
      });
      if (onStatusChange) onStatusChange(true, latency);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Could not reach backend API server.',
        latency: null,
      });
      if (onStatusChange) onStatusChange(false, null);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setBaseUrl(customUrl);
    if (onToast) onToast('Settings Saved', 'API base URL updated.');
    onClose();
  };

  const handleReset = () => {
    setCustomUrl('');
    setBaseUrl('');
    if (onToast) onToast('Reset', 'API Base URL reset to default Vite proxy (/api).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Backend Connection</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Node.js Express + SQLite API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close backend settings dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              API Base URL
            </label>
            <input
              type="text"
              placeholder="Leave blank for relative proxy (/api)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-xs font-mono bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              By default, requests to <code className="text-emerald-400">/api/*</code> are forwarded to the configured backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex-1 min-w-[140px] py-2 px-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[38px]"
            >
              <Activity className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing Ping...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors min-h-[38px]"
            >
              Reset
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{testResult.success ? 'Connected' : 'Connection Failed'}</span>
                {testResult.latency !== null && (
                  <span className="font-mono text-[10px] text-slate-400 ml-auto">
                    {testResult.latency}ms latency
                  </span>
                )}
              </div>
              <p>{testResult.message}</p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deployment Reference</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              When deployed, frontend can route requests directly to relative paths (<code className="text-emerald-400 font-mono">/api</code>) or to an external API base URL.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 shrink-0 flex items-center justify-end gap-2 bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors min-h-[38px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all min-h-[38px]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
