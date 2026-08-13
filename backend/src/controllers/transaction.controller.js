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


        // -------------------------------------------------
        // Validation
        // -------------------------------------------------

        if (
            !type ||
            !category ||
            amount === undefined ||
            amount === null ||
            !date
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        // -------------------------------------------------
        // Logged-in User
        // -------------------------------------------------

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


        // -------------------------------------------------
        // Validate amount
        // -------------------------------------------------

        const numericAmount = Number(amount);

        if (
            Number.isNaN(numericAmount) ||
            numericAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a valid positive number"
            });
        }


        // -------------------------------------------------
        // Validate date
        // -------------------------------------------------

        const transactionDate = new Date(date);

        if (Number.isNaN(transactionDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction date"
            });
        }


        // -------------------------------------------------
        // Check category belongs to logged-in user
        // -------------------------------------------------

        const categoryExists =
            await prisma.category.findFirst({
                where: {
                    name: category,
                    userId: Number(userId)
                }
            });


        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Selected category does not exist"
            });
        }


        // -------------------------------------------------
        // Create Transaction
        // -------------------------------------------------

        const transaction =
            await prisma.transaction.create({

                data: {
                    type,
                    category,
                    amount: numericAmount,
                    date: transactionDate,
                    userId: Number(userId)
                }

            });


        // -------------------------------------------------
        // Success
        // -------------------------------------------------

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

        const id =
            Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
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

        const id =
            Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }


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


        if (
            !type ||
            !category ||
            amount === undefined ||
            !date
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        const updatedTransaction =
            await prisma.transaction.update({

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

        const id =
            Number(req.params.id);

        const userId =
            req.user?.id ||
            req.user?.userId;


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found"
            });
        }


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