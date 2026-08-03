const prisma = require("../config/prisma");

// ==============================
// Create Tax Estimate
// ==============================
const createTaxEstimate = async (req, res) => {
  try {
    const { annualIncome, quarter } = req.body;

    if (!annualIncome || !quarter) {
      return res.status(400).json({
        success: false,
        message: "Annual income and quarter are required",
      });
    }

    let taxRate = 0;

    if (annualIncome <= 500000) {
      taxRate = 0.05;
    } else if (annualIncome <= 1000000) {
      taxRate = 0.10;
    } else {
      taxRate = 0.20;
    }

    const estimatedTax = annualIncome * taxRate;
   
    const taxEstimate = await prisma.taxEstimate.create({
      data: {
        annualIncome,
        quarter,
        estimatedTax,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tax estimate calculated successfully",
      taxEstimate,
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
// Get All Tax Estimates
// ==============================
const getAllTaxEstimates = async (req, res) => {
  try {
    const taxEstimates = await prisma.taxEstimate.findMany({
      where: {
        userId: req.user.userId,
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

// ==============================
// Get Single Tax Estimate
// ==============================
const getTaxEstimateById = async (req, res) => {
  try {
    const { id } = req.params;

    const taxEstimate = await prisma.taxEstimate.findFirst({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    });

    if (!taxEstimate) {
      return res.status(404).json({
        success: false,
        message: "Tax estimate not found",
      });
    }

    res.status(200).json({
      success: true,
      taxEstimate,
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
// Delete Tax Estimate
// ==============================
const deleteTaxEstimate = async (req, res) => {
  try {
    const { id } = req.params;

    const taxEstimate = await prisma.taxEstimate.findFirst({
      where: {
        id: Number(id),
        userId: req.user.userId,
      },
    });

    if (!taxEstimate) {
      return res.status(404).json({
        success: false,
        message: "Tax estimate not found",
      });
    }

    await prisma.taxEstimate.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Tax estimate deleted successfully",
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
  createTaxEstimate,
  getAllTaxEstimates,
  getTaxEstimateById,
  deleteTaxEstimate,
};