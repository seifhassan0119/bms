import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useBankData(user, searchQuery) {
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const checkConnection = useCallback(async () => {
    try {
      await api.checkHealth();
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await checkConnection();
      const [accRes, reqRes, txRes] = await Promise.allSettled([
        api.getAccounts(searchQuery),
        api.getAccountRequests(),
        api.getTransactions(),
      ]);

      if (accRes.status === 'fulfilled') setAccounts(Array.isArray(accRes.value) ? accRes.value : []);
      if (reqRes.status === 'fulfilled') setAccountRequests(Array.isArray(reqRes.value) ? reqRes.value : []);
      if (txRes.status === 'fulfilled') setTransactions(Array.isArray(txRes.value) ? txRes.value : []);
    } catch (err) {
      console.error('Data sync failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user, checkConnection, searchQuery]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      api.getAccounts(searchQuery)
        .then((res) => setAccounts(Array.isArray(res) ? res : []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [user, searchQuery]);

  return {
    backendConnected,
    loading,
    accounts,
    accountRequests,
    transactions,
    checkConnection,
    fetchAllData,
  };
}
