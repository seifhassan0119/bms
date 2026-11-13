const express = require('express');
const db = require('../database');
const router = express.Router();

function centsFrom(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text) * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function accountId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.post('/requests', (req, res) => {
  const body = req.body || {};
  const type = typeof body.type === 'string' ? body.type.toLowerCase() : '';
  const amountCents = centsFrom(body.amount);
  const fromId = body.from_account_id == null ? null : accountId(body.from_account_id);
  const toId = body.to_account_id == null ? null : accountId(body.to_account_id);
  if (!['deposit', 'withdrawal', 'transfer'].includes(type)) return res.status(400).json({ error: 'Type must be deposit, withdrawal, or transfer.' });
  if (!amountCents) return res.status(400).json({ error: 'Amount must be a positive number with up to two decimal places.' });
  if (type === 'deposit' && (!toId || fromId)) return res.status(400).json({ error: 'For a deposit, provide only to_account_id.' });
  if (type === 'withdrawal' && (!fromId || toId)) return res.status(400).json({ error: 'For a withdrawal, provide only from_account_id.' });
  if (type === 'transfer' && (!fromId || !toId)) return res.status(400).json({ error: 'For a transfer, provide both account IDs.' });
  if (fromId && fromId === toId) return res.status(400).json({ error: 'An account cannot transfer money to itself.' });

  const ids = [fromId, toId].filter(Boolean);
  const found = db.prepare(`SELECT id, status FROM accounts WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids);
  if (found.length !== ids.length) return res.status(404).json({ error: 'One or more accounts do not exist.' });
  if (found.some(account => account.status !== 'active')) return res.status(400).json({ error: 'All requested accounts must be active.' });

  const result = db.prepare(`INSERT INTO transactions (type, from_account_id, to_account_id, amount_cents, note)
    VALUES (?, ?, ?, ?, ?)`).run(type, fromId, toId, amountCents, typeof body.note === 'string' ? body.note.trim() : '');
  res.status(201).json({ message: 'Transaction request submitted.', transaction_id: result.lastInsertRowid, status: 'pending' });
});

router.get('/', (req, res) => {
  const conditions = [];
  const values = [];
  if (['deposit', 'withdrawal', 'transfer'].includes(req.query.type)) { conditions.push('type = ?'); values.push(req.query.type); }
  if (['pending', 'approved', 'rejected'].includes(req.query.status)) { conditions.push('status = ?'); values.push(req.query.status); }
  if (req.query.account_id && accountId(req.query.account_id)) {
    conditions.push('(from_account_id = ? OR to_account_id = ?)'); values.push(accountId(req.query.account_id), accountId(req.query.account_id));
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  res.json(db.prepare(`SELECT * FROM transactions ${where} ORDER BY id DESC`).all(...values));
});

router.get('/:id', (req, res) => {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(Number(req.params.id));
  if (!transaction) return res.status(404).json({ error: 'Transaction not found.' });
  res.json(transaction);
});

router.post('/:id/:decision', (req, res) => {
  const id = Number(req.params.id);
  const decision = req.params.decision;
  if (!Number.isInteger(id) || id < 1 || !['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Use a valid transaction ID and approve or reject.' });

  const review = db.transaction(() => {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!transaction) return { error: 'Transaction not found.', code: 404 };
    if (transaction.status !== 'pending') return { error: 'This transaction has already been reviewed.', code: 409 };
    if (decision === 'reject') {
      db.prepare("UPDATE transactions SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      return { status: 'rejected' };
    }

    // Check the source balance inside the same transaction as both updates.
    if (transaction.from_account_id) {
      const debit = db.prepare(`UPDATE accounts SET balance_cents = balance_cents - ?
        WHERE id = ? AND status = 'active' AND balance_cents >= ?`)
        .run(transaction.amount_cents, transaction.from_account_id, transaction.amount_cents);
      if (debit.changes !== 1) return { error: 'Insufficient funds or source account is inactive.', code: 400 };
    }
    if (transaction.to_account_id) {
      const credit = db.prepare("UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ? AND status = 'active'")
        .run(transaction.amount_cents, transaction.to_account_id);
      if (credit.changes !== 1) throw new Error('Destination account could not be credited.');
    }
    db.prepare("UPDATE transactions SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'").run(id);
    return { status: 'approved' };
  });

  const result = review();
  if (result.error) return res.status(result.code).json({ error: result.error });
  res.json(result);
});

module.exports = router;
