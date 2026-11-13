import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, ShieldAlert, CheckCircle2, PiggyBank, Briefcase } from 'lucide-react';
import { api } from '../api/client';

export default function NewAccountModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ customer_name: '', email: '', phone: '', account_type: 'savings' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.customer_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createAccountRequest({
        customer_name: formData.customer_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        account_type: formData.account_type,
      });
      setSuccessResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to submit account application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Apply for Customer Account</h2>
              <p className="text-[11px] text-slate-400">Submits application to manager pending queue</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
              <p className="text-xs text-slate-300 mt-1">Request ID: <span className="font-mono text-emerald-400 font-bold">#{successResult.request_id}</span>.</p>
              <p className="text-xs text-slate-400 mt-1">Review and approve it directly on your dashboard.</p>
            </div>
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5">
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Customer Full Name *</label>
              <input
                ref={firstInputRef}
                required
                placeholder="e.g. Maya Chen"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. maya@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 01012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>

            {/* Plan selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, account_type: 'savings' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  formData.account_type === 'savings' ? 'bg-emerald-500/15 border-emerald-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5"><PiggyBank className="w-4 h-4 text-emerald-400" /><span className="font-bold text-xs text-white">Savings</span></div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, account_type: 'current' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  formData.account_type === 'current' ? 'bg-emerald-500/15 border-emerald-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-emerald-400" /><span className="font-bold text-xs text-white">Current</span></div>
              </button>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
