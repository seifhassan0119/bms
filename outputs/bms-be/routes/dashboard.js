const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (_req, res) => {
  const accounts = db.prepare(`SELECT COUNT(*) AS total,
    COALESCE(SUM(balance_cents), 0) AS total_balance_cents FROM accounts WHERE status = 'active'`).get();
  const accountRequests = db.prepare(`SELECT COUNT(*) AS total FROM account_requests WHERE status = 'pending'`).get();
  const transactionRequests = db.prepare(`SELECT COUNT(*) AS total FROM transactions WHERE status = 'pending'`).get();
  const recentTransactions = db.prepare('SELECT * FROM transactions ORDER BY id DESC LIMIT 5').all();
  res.json({
    active_accounts: accounts.total,
    total_balance_cents: accounts.total_balance_cents,
    pending_account_requests: accountRequests.total,
    pending_transaction_requests: transactionRequests.total,
    recent_transactions: recentTransactions
  });
});

module.exports = router;
