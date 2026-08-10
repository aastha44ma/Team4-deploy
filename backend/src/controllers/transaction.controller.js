const prisma = require("../config/prisma");

const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, date } = req.body;

        // Normalize transaction type
        const normalizedType =
            typeof type === "string" ? type.trim().toLowerCase() : "";

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

        if (!date || Number.isNaN(transactionDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Date must be a valid date"
            });
        }

        // Logged-in user
        const userId = req.user.userId;

        // Save transaction
        const transaction = await prisma.transaction.create({
            data: {
                type:
                    normalizedType === "income"
                        ? "Income"
                        : "Expense",
                category: category.trim(),
                amount: numericAmount,
                date: transactionDate,
                userId
            }
        });

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            transaction
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get All Transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: req.user.userId
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const getTransactionById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const transaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.user.userId
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const updateTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Check transaction belongs to logged-in user
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.user.userId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const { type, category, amount, date } = req.body;

        // Normalize transaction type
        const normalizedType =
            typeof type === "string" ? type.trim().toLowerCase() : "";

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

        if (!date || Number.isNaN(transactionDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Date must be a valid date"
            });
        }

        const updatedTransaction = await prisma.transaction.update({
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const deleteTransaction = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: req.user.userId
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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};