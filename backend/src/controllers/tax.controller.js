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

      if (slab.limit !== Infinity) {
        previousLimit = slab.limit;
      }
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

      if (slab.limit !== Infinity) {
        previousLimit = slab.limit;
      }
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
      filingStatus,
      quarter,
      annualIncome,
      grossIncome,
      annualGrossIncome,
      deductions,
      taxableIncome
    } = req.body;

    // Support both annualIncome and annualGrossIncome
    const annualIncomeValue = Number(
      annualIncome ?? annualGrossIncome
    );

    const grossIncomeValue = Number(grossIncome);

    const deductionValues = {
      businessExpenses: Number(
        deductions?.businessExpenses ?? 0
      ),
      retirementContributions: Number(
        deductions?.retirementContributions ?? 0
      ),
      healthInsurance: Number(
        deductions?.healthInsurance ?? 0
      ),
      homeOffice: Number(
        deductions?.homeOffice ?? 0
      )
    };

    // ==============================
    // Validation
    // ==============================
    if (
      !country ||
      !region ||
      !taxYear ||
      !taxRegime ||
      !filingStatus ||
      !quarter
    ) {
      return res.status(400).json({
        success: false,
        message: "All tax calculation fields are required"
      });
    }

    if (
      !Number.isFinite(annualIncomeValue) ||
      annualIncomeValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Annual income must be a valid non-negative number"
      });
    }

    if (
      !Number.isFinite(grossIncomeValue) ||
      grossIncomeValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quarterly gross income must be a valid non-negative number"
      });
    }

    if (annualIncomeValue < grossIncomeValue) {
      return res.status(400).json({
        success: false,
        message: "Annual Gross Income cannot be less than Quarterly Gross Income"
      });
    }

    if (!["new", "old"].includes(taxRegime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax regime. Use new or old."
      });
    }

    const calculatedTaxableIncome = Math.max(
      0,
      annualIncomeValue -
        deductionValues.businessExpenses -
        deductionValues.retirementContributions -
        deductionValues.healthInsurance -
        deductionValues.homeOffice
    );

    const income =
      taxableIncome !== undefined && taxableIncome !== null
        ? Number(taxableIncome)
        : calculatedTaxableIncome;

    if (!Number.isFinite(income) || income < 0) {
      return res.status(400).json({
        success: false,
        message: "Taxable income must be a valid non-negative number"
      });
    }

    // ==============================
    // Calculate Tax
    // ==============================
    const calculation = calculateTax(
      income,
      taxRegime
    );

    // ==============================
    // Save Estimate
    // ==============================
    const taxEstimate = await prisma.taxestimate.create({
      data: {
        country,
        region,
        taxYear,
        taxRegime,
        filingStatus,
        quarter,
        annualIncome: annualIncomeValue,
        grossIncome: grossIncomeValue,
        businessExpenses:
          deductionValues.businessExpenses,
        retirementContributions:
          deductionValues.retirementContributions,
        healthInsurance:
          deductionValues.healthInsurance,
        homeOffice:
          deductionValues.homeOffice,
        taxableIncome: income,
        estimatedTax: calculation.estimatedTax,
        effectiveTaxRate:
          calculation.effectiveTaxRate,
        userId: req.user.id
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
      effectiveTaxRate:
        calculation.effectiveTaxRate,
      slabBreakdown:
        calculation.slabBreakdown,

      taxEstimate
    });

  } catch (error) {
    console.error("Tax calculation error:", error);

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
      await prisma.taxestimate.findMany({
        where: {
          userId: req.user.id
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
    console.error("Get tax estimates error:", error);

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

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax estimate ID"
      });
    }

    const taxEstimate =
      await prisma.taxestimate.findFirst({
        where: {
          id,
          userId: req.user.id
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
    console.error("Get tax estimate error:", error);

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

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax estimate ID"
      });
    }

    const taxEstimate =
      await prisma.taxestimate.findFirst({
        where: {
          id,
          userId: req.user.id
        }
      });

    if (!taxEstimate) {
      return res.status(404).json({
        success: false,
        message: "Tax estimate not found"
      });
    }

    await prisma.taxestimate.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      success: true,
      message: "Tax estimate deleted successfully"
    });

  } catch (error) {
    console.error("Delete tax estimate error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// ==============================
// EXPORTS
// ==============================
const calculateTaxOnly = async (req, res) => {
  try {
    const {
      country,
      region,
      taxYear,
      taxRegime,
      filingStatus,
      quarter,
      annualIncome,
      grossIncome,
      annualGrossIncome,
      deductions,
      taxableIncome
    } = req.body;

    const annualIncomeValue = Number(
      annualIncome ?? annualGrossIncome
    );

    const grossIncomeValue = Number(grossIncome);

    const deductionValues = {
      businessExpenses: Number(
        deductions?.businessExpenses ?? 0
      ),
      retirementContributions: Number(
        deductions?.retirementContributions ?? 0
      ),
      healthInsurance: Number(
        deductions?.healthInsurance ?? 0
      ),
      homeOffice: Number(
        deductions?.homeOffice ?? 0
      )
    };

    if (
      !country ||
      !region ||
      !taxYear ||
      !taxRegime ||
      !filingStatus ||
      !quarter
    ) {
      return res.status(400).json({
        success: false,
        message: "All tax calculation fields are required"
      });
    }

    if (
      !Number.isFinite(annualIncomeValue) ||
      annualIncomeValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Annual income must be a valid non-negative number"
      });
    }

    if (
      !Number.isFinite(grossIncomeValue) ||
      grossIncomeValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quarterly gross income must be a valid non-negative number"
      });
    }

    if (annualIncomeValue < grossIncomeValue) {
      return res.status(400).json({
        success: false,
        message: "Annual Gross Income cannot be less than Quarterly Gross Income"
      });
    }

    if (!["new", "old"].includes(taxRegime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tax regime. Use new or old."
      });
    }

    const calculatedTaxableIncome = Math.max(
      0,
      annualIncomeValue -
        deductionValues.businessExpenses -
        deductionValues.retirementContributions -
        deductionValues.healthInsurance -
        deductionValues.homeOffice
    );

    const income =
      taxableIncome !== undefined && taxableIncome !== null
        ? Number(taxableIncome)
        : calculatedTaxableIncome;

    if (!Number.isFinite(income) || income < 0) {
      return res.status(400).json({
        success: false,
        message: "Taxable income must be a valid non-negative number"
      });
    }

    const calculation = calculateTax(
      income,
      taxRegime
    );

    return res.status(200).json({
      success: true,
      message: "Tax calculated successfully",

      taxRegimeLabel:
        taxRegime === "new"
          ? "New Tax Regime"
          : "Old Tax Regime",

      taxYear,
      taxableIncome: income,
      estimatedTax: calculation.estimatedTax,
      effectiveTaxRate:
        calculation.effectiveTaxRate,
      slabBreakdown:
        calculation.slabBreakdown
    });

  } catch (error) {
    console.error("Tax calculation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


module.exports = {
  calculateTaxOnly,
  createTaxEstimate,
  getAllTaxEstimates,
  getTaxEstimateById,
  deleteTaxEstimate
};