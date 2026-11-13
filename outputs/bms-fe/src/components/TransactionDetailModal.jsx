import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { formatCents, formatDate, getStatusColor } from '../utils/formatters';

export default function TransactionDetailModal({
  transaction,
  accounts = [],
  onClose,
  onReviewTransaction,
  canReview = false,
  onToast,
}) {
  const [reviewing, setReviewing] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!transaction) return null;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const targetAcc = accountMap.get(transaction.to_account_id || transaction.from_account_id);
  const isDeposit = transaction.type === 'deposit';
  const isPending = transaction.status === 'pending';
  const statusTheme = getStatusColor(transaction.status);

  const handleDecision = async (decision) => {
    if (!onReviewTransaction) return;
    try {
      setReviewing(decision);
      await onReviewTransaction(transaction.id, decision);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(null);
    }
  };

  const handleCopyReceipt = () => {
    const text = `AxiomBank Transaction #${transaction.id}\nType: ${transaction.type.toUpperCase()}\nAmount: ${formatCents(transaction.amount_cents)}\nStatus: ${transaction.status.toUpperCase()}\nDate: ${formatDate(transaction.created_at)}\nAccount: ${targetAcc ? `${targetAcc.customer_name} (${targetAcc.account_number})` : 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) onToast('Copied', 'Transaction receipt copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Receipt Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-850 text-center relative shrink-0">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
            isDeposit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isDeposit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
          </div>
          <div className="mt-3">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">Transaction Receipt</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {isDeposit ? '+' : '-'}{formatCents(transaction.amount_cents)}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">Ref ID #{transaction.id}</p>
          </div>
          <div className="mt-2.5 flex justify-center">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusTheme.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusTheme.dot}`} />
              {transaction.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-4 sm:p-6 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Operation</span>
            <span className="font-bold text-slate-200 capitalize">{transaction.type}</span>
          </div>
          {targetAcc && (
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">{isDeposit ? 'Destination' : 'Source'}</span>
              <span className="font-bold text-slate-200">{targetAcc.customer_name} ({targetAcc.account_number})</span>
            </div>
          )}
          {transaction.note && (
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Note</span>
              <span className="text-slate-200 italic">{transaction.note}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
            <span className="text-slate-400">Date</span>
            <span className="text-slate-300 font-mono text-[11px]">{formatDate(transaction.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col gap-2">
          {isPending && canReview && (
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => handleDecision('approve')}
                disabled={!!reviewing}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 min-h-[38px]"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${reviewing === 'approve' ? 'animate-spin' : ''}`} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => handleDecision('reject')}
                disabled={!!reviewing}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 disabled:opacity-50 min-h-[38px]"
              >
                <XCircle className={`w-3.5 h-3.5 ${reviewing === 'reject' ? 'animate-spin' : ''}`} />
                <span>Reject</span>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center gap-1.5 transition-colors min-h-[36px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Receipt'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors min-h-[36px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
