const prisma = require("../config/prisma");

// Create Budget
const createBudget = async (req, res) => {
    try {
        const { category, limit, month } = req.body;

        // Validate category
        if (
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        // Validate budget limit
        const numericLimit = Number(limit);

        if (
            limit === undefined ||
            limit === null ||
            limit === "" ||
            !Number.isFinite(numericLimit) ||
            numericLimit <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be a valid positive number"
            });
        }

        // Validate month
        if (
            typeof month !== "string" ||
            !month.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Month is required"
            });
        }

        // Logged-in user
        const userId = req.user.userId;

        // Create Budget
        const budget = await prisma.budget.create({
            data: {
                category: category.trim(),
                limit: numericLimit,
                month: month.trim(),
                userId
            }
        });

        return res.status(201).json({
            success: true,
            message: "Budget created successfully",
            budget
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get All Budgets
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: {
                userId: req.user.userId
            },
            orderBy: {
                id: "desc"
            }
        });

        return res.status(200).json({
            success: true,
            count: budgets.length,
            budgets
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get Budget By ID
const getBudgetById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const budget = await prisma.budget.findFirst({
            where: {
                id,
                userId: req.user.userId
            }
        });

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        return res.status(200).json({
            success: true,
            budget
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Update Budget
const updateBudget = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Check Budget belongs to logged-in user
        const existingBudget = await prisma.budget.findFirst({
            where: {
                id,
                userId: req.user.userId
            }
        });

        if (!existingBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        const { category, limit, month } = req.body;

        // Validate category
        if (
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        // Validate budget limit
        const numericLimit = Number(limit);

        if (
            limit === undefined ||
            limit === null ||
            limit === "" ||
            !Number.isFinite(numericLimit) ||
            numericLimit <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be a valid positive number"
            });
        }

        // Validate month
        if (
            typeof month !== "string" ||
            !month.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Month is required"
            });
        }

        const updatedBudget = await prisma.budget.update({
            where: {
                id
            },
            data: {
                category: category.trim(),
                limit: numericLimit,
                month: month.trim()
            }
        });

        return res.status(200).json({
            success: true,
            message: "Budget updated successfully",
            budget: updatedBudget
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Delete Budget
const deleteBudget = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Check Budget belongs to logged-in user
        const existingBudget = await prisma.budget.findFirst({
            where: {
                id,
                userId: req.user.userId
            }
        });

        if (!existingBudget) {
            return res.status(404).json({
                success: false,
                message: "Budget not found"
            });
        }

        await prisma.budget.delete({
            where: {
                id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Budget deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    createBudget,
    getAllBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget
};