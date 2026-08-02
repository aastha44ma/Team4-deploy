const prisma = require("../config/prisma");

// ==============================
// Dashboard
// ==============================
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // User
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        incomeBracket: true,
      },
    });

    // Income
    const income = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "Income",
      },
      _sum: {
        amount: true,
      },
    });

    // Expense
    const expense = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "Expense",
      },
      _sum: {
        amount: true,
      },
    });

    // Budget
    const budget = await prisma.budget.aggregate({
      where: {
        userId,
      },
      _sum: {
        limit: true,
      },
    });

    // Latest Tax
    const latestTax = await prisma.taxEstimate.findFirst({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    // Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;

    res.status(200).json({
      success: true,
      dashboard: {
        user,
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        },
        totalBudget: budget._sum.limit || 0,
        estimatedTax: latestTax?.estimatedTax || 0,
        recentTransactions,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getDashboard,
};