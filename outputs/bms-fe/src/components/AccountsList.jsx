import React, { useState } from 'react';
import {
  Search,
  Users,
  Copy,
  Check,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatCents, getAccountTypeLabel, getStatusColor } from '../utils/formatters';

export default function AccountsList({
  accounts = [],
  loading = false,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  onSelectAccount,
  onOpenNewAccount,
  onQuickDeposit,
  onQuickTransfer,
  onDeleteAccount,
  onToast,
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeSearch = onSearchChange !== undefined ? searchQuery : internalSearch;
  const handleSearchChange = (val) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onToast) onToast('Copied', `Account number ${text} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAccounts = (accounts || []).filter((acc) => {
    if (!acc) return false;
    if (typeFilter !== 'all' && acc.account_type !== typeFilter) return false;
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchName = acc.customer_name?.toLowerCase().includes(q);
      const matchNum = acc.account_number?.toLowerCase().includes(q);
      const matchEmail = acc.email?.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-slate-850 border border-slate-800 shadow-xl overflow-hidden w-full">
      {/* Rectangle Header: Title, Search, Filters & Action Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Section Title & Live Count Badge */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Customer Accounts
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {filteredAccounts.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified accounts, live balances, and customer directory.
            </p>
          </div>
        </div>

        {/* Right: Search, Filter Tabs, Refresh & New Request Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56 md:w-64 min-w-[170px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, account #..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors min-h-[36px]"
            />
          </div>

          {/* Type Filter Pills: All, Savings, Current */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            {['all', 'savings', 'current'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors min-h-[32px] ${
                  typeFilter === type
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Accounts"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          {/* New Account Button */}
          {onOpenNewAccount && (
            <button
              type="button"
              onClick={onOpenNewAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors min-h-[36px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Rectangle Body */}
      {filteredAccounts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-850">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No customer accounts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {activeSearch
              ? `No account matches "${activeSearch}". Try another keyword or clear the filter.`
              : 'Accounts will appear here once approved by a branch manager.'}
          </p>
          {onOpenNewAccount && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onOpenNewAccount}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Submit Account Application
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Table View (Fits the rectangle perfectly across the page) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th scope="col" className="py-3 px-4">Customer</th>
                  <th scope="col" className="py-3 px-4">Account Number</th>
                  <th scope="col" className="py-3 px-4">Plan Type</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Balance</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAccounts.map((account) => {
                  const statusTheme = getStatusColor(account.status);
                  const isCopied = copiedId === account.id;

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectAccount && onSelectAccount(account)}
                          className="font-bold text-white hover:text-emerald-400 text-left transition-colors text-xs sm:text-sm block truncate max-w-[220px]"
                        >
                          {account.customer_name}
                        </button>
                        <div className="text-[11px] text-slate-400 truncate max-w-[220px] mt-0.5">
                          {account.email || account.phone || 'No contact on file'}
                        </div>
                      </td>

                      {/* Account Number with Copy */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">
                            {account.account_number}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, account.account_number, account.id)}
                            title="Copy Account Number"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {getAccountTypeLabel(account.account_type)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                          {account.status}
                        </span>
                      </td>

                      {/* Current Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-white text-sm sm:text-base">
                          {formatCents(account.balance_cents)}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onQuickDeposit && (
                            <button
                              type="button"
                              onClick={() => onQuickDeposit(account)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            >
                              Deposit
                            </button>
                          )}

                          {onQuickTransfer && (
                            <button
                              type="button"
                              onClick={() => onQuickTransfer(account)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                            >
                              Transfer
                            </button>
                          )}

                          {onSelectAccount && (
                            <button
                              type="button"
                              onClick={() => onSelectAccount(account)}
                              title="Inspect Account Details"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteAccount && (
                            <button
                              type="button"
                              onClick={() => setAccountToDelete(account)}
                              title={`Delete Customer ${account.customer_name}`}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Clean Rectangular Rows (Fits mobile screen width) */}
          <div className="md:hidden divide-y divide-slate-800">
            {filteredAccounts.map((account) => {
              const statusTheme = getStatusColor(account.status);
              const isCopied = copiedId === account.id;

              return (
                <div key={account.id} className="p-3.5 sm:p-4 space-y-2.5 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectAccount && onSelectAccount(account)}
                        className="font-bold text-white text-sm hover:text-emerald-400 transition-colors text-left truncate block"
                      >
                        {account.customer_name}
                      </button>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mt-0.5">
                        <span>{account.account_number}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, account.account_number, account.id)}
                          className="p-0.5 text-slate-400 hover:text-white"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">
                        {formatCents(account.balance_cents)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                        {getAccountTypeLabel(account.account_type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                      {account.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onQuickDeposit && (
                        <button
                          type="button"
                          onClick={() => onQuickDeposit(account)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          Deposit
                        </button>
                      )}
                      {onQuickTransfer && (
                        <button
                          type="button"
                          onClick={() => onQuickTransfer(account)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750"
                        >
                          Transfer
                        </button>
                      )}
                      {onSelectAccount && (
                        <button
                          type="button"
                          onClick={() => onSelectAccount(account)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteAccount && (
                        <button
                          type="button"
                          onClick={() => setAccountToDelete(account)}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md p-5 sm:p-6 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl text-center space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 id="delete-account-modal-title" className="text-base sm:text-lg font-bold text-white">
              Delete Customer Account?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete customer <strong className="text-white">{accountToDelete.customer_name}</strong> (Account <span className="font-mono text-emerald-400">{accountToDelete.account_number}</span>)?
            </p>
            <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/30">
              Warning: This action cannot be undone. All balances and customer data will be erased.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await onDeleteAccount(accountToDelete);
                    setAccountToDelete(null);
                  } catch (err) {
                    console.error('Delete failed:', err);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors min-h-[38px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Customer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
