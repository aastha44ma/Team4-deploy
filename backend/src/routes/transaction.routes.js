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

router.post("/", authenticateUser, createTransaction);

router.get("/", authenticateUser, getAllTransactions);

router.get("/:id", authenticateUser, getTransactionById);

router.put("/:id", authenticateUser, updateTransaction);

router.delete("/:id", authenticateUser, deleteTransaction);

module.exports = router;