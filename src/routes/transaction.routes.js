const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transaction.controller");

// Create Transaction
router.post("/", authenticateUser, createTransaction);

// Get All Transactions
router.get("/", authenticateUser, getAllTransactions);

// Get Transaction By ID
router.get("/:id", authenticateUser, getTransactionById);

// Update Transaction
router.put("/:id", authenticateUser, updateTransaction);

// Delete Transaction
router.delete("/:id", authenticateUser, deleteTransaction);

module.exports = router;