# Team4-TaxPal-Personal-Finance-Tax-Estimator-for-Freelancers-
**Project Statement:**
TaxPal helps freelancers and gig workers manage income, track expenses, and estimate quarterly
taxes. It supports categorized transaction logging, budgeting, and downloadable financial reports

**Outcomes:**
1. Users can log income and expenses.
2. Categorize transactions and set budget limits.
3. Get regional tax estimates automatically.
4. Monthly and quarterly financial summaries.
5. Downloadable reports for tax filing.
Modules:
Module A: Income & Expense Management.
Module B: Categorization & Budgeting.
Module C: Tax Estimation Engine.
Module D: Reporting & Export. 

# 💰 TaxPal Backend

A secure and scalable RESTful API for **TaxPal – Personal Finance & Tax Estimator for Freelancers**.  
Built with **Node.js, Express.js, Prisma ORM, MySQL, and JWT Authentication**.

---

## 📌 Features

### 🔐 Authentication
- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes

### 👤 User Management
- Get User Profile
- Secure User Authentication

### 💳 Transactions
- Add Transaction
- View All Transactions
- View Transaction by ID
- Update Transaction
- Delete Transaction

### 💼 Budget Management
- Create Budget
- View Budget
- Update Budget

### 🧾 Tax Estimation
- Estimate Tax
- View Tax Reports

### 📊 Reports
- Financial Summary
- Monthly Report
- Tax Report

### 📈 Dashboard
- Financial Dashboard
- Recent Transactions
- Income & Expense Summary

### 📤 Export
- Export Report as PDF
- Export Transactions as CSV

### ✅ Validation & Error Handling
- Request Validation using Zod
- Global Error Middleware
- Custom 404 Handler

---

# 🛠 Tech Stack

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT Authentication
- bcrypt
- Zod
- PDFKit
- json2csv

---

# 📁 Project Structure

```
taxpal-backend
│
├── prisma/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── validations/
│   ├── docs/
│   └── app.js
│
├── server.js
├── package.json
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone <repository-url>
```

Move into project

```bash
cd taxpal-backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
DATABASE_URL="your_database_url"

JWT_SECRET="your_secret_key"

PORT=5000
```

Run Prisma Migration

```bash
npx prisma migrate dev
```

Generate Prisma Client

```bash
npx prisma generate
```

Start Server

```bash
npm start
```

Development Mode

```bash
npm run dev
```

---

# 📌 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |

---

## User

| Method | Endpoint |
|---------|----------|
| GET | /api/user/profile |

---

## Transactions

| Method | Endpoint |
|---------|----------|
| POST | /api/transactions |
| GET | /api/transactions |
| GET | /api/transactions/:id |
| PUT | /api/transactions/:id |
| DELETE | /api/transactions/:id |

---

## Budget

| Method | Endpoint |
|---------|----------|
| POST | /api/budgets |
| GET | /api/budgets |

---

## Tax

| Method | Endpoint |
|---------|----------|
| POST | /api/tax-estimates |
| GET | /api/tax-estimates |

---

## Reports

| Method | Endpoint |
|---------|----------|
| GET | /api/reports/summary |
| GET | /api/reports/monthly |
| GET | /api/reports/tax |

---

## Dashboard

| Method | Endpoint |
|---------|----------|
| GET | /api/dashboard |

---

## Export

| Method | Endpoint |
|---------|----------|
| GET | /api/export/pdf |
| GET | /api/export/csv |

---

# 🔒 Authentication

Protected routes require a JWT token.

```
Authorization: Bearer <your_token>
```

---

