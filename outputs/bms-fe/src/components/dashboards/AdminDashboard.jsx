import React, { useState } from 'react';
import {
  Wallet,
  Users,
  ShieldCheck,
  UserPlus,
  Trash2,
  Power,
  RefreshCw,
  PlusCircle,
  ArrowRightLeft,
  Receipt,
  Building,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { formatCents, formatDate, getStatusColor } from '../../utils/formatters';
import { getStaffList, createStaffAccount, deleteStaffAccount, toggleStaffStatus } from '../../utils/staffStorage';

export default function AdminDashboard({
  dashboardData,
  loading,
  onRefresh,
  onOpenNewAccount,
  onOpenNewTransaction,
  onNavigateToAccounts,
  onNavigateToReviews,
  onSelectTransaction,
  onToast,
}) {
  const [staff, setStaff] = useState(getStaffList);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', password: '', role: 'teller' });
  const [staffError, setStaffError] = useState('');

  const {
    active_accounts = 0,
    total_balance_cents = 0,
    pending_account_requests = 0,
    pending_transaction_requests = 0,
    recent_transactions = [],
  } = dashboardData || {};

  // Close modal on Escape
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddStaffOpen) setIsAddStaffOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddStaffOpen]);

  const handleCreateStaff = (e) => {
    e.preventDefault();
    setStaffError('');
    try {
      createStaffAccount(newStaff);
      setStaff(getStaffList());
      setIsAddStaffOpen(false);
      setNewStaff({ name: '', username: '', password: '', role: 'teller' });
      if (onToast) onToast('Staff Created', `Staff account "${newStaff.username}" created successfully.`, 'success');
    } catch (err) {
      setStaffError(err.message || 'Error creating staff account.');
    }
  };

  const handleToggleStatus = (id) => {
    try {
      const updated = toggleStaffStatus(id);
      setStaff(updated);
      if (onToast) onToast('Status Updated', 'Staff account status toggled.', 'info');
    } catch (err) {
      if (onToast) onToast('Action Blocked', err.message, 'error');
    }
  };

  const handleDeleteStaff = (id) => {
    try {
      const updated = deleteStaffAccount(id);
      setStaff(updated);
      if (onToast) onToast('Staff Removed', 'Staff account has been removed.', 'info');
    } catch (err) {
      if (onToast) onToast('Action Blocked', err.message, 'error');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Administrator Control Panel</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              System Admin
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            System configuration, staff credentials, reserve liquidity, and enterprise audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all min-h-[38px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Vault Reserve */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Vault Reserve Summary"
          className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-slate-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Vault Reserve
            </span>
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono group-hover:text-emerald-300 transition-colors truncate">
              {formatCents(total_balance_cents)}
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              {(total_balance_cents || 0).toLocaleString()} cents in vault
            </p>
          </div>
          <div aria-hidden="true" className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />
        </div>

        {/* Active Accounts */}
        <button
          type="button"
          onClick={onNavigateToAccounts}
          className="text-left w-full group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:bg-slate-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Customer Accounts
            </span>
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {active_accounts}
              </div>
              <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400">
                Verified records &rarr;
              </p>
            </div>
            <span className="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform font-bold hidden xs:inline">
              Directory
            </span>
          </div>
          <div aria-hidden="true" className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/25 transition-all" />
        </button>

        {/* Staff Members Count */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Staff Accounts Summary"
          className="group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-400 transition-colors">
              Staff Accounts
            </span>
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-purple-300 transition-colors">
              {staff.length}
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 truncate">
              Active personnel with system access
            </p>
          </div>
          <div aria-hidden="true" className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/25 transition-all" />
        </div>

        {/* Pending Operations Queue */}
        <button
          type="button"
          onClick={() => onNavigateToReviews('accounts')}
          className="text-left w-full group relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/20 hover:bg-slate-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
              Pending Queue
            </span>
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-sm">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                {pending_account_requests + pending_transaction_requests}
              </div>
              <p className="mt-1 text-[10px] sm:text-[11px] text-amber-400/90 font-medium">
                Applications & Transfers
              </p>
            </div>
            <span className="text-xs text-amber-400 group-hover:translate-x-1 transition-transform font-bold hidden xs:inline">
              Review &rarr;
            </span>
          </div>
          <div aria-hidden="true" className="absolute -bottom-8 -right-8 w-24 sm:w-28 h-24 sm:h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
        </button>
      </div>

      {/* Staff Management Section */}
      <div className="rounded-3xl bg-slate-850/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Staff Accounts & Access Management
            </h2>
            <p className="text-xs text-slate-400">
              Create, deactivate, and administer authorized employee and manager logins.
            </p>
          </div>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-start sm:self-auto min-h-[36px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Staff Account</span>
          </button>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-3">
          {staff.map((member) => {
            const isRoot = member.username === 'admin';
            return (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{member.name}</h3>
                    <p className="font-mono text-xs text-slate-400">@{member.username}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      member.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : member.role === 'manager'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {member.role === 'admin' ? 'Admin' : member.role === 'manager' ? 'Manager' : 'Teller'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {member.status === 'active' ? 'Active' : 'Deactivated'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{member.createdAt}</span>
                  </div>

                  {!isRoot ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id)}
                        aria-label={`${member.status === 'active' ? 'Deactivate' : 'Activate'} staff account for ${member.name}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Power aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(member.id)}
                        aria-label={`Delete staff account for ${member.name}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 italic">Root Admin</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <caption className="sr-only">Authorized staff accounts directory and roles</caption>
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th scope="col" className="py-3 px-4">Staff Name</th>
                <th scope="col" className="py-3 px-4">Username</th>
                <th scope="col" className="py-3 px-4">Role</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4">Created Date</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {staff.map((member) => {
                const isRoot = member.username === 'admin';
                return (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{member.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">@{member.username}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          member.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : member.role === 'manager'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {member.role === 'admin' ? 'Administrator' : member.role === 'manager' ? 'Manager' : 'Teller / Employee'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {member.status === 'active' ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">{member.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      {!isRoot ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(member.id)}
                            aria-label={`${member.status === 'active' ? 'Deactivate' : 'Activate'} staff account for ${member.name}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                          >
                            <Power aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(member.id)}
                            aria-label={`Delete staff account for ${member.name}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          >
                            <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 italic">Root Admin</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-850/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Banking Ledger Activity
              </h2>
              <p className="text-xs text-slate-400">Chronological transaction record</p>
            </div>
            <button
              onClick={() => onNavigateToReviews('transactions')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recent_transactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-xs text-slate-400">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recent_transactions.map((tx) => {
                const statusTheme = getStatusColor(tx.status);
                return (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full text-left flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{tx.type}</span>
                        <span className="text-[11px] font-mono text-slate-400">#{tx.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.from_account_id ? `From Acc #${tx.from_account_id} ` : ''}
                        {tx.to_account_id ? `To Acc #${tx.to_account_id}` : ''}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold font-mono text-white">{formatCents(tx.amount_cents)}</div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}>
                        {tx.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Operations Panel */}
        <div className="rounded-3xl bg-slate-850/80 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building aria-hidden="true" className="w-4 h-4 text-emerald-400" />
              Quick Operations
            </h2>
            <p className="text-xs text-slate-400">Direct account & request actions</p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onOpenNewAccount}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-750 hover:border-emerald-500/50 hover:shadow-lg text-left transition-all group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[48px]"
            >
              <div aria-hidden="true" className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Submit Account Application
                </h3>
                <p className="text-[11px] text-slate-400">Open Savings or Current account</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-750 hover:border-emerald-500/50 hover:shadow-lg text-left transition-all group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[48px]"
            >
              <div aria-hidden="true" className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Submit Money Request
                </h3>
                <p className="text-[11px] text-slate-400">Deposit, withdrawal, or transfer</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add Staff Account (Mobile Responsive with scroll container) */}
      {isAddStaffOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-staff-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
              <h2 id="add-staff-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus aria-hidden="true" className="w-5 h-5 text-emerald-400" />
                Add New Staff Member
              </h2>
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                aria-label="Close add staff modal"
                className="text-slate-400 hover:text-white text-xs font-bold p-2 rounded-lg hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs flex-1">
              {staffError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300"
                >
                  {staffError}
                </div>
              )}

              <form id="add-staff-form" onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="staff-fullname" className="block font-semibold text-slate-300 mb-1">
                    Full Name <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="staff-fullname"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Johnathan Lee"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="staff-username" className="block font-semibold text-slate-300 mb-1">
                    Username <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="staff-username"
                    name="username"
                    type="text"
                    required
                    placeholder="e.g. jlee"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="staff-password" className="block font-semibold text-slate-300 mb-1">
                    Temporary Password <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="staff-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="staff-role" className="block font-semibold text-slate-300 mb-1">
                    System Role <span aria-hidden="true" className="text-emerald-400">*</span>
                  </label>
                  <select
                    id="staff-role"
                    name="role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="teller">Teller / Employee (Everyday Banking Operations)</option>
                    <option value="manager">Manager (Supervises & Approves Operations)</option>
                    <option value="admin">Administrator (Full System & Staff Access)</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-800 shrink-0 flex items-center justify-end gap-2 bg-slate-900">
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-xs min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-staff-form"
                className="px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-xs min-h-[40px]"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
