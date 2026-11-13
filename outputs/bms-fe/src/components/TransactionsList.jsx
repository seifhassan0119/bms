import React, { useState } from 'react';
import {
  Receipt,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  RefreshCw,
  PlusCircle,
  Eye,
} from 'lucide-react';
import { formatCents, formatDate, getStatusColor } from '../utils/formatters';

export default function TransactionsList({
  transactions = [],
  accounts = [],
  loading,
  onRefresh,
  onSelectTransaction,
  onOpenNewTransaction,
}) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchAccount, setSearchAccount] = useState('');

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchAccount) {
      const q = searchAccount.toLowerCase();
      const matchId = String(tx.id).includes(q);
      const matchFrom = tx.from_account_id && String(tx.from_account_id).includes(q);
      const matchTo = tx.to_account_id && String(tx.to_account_id).includes(q);
      const matchNote = tx.note && tx.note.toLowerCase().includes(q);
      if (!matchId && !matchFrom && !matchTo && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor="tx-ledger-search" className="sr-only">
            Filter transactions by ID, account number, or memo
          </label>
          <Search aria-hidden="true" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="tx-ledger-search"
            name="search"
            type="search"
            value={searchAccount}
            onChange={(e) => setSearchAccount(e.target.value)}
            placeholder="Filter by Ref #, account ID, or memo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-base sm:text-sm bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[42px]"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
          {/* Type Filter */}
          <div className="flex-1 sm:flex-initial min-w-[110px]">
            <label htmlFor="tx-filter-type" className="sr-only">Filter by operation type</label>
            <select
              id="tx-filter-type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 sm:flex-initial min-w-[110px]">
            <label htmlFor="tx-filter-status" className="sr-only">Filter by approval status</label>
            <select
              id="tx-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh transaction ledger"
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <RefreshCw aria-hidden="true" className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/20 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px]"
            >
              <PlusCircle aria-hidden="true" className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visibility of System Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div role="status" aria-live="polite">
          Showing <span className="font-bold text-white">{filtered.length}</span> of {transactions.length} records
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-800/40 border border-dashed border-slate-700/80">
          <Receipt aria-hidden="true" className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">No ledger entries match criteria</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Try adjusting your search filters or submit a new money operation.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Cards */}
          <div className="block md:hidden space-y-3">
            {filtered.map((tx) => {
              const statusTheme = getStatusColor(tx.status);
              const isDeposit = tx.type === 'deposit';
              const isWithdrawal = tx.type === 'withdrawal';
              const isTransfer = tx.type === 'transfer';
              const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
              const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
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
                        {isDeposit && <ArrowDownLeft className="w-4 h-4" />}
                        {isWithdrawal && <ArrowUpRight className="w-4 h-4" />}
                        {isTransfer && <ArrowRightLeft className="w-4 h-4" />}
                      </span>
                      <div>
                        <span className="font-bold uppercase tracking-wider text-slate-200 text-xs block">
                          {tx.type}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">Ref #{tx.id}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-white">
                        {isWithdrawal ? '-' : isDeposit ? '+' : ''}
                        {formatCents(tx.amount_cents)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                      >
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Accounts & Note */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-xs space-y-1 border border-slate-800">
                    {fromAcc && (
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 shrink-0">From:</span>
                        <span className="text-slate-200 font-semibold truncate text-right">
                          {fromAcc.customer_name} ({fromAcc.account_number})
                        </span>
                      </div>
                    )}
                    {toAcc && (
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-400 shrink-0">To:</span>
                        <span className="text-slate-200 font-semibold truncate text-right">
                          {toAcc.customer_name} ({toAcc.account_number})
                        </span>
                      </div>
                    )}
                    {tx.note && (
                      <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 italic truncate">
                        "{tx.note}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <span className="text-[11px]">{formatDate(tx.created_at)}</span>
                    <button
                      type="button"
                      onClick={() => onSelectTransaction(tx)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center gap-1 transition-colors min-h-[34px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-hidden rounded-3xl bg-slate-850/80 border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <caption className="sr-only">Financial transactions audit ledger</caption>
                <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Ref #</th>
                    <th scope="col" className="py-3.5 px-4">Type</th>
                    <th scope="col" className="py-3.5 px-4">From Account</th>
                    <th scope="col" className="py-3.5 px-4">To Account</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Amount</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                    <th scope="col" className="py-3.5 px-4">Date</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((tx) => {
                    const statusTheme = getStatusColor(tx.status);
                    const isDeposit = tx.type === 'deposit';
                    const isWithdrawal = tx.type === 'withdrawal';
                    const isTransfer = tx.type === 'transfer';
                    const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
                    const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                          #{tx.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
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
                            <span className="font-bold uppercase tracking-wider text-slate-200">
                              {tx.type}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {fromAcc ? (
                            <div>
                              <span className="font-medium text-slate-200">{fromAcc.customer_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {fromAcc.account_number}
                              </span>
                            </div>
                          ) : tx.from_account_id ? (
                            <span className="font-mono text-slate-400">ID #{tx.from_account_id}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {toAcc ? (
                            <div>
                              <span className="font-medium text-slate-200">{toAcc.customer_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {toAcc.account_number}
                              </span>
                            </div>
                          ) : tx.to_account_id ? (
                            <span className="font-mono text-slate-400">ID #{tx.to_account_id}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                          {isWithdrawal ? '-' : isDeposit ? '+' : ''}
                          {formatCents(tx.amount_cents)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusTheme.bg}`}
                          >
                            <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                            {tx.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {formatDate(tx.created_at)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectTransaction(tx)}
                            aria-label={`View receipt for transaction #${tx.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            <Eye aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
