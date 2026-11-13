import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatCents } from '../utils/formatters';

export default function NewTransactionModal({
  accounts = [],
  preselectedAccount = null,
  preselectedType = 'deposit',
  onClose,
  onSuccess,
  onNavigateToReviews,
}) {
  const [type, setType] = useState(preselectedType || 'deposit');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const amountInputRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Autofocus amount on mount or preset
  useEffect(() => {
    if (preselectedAccount?.id) {
      if (type === 'deposit') {
        setToAccountId(String(preselectedAccount.id));
      } else if (type === 'withdrawal' || type === 'transfer') {
        setFromAccountId(String(preselectedAccount.id));
      }
    }
    amountInputRef.current?.focus();
  }, [preselectedAccount, type]);

  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const fromAccount = activeAccounts.find((a) => String(a.id) === String(fromAccountId));
  const toAccount = activeAccounts.find((a) => String(a.id) === String(toAccountId));

  // Compute cents
  const amountNumber = parseFloat(amount);
  const amountCents = !isNaN(amountNumber) && amountNumber > 0 ? Math.round(amountNumber * 100) : 0;

  // Real-time overdraft check
  const isOverdraft =
    (type === 'withdrawal' || type === 'transfer') &&
    fromAccount &&
    amountCents > fromAccount.balance_cents;

  const isSameAccount = type === 'transfer' && fromAccountId && fromAccountId === toAccountId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      setError('Amount must be a positive number with up to two decimal places.');
      return;
    }

    if ((type === 'withdrawal' || type === 'transfer') && !fromAccountId) {
      setError('Please select a source account.');
      return;
    }

    if ((type === 'deposit' || type === 'transfer') && !toAccountId) {
      setError('Please select a destination account.');
      return;
    }

    if (isSameAccount) {
      setError('Cannot transfer money to the same account.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        type,
        amount_cents: amountCents,
        from_account_id: (type === 'withdrawal' || type === 'transfer') ? Number(fromAccountId) : null,
        to_account_id: (type === 'deposit' || type === 'transfer') ? Number(toAccountId) : null,
        note: note.trim() || undefined,
      };

      const res = await api.createTransactionRequest(payload);
      setSuccessResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to submit transaction request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-transaction-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 id="new-transaction-modal-title" className="text-sm sm:text-base font-bold text-white">Create Money Request</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Deposit, withdraw, or transfer funds</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction request dialog"
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
              <h3 className="text-lg font-bold text-white">Transaction Request Created!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Transaction ID <span className="font-mono font-bold text-emerald-400">#{successResult.transaction_id}</span> is currently pending.
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Atomic balances will be updated immediately once authorized by a branch manager.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToReviews) onNavigateToReviews('transactions');
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

            {/* Type Tabs: Deposit / Withdrawal / Transfer */}
            <fieldset>
              <legend className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Operation Type <span aria-hidden="true" className="text-emerald-400">*</span>
              </legend>
              <div role="radiogroup" aria-label="Operation Type" className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === 'deposit'}
                  onClick={() => setType('deposit')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px] ${
                    type === 'deposit'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownLeft aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={type === 'withdrawal'}
                  onClick={() => setType('withdrawal')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px] ${
                    type === 'withdrawal'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                  <span>Withdraw</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={type === 'transfer'}
                  onClick={() => setType('transfer')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px] ${
                    type === 'transfer'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRightLeft aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                  <span>Transfer</span>
                </button>
              </div>
            </fieldset>

            {/* From Account Dropdown (Withdrawal / Transfer) */}
            {(type === 'withdrawal' || type === 'transfer') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tx-from-account" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Source Account (Debit) <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  {fromAccount && (
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      Balance: <strong className="text-white">{formatCents(fromAccount.balance_cents)}</strong>
                    </span>
                  )}
                </div>
                <select
                  id="tx-from-account"
                  name="from_account_id"
                  required
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-xs bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
                >
                  <option value="">Select source account...</option>
                  {activeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.customer_name} ({acc.account_number}) — {formatCents(acc.balance_cents)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* To Account Dropdown (Deposit / Transfer) */}
            {(type === 'deposit' || type === 'transfer') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tx-to-account" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Destination Account (Credit) <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  {toAccount && (
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      Balance: <strong className="text-white">{formatCents(toAccount.balance_cents)}</strong>
                    </span>
                  )}
                </div>
                <select
                  id="tx-to-account"
                  name="to_account_id"
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-xs bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
                >
                  <option value="">Select destination account...</option>
                  {activeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={type === 'transfer' && String(acc.id) === String(fromAccountId)}>
                      {acc.customer_name} ({acc.account_number}) — {formatCents(acc.balance_cents)}
                      {type === 'transfer' && String(acc.id) === String(fromAccountId) ? ' (Source)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Amount (USD) <span aria-hidden="true" className="text-emerald-400">*</span>
                </label>
                {amountCents > 0 && (
                  <span className="text-[11px] font-mono text-emerald-400">
                    = {amountCents.toLocaleString()} cents
                  </span>
                )}
              </div>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  $
                </span>
                <input
                  ref={amountInputRef}
                  id="tx-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-base sm:text-sm font-mono font-bold bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
                />
              </div>

              {/* Overdraft Warning Banner */}
              {isOverdraft && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mt-2 p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-[11px] text-amber-200 flex items-start gap-1.5"
                >
                  <AlertTriangle aria-hidden="true" className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Warning: Amount exceeds source balance ({formatCents(fromAccount.balance_cents)}).
                    System checks will reject this request upon manager review.
                  </span>
                </div>
              )}

              {/* Same Account Warning */}
              {isSameAccount && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mt-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-[11px] text-rose-200 flex items-start gap-1.5"
                >
                  <AlertTriangle aria-hidden="true" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>An account cannot transfer money to itself.</span>
                </div>
              )}
            </div>

            {/* Note / Memo */}
            <div>
              <label htmlFor="tx-note" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Note / Memo (Optional)
              </label>
              <input
                id="tx-note"
                name="note"
                type="text"
                placeholder="e.g. Counter deposit, Vendor invoice"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
              />
            </div>

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
                disabled={submitting || isSameAccount}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
