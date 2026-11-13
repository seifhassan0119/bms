import React from 'react';
import { PlusCircle, ArrowDownLeft } from 'lucide-react';
import AccountsList from '../AccountsList';
import PendingRequests from '../PendingRequests';

export default function ManagerDashboard({
  accountRequests = [],
  transactionRequests = [],
  accounts = [],
  user,
  searchQuery,
  onSearchChange,
  onReviewAccount,
  onReviewTransaction,
  onSelectAccount,
  onOpenNewAccount,
  onOpenNewTransaction,
  onDeleteAccount,
  onToast,
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-850 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Manager Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Clearance &amp; Operations
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Welcome, <strong className="text-white">{user?.name || 'Manager'}</strong>. Initiate customer requests, approve transactions, and manage accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewTransaction && (
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Money Request</span>
            </button>
          )}
          {onOpenNewAccount && (
            <button
              type="button"
              onClick={onOpenNewAccount}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Requests Section */}
      <PendingRequests
        accountRequests={accountRequests}
        transactionRequests={transactionRequests}
        accounts={accounts}
        onReviewAccount={onReviewAccount}
        onReviewTransaction={onReviewTransaction}
      />

      {/* Customer Accounts Directory */}
      <div id="customer-accounts-directory">
        <AccountsList
          accounts={accounts}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectAccount={onSelectAccount}
          onDeleteAccount={onDeleteAccount}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
