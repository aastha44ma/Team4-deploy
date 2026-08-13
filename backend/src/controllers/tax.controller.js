const prisma = require("../config/prisma");

// ==============================
// Calculate Tax
// ==============================
const calculateTax = (taxableIncome, taxRegime) => {
  let slabBreakdown = [];
  let estimatedTax = 0;

  if (taxRegime === "new") {
    // New Tax Regime
    const slabs = [
      { limit: 400000, rate: 0, label: "Up to ₹4,00,000" },
      { limit: 800000, rate: 0.05, label: "₹4,00,001 - ₹8,00,000" },
      { limit: 1200000, rate: 0.10, label: "₹8,00,001 - ₹12,00,000" },
      { limit: 1600000, rate: 0.15, label: "₹12,00,001 - ₹16,00,000" },
      { limit: 2000000, rate: 0.20, label: "₹16,00,001 - ₹20,00,000" },
      { limit: 2400000, rate: 0.25, label: "₹20,00,001 - ₹24,00,000" },
      { limit: Infinity, rate: 0.30, label: "Above ₹24,00,000" }
    ];

    let previousLimit = 0;

    for (const slab of slabs) {
      if (taxableIncome <= previousLimit) {
        break;
      }

      const taxableAmount =
        Math.min(taxableIncome, slab.limit) - previousLimit;

      const taxAmount = taxableAmount * slab.rate;

      slabBreakdown.push({
        label: slab.label,
        taxableAmount,
        rate: slab.rate * 100,
        taxAmount
      });

      estimatedTax += taxAmount;
      previousLimit = slab.limit;
    }
  } else {
    // Old Tax Regime
    const slabs = [
      { limit: 250000, rate: 0, label: "Up to ₹2,50,000" },
      { limit: 500000, rate: 0.05, label: "₹2,50,001 - ₹5,00,000" },
      { limit: 1000000, rate: 0.20, label: "₹5,00,001 - ₹10,00,000" },
      { limit: Infinity, rate: 0.30, label: "Above ₹10,00,000" }
    ];

    let previousLimit = 0;

    for (const slab of slabs) {
      if (taxableIncome <= previousLimit) {
        break;
      }

      const taxableAmount =
        Math.min(taxableIncome, slab.limit) - previousLimit;

      const taxAmount = taxableAmount * slab.rate;

      slabBreakdown.push({
        label: slab.label,
        taxableAmount,
        rate: slab.rate * 100,
        taxAmount
      });

      estimatedTax += taxAmount;
      previousLimit = slab.limit;
    }
  }

  const effectiveTaxRate =
    taxableIncome > 0
      ? (estimatedTax / taxableIncome) * 100
      : 0;

  return {
    estimatedTax,
    effectiveTaxRate,
    slabBreakdown
  };
};


// ==============================
// Create Tax Estimate
// ==============================
const createTaxEstimate = async (req, res) => {
  try {
    const {
      country,
      region,
      taxYear,
      taxRegime,
      taxableIncome
    } = req.body;

    // Validate required fields
    if (
      !country ||
      !region ||
      !taxYear ||
      !taxRegime ||
      taxableIncome === undefined ||
      taxableIncome === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All tax calculation fields are required"
      });
    }

    // Validate taxable income
    const income = Number(taxableIncome);

    if (
      !Number.isFinite(income) ||
      income < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Taxable income must be a valid non-negative number"
      });
    }

    // Validate tax regime
    if (!["new", "old"].includes(taxRegime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax regime"
      });
    }

    // Calculate tax using existing project tax logic
    const calculation = calculateTax(
      income,
      taxRegime
    );

    // Save tax estimate
    const taxEstimate = await prisma.taxEstimate.create({
      data: {
        annualIncome: income,
        quarter: taxYear,
        estimatedTax: calculation.estimatedTax,
        userId: req.user.userId
      }
    });

    return res.status(201).json({
      success: true,
      message: "Tax estimate calculated successfully",

      taxRegimeLabel:
        taxRegime === "new"
          ? "New Tax Regime"
          : "Old Tax Regime",

      taxYear,
      taxableIncome: income,
      estimatedTax: calculation.estimatedTax,
      effectiveTaxRate: calculation.effectiveTaxRate,
      slabBreakdown: calculation.slabBreakdown,

      taxEstimate
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// ==============================
// Get All Tax Estimates
// ==============================
const getAllTaxEstimates = async (req, res) => {
  try {
    const taxEstimates =
      await prisma.taxEstimate.findMany({
        where: {
          userId: req.user.userId
        },
        orderBy: {
          id: "desc"
        }
      });

    return res.status(200).json({
      success: true,
      count: taxEstimates.length,
      taxEstimates
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// ==============================
// Get Single Tax Estimate
// ==============================
const getTaxEstimateById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax estimate ID"
      });
    }

    const taxEstimate =
      await prisma.taxEstimate.findFirst({
        where: {
          id,
          userId: req.user.userId
        }
      });

    if (!taxEstimate) {
      return res.status(404).json({
        success: false,
        message: "Tax estimate not found"
      });
    }

    return res.status(200).json({
      success: true,
      taxEstimate
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// ==============================
// Delete Tax Estimate
// ==============================
const deleteTaxEstimate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax estimate ID"
      });
    }

    const taxEstimate =
      await prisma.taxEstimate.findFirst({
        where: {
          id,
          userId: req.user.userId
        }
      });

    if (!taxEstimate) {
      return res.status(404).json({
        success: false,
        message: "Tax estimate not found"
      });
    }

    await prisma.taxEstimate.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Tax estimate deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  createTaxEstimate,
  getAllTaxEstimates,
  getTaxEstimateById,
  deleteTaxEstimate
};