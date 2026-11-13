
const express = require('express');
const cors = require('cors');

const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or any of the bank's domains & localhost
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('axiombank.site')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.TELLER_USERNAME || 'teller';
  const expectedPassword = process.env.TELLER_PASSWORD || 'teller123';

  if (username !== expectedUser || password !== expectedPassword) {
    return res.status(401).json({
      error: 'Invalid teller username or password.'
    });
  }

  return res.json({
    message: 'Login successful.',
    teller: { username, role: 'teller' }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: 'Something went wrong. Please try again.'
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bank API listening at http://localhost:${PORT}`);
  });
}

module.exports = app;
