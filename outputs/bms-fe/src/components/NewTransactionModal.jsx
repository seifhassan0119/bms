import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../api/client';
import { formatCents } from '../utils/formatters';

export default function NewTransactionModal({ accounts = [], preselectedAccount = null, preselectedType = 'deposit', onClose, onSuccess }) {
  const [type, setType] = useState(preselectedType === 'withdrawal' ? 'withdrawal' : 'deposit');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const amountRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (preselectedAccount?.id) setAccountId(String(preselectedAccount.id));
    amountRef.current?.focus();
  }, [preselectedAccount]);

  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const selectedAcc = activeAccounts.find((a) => String(a.id) === String(accountId));
  const amountNum = parseFloat(amount);
  const amountCents = !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : 0;
  const isOverdraft = type === 'withdrawal' && selectedAcc && amountCents > selectedAcc.balance_cents;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number with up to two decimal places.');
      return;
    }
    if (!accountId) {
      setError(`Please select an account for ${type}.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createTransactionRequest({
        type,
        amount: String(amount).trim(),
        amount_cents: amountCents,
        from_account_id: type === 'withdrawal' ? Number(accountId) : null,
        to_account_id: type === 'deposit' ? Number(accountId) : null,
        note: note.trim() || undefined,
      });
      setSuccessResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">New Money Request</h2>
              <p className="text-[11px] text-slate-400">Initiate a deposit or withdrawal</p>
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
              <h3 className="text-lg font-bold text-white">Money Request Created!</h3>
              <p className="text-xs text-slate-300 mt-1">Ref ID <span className="font-mono text-emerald-400 font-bold">#{successResult.transaction_id}</span>.</p>
              <p className="text-xs text-slate-400 mt-1">Pending approval on your dashboard.</p>
            </div>
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'deposit' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>
              <button
                type="button"
                onClick={() => setType('withdrawal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  type === 'withdrawal' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdrawal</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{type === 'deposit' ? 'Destination Account' : 'Source Account'}</label>
                {selectedAcc && <span className="text-[11px] font-mono text-slate-400">Balance: <strong className="text-white">{formatCents(selectedAcc.balance_cents)}</strong></span>}
              </div>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              >
                <option value="">Select account...</option>
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.customer_name} ({acc.account_number}) — {formatCents(acc.balance_cents)}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Amount (USD)</label>
                {amountCents > 0 && <span className="text-[11px] font-mono text-emerald-400">= {amountCents.toLocaleString()} cents</span>}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm font-mono font-bold bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                />
              </div>
              {isOverdraft && (
                <div className="mt-1.5 p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Amount exceeds available balance ({formatCents(selectedAcc.balance_cents)}).</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Counter deposit, Cash withdrawal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
