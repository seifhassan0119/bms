import React, { useState } from 'react';
import {
  CheckSquare,
  Users,
  Receipt,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { formatCents, formatDate, getAccountTypeLabel, getStatusColor } from '../utils/formatters';

export default function ReviewQueue({
  accountRequests = [],
  transactionRequests = [],
  accounts = [],
  loading,
  onRefresh,
  onReviewAccount,
  onReviewTransaction,
  onSelectAccount,
  admin,
  initialTab = 'accounts',
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);

  const filteredAccountRequests = accountRequests.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const filteredTransactionRequests = transactionRequests.filter((tx) => {
    if (statusFilter === 'all') return true;
    return tx.status === statusFilter;
  });

  const pendingAccountsCount = accountRequests.filter((r) => r.status === 'pending').length;
  const pendingTransactionsCount = transactionRequests.filter((t) => t.status === 'pending').length;

  const handleAccountDecision = async (id, decision) => {
    try {
      setReviewingId(`acc-${id}-${decision}`);
      await onReviewAccount(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  const handleTransactionDecision = async (id, decision) => {
    try {
      setReviewingId(`tx-${id}-${decision}`);
      await onReviewTransaction(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-slate-850/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <CheckSquare aria-hidden="true" className="w-5 h-5 text-emerald-400" />
              Review Queue & Authorization
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Clearance Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate, approve, or reject pending account applications and monetary transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh review queue"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px] w-full sm:w-auto"
          >
            <RefreshCw aria-hidden="true" className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Main Section Tabs: Accounts vs Transactions */}
        <div role="tablist" aria-label="Review Categories" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'accounts'}
            onClick={() => setActiveSubTab('accounts')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px] ${
              activeSubTab === 'accounts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users aria-hidden="true" className="w-4 h-4" />
            <span>Accounts</span>
            {pendingAccountsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-slate-950 font-black">
                <span className="sr-only">({pendingAccountsCount} pending)</span>
                <span aria-hidden="true">{pendingAccountsCount}</span>
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'transactions'}
            onClick={() => setActiveSubTab('transactions')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px] ${
              activeSubTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt aria-hidden="true" className="w-4 h-4" />
            <span>Money Requests</span>
            {pendingTransactionsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-slate-950 font-black">
                <span className="sr-only">({pendingTransactionsCount} pending)</span>
                <span aria-hidden="true">{pendingTransactionsCount}</span>
              </span>
            )}
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div role="group" aria-label="Filter by approval status" className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800 overflow-x-auto self-start sm:self-auto">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              type="button"
              aria-pressed={statusFilter === st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[32px] ${
                statusFilter === st
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Account Requests Tab Content */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-3">
          <div role="status" aria-live="polite" className="sr-only">
            {filteredAccountRequests.length} account requests shown for status {statusFilter}
          </div>

          {filteredAccountRequests.length === 0 ? (
            <div className="p-8 sm:p-10 text-center rounded-3xl bg-slate-800/30 border border-dashed border-slate-800">
              <Users aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h2 className="text-sm font-bold text-slate-200">No account requests found</h2>
              <p className="text-xs text-slate-400 mt-1">
                {statusFilter === 'pending'
                  ? 'There are no pending customer account applications awaiting review.'
                  : `No account requests matching status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredAccountRequests.map((req) => {
                const isPending = req.status === 'pending';
                const statusTheme = getStatusColor(req.status);
                const isApproving = reviewingId === `acc-${req.id}-approve`;
                const isRejecting = reviewingId === `acc-${req.id}-reject`;

                return (
                  <div
                    key={req.id}
                    className={`flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-slate-850/80 border transition-all ${
                      isPending
                        ? 'border-slate-750 hover:border-emerald-500/50 shadow-md'
                        : 'border-slate-800/80 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Top row: Type & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                          {getAccountTypeLabel(req.account_type)} Request
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                        >
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                          {req.status}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="mt-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">{req.customer_name}</h3>
                          <span className="text-xs font-mono text-slate-400 shrink-0">App #{req.id}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-300">
                          <p className="truncate">
                            <span className="text-slate-400 font-semibold">Email:</span> {req.email}
                          </p>
                          <p className="truncate">
                            <span className="text-slate-400 font-semibold">Phone:</span> {req.phone}
                          </p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                        <span>Submitted: {formatDate(req.created_at)}</span>
                        {req.reviewed_at && <span>Reviewed: {formatDate(req.reviewed_at)}</span>}
                      </div>

                      {/* If approved, show linked account */}
                      {req.account_id && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                          <span>Account ID: #{req.account_id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const acc = accountMap.get(req.account_id);
                              if (acc) onSelectAccount(acc);
                            }}
                            className="font-bold underline flex items-center gap-1 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                          >
                            <span>Inspect</span>
                            <ExternalLink aria-hidden="true" className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions for Pending */}
                    {isPending && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccountDecision(req.id, 'approve')}
                          disabled={!!reviewingId}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
                        >
                          <CheckCircle2 aria-hidden="true" className={`w-3.5 h-3.5 ${isApproving ? 'animate-spin' : ''}`} />
                          <span>Approve & Open</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAccountDecision(req.id, 'reject')}
                          disabled={!!reviewingId}
                          className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 active:scale-98 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
                        >
                          <XCircle aria-hidden="true" className={`w-3.5 h-3.5 ${isRejecting ? 'animate-spin' : ''}`} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Transaction Requests Tab Content */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-3">
          <div role="status" aria-live="polite" className="sr-only">
            {filteredTransactionRequests.length} money requests shown for status {statusFilter}
          </div>

          {filteredTransactionRequests.length === 0 ? (
            <div className="p-8 sm:p-10 text-center rounded-3xl bg-slate-800/30 border border-dashed border-slate-800">
              <Receipt aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h2 className="text-sm font-bold text-slate-200">No money requests found</h2>
              <p className="text-xs text-slate-400 mt-1">
                {statusFilter === 'pending'
                  ? 'There are no pending deposits, withdrawals, or transfers awaiting manager clearance.'
                  : `No transactions matching status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredTransactionRequests.map((tx) => {
                const isPending = tx.status === 'pending';
                const statusTheme = getStatusColor(tx.status);
                const isDeposit = tx.type === 'deposit';
                const isWithdrawal = tx.type === 'withdrawal';
                const isTransfer = tx.type === 'transfer';

                const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
                const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;

                const hasSufficientFunds =
                  !fromAcc || fromAcc.balance_cents >= tx.amount_cents;

                const isApproving = reviewingId === `tx-${tx.id}-approve`;
                const isRejecting = reviewingId === `tx-${tx.id}-reject`;

                return (
                  <div
                    key={tx.id}
                    className={`flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-slate-850/80 border transition-all ${
                      isPending
                        ? 'border-slate-750 hover:border-emerald-500/50 shadow-md'
                        : 'border-slate-800/80 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isDeposit
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : isWithdrawal
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {isDeposit && <ArrowDownLeft className="w-3.5 h-3.5" />}
                            {isWithdrawal && <ArrowUpRight className="w-3.5 h-3.5" />}
                            {isTransfer && <ArrowRightLeft className="w-3.5 h-3.5" />}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            {tx.type} #{tx.id}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                        >
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                          {tx.status}
                        </span>
                      </div>

                      {/* Amount Hero */}
                      <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          Requested Amount
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-white font-mono">
                          {formatCents(tx.amount_cents)}
                        </div>
                      </div>

                      {/* Account Route Flow */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                        {tx.from_account_id && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 shrink-0">Debit (From):</span>
                            <span className="font-semibold text-slate-200 truncate text-right">
                              {fromAcc ? `${fromAcc.customer_name} (${fromAcc.account_number})` : `ID: ${tx.from_account_id}`}
                            </span>
                          </div>
                        )}

                        {tx.to_account_id && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400 shrink-0">Credit (To):</span>
                            <span className="font-semibold text-slate-200 truncate text-right">
                              {toAcc ? `${toAcc.customer_name} (${toAcc.account_number})` : `ID: ${tx.to_account_id}`}
                            </span>
                          </div>
                        )}

                        {/* Balance Pre-check warning */}
                        {isPending && fromAcc && (
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Current Balance:</span>
                            <span
                              className={`font-mono font-bold ${
                                hasSufficientFunds ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {formatCents(fromAcc.balance_cents)}
                              {!hasSufficientFunds && ' (Insufficient!)'}
                            </span>
                          </div>
                        )}
                      </div>

                      {tx.note && (
                        <p className="mt-2 text-xs italic text-slate-300 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
                          Note: "{tx.note}"
                        </p>
                      )}

                      {/* Timestamps */}
                      <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-1">
                        <span>Submitted: {formatDate(tx.created_at)}</span>
                        {tx.reviewed_at && <span>Reviewed: {formatDate(tx.reviewed_at)}</span>}
                      </div>
                    </div>

                    {/* Pending Decision Buttons */}
                    {isPending && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTransactionDecision(tx.id, 'approve')}
                          disabled={!!reviewingId}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
                        >
                          <CheckCircle2 aria-hidden="true" className={`w-3.5 h-3.5 ${isApproving ? 'animate-spin' : ''}`} />
                          <span>Authorize</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTransactionDecision(tx.id, 'reject')}
                          disabled={!!reviewingId}
                          className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 active:scale-98 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[40px]"
                        >
                          <XCircle aria-hidden="true" className={`w-3.5 h-3.5 ${isRejecting ? 'animate-spin' : ''}`} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
