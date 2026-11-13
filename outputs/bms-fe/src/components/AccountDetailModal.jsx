import React, { useEffect, useState } from 'react';
import { X, CreditCard, Mail, Phone, Calendar, ArrowDownLeft, ArrowUpRight, Copy, Check, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { formatCents, formatDate, getStatusColor } from '../utils/formatters';
import DeleteAccountModal from './DeleteAccountModal';

export default function AccountDetailModal({
  account,
  onClose,
  onOpenWithdrawal,
  onSelectTransaction,
  onDeleteAccount,
  onToast,
}) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!account?.id) return;
    loadTransactions();
  }, [account?.id]);

  const loadTransactions = async () => {
    try {
      setLoadingTx(true);
      const data = await api.getTransactions({ account_id: account.id });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    if (onToast) onToast('Copied', 'Account number copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) return null;
  const statusTheme = getStatusColor(account.status);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xs">{account.customer_name}</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}>{account.status}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{account.account_number}</span>
                <button type="button" onClick={handleCopy} className="p-0.5 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
              <div className="text-2xl sm:text-4xl font-black text-white font-mono mt-1">{formatCents(account.balance_cents)}</div>
              <p className="text-xs text-slate-400 mt-1 capitalize">Plan: {account.account_type}</p>
            </div>
            {onOpenWithdrawal && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenWithdrawal(account); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-750 text-xs">
            <div><span className="text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</span><p className="font-semibold text-slate-100 truncate mt-0.5">{account.email || 'N/A'}</p></div>
            <div><span className="text-slate-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</span><p className="font-semibold text-slate-100 mt-0.5">{account.phone || 'N/A'}</p></div>
            <div><span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Opened</span><p className="font-semibold text-slate-100 mt-0.5">{formatDate(account.created_at)}</p></div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Activity ({transactions.length})</h3>
              <button type="button" onClick={loadTransactions} disabled={loadingTx} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${loadingTx ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            {loadingTx ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-slate-800/30 text-xs text-slate-400">No transactions recorded yet.</div>
            ) : (
              <div className="space-y-1.5">
                {transactions.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-750 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> : <ArrowUpRight className="w-4 h-4 text-rose-400" />}
                      <div>
                        <div className="font-semibold text-slate-200 capitalize">{tx.type} {tx.note && `(${tx.note})`}</div>
                        <span className="text-[10px] text-slate-400">{formatDate(tx.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-100'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatCents(tx.amount_cents)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-2 shrink-0">
          {onDeleteAccount ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Customer</span>
            </button>
          ) : <div />}
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors">
            Close
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteAccountModal
          account={account}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async (acc) => { await onDeleteAccount(acc); onClose(); }}
        />
      )}
    </div>
  );
}
