const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Use a fresh temporary database for every test run.
// Use a fresh temporary database for every test run.
const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-api-'));
process.env.BANK_DB_PATH = path.join(folder, 'test.db');

// Use the same built-in SQLite database as the application.
const db = require('../database');

// Load the application after configuring the test database.
const app = require('../server');
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

async function request(route, method = 'GET', data) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined
  });
  return { status: response.status, body: await response.json() };
}

test('account approval, deposit, and atomic transfer workflow', async () => {
  let result = await request('/api/accounts/requests', 'POST', {
    customer_name: 'Asha Khan', email: 'asha@example.com', phone: '01012345678', account_type: 'savings'
  });
  assert.equal(result.status, 201);
  const firstRequest = result.body.request_id;
  result = await request(`/api/accounts/requests/${firstRequest}/approve`, 'POST');
  assert.equal(result.body.status, 'approved');
  const firstAccount = result.body.account_id;

  const second = await request('/api/accounts/requests', 'POST', {
    customer_name: 'Omar Ali', email: 'omar@example.com', phone: '01087654321', account_type: 'current'
  });
  const secondApproval = await request(`/api/accounts/requests/${second.body.request_id}/approve`, 'POST');
  const secondAccount = secondApproval.body.account_id;

  const deposit = await request('/api/transactions/requests', 'POST', { type: 'deposit', to_account_id: firstAccount, amount: 100 });
  assert.equal((await request(`/api/transactions/${deposit.body.transaction_id}/approve`, 'POST')).body.status, 'approved');
  const transfer = await request('/api/transactions/requests', 'POST', {
    type: 'transfer', from_account_id: firstAccount, to_account_id: secondAccount, amount: '35.25'
  });
  await request(`/api/transactions/${transfer.body.transaction_id}/approve`, 'POST');

  const balances = await request('/api/accounts');
  assert.deepEqual(balances.body.map(account => account.balance_cents).sort((a, b) => a - b), [3525, 6475]);
  assert.equal((await request(`/api/transactions/${transfer.body.transaction_id}/approve`, 'POST')).status, 409);
});

test('rejects unsafe requests and overdrafts without changing balances', async () => {
  const accounts = await request('/api/accounts');
  const sender = accounts.body.find(account => account.balance_cents === 3525);
  const receiver = accounts.body.find(account => account.id !== sender.id);
  assert.equal((await request('/api/transactions/requests', 'POST', {
    type: 'transfer', from_account_id: sender.id, to_account_id: sender.id, amount: 1
  })).status, 400);
  assert.equal((await request('/api/transactions/requests', 'POST', {
    type: 'withdrawal', from_account_id: sender.id, amount: -2
  })).status, 400);
  assert.equal((await request('/api/transactions/requests', 'POST', {
    type: 'transfer', from_account_id: sender.id, to_account_id: receiver.id, amount: 1000
  })).status, 201);
  const pending = await request('/api/transactions?status=pending');
  const tooLarge = pending.body[pending.body.length - 1];
  assert.equal((await request(`/api/transactions/${tooLarge.id}/approve`, 'POST')).status, 400);
  const after = await request('/api/accounts');
  assert.equal(after.body.find(account => account.id === sender.id).balance_cents, 3525);
});

test('simulated teller login and dashboard return expected results', async () => {
  assert.equal((await request('/api/login', 'POST', { username: 'teller', password: 'wrong' })).status, 401);
  assert.equal((await request('/api/login', 'POST', { username: 'teller', password: 'teller123' })).status, 200);
  const dashboard = await request('/api/dashboard');
  assert.equal(dashboard.body.active_accounts, 2);
  assert.equal(dashboard.body.total_balance_cents, 10000);
});

test.after(() => {
  server.close();
  db.close();
  fs.rmSync(folder, { recursive: true, force: true });
});