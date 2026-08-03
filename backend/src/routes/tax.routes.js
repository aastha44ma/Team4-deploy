const express = require("express");

const router = express.Router();

const {
  createTaxEstimate,
  getAllTaxEstimates,
  getTaxEstimateById,
  deleteTaxEstimate,
} = require("../controllers/tax.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Create & Calculate Tax
router.post("/", authMiddleware, createTaxEstimate);

// Get All Tax Records
router.get("/", authMiddleware, getAllTaxEstimates);

// Get Single Tax Record
router.get("/:id", authMiddleware, getTaxEstimateById);

// Delete Tax Record
router.delete("/:id", authMiddleware, deleteTaxEstimate);

module.exports = router;