import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Receipt,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Search,
  Eye,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatCents, formatDate, getAccountTypeLabel, getStatusColor } from '../utils/formatters';

export default function RequestsAndLedger({
  user,
  accountRequests = [],
  transactions = [],
  accounts = [],
  loading,
  onRefresh,
  onReviewAccount,
  onReviewTransaction,
  onSelectAccount,
  onSelectTransaction,
  onOpenNewAccount,
  onOpenNewTransaction,
  initialView = 'requests', // 'requests' or 'ledger'
  initialRequestType = 'accounts', // 'accounts' or 'money'
}) {
  const [activeSection, setActiveSection] = useState(initialView);
  const [requestType, setRequestType] = useState(initialRequestType);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    if (initialView) setActiveSection(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialRequestType) setRequestType(initialRequestType);
  }, [initialRequestType]);

  // Ledger filters
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');

  const isManager = user?.role === 'manager';
  const isTeller = user?.role === 'teller';

  const pendingAccounts = accountRequests.filter((r) => r.status === 'pending');
  const pendingTransactions = transactions.filter((t) => t.status === 'pending');
  const totalPending = pendingAccounts.length + pendingTransactions.length;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const handleAccountDecision = async (id, decision) => {
    try {
      setReviewingId(`acc-${id}-${decision}`);
      await onReviewAccount(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  const handleTransactionDecision = async (id, decision) => {
    try {
      setReviewingId(`tx-${id}-${decision}`);
      await onReviewTransaction(id, decision);
    } finally {
      setReviewingId(null);
    }
  };

  // Filtered requests
  const filteredAccounts = accountRequests.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const filteredTransactionRequests = transactions.filter((tx) => {
    if (statusFilter === 'all') return true;
    return tx.status === statusFilter;
  });

  // Filtered ledger entries
  const filteredLedger = transactions.filter((tx) => {
    if (ledgerTypeFilter !== 'all' && tx.type !== ledgerTypeFilter) return false;
    if (ledgerStatusFilter !== 'all' && tx.status !== ledgerStatusFilter) return false;
    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase();
      const matchId = String(tx.id).includes(q);
      const matchFrom = tx.from_account_id && String(tx.from_account_id).includes(q);
      const matchTo = tx.to_account_id && String(tx.to_account_id).includes(q);
      const matchNote = tx.note && tx.note.toLowerCase().includes(q);
      if (!matchId && !matchFrom && !matchTo && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-850 border border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Requests & Ledger</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isManager
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isManager ? 'Manager Clearance & Ledger' : 'Teller Requests & Ledger'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isManager
              ? 'Authorize incoming customer onboarding and money operations, or inspect the comprehensive transaction ledger.'
              : 'Track status of submitted money & account requests and inspect all settled ledger entries.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isTeller && (
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh requests and ledger"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: [ Review Requests (N) ] vs [ Transactions Ledger ] */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setActiveSection('requests')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'requests'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{isManager ? 'Review Requests' : 'Operation Requests'}</span>
          {totalPending > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-slate-950 font-black">
              {totalPending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('ledger')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
            activeSection === 'ledger'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Transactions Ledger</span>
          <span className="text-[10px] text-slate-400 font-mono">({transactions.length})</span>
        </button>
      </div>

      {/* VIEW A: REVIEW REQUESTS SECTION */}
      {activeSection === 'requests' && (
        <div className="space-y-4">
          {/* Sub-Tabs: Account Applications vs Money Requests + Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRequestType('accounts')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  requestType === 'accounts'
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Account Applications</span>
                {pendingAccounts.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {pendingAccounts.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequestType('money')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  requestType === 'money'
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Money Requests</span>
                {pendingTransactions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {pendingTransactions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              {['pending', 'approved', 'rejected', 'all'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-view 1: Account Requests */}
          {requestType === 'accounts' && (
            <div>
              {filteredAccounts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-850/50 border border-slate-800 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  No account applications found matching "{statusFilter}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAccounts.map((req) => {
                    const isPending = req.status === 'pending';
                    const statusTheme = getStatusColor(req.status);
                    const isApproving = reviewingId === `acc-${req.id}-approve`;
                    const isRejecting = reviewingId === `acc-${req.id}-reject`;

                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                            {getAccountTypeLabel(req.account_type)} Plan
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400">Application #{req.id}</span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                              {req.status}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base">{req.customer_name}</h3>
                          <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                            <p>Email: <span className="text-slate-200">{req.email}</span></p>
                            <p>Phone: <span className="text-slate-200">{req.phone}</span></p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Submitted: {formatDate(req.created_at)}</span>
                          {req.reviewed_at && <span>Reviewed: {formatDate(req.reviewed_at)}</span>}
                        </div>

                        {req.account_id && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                            <span>Assigned Account: #{req.account_id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const acc = accountMap.get(req.account_id);
                                if (acc) onSelectAccount(acc);
                              }}
                              className="font-bold underline flex items-center gap-1 hover:text-emerald-200"
                            >
                              <span>Inspect Record</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Manager Approval Controls */}
                        {isPending && isManager && (
                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAccountDecision(req.id, 'approve')}
                              disabled={!!reviewingId}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[38px]"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isApproving ? 'animate-spin' : ''}`} />
                              <span>Approve & Open</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAccountDecision(req.id, 'reject')}
                              disabled={!!reviewingId}
                              className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition-colors disabled:opacity-50 min-h-[38px]"
                            >
                              <XCircle className={`w-3.5 h-3.5 ${isRejecting ? 'animate-spin' : ''}`} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        {/* Teller Status Badge */}
                        {isPending && isTeller && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Queued for Manager Review and Account Number Generation.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub-view 2: Money Requests */}
          {requestType === 'money' && (
            <div>
              {filteredTransactionRequests.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-850/50 border border-slate-800 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  No money requests found matching "{statusFilter}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredTransactionRequests.map((tx) => {
                    const isPending = tx.status === 'pending';
                    const statusTheme = getStatusColor(tx.status);
                    const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
                    const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;
                    const hasFunds = !fromAcc || fromAcc.balance_cents >= tx.amount_cents;
                    const isApproving = reviewingId === `tx-${tx.id}-approve`;
                    const isRejecting = reviewingId === `tx-${tx.id}-reject`;

                    return (
                      <div
                        key={tx.id}
                        className="p-4 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                            {tx.type} Request #{tx.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-white">
                              {formatCents(tx.amount_cents)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 text-xs space-y-1.5 border border-slate-800">
                          {fromAcc && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-400">Debit (Source):</span>
                              <span className="font-semibold text-slate-200 truncate text-right">
                                {fromAcc.customer_name} ({fromAcc.account_number})
                              </span>
                            </div>
                          )}
                          {toAcc && (
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-400">Credit (Dest):</span>
                              <span className="font-semibold text-slate-200 truncate text-right">
                                {toAcc.customer_name} ({toAcc.account_number})
                              </span>
                            </div>
                          )}
                          {fromAcc && isPending && (
                            <div className="pt-1 border-t border-slate-800 flex justify-between items-center font-mono text-[11px]">
                              <span className="text-slate-400">Available Balance:</span>
                              <span className={hasFunds ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {formatCents(fromAcc.balance_cents)} {!hasFunds && '(Insufficient)'}
                              </span>
                            </div>
                          )}
                        </div>

                        {tx.note && <p className="text-xs italic text-slate-400 truncate">Memo: "{tx.note}"</p>}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Submitted: {formatDate(tx.created_at)}</span>
                          <button
                            type="button"
                            onClick={() => onSelectTransaction(tx)}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>

                        {/* Manager Approval Controls */}
                        {isPending && isManager && (
                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTransactionDecision(tx.id, 'approve')}
                              disabled={!!reviewingId}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 min-h-[38px]"
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isApproving ? 'animate-spin' : ''}`} />
                              <span>Authorize & Execute</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleTransactionDecision(tx.id, 'reject')}
                              disabled={!!reviewingId}
                              className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1 transition-colors disabled:opacity-50 min-h-[38px]"
                            >
                              <XCircle className={`w-3.5 h-3.5 ${isRejecting ? 'animate-spin' : ''}`} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        {/* Teller Status Badge */}
                        {isPending && isTeller && (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Awaiting Manager Approval before balances update atomically.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: TRANSACTIONS LEDGER SECTION */}
      {activeSection === 'ledger' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="relative flex-1">
              <label htmlFor="ledger-search-input" className="sr-only">
                Filter transactions
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ledger-search-input"
                name="search"
                type="search"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Filter by Ref #, Account ID, or Memo..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ledgerTypeFilter}
                onChange={(e) => setLedgerTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
              </select>

              <select
                value={ledgerStatusFilter}
                onChange={(e) => setLedgerStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400 px-1">
            Showing <strong className="text-white">{filteredLedger.length}</strong> of {transactions.length} ledger records
          </div>

          {/* Ledger Table & Cards */}
          {filteredLedger.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-850/50 border border-slate-800 text-xs text-slate-400">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No ledger entries match criteria.
            </div>
          ) : (
            <>
              {/* Mobile View: Cards */}
              <div className="block md:hidden space-y-3">
                {filteredLedger.map((tx) => {
                  const statusTheme = getStatusColor(tx.status);
                  const isDeposit = tx.type === 'deposit';
                  const isWithdrawal = tx.type === 'withdrawal';
                  const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
                  const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isDeposit ? 'bg-emerald-500/10 text-emerald-400' : isWithdrawal ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : isWithdrawal ? <ArrowUpRight className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                          </span>
                          <div>
                            <span className="font-bold uppercase text-xs text-white block">{tx.type}</span>
                            <span className="font-mono text-[11px] text-slate-400">Ref #{tx.id}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-white">
                            {isWithdrawal ? '-' : isDeposit ? '+' : ''}
                            {formatCents(tx.amount_cents)}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                            {tx.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 text-xs space-y-1 border border-slate-800">
                        {fromAcc && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400 shrink-0">From:</span>
                            <span className="text-slate-200 font-semibold truncate text-right">
                              {fromAcc.customer_name} ({fromAcc.account_number})
                            </span>
                          </div>
                        )}
                        {toAcc && (
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-slate-400 shrink-0">To:</span>
                            <span className="text-slate-200 font-semibold truncate text-right">
                              {toAcc.customer_name} ({toAcc.account_number})
                            </span>
                          </div>
                        )}
                        {tx.note && <p className="text-[11px] text-slate-400 italic truncate">"{tx.note}"</p>}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span className="text-[11px]">{formatDate(tx.created_at)}</span>
                        <button
                          type="button"
                          onClick={() => onSelectTransaction(tx)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block overflow-hidden rounded-2xl bg-slate-850 border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <caption className="sr-only">Financial transactions audit ledger</caption>
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <tr>
                      <th scope="col" className="py-3 px-4">Ref #</th>
                      <th scope="col" className="py-3 px-4">Type</th>
                      <th scope="col" className="py-3 px-4">From Account</th>
                      <th scope="col" className="py-3 px-4">To Account</th>
                      <th scope="col" className="py-3 px-4 text-right">Amount</th>
                      <th scope="col" className="py-3 px-4 text-center">Status</th>
                      <th scope="col" className="py-3 px-4">Date</th>
                      <th scope="col" className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLedger.map((tx) => {
                      const statusTheme = getStatusColor(tx.status);
                      const isDeposit = tx.type === 'deposit';
                      const isWithdrawal = tx.type === 'withdrawal';
                      const isTransfer = tx.type === 'transfer';
                      const fromAcc = tx.from_account_id ? accountMap.get(tx.from_account_id) : null;
                      const toAcc = tx.to_account_id ? accountMap.get(tx.to_account_id) : null;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-400">#{tx.id}</td>
                          <td className="py-3 px-4 font-bold uppercase text-slate-200">{tx.type}</td>
                          <td className="py-3 px-4">
                            {fromAcc ? `${fromAcc.customer_name} (${fromAcc.account_number})` : tx.from_account_id ? `#${tx.from_account_id}` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {toAcc ? `${toAcc.customer_name} (${toAcc.account_number})` : tx.to_account_id ? `#${tx.to_account_id}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {isWithdrawal ? '-' : isDeposit ? '+' : ''}
                            {formatCents(tx.amount_cents)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusTheme.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">{formatDate(tx.created_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onSelectTransaction(tx)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
