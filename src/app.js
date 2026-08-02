const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const taxRoutes = require("./routes/tax.routes");
const reportRoutes = require("./routes/report.routes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxRoutes);
app.use("/api/reports", reportRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 TaxPal Backend API is Running...");
});

module.exports = app;