const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {
  getSummaryReport,
  getMonthlyReport,
  getTaxReport,
} = require("../controllers/report.controller");

// Report Routes

// Summary Report
router.get("/summary", authenticateUser, getSummaryReport);

// Monthly Report
router.get("/monthly", authenticateUser, getMonthlyReport);

// Tax Report
router.get("/tax", authenticateUser, getTaxReport);

module.exports = router;