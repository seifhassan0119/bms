# Simple Bank Management System API

A beginner-friendly backend for a coursework bank records-management system. It uses Node.js, Express, and SQLite. Customers are records; the only simulated user is a teller. Account and money requests stay pending until the teller approves or rejects them.

> This is a learning project, not real banking software. The login is simulated and the API does not issue or check sessions/tokens.

## What is included

- Simulated teller login (`teller` / `teller123` by default).
- Dashboard totals and recent transactions.
- Account creation requests, review, listing, search, and details.
- Deposit, withdrawal, and transfer requests with teller review.
- Transaction history, filters, and individual transaction details.
- Persistent SQLite storage and validation.
- Atomic balance changes, money stored as integer cents, overdraft checks, self-transfer checks, and duplicate-review protection.

## Requirements

- Node.js 20 or later
- Windows PowerShell

## Install and run (PowerShell)

Open PowerShell in this project folder, then run:

```powershell
npm install
npm start
```

The API listens at `http://localhost:3000`. The SQLite database is created at `database/bank.db` the first time the server runs. Keep that file to keep your records.

To use different simulated teller credentials in the current PowerShell window:

```powershell
$env:TELLER_USERNAME = "staff"
$env:TELLER_PASSWORD = "choose-a-password"
npm start
```

## Run the included workflow checks

```powershell
npm test
```

## API examples

Use `Invoke-RestMethod` from PowerShell. These examples assume the server is running in another window.

### Teller login

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/login `
  -ContentType "application/json" `
  -Body '{"username":"teller","password":"teller123"}'
$login
```

Login is simulated only; it does not protect other endpoints with a real session.

### Submit and approve an account request

```powershell
$request = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/accounts/requests `
  -ContentType "application/json" `
  -Body '{"customer_name":"Asha Khan","email":"asha@example.com","phone":"01012345678","account_type":"savings"}'
$request

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/accounts/requests/$($request.request_id)/approve"
```

Use `/reject` instead of `/approve` to reject a pending request. A request can only be reviewed once.

### List and search accounts

```powershell
Invoke-RestMethod http://localhost:3000/api/accounts
Invoke-RestMethod "http://localhost:3000/api/accounts?search=Asha"
Invoke-RestMethod http://localhost:3000/api/accounts/1
```

The account detail route accepts either the numeric database ID or account number.

### Submit and approve a deposit

```powershell
$deposit = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/transactions/requests `
  -ContentType "application/json" `
  -Body '{"type":"deposit","to_account_id":1,"amount":250.00,"note":"Cash deposit"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/transactions/$($deposit.transaction_id)/approve"
```

### Submit and approve a withdrawal

```powershell
$withdrawal = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/transactions/requests `
  -ContentType "application/json" `
  -Body '{"type":"withdrawal","from_account_id":1,"amount":20}'
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/transactions/$($withdrawal.transaction_id)/approve"
```

An approved withdrawal is rejected if the account does not have enough money.

### Submit and approve a transfer

```powershell
$transfer = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/transactions/requests `
  -ContentType "application/json" `
  -Body '{"type":"transfer","from_account_id":1,"to_account_id":2,"amount":35.25}'
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/transactions/$($transfer.transaction_id)/approve"
```

Both balances change together in one SQLite transaction. Transfers to the same account, negative amounts, missing accounts, and overdrafts are rejected.

### Review a money request

Use `POST /api/transactions/{id}/approve` or `POST /api/transactions/{id}/reject`. Repeating a decision returns HTTP 409.

### History, filters, details, and dashboard

```powershell
Invoke-RestMethod http://localhost:3000/api/transactions
Invoke-RestMethod "http://localhost:3000/api/transactions?type=transfer&status=approved"
Invoke-RestMethod "http://localhost:3000/api/transactions?account_id=1"
Invoke-RestMethod http://localhost:3000/api/transactions/1
Invoke-RestMethod http://localhost:3000/api/dashboard
```

## Project layout

```text
bank-management-system/
  server.js                 Express setup and simulated login
  database.js               SQLite connection and table creation
  routes/accounts.js        Account request and account endpoints
  routes/transactions.js    Money request and history endpoints
  routes/dashboard.js       Dashboard statistics
  test/workflows.test.js    Key workflow checks
  database/                 Created automatically for the SQLite file
```

Money amounts in requests are regular currency units (for example `35.25`). Database balances are stored as integer cents to avoid floating point rounding errors. API account rows expose `balance_cents` so the representation stays explicit.
