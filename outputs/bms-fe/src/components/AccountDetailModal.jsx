import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatCents, formatDate, getStatusColor } from '../utils/formatters';

export default function AccountDetailModal({
  account,
  onClose,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenTransfer,
  onSelectTransaction,
  onDeleteAccount,
  onToast,
}) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!onDeleteAccount) return;
    try {
      setDeleting(true);
      await onDeleteAccount(account);
      onClose();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!account?.id) return;
    loadAccountTransactions();
  }, [account?.id]);

  const loadAccountTransactions = async () => {
    try {
      setLoadingTx(true);
      const data = await api.getTransactions({ account_id: account.id });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load transactions for account:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    if (onToast) onToast('Copied', 'Account number copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) return null;

  const statusTheme = getStatusColor(account.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div aria-hidden="true" className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-account-title" className="text-base sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-xs">{account.customer_name}</h2>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                >
                  <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                  {account.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{account.account_number}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy account number"
                  className="p-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded min-h-[24px] min-w-[24px] flex items-center justify-center"
                >
                  {copied ? <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-400" /> : <Copy aria-hidden="true" className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account details modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-6">
          {/* Balance Hero Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Balance
              </span>
              <div className="text-2xl sm:text-4xl font-black text-white font-mono mt-1">
                {formatCents(account.balance_cents)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cents:{' '}
                <span className="font-mono text-emerald-400 font-semibold">
                  {account.balance_cents.toLocaleString()}
                </span>{' '}
                &bull; Plan: <span className="capitalize text-slate-200">{account.account_type}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit(account);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px]"
              >
                <ArrowDownLeft aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Deposit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWithdrawal(account);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px]"
              >
                <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTransfer(account);
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px]"
              >
                <ArrowRightLeft aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Account Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-750 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <User aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" /> Account Holder
              </span>
              <p className="font-semibold text-slate-100 text-sm truncate">{account.customer_name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Mail aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" /> Email Address
              </span>
              <p className="font-semibold text-slate-100 truncate">{account.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Phone aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" /> Phone Contact
              </span>
              <p className="font-semibold text-slate-100">{account.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar aria-hidden="true" className="w-3.5 h-3.5 text-slate-500" /> Date Opened
              </span>
              <p className="font-semibold text-slate-100">{formatDate(account.created_at)}</p>
            </div>
          </div>

          {/* Account Activity / Specific History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Account Activity History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {transactions.length}
                </span>
              </h3>
              <button
                type="button"
                onClick={loadAccountTransactions}
                disabled={loadingTx}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded min-h-[30px]"
              >
                <RefreshCw aria-hidden="true" className={`w-3 h-3 ${loadingTx ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingTx ? (
              <div role="status" className="py-8 text-center text-xs text-slate-400">Loading account transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-800/30 border border-slate-800 text-xs text-slate-400">
                No transactions recorded for this account yet.
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const isIncoming = tx.to_account_id === account.id;
                  const statusTheme = getStatusColor(tx.status);

                  return (
                    <button
                      type="button"
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-750 hover:border-slate-600 transition-colors cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <div className="flex items-center gap-2.5 pr-2">
                        <div
                          aria-hidden="true"
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncoming
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isIncoming ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-200 capitalize truncate">
                            {tx.type} {tx.note && <span className="font-normal text-slate-400">({tx.note})</span>}
                          </div>
                          <span className="text-[10px] text-slate-400">{formatDate(tx.created_at)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold ${
                            isIncoming ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {formatCents(tx.amount_cents)}
                        </span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${statusTheme.bg}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-2 shrink-0">
          {onDeleteAccount ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Customer</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[38px]"
          >
            Close
          </button>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="max-w-md w-full p-5 sm:p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-center space-y-3.5 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 id="confirm-delete-title" className="text-base sm:text-lg font-bold text-white">
                Delete Customer Account?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete customer <strong className="text-white">{account.customer_name}</strong> (Account <span className="font-mono text-emerald-400">{account.account_number}</span>)?
              </p>
              <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/30">
                Warning: This action cannot be undone. All associated account records and balances will be removed.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors min-h-[38px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
