import React from 'react';
import {
  Clock,
  Users,
  RefreshCw,
} from 'lucide-react';
import AccountsList from '../AccountsList';

export default function ManagerDashboard({
  dashboardData,
  accountRequests = [],
  transactionRequests = [],
  accounts = [],
  loading = false,
  user,
  searchQuery,
  onSearchChange,
  onRefresh,
  onNavigateToReviews,
  onSelectAccount,
  onOpenNewAccount,
  onQuickDeposit,
  onQuickTransfer,
  onDeleteAccount,
  onToast,
}) {
  const {
    active_accounts = 0,
    pending_account_requests = 0,
    pending_transaction_requests = 0,
  } = dashboardData || {};

  const pendingAccounts = accountRequests.filter((r) => r.status === 'pending');
  const pendingTransactions = transactionRequests.filter((t) => t.status === 'pending');
  const totalPending = pendingAccounts.length + pendingTransactions.length;

  const pendingSummaryParts = [];
  if (pendingAccounts.length > 0) {
    pendingSummaryParts.push(`${pendingAccounts.length} application${pendingAccounts.length === 1 ? '' : 's'}`);
  }
  if (pendingTransactions.length > 0) {
    pendingSummaryParts.push(`${pendingTransactions.length} transaction${pendingTransactions.length === 1 ? '' : 's'}`);
  }
  const pendingSummaryText =
    totalPending > 0
      ? `${pendingSummaryParts.join(' & ')} awaiting approval`
      : 'All accounts verified • Ledger settled';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-850 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Manager Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Clearance Authority
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Welcome, <strong className="text-white">{user?.name || 'Manager'}</strong>. Supervise bank operations, authorize teller requests, and inspect customer accounts.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 self-stretch sm:self-auto min-h-[38px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Full-Width Short Rectangles (Fit the width of the screen) */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* 1. Account Applications & Money Approvals (Combined into one button) */}
        <button
          type="button"
          onClick={() => onNavigateToReviews(pendingAccounts.length > 0 ? 'accounts' : 'transactions')}
          className="w-full flex items-center justify-between p-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors text-left group min-h-[56px] cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 transition-colors ${
                totalPending > 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Account Applications &amp; Money Approvals
                </h3>
                {totalPending > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Action Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {pendingSummaryText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-3">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              {totalPending}
            </span>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden xs:inline">Review</span> &rarr;
            </span>
          </div>
        </button>

        {/* 2. Active Accounts (with interactive hover) */}
        <button
          type="button"
          onClick={() => {
            document.getElementById('customer-accounts-directory')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full flex items-center justify-between p-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors text-left group cursor-pointer min-h-[56px]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-emerald-500/10 text-slate-300 group-hover:text-emerald-400 border border-slate-700/60 group-hover:border-emerald-500/20 shrink-0 transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Active Accounts
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Managed customer accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 pl-3">
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {active_accounts}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
              <span className="hidden xs:inline">Directory</span> &rarr;
            </span>
          </div>
        </button>
      </div>

      {/* EMBEDDED CUSTOMER ACCOUNTS RECTANGLE */}
      <div id="customer-accounts-directory" className="pt-2">
        <AccountsList
          accounts={accounts}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          onSelectAccount={onSelectAccount}
          onOpenNewAccount={onOpenNewAccount}
          onQuickDeposit={onQuickDeposit}
          onQuickTransfer={onQuickTransfer}
          onDeleteAccount={onDeleteAccount}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
