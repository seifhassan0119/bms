import React, { useState } from 'react';
import { Search, Users, Copy, Check, ArrowRight, Trash2 } from 'lucide-react';
import { formatCents, getAccountTypeLabel, getStatusColor } from '../utils/formatters';
import DeleteAccountModal from './DeleteAccountModal';

export default function AccountsList({
  accounts = [],
  searchQuery = '',
  onSearchChange,
  onSelectAccount,
  onDeleteAccount,
  onToast,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onToast) onToast('Copied', `Account number ${text} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = (accounts || []).filter((acc) => {
    if (!acc) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      acc.customer_name?.toLowerCase().includes(q) ||
      acc.account_number?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl bg-slate-850 border border-slate-800 shadow-xl overflow-hidden w-full">
      {/* Header: Title & Search */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Customer Accounts</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {filtered.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Verified customer accounts directory.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by name, account #..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors min-h-[36px]"
          />
        </div>
      </div>

      {/* Table Body */}
      {filtered.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-850">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No customer accounts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery ? `No account matches "${searchQuery}".` : 'Accounts will appear here once approved.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th scope="col" className="py-3 px-4">Customer</th>
                <th scope="col" className="py-3 px-4">Account Number</th>
                <th scope="col" className="py-3 px-4">Plan</th>
                <th scope="col" className="py-3 px-4">Status</th>
                <th scope="col" className="py-3 px-4 text-right">Balance</th>
                <th scope="col" className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((acc) => {
                const statusTheme = getStatusColor(acc.status);
                const isCopied = copiedId === acc.id;
                return (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectAccount && onSelectAccount(acc)}
                        className="font-bold text-white hover:text-emerald-400 text-left transition-colors text-xs sm:text-sm block truncate max-w-[200px]"
                      >
                        {acc.customer_name}
                      </button>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {acc.email || acc.phone || 'No contact'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{acc.account_number}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, acc.account_number, acc.id)}
                          title="Copy Account Number"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {getAccountTypeLabel(acc.account_type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {formatCents(acc.balance_cents)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onSelectAccount && (
                          <button
                            type="button"
                            onClick={() => onSelectAccount(acc)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteAccount && (
                          <button
                            type="button"
                            onClick={() => setAccountToDelete(acc)}
                            title={`Delete ${acc.customer_name}`}
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
      )}

      {accountToDelete && (
        <DeleteAccountModal
          account={accountToDelete}
          onClose={() => setAccountToDelete(null)}
          onConfirm={onDeleteAccount}
        />
      )}
    </div>
  );
}
