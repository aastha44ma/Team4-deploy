const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {
    createBudget,
    getAllBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require("../controllers/budget.controller");

// Create Budget
router.post(
    "/",
    authenticateUser,
    createBudget
);

// Get All Budgets
router.get(
    "/",
    authenticateUser,
    getAllBudgets
);

// Get Budget By ID
router.get(
    "/:id",
    authenticateUser,
    getBudgetById
);

// Update Budget
router.put(
    "/:id",
    authenticateUser,
    updateBudget
);

// Delete Budget
router.delete(
    "/:id",
    authenticateUser,
    deleteBudget
);
module.exports = router;