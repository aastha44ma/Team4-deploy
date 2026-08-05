const prisma = require("../config/prisma");

// Summary Report
const getSummaryReport = async (req, res) => {
  try {
    const userId = req.user.userId;

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

    // Latest Tax Estimate
    const latestTax = await prisma.taxEstimate.findFirst({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpense = expense._sum.amount || 0;
    const totalBudget = budget._sum.limit || 0;
    const estimatedTax = latestTax?.estimatedTax || 0;

    res.status(200).json({
      success: true,
      report: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalBudget,
        estimatedTax,
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

// ==============================
// Monthly Report
// ==============================
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "Income") {
        income += transaction.amount;
      } else if (transaction.type === "Expense") {
        expense += transaction.amount;
      }
    });

    res.status(200).json({
      success: true,
      month: new Date().toLocaleString("default", {
        month: "long",
      }),
      income,
      expense,
      balance: income - expense,
      transactions,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==============================
// Tax Report
// ==============================
const getTaxReport = async (req, res) => {
  try {
    const userId = req.user.userId;

    const taxEstimates = await prisma.taxEstimate.findMany({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: taxEstimates.length,
      taxEstimates,
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
  getSummaryReport,
  getMonthlyReport,
  getTaxReport,
};