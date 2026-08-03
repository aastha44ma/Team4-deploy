const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

// Simple CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const sampleTransactions = [
  { id: 't1', type: 'Income', amount: 50000, category: 'Freelance', date: '2026-06-01' },
  { id: 't2', type: 'Expense', amount: 12000, category: 'Rent', date: '2026-06-03' },
  { id: 't3', type: 'Expense', amount: 3000, category: 'Utilities', date: '2026-06-05' },
  { id: 't4', type: 'Expense', amount: 4500, category: 'Groceries', date: '2026-06-08' },
  { id: 't5', type: 'Income', amount: 20000, category: 'Project Bonus', date: '2026-06-15' }
];

app.get('/api/transactions', (req, res) => {
  res.json({ data: sampleTransactions });
});

app.get('/api/budgets', (req, res) => {
  res.json({ data: [] });
});

app.listen(port, () => {
  console.log(`Mock API server listening on http://localhost:${port}`);
});

module.exports = app;
