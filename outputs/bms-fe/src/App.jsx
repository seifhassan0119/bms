import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Logo from './components/Logo';
import TellerDashboard from './components/dashboards/TellerDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import RequestsAndLedger from './components/RequestsAndLedger';
import AccountDetailModal from './components/AccountDetailModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import NewAccountModal from './components/NewAccountModal';
import NewTransactionModal from './components/NewTransactionModal';
import LoginPage from './components/LoginPage';
import Toast from './components/Toast';
import { api } from './api/client';

export default function App() {
  // User Session State: { id, username, name, role: 'teller'|'manager', status }
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('APEX_USER_SESSION');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Automatically migrate legacy 'admin' or invalid session roles to manager
      if (parsed?.role === 'admin' || (parsed?.role !== 'teller' && parsed?.role !== 'manager')) {
        const migrated = {
          id: 'staff-manager',
          username: 'manager',
          name: 'Manager',
          role: 'manager',
          status: 'active',
        };
        localStorage.setItem('APEX_USER_SESSION', JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Exactly 2 primary pages: 'dashboard' (with embedded accounts) and 'operations' (requests & ledger)
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['operations', 'reviews', 'transactions', 'requests', 'ledger'].includes(hash)) {
      return 'operations';
    }
    return 'dashboard';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [reviewSubTab, setReviewSubTab] = useState('accounts');

  // Backend state & data
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [txModalPreset, setTxModalPreset] = useState({ account: null, type: 'deposit' });

  // Toast feedback notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const currentRawHash = window.location.hash.replace('#', '').toLowerCase();
      if (['accounts'].includes(currentRawHash)) {
        window.location.hash = 'dashboard';
        setActivePage('dashboard');
        return;
      }
      if (['reviews', 'transactions', 'requests', 'ledger'].includes(currentRawHash)) {
        if (currentRawHash === 'transactions' || currentRawHash === 'ledger') {
          setReviewSubTab('ledger');
        } else if (currentRawHash === 'reviews') {
          setReviewSubTab('accounts');
        }
        window.location.hash = 'operations';
        setActivePage('operations');
        return;
      }
      setActivePage(getInitialPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic Document Title for WCAG 2.1 AA Page Identification
  useEffect(() => {
    if (!user) {
      document.title = 'ApexCore Bank | Sign In';
    } else {
      const pageTitles = {
        dashboard: `${(user.role || 'Bank').toUpperCase()} Dashboard`,
        operations: 'Requests & Ledger',
      };
      document.title = `ApexCore Bank | ${pageTitles[activePage] || 'Portal'}`;
    }
  }, [user, activePage]);

  const handleNavigatePage = (pageId) => {
    const target = ['operations', 'reviews', 'transactions', 'requests', 'ledger'].includes(pageId)
      ? 'operations'
      : 'dashboard';
    window.location.hash = target;
    setActivePage(target);
  };

  // Check health and ping
  const checkConnection = useCallback(async () => {
    try {
      await api.checkHealth();
      setBackendConnected(true);
    } catch (e) {
      setBackendConnected(false);
    }
  }, []);

  // Fetch all core application data
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await checkConnection();

      const [dashRes, accRes, reqRes, txRes] = await Promise.allSettled([
        api.getDashboard(),
        api.getAccounts(searchQuery),
        api.getAccountRequests(),
        api.getTransactions(),
      ]);

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value);
      if (accRes.status === 'fulfilled') setAccounts(Array.isArray(accRes.value) ? accRes.value : []);
      if (reqRes.status === 'fulfilled') setAccountRequests(Array.isArray(reqRes.value) ? reqRes.value : []);
      if (txRes.status === 'fulfilled') setTransactions(Array.isArray(txRes.value) ? txRes.value : []);
    } catch (err) {
      console.error('Failed fetching data:', err);
      addToast('Sync Issue', 'Could not fetch latest bank records from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, checkConnection, searchQuery, addToast]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Search debounce
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      api.getAccounts(searchQuery)
        .then((res) => setAccounts(Array.isArray(res) ? res : []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [user, searchQuery]);

  // User login & logout
  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('APEX_USER_SESSION', JSON.stringify(userInfo));
    addToast('Authenticated', `Signed in as ${userInfo.name} (${userInfo.role.toUpperCase()}).`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('APEX_USER_SESSION');
    addToast('Signed Out', 'Your session has been terminated.', 'info');
  };

  // Review decisions (Manager & Admin only)
  const handleReviewAccount = async (id, decision) => {
    if (user?.role === 'teller') {
      addToast('Unauthorized', 'Tellers cannot approve or reject account requests.', 'error');
      return;
    }
    try {
      const res = await api.reviewAccountRequest(id, decision);
      if (decision === 'approve') {
        addToast(
          'Account Approved',
          `Generated Account Number: ${res.account_number}. Record active in database.`,
          'success'
        );
      } else {
        addToast('Account Rejected', `Account application #${id} has been marked as rejected.`, 'info');
      }
      fetchAllData();
      return res;
    } catch (err) {
      addToast('Review Failed', err.message || 'Error updating account request.', 'error');
      throw err;
    }
  };

  const handleReviewTransaction = async (id, decision) => {
    if (user?.role === 'teller') {
      addToast('Unauthorized', 'Tellers cannot approve or reject monetary transactions.', 'error');
      return;
    }
    try {
      const res = await api.reviewTransaction(id, decision);
      if (decision === 'approve') {
        addToast(
          'Transaction Executed',
          `Transaction #${id} approved and balances updated atomically.`,
          'success'
        );
      } else {
        addToast('Transaction Rejected', `Transaction #${id} was marked as rejected.`, 'info');
      }
      fetchAllData();
      return res;
    } catch (err) {
      addToast('Execution Failed', err.message || 'Error processing transaction review.', 'error');
      throw err;
    }
  };

  // Quick Action Shortcuts
  const handleQuickDeposit = (acc = null) => {
    setTxModalPreset({ account: acc, type: 'deposit' });
    setIsNewTransactionOpen(true);
  };

  const handleQuickWithdrawal = (acc = null) => {
    setTxModalPreset({ account: acc, type: 'withdrawal' });
    setIsNewTransactionOpen(true);
  };

  const handleQuickTransfer = (acc = null) => {
    setTxModalPreset({ account: acc, type: 'transfer' });
    setIsNewTransactionOpen(true);
  };

  const handleDeleteAccount = async (account) => {
    try {
      await api.deleteAccount(account.id);
      addToast(
        'Customer Deleted',
        `Account ${account.account_number} (${account.customer_name}) has been permanently deleted.`,
        'success'
      );
      if (selectedAccount?.id === account.id) {
        setSelectedAccount(null);
      }
      fetchAllData();
    } catch (err) {
      addToast('Delete Failed', err.message || 'Could not delete customer account.', 'error');
      throw err;
    }
  };

  const handleNavigateToReviews = (subTab = 'accounts') => {
    setReviewSubTab(subTab);
    handleNavigatePage('operations');
  };

  const pendingCounts = {
    accounts: accountRequests.filter((r) => r.status === 'pending').length,
    transactions: transactions.filter((t) => t.status === 'pending').length,
  };

  // If not logged in, show clean Sign In page (no admin hint, no fill-in button)
  if (!user) {
    return (
      <>
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* WCAG 2.1 AA Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Application Bar */}
      <Header
        activeTab={activePage}
        setActiveTab={handleNavigatePage}
        pendingCounts={pendingCounts}
        user={user}
        onLogout={handleLogout}
        onOpenNewAccount={() => setIsNewAccountOpen(true)}
        onOpenNewTransaction={() => {
          setTxModalPreset({ account: null, type: 'deposit' });
          setIsNewTransactionOpen(true);
        }}
      />

      {/* Main Container - Exactly 2 primary sections */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 focus:outline-none">
        {/* Connection warning banner if backend is down */}
        {!backendConnected && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <p className="font-bold text-white">Backend Server Unreachable</p>
                <p className="opacity-90">
                  Ensure the backend is running or configure API target.
                </p>
              </div>
            </div>
            <button
              onClick={checkConnection}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl font-bold bg-rose-800 hover:bg-rose-700 text-white transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Page 1: Role-Specific Dashboard (with Embedded Accounts Directory) */}
        {activePage === 'dashboard' && (
          <section className="animate-in fade-in duration-200">
            {/* 1. Teller Workstation */}
            {user.role === 'teller' ? (
              <TellerDashboard
                accounts={accounts}
                transactions={transactions}
                loading={loading}
                user={user}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={fetchAllData}
                onOpenNewAccount={() => setIsNewAccountOpen(true)}
                onOpenDeposit={handleQuickDeposit}
                onOpenWithdrawal={handleQuickWithdrawal}
                onOpenTransfer={handleQuickTransfer}
                onSelectAccount={(acc) => setSelectedAccount(acc)}
                onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                onDeleteAccount={handleDeleteAccount}
                onToast={addToast}
              />
            ) : (
              /* 2. Manager Dashboard */
              <ManagerDashboard
                dashboardData={dashboardData}
                accountRequests={accountRequests}
                transactionRequests={transactions}
                accounts={accounts}
                loading={loading}
                user={user}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={fetchAllData}
                onReviewAccount={handleReviewAccount}
                onReviewTransaction={handleReviewTransaction}
                onNavigateToReviews={handleNavigateToReviews}
                onSelectAccount={(acc) => setSelectedAccount(acc)}
                onOpenNewAccount={() => setIsNewAccountOpen(true)}
                onQuickDeposit={handleQuickDeposit}
                onQuickTransfer={handleQuickTransfer}
                onDeleteAccount={handleDeleteAccount}
                onToast={addToast}
              />
            )}
          </section>
        )}

        {/* Page 2: Combined Requests and Transactions Ledger */}
        {activePage === 'operations' && (
          <section className="animate-in fade-in duration-200">
            <RequestsAndLedger
              user={user}
              accountRequests={accountRequests}
              transactions={transactions}
              accounts={accounts}
              loading={loading}
              onRefresh={fetchAllData}
              onReviewAccount={handleReviewAccount}
              onReviewTransaction={handleReviewTransaction}
              onSelectAccount={(acc) => setSelectedAccount(acc)}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onOpenNewAccount={() => setIsNewAccountOpen(true)}
              onOpenNewTransaction={() => {
                setTxModalPreset({ account: null, type: 'deposit' });
                setIsNewTransactionOpen(true);
              }}
              initialView={reviewSubTab === 'ledger' ? 'ledger' : 'requests'}
              initialRequestType={reviewSubTab === 'transactions' ? 'money' : 'accounts'}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 sm:py-6 text-xs text-slate-500 safe-bottom">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 rounded-md" />
            <span className="font-bold text-slate-300">ApexCore Bank</span>
            <span>&bull;</span>
            <span className="hidden sm:inline">Enterprise Account Management System</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-400">
            <span>
              Signed in as: <strong className="text-emerald-400 font-mono">{user.username}</strong> ({user.role})
            </span>
            <span>&bull;</span>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 underline font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {isNewAccountOpen && (
        <NewAccountModal
          onClose={() => setIsNewAccountOpen(false)}
          onSuccess={() => {
            fetchAllData();
            addToast('Request Created', 'Account application submitted successfully.', 'success');
          }}
          onNavigateToReviews={handleNavigateToReviews}
        />
      )}

      {isNewTransactionOpen && (
        <NewTransactionModal
          accounts={accounts}
          preselectedAccount={txModalPreset.account}
          preselectedType={txModalPreset.type}
          onClose={() => setIsNewTransactionOpen(false)}
          onSuccess={() => {
            fetchAllData();
            addToast('Transaction Created', 'Transaction request is now queued for review.', 'success');
          }}
          onNavigateToReviews={handleNavigateToReviews}
        />
      )}

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onOpenDeposit={handleQuickDeposit}
          onOpenWithdrawal={handleQuickWithdrawal}
          onOpenTransfer={handleQuickTransfer}
          onSelectTransaction={(tx) => setSelectedTransaction(tx)}
          onDeleteAccount={handleDeleteAccount}
          onToast={(title, msg) => addToast(title, msg, 'info')}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          accounts={accounts}
          onClose={() => setSelectedTransaction(null)}
          onReviewTransaction={handleReviewTransaction}
          canReview={user?.role !== 'teller'}
          onToast={(title, msg) => addToast(title, msg, 'info')}
        />
      )}
    </div>
  );
}
