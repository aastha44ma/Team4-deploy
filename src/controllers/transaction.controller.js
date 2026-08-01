const prisma = require("../config/prisma");

const createTransaction = async (req, res) => {
    try {

        const { type, category, amount, date } = req.body;

        // Validation
        if (!type || !category || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        

        // Logged-in user
        const userId = req.user.userId;
        

        // Save transaction
        const transaction = await prisma.transaction.create({
            data: {
                type,
                category,
                amount: Number(amount),
                date: new Date(date),
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

        const updatedTransaction = await prisma.transaction.update({
            where: {
                id
            },
            data: {
                type,
                category,
                amount: Number(amount),
                date: new Date(date)
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