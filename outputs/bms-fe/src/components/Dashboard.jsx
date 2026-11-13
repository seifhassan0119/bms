import React from 'react';
import {
  Wallet,
  Users,
  Clock,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Building,
} from 'lucide-react';
import { formatCents, formatDate, getStatusColor } from '../utils/formatters';

export default function Dashboard({
  dashboardData,
  loading,
  onRefresh,
  onOpenNewAccount,
  onOpenNewTransaction,
  onNavigateToReviews,
  onNavigateToAccounts,
  onSelectTransaction,
}) {
  const {
    active_accounts = 0,
    total_balance_cents = 0,
    pending_account_requests = 0,
    pending_transaction_requests = 0,
    recent_transactions = [],
  } = dashboardData || {};

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">System Dashboard</h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time vault liquidity, account statistics, and transaction operations.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-600/25 transition-all min-h-[38px]"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Vault Deposits */}
        <div className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Vault Reserve
            </span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono group-hover:text-emerald-300 transition-colors truncate">
              {formatCents(total_balance_cents)}
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              {(total_balance_cents || 0).toLocaleString()} cents total reserve
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />
        </div>

        {/* Active Accounts */}
        <div
          onClick={onNavigateToAccounts}
          className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-slate-800/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Active Accounts
            </span>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {active_accounts}
              </div>
              <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400">
                Verified customer accounts &rarr;
              </p>
            </div>
            <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform font-bold hidden xs:inline">
              View
            </span>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />
        </div>

        {/* Pending Account Requests */}
        <div
          onClick={() => onNavigateToReviews('accounts')}
          className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/20 hover:bg-slate-800/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
              Account Reviews
            </span>
            <div
              className={`p-2 sm:p-2.5 rounded-2xl transition-all duration-300 ${
                pending_account_requests > 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950'
                  : 'bg-slate-700/40 text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                {pending_account_requests}
              </div>
              <p className="mt-1 text-[10px] sm:text-[11px] text-amber-400/90 font-medium">
                {pending_account_requests > 0 ? 'Pending admin approval' : 'All accounts approved'}
              </p>
            </div>
            {pending_account_requests > 0 && (
              <span className="text-xs text-amber-400 group-hover:translate-x-1 transition-transform font-bold hidden xs:inline">
                Review &rarr;
              </span>
            )}
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
        </div>

        {/* Pending Transaction Requests */}
        <div
          onClick={() => onNavigateToReviews('transactions')}
          className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-slate-800/90"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Money Approvals
            </span>
            <div
              className={`p-2 sm:p-2.5 rounded-2xl transition-all duration-300 ${
                pending_transaction_requests > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white'
                  : 'bg-slate-700/40 text-slate-400'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {pending_transaction_requests}
              </div>
              <p className="mt-1 text-[10px] sm:text-[11px] text-emerald-400/90 font-medium">
                {pending_transaction_requests > 0 ? 'Pending ledger execution' : 'Ledger up to date'}
              </p>
            </div>
            {pending_transaction_requests > 0 && (
              <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform font-bold hidden xs:inline">
                Review &rarr;
              </span>
            )}
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        </div>
      </div>

      {/* Main Content Grid: Recent Transactions (Left) + Quick Banking Operations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions List (2 columns wide) */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-850/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Recent Transaction Requests
              </h2>
              <p className="text-xs text-slate-400">Latest ledger submissions across all accounts</p>
            </div>
            <button
              onClick={() => onNavigateToReviews('transactions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>Review Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recent_transactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No transactions recorded yet.</p>
              <button
                onClick={onOpenNewTransaction}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                Create First Transaction
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent_transactions.map((tx) => {
                const statusTheme = getStatusColor(tx.status);
                const isDeposit = tx.type === 'deposit';
                const isWithdrawal = tx.type === 'withdrawal';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isWithdrawal
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {isDeposit && <ArrowDownLeft className="w-4 h-4" />}
                        {isWithdrawal && <ArrowUpRight className="w-4 h-4" />}
                        {isTransfer && <ArrowRightLeft className="w-4 h-4" />}
                      </div>

                      <div className="truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                            {tx.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">#{tx.id}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {isDeposit && `To Acc: #${tx.to_account_id}`}
                          {isWithdrawal && `From Acc: #${tx.from_account_id}`}
                          {isTransfer && `#${tx.from_account_id} → #${tx.to_account_id}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {isWithdrawal ? '-' : isDeposit ? '+' : ''}
                        {formatCents(tx.amount_cents)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Operations Panel */}
        <div className="rounded-3xl bg-slate-850/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              Quick Operations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Direct actions for accounts and ledger</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenNewAccount}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-750 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 text-left transition-all group min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Submit Account Application
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Open a new Savings or Current account
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-750 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 text-left transition-all group min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Submit Money Request
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deposit, withdrawal, or fund transfer
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
