const express = require('express');
const db = require('../database');
const router = express.Router();

function cleanText(value) { return typeof value === 'string' ? value.trim() : ''; }

function validateCustomer(body) {
  const customer = {
    customer_name: cleanText(body.customer_name),
    email: cleanText(body.email),
    phone: cleanText(body.phone),
    account_type: cleanText(body.account_type).toLowerCase()
  };
  if (!customer.customer_name || !customer.email || !customer.phone) return 'Name, email, and phone are required.';
  if (!/^\S+@\S+\.\S+$/.test(customer.email)) return 'Enter a valid email address.';
  if (!['savings', 'current'].includes(customer.account_type)) return 'Account type must be savings or current.';
  return customer;
}

router.post('/requests', (req, res) => {
  const customer = validateCustomer(req.body || {});
  if (typeof customer === 'string') return res.status(400).json({ error: customer });
  const result = db.prepare(`INSERT INTO account_requests (customer_name, email, phone, account_type)
    VALUES (@customer_name, @email, @phone, @account_type)`).run(customer);
  res.status(201).json({ message: 'Account request submitted.', request_id: result.lastInsertRowid, status: 'pending' });
});

router.get('/requests', (_req, res) => {
  const status = cleanText(_req.query.status);
  const rows = ['pending', 'approved', 'rejected'].includes(status)
    ? db.prepare('SELECT * FROM account_requests WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT * FROM account_requests ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/requests/:id/:decision', (req, res) => {
  const id = Number(req.params.id);
  const decision = req.params.decision;
  if (!Number.isInteger(id) || id < 1 || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Use a valid request ID and approve or reject.' });
  }

  const review = db.transaction(() => {
    const request = db.prepare('SELECT * FROM account_requests WHERE id = ?').get(id);
    if (!request) return { error: 'Account request not found.', code: 404 };
    if (request.status !== 'pending') return { error: 'This request has already been reviewed.', code: 409 };
    if (decision === 'reject') {
      db.prepare("UPDATE account_requests SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      return { status: 'rejected' };
    }
    const accountNumber = `ACC${String(Date.now()).slice(-8)}${String(id).padStart(3, '0')}`;
    const account = db.prepare(`INSERT INTO accounts (account_number, customer_name, email, phone, account_type)
      VALUES (?, ?, ?, ?, ?)`).run(accountNumber, request.customer_name, request.email, request.phone, request.account_type);
    db.prepare("UPDATE account_requests SET status = 'approved', account_id = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(account.lastInsertRowid, id);
    return { status: 'approved', account_id: account.lastInsertRowid, account_number: accountNumber };
  });

  try {
    const result = review();
    if (result.error) return res.status(result.code).json({ error: result.error });
    return res.json(result);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Could not create a unique account number. Try again.' });
    throw error;
  }
});

router.get('/', (req, res) => {
  const search = cleanText(req.query.search);
  const rows = search
    ? db.prepare(`SELECT * FROM accounts WHERE account_number LIKE ? OR customer_name LIKE ? ORDER BY id DESC`).all(`%${search}%`, `%${search}%`)
    : db.prepare('SELECT * FROM accounts ORDER BY id DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ? OR account_number = ?').get(req.params.id, req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  res.json(account);
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const deleteOp = db.transaction(() => {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ? OR account_number = ?').get(id, id);
    if (!account) {
      return { error: 'Account not found.', code: 404 };
    }

    // Clean up foreign key references in transactions and requests
    db.prepare('DELETE FROM transactions WHERE from_account_id = ? OR to_account_id = ?').run(account.id, account.id);
    db.prepare('DELETE FROM account_requests WHERE account_id = ?').run(account.id);
    db.prepare('DELETE FROM accounts WHERE id = ?').run(account.id);

    return {
      message: `Customer account ${account.account_number} (${account.customer_name}) deleted successfully.`,
      id: account.id,
      account_number: account.account_number,
      customer_name: account.customer_name,
    };
  });

  try {
    const result = deleteOp();
    if (result.error) {
      return res.status(result.code).json({ error: result.error });
    }
    return res.json(result);
  } catch (error) {
    console.error('Failed to delete account:', error);
    return res.status(500).json({ error: 'Failed to delete customer account.' });
  }
});

module.exports = router;
