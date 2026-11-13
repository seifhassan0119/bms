import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, ShieldAlert, CheckCircle2, PiggyBank, Briefcase } from 'lucide-react';
import { api } from '../api/client';

export default function NewAccountModal({ onClose, onSuccess, onNavigateToReviews }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    account_type: 'savings',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const firstInputRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Autofocus first input
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Name, email, and phone are required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError('Enter a valid email address (e.g. name@example.com).');
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
      setError(err.message || 'Failed to submit account request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 id="new-account-modal-title" className="text-sm sm:text-base font-bold text-white">Apply for a New Bank Account</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Submits customer application to review queue</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account application dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successResult ? (
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div aria-hidden="true" className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your request ID is <span className="font-mono font-bold text-emerald-400">#{successResult.request_id}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                As per banking security protocol, new accounts remain pending until reviewed and approved by an authorized manager.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToReviews) onNavigateToReviews('accounts');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-md shadow-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                Go to Review Queue &rarr;
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2"
              >
                <ShieldAlert aria-hidden="true" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Full Name */}
            <div>
              <label htmlFor="new-customer-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Customer Full Name <span aria-hidden="true" className="text-emerald-400">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="new-customer-name"
                name="customer_name"
                type="text"
                required
                placeholder="e.g. Asha Khan"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="new-customer-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address <span aria-hidden="true" className="text-emerald-400">*</span>
              </label>
              <input
                id="new-customer-email"
                name="email"
                type="email"
                required
                placeholder="e.g. asha@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="new-customer-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number <span aria-hidden="true" className="text-emerald-400">*</span>
              </label>
              <input
                id="new-customer-phone"
                name="phone"
                type="tel"
                required
                placeholder="e.g. 01012345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
              />
            </div>

            {/* Account Type Selection */}
            <fieldset>
              <legend className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Account Plan <span aria-hidden="true" className="text-emerald-400">*</span>
              </legend>
              <div role="radiogroup" aria-label="Account Plan" className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked={formData.account_type === 'savings'}
                  onClick={() => setFormData({ ...formData, account_type: 'savings' })}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    formData.account_type === 'savings'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PiggyBank aria-hidden="true" className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-slate-100">Savings</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Personal savings account with zero maintenance.
                  </p>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={formData.account_type === 'current'}
                  onClick={() => setFormData({ ...formData, account_type: 'current' })}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    formData.account_type === 'current'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase aria-hidden="true" className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-slate-100">Current</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Checking account suited for frequent transactions.
                  </p>
                </button>
              </div>
            </fieldset>

            {/* Actions */}
            <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 sm:gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
