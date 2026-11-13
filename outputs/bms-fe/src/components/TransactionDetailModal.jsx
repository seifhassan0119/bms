import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!transaction) return null;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const fromAcc = transaction.from_account_id ? accountMap.get(transaction.from_account_id) : null;
  const toAcc = transaction.to_account_id ? accountMap.get(transaction.to_account_id) : null;

  const isDeposit = transaction.type === 'deposit';
  const isWithdrawal = transaction.type === 'withdrawal';
  const isTransfer = transaction.type === 'transfer';
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
    const text = `ApexCore Bank Transaction #${transaction.id}
Type: ${transaction.type.toUpperCase()}
Amount: ${formatCents(transaction.amount_cents)}
Status: ${transaction.status.toUpperCase()}
Date: ${formatDate(transaction.created_at)}
${fromAcc ? `From: ${fromAcc.customer_name} (${fromAcc.account_number})` : ''}
${toAcc ? `To: ${toAcc.customer_name} (${toAcc.account_number})` : ''}
Note: ${transaction.note || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onToast) onToast('Copied', 'Transaction receipt copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-receipt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Receipt Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-850 text-center relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction receipt"
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>

          <div
            aria-hidden="true"
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
              isDeposit
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isWithdrawal
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            }`}
          >
            {isDeposit && <ArrowDownLeft className="w-6 h-6" />}
            {isWithdrawal && <ArrowUpRight className="w-6 h-6" />}
            {isTransfer && <ArrowRightLeft className="w-6 h-6" />}
          </div>

          <div className="mt-3">
            <span id="modal-receipt-title" className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
              Transaction Receipt
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {isWithdrawal ? '-' : isDeposit ? '+' : ''}
              {formatCents(transaction.amount_cents)}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Ref ID #{transaction.id} &bull; {transaction.amount_cents.toLocaleString()} cents
            </p>
          </div>

          <div className="mt-2.5 flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusTheme.bg}`}
            >
              <span aria-hidden="true" className={`w-2 h-2 rounded-full ${statusTheme.dot}`} />
              {transaction.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Receipt Body Rows */}
        <div className="p-4 sm:p-6 space-y-3 text-xs overflow-y-auto flex-1">
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400 font-medium">Operation</span>
            <span className="font-bold text-slate-200 capitalize">{transaction.type}</span>
          </div>

          {transaction.from_account_id && (
            <div className="flex items-center justify-between py-2 border-b border-slate-800 gap-2">
              <span className="text-slate-400 font-medium shrink-0">From (Source)</span>
              <div className="text-right truncate">
                <span className="font-bold text-slate-200 block truncate">
                  {fromAcc ? fromAcc.customer_name : `ID #${transaction.from_account_id}`}
                </span>
                {fromAcc && (
                  <span className="block font-mono text-[10px] text-slate-400">
                    {fromAcc.account_number}
                  </span>
                )}
              </div>
            </div>
          )}

          {transaction.to_account_id && (
            <div className="flex items-center justify-between py-2 border-b border-slate-800 gap-2">
              <span className="text-slate-400 font-medium shrink-0">To (Destination)</span>
              <div className="text-right truncate">
                <span className="font-bold text-slate-200 block truncate">
                  {toAcc ? toAcc.customer_name : `ID #${transaction.to_account_id}`}
                </span>
                {toAcc && (
                  <span className="block font-mono text-[10px] text-slate-400">
                    {toAcc.account_number}
                  </span>
                )}
              </div>
            </div>
          )}

          {transaction.note && (
            <div className="flex items-center justify-between py-2 border-b border-slate-800 gap-2">
              <span className="text-slate-400 font-medium shrink-0">Memo / Note</span>
              <span className="text-slate-200 italic font-medium truncate text-right">{transaction.note}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400 font-medium">Submission Time</span>
            <span className="text-slate-300 font-mono text-[11px]">{formatDate(transaction.created_at)}</span>
          </div>

          {transaction.reviewed_at && (
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Reviewed Time</span>
              <span className="text-slate-300 font-mono text-[11px]">{formatDate(transaction.reviewed_at)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-col gap-2 shrink-0">
          {/* If Pending and user has authority, Show Approve/Reject */}
          {isPending && canReview && (
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => handleDecision('approve')}
                disabled={!!reviewing}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                <CheckCircle2 aria-hidden="true" className={`w-3.5 h-3.5 ${reviewing === 'approve' ? 'animate-spin' : ''}`} />
                <span>Authorize & Execute</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('reject')}
                disabled={!!reviewing}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 active:scale-98 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
              >
                <XCircle aria-hidden="true" className={`w-3.5 h-3.5 ${reviewing === 'reject' ? 'animate-spin' : ''}`} />
                <span>Reject</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
            >
              {copied ? <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" /> : <Copy aria-hidden="true" className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Receipt' : 'Copy Receipt'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
