import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import AccountDetailModal from './components/AccountDetailModal';
import TransactionDetailModal from './components/TransactionDetailModal';
import NewAccountModal from './components/NewAccountModal';
import NewTransactionModal from './components/NewTransactionModal';
import LoginPage from './components/LoginPage';
import Toast from './components/Toast';
import { api } from './api/client';
import { useBankData } from './hooks/useBankData';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('AXIOM_USER_SESSION');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const managerUser = { id: 'staff-manager', username: 'manager', name: 'Manager', role: 'manager', status: 'active' };
      if (!parsed || parsed.role !== 'manager') {
        localStorage.setItem('AXIOM_USER_SESSION', JSON.stringify(managerUser));
        return managerUser;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const { backendConnected, accounts, accountRequests, transactions, checkConnection, fetchAllData } = useBankData(user, searchQuery);

  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [txModalPreset, setTxModalPreset] = useState({ account: null, type: 'deposit' });
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    document.title = user ? 'AxiomBank | Manager Dashboard' : 'AxiomBank | Sign In';
  }, [user]);

  const handleLoginSuccess = (userInfo) => {
    const managerInfo = { ...userInfo, role: 'manager' };
    setUser(managerInfo);
    localStorage.setItem('AXIOM_USER_SESSION', JSON.stringify(managerInfo));
    addToast('Authenticated', `Signed in as ${managerInfo.name || 'Manager'}.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('AXIOM_USER_SESSION');
    addToast('Signed Out', 'Your session has been terminated.', 'info');
  };

  const handleReviewAccount = async (id, decision) => {
    try {
      const res = await api.reviewAccountRequest(id, decision);
      addToast(decision === 'approve' ? 'Account Approved' : 'Account Rejected', `Request #${id} processed.`, decision === 'approve' ? 'success' : 'info');
      fetchAllData();
      return res;
    } catch (err) {
      addToast('Review Failed', err.message || 'Error updating account request.', 'error');
      throw err;
    }
  };

  const handleReviewTransaction = async (id, decision) => {
    try {
      const res = await api.reviewTransaction(id, decision);
      addToast(decision === 'approve' ? 'Transaction Executed' : 'Transaction Rejected', `Transaction #${id} updated.`, decision === 'approve' ? 'success' : 'info');
      fetchAllData();
      return res;
    } catch (err) {
      addToast('Execution Failed', err.message || 'Error processing transaction review.', 'error');
      throw err;
    }
  };

  const handleDeleteAccount = async (account) => {
    try {
      await api.deleteAccount(account.id);
      addToast('Customer Deleted', `Account ${account.account_number} (${account.customer_name}) deleted.`, 'success');
      if (selectedAccount?.id === account.id) setSelectedAccount(null);
      fetchAllData();
    } catch (err) {
      addToast('Delete Failed', err.message || 'Could not delete account.', 'error');
      throw err;
    }
  };

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
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <Header user={user} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 focus:outline-none">
        {!backendConnected && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <p className="font-bold text-white">Backend Server Unreachable</p>
                <p className="opacity-90">Ensure the API server at https://api.axiombank.site is running.</p>
              </div>
            </div>
            <button onClick={checkConnection} className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl font-bold bg-rose-800 hover:bg-rose-700 text-white">
              Retry Connection
            </button>
          </div>
        )}

        <ManagerDashboard
          accountRequests={accountRequests}
          transactionRequests={transactions}
          accounts={accounts}
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReviewAccount={handleReviewAccount}
          onReviewTransaction={handleReviewTransaction}
          onSelectAccount={(acc) => setSelectedAccount(acc)}
          onOpenNewAccount={() => setIsNewAccountOpen(true)}
          onOpenNewTransaction={() => {
            setTxModalPreset({ account: null, type: 'deposit' });
            setIsNewTransactionOpen(true);
          }}
          onDeleteAccount={handleDeleteAccount}
          onToast={addToast}
        />
      </main>

      {isNewAccountOpen && (
        <NewAccountModal
          onClose={() => setIsNewAccountOpen(false)}
          onSuccess={() => { fetchAllData(); addToast('Request Created', 'Application submitted.', 'success'); }}
        />
      )}

      {isNewTransactionOpen && (
        <NewTransactionModal
          accounts={accounts}
          preselectedAccount={txModalPreset.account}
          preselectedType={txModalPreset.type}
          onClose={() => setIsNewTransactionOpen(false)}
          onSuccess={() => { fetchAllData(); addToast('Transaction Created', 'Queued for approval.', 'success'); }}
        />
      )}

      {selectedAccount && (
        <AccountDetailModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onOpenWithdrawal={(acc) => { setTxModalPreset({ account: acc, type: 'withdrawal' }); setIsNewTransactionOpen(true); }}
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
          canReview={true}
          onToast={(title, msg) => addToast(title, msg, 'info')}
        />
      )}
    </div>
  );
}
