const express = require("express");
const cors = require("cors");

const app = express();


// =======================================================
// Middleware
// =======================================================

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use(express.json());


// =======================================================
// Routes
// =======================================================

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const taxRoutes = require("./routes/tax.routes");
const reportRoutes = require("./routes/report.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const exportRoutes = require("./routes/export.routes");
const categoryRoutes = require("./routes/category.routes");

const errorHandler = require("./middleware/error.middleware");


// =======================================================
// API Routes
// =======================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/tax-estimates", taxRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/categories", categoryRoutes);


// =======================================================
// Test Route
// =======================================================

app.get("/", (req, res) => {
  res.send("🚀 TaxPal Backend API is Running...");
});


// =======================================================
// 404 Handler
// =======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});


// =======================================================
// Error Handler
// =======================================================

app.use(errorHandler);


module.exports = app;