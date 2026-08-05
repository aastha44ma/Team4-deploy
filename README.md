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

# 💰 TaxPal

A full-stack app for **TaxPal – Personal Finance & Tax Estimator for Freelancers**, made up of:
- **Backend** — a secure RESTful API built with **Node.js, Express.js, Prisma ORM, and JWT Authentication**
- **Frontend** — an **Angular (SSR)** single-page app that consumes the API

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

### 🖥️ Frontend (Angular)
- Login / Register page
- Dashboard with financial overview
- Income tracking page
- Expense tracking page
- Transactions page
- Server-Side Rendering (Angular SSR / Express)

---

# 🛠 Tech Stack

**Backend**
- Node.js
- Express.js 5
- Prisma ORM
- JWT Authentication (jsonwebtoken)
- bcrypt
- Zod
- PDFKit
- json2csv

**Frontend**
- Angular 22 (standalone components, SSR)
- Chart.js
- RxJS
- TypeScript

---

# 📁 Project Structure

```
Team4-TaxPal-Personal-Finance-Tax-Estimator-for-Freelancers-
│
├── prisma/                          # Prisma schema & migrations
│   ├── migrations/
│   └── schema.prisma
│
├── src/                             # Backend source
│   ├── config/
│   │   └── prisma.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── export.controller.js
│   │   ├── report.controller.js
│   │   ├── tax.controller.js
│   │   ├── transaction.controller.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── export.routes.js
│   │   ├── report.routes.js
│   │   ├── tax.routes.js
│   │   ├── transaction.routes.js
│   │   └── user.routes.js
│   ├── validations/
│   │   └── auth.validation.js
│   └── app.js
│
├── frontend/                        # Angular SSR frontend
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── expense/
│   │   │   │   ├── income/
│   │   │   │   └── transactions/
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.ts
│   │   ├── main.ts
│   │   ├── main.server.ts
│   │   └── server.ts
│   ├── angular.json
│   ├── mock-server.js
│   └── package.json
│
├── server.js                        # Backend entry point
├── prisma.config.ts
├── package.json
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone <repository-url>
cd Team4-TaxPal-Personal-Finance-Tax-Estimator-for-Freelancers-
```

## Backend setup

Install dependencies (run from the project root)

```bash
npm install
```

Create a `.env` file in the project root

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

Start the backend server

```bash
node server.js
```

Development mode (auto-restart with nodemon)

```bash
npx nodemon server.js
```

> The backend currently doesn't define `start`/`dev` scripts in `package.json` — you can add them (`"start": "node server.js"`, `"dev": "nodemon server.js"`) to use `npm start` / `npm run dev` instead.

## Frontend setup

Move into the frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start the Angular dev server

```bash
npm start
```

The app will be available at `http://localhost:4200` by default.

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
| GET | /api/budgets/:id |
| PUT | /api/budgets/:id |
| DELETE | /api/budgets/:id |

---

## Tax

| Method | Endpoint |
|---------|----------|
| POST | /api/tax-estimates |
| GET | /api/tax-estimates |
| GET | /api/tax-estimates/:id |
| DELETE | /api/tax-estimates/:id |

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

# 🧭 Frontend Routes

| Path | Page |
|------|------|
| /login | Login |
| /register | Register |
| /dashboard | Dashboard |
| /income | Income |
| /expense | Expense |
| /transactions | Transactions |

---
