const prisma = require("../config/prisma");


// =========================================================
// CREATE TRANSACTION
// =========================================================

const createTransaction = async (req, res) => {
    try {
        const {
            type,
            category,
            amount,
            date
        } = req.body;

        // Normalize transaction type
        const normalizedType =
            typeof type === "string"
                ? type.trim().toLowerCase()
                : "";

        // Validate transaction type
        if (!["income", "expense"].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Type must be either Income or Expense"
            });
        }

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

        // Validate amount
        const numericAmount = Number(amount);

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number"
            });
        }

        // Validate date
        const transactionDate = new Date(date);

        if (
            !date ||
            Number.isNaN(transactionDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Date must be a valid date"
            });
        }

        // Logged-in user
        const userId =
            req.user?.id ||
            req.user?.userId;

        console.log("=================================");
        console.log("CREATE TRANSACTION");
        console.log("req.user:", req.user);
        console.log("userId:", userId);
        console.log("Body:", req.body);
        console.log("=================================");

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        // Check category belongs to logged-in user
        const categoryExists =
            await prisma.category.findFirst({
                where: {
                    name: category.trim(),
                    userId: Number(userId)
                }
            });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected category does not exist"
            });
        }

        // Create transaction
        const transaction =
            await prisma.transaction.create({
                data: {
                    type:
                        normalizedType === "income"
                            ? "Income"
                            : "Expense",
                    category: category.trim(),
                    amount: numericAmount,
                    date: transactionDate,
                    userId: Number(userId)
                }
            });

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction
        });

    } catch (error) {
        console.error("=================================");
        console.error("CREATE TRANSACTION ERROR");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Meta:", error.meta);
        console.error("Full Error:", error);
        console.error("=================================");

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};


// =========================================================
// GET ALL TRANSACTIONS
// =========================================================

const getAllTransactions = async (req, res) => {
    try {
        const userId =
            req.user?.id ||
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }

        const transactions =
            await prisma.transaction.findMany({
                where: {
                    userId: Number(userId)
                },
                orderBy: {
                    date: "desc"
                }
            });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error(
            "GET TRANSACTIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// =========================================================
// GET TRANSACTION BY ID
// =========================================================

const getTransactionById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        const transaction =
            await prisma.transaction.findFirst({
                where: {
                    id,
                    userId: Number(userId)
                }
            });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            transaction
        });

    } catch (error) {
        console.error(
            "GET TRANSACTION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// =========================================================
// UPDATE TRANSACTION
// =========================================================

const updateTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        // Check transaction belongs to logged-in user
        const existingTransaction =
            await prisma.transaction.findFirst({
                where: {
                    id,
                    userId: Number(userId)
                }
            });

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const {
            type,
            category,
            amount,
            date
        } = req.body;

        // Normalize transaction type
        const normalizedType =
            typeof type === "string"
                ? type.trim().toLowerCase()
                : "";

        // Validate transaction type
        if (!["income", "expense"].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Type must be either Income or Expense"
            });
        }

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

        // Validate amount
        const numericAmount = Number(amount);

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number"
            });
        }

        // Validate date
        const transactionDate = new Date(date);

        if (
            !date ||
            Number.isNaN(transactionDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Date must be a valid date"
            });
        }

        // Check category belongs to logged-in user
        const categoryExists =
            await prisma.category.findFirst({
                where: {
                    name: category.trim(),
                    userId: Number(userId)
                }
            });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected category does not exist"
            });
        }

        const updatedTransaction =
            await prisma.transaction.update({
                where: {
                    id
                },
                data: {
                    type:
                        normalizedType === "income"
                            ? "Income"
                            : "Expense",
                    category: category.trim(),
                    amount: numericAmount,
                    date: transactionDate
                }
            });

        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });

    } catch (error) {
        console.error(
            "UPDATE TRANSACTION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// =========================================================
// DELETE TRANSACTION
// =========================================================

const deleteTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID"
            });
        }

        // Check transaction belongs to logged-in user
        const existingTransaction =
            await prisma.transaction.findFirst({
                where: {
                    id,
                    userId: Number(userId)
                }
            });

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        await prisma.transaction.delete({
            where: {
                id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error(
            "DELETE TRANSACTION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};