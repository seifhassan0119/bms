import React from 'react';
import {
  Users,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';
import AccountsList from '../AccountsList';

export default function TellerDashboard({
  accounts = [],
  transactions = [],
  loading = false,
  user,
  searchQuery,
  onSearchChange,
  onRefresh,
  onOpenNewAccount,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenTransfer,
  onSelectAccount,
  onSelectTransaction,
  onDeleteAccount,
  onToast,
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-850 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Teller Workstation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Request Originator
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Welcome, <strong className="text-white">{user?.name || 'Teller'}</strong>. Search customer balances, initiate new money operations, and submit account onboarding applications.
          </p>
        </div>

        <button
          onClick={onOpenNewAccount}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors self-stretch sm:self-auto min-h-[38px]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Account Application</span>
        </button>
      </div>

      {/* Everyday Banking Operations (Basic, clean hover) */}
      <div>
        <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
          Quick Request Actions
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: New Account */}
          <button
            type="button"
            onClick={onOpenNewAccount}
            className="text-left w-full p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3">
              New Account Application
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Submit customer onboarding for Savings or Current plan.
            </p>
          </button>

          {/* Action 2: Customer Deposit */}
          <button
            type="button"
            onClick={() => onOpenDeposit()}
            className="text-left w-full p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3">
              Customer Deposit
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Submit cash/check credit request to customer account.
            </p>
          </button>

          {/* Action 3: Customer Withdrawal */}
          <button
            type="button"
            onClick={() => onOpenWithdrawal()}
            className="text-left w-full p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3">
              Customer Withdrawal
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Submit customer debit withdrawal request.
            </p>
          </button>

          {/* Action 4: Account Transfer */}
          <button
            type="button"
            onClick={() => onOpenTransfer()}
            className="text-left w-full p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mt-3">
              Process Transfer
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Submit fund transfer between two verified accounts.
            </p>
          </button>
        </div>
      </div>

      {/* EMBEDDED CUSTOMER ACCOUNTS RECTANGLE */}
      <div className="pt-2">
        <AccountsList
          accounts={accounts}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          onSelectAccount={onSelectAccount}
          onOpenNewAccount={onOpenNewAccount}
          onQuickDeposit={onOpenDeposit}
          onQuickTransfer={onOpenTransfer}
          onDeleteAccount={onDeleteAccount}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
