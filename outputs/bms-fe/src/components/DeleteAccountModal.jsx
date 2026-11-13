import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteAccountModal({ account, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  if (!account) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onConfirm(account);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md p-5 sm:p-6 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl text-center space-y-3.5">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 id="delete-account-modal-title" className="text-base sm:text-lg font-bold text-white">
          Delete Customer Account?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to permanently delete customer <strong className="text-white">{account.customer_name}</strong> (Account <span className="font-mono text-emerald-400">{account.account_number}</span>)?
        </p>
        <p className="text-[11px] text-rose-400 font-semibold bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/30">
          Warning: This action cannot be undone. All balances and customer data will be erased.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors min-h-[38px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors min-h-[38px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Delete Customer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
