import React, { useState } from 'react';
import { Clock, CheckCircle2, UserPlus, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { formatCents, formatDate } from '../utils/formatters';

export default function PendingRequests({
  accountRequests = [],
  transactionRequests = [],
  accounts = [],
  onReviewAccount,
  onReviewTransaction,
}) {
  const [reviewingId, setReviewingId] = useState(null);

  const pendingAccounts = (accountRequests || []).filter((r) => r && r.status === 'pending');
  const pendingTransactions = (transactionRequests || []).filter((t) => t && t.status === 'pending');
  const totalPending = pendingAccounts.length + pendingTransactions.length;

  const handleAccountDecision = async (id, decision) => {
    try {
      setReviewingId(`acc-${id}-${decision}`);
      if (onReviewAccount) await onReviewAccount(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  const handleTransactionDecision = async (id, decision) => {
    try {
      setReviewingId(`tx-${id}-${decision}`);
      if (onReviewTransaction) await onReviewTransaction(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-850 border border-slate-800 overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Pending Requests</h2>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                totalPending > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {totalPending}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Review and authorize customer requests and money operations.</p>
          </div>
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
          <p className="font-semibold text-slate-300">All requests are settled</p>
          <p className="text-[11px] text-slate-500">New customer applications and monetary requests will appear here for approval.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {/* Account Applications */}
          {pendingAccounts.map((req) => (
            <div key={`acc-req-${req.id}`} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{req.customer_name}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {req.account_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>{req.email}</span>
                    <span>&bull;</span>
                    <span>{req.phone}</span>
                    <span>&bull;</span>
                    <span>{formatDate(req.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  disabled={reviewingId === `acc-${req.id}-reject`}
                  onClick={() => handleAccountDecision(req.id, 'reject')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-colors disabled:opacity-50 min-h-[32px]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={reviewingId === `acc-${req.id}-approve`}
                  onClick={() => handleAccountDecision(req.id, 'approve')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 min-h-[32px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}

          {/* Transaction Requests (Deposit / Withdrawal only) */}
          {pendingTransactions.map((tx) => {
            const acc = accounts.find((a) => a.id === (tx.to_account_id || tx.from_account_id));
            const isDeposit = tx.type === 'deposit';

            return (
              <div key={`tx-req-${tx.id}`} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                    isDeposit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {tx.type}
                      </span>
                      <span className="font-mono font-bold text-white text-xs sm:text-sm">
                        {formatCents(tx.amount_cents)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                      {acc && <span>{acc.customer_name} ({acc.account_number})</span>}
                      {tx.note && <span>&bull; &ldquo;{tx.note}&rdquo;</span>}
                      <span>&bull;</span>
                      <span>{formatDate(tx.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    disabled={reviewingId === `tx-${tx.id}-reject`}
                    onClick={() => handleTransactionDecision(tx.id, 'reject')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-colors disabled:opacity-50 min-h-[32px]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={reviewingId === `tx-${tx.id}-approve`}
                    onClick={() => handleTransactionDecision(tx.id, 'approve')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 min-h-[32px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
