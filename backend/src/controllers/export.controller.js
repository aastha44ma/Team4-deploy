const prisma = require("../config/prisma");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

const exportPDF = async (req, res) => {
    try {
        const userId = req.user.userId;

        const transactions = await prisma.transaction.findMany({
            where: { userId }
        });

        const doc = new PDFDocument();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=TaxPal_Report.pdf"
        );

        doc.pipe(res);

        doc.fontSize(22).text("TaxPal Financial Report", {
            align: "center"
        });

        doc.moveDown();

        transactions.forEach((transaction, index) => {
            doc
                .fontSize(12)
                .text(
                    `${index + 1}. ${transaction.type} | ${transaction.category} | ₹${transaction.amount} | ${new Date(transaction.date).toLocaleDateString()}`
                );
        });

        doc.end();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to export PDF"
        });
    }
};


const exportCSV = async (req, res) => {
    try {
        const userId = req.user.userId;

        const transactions = await prisma.transaction.findMany({
            where: { userId }
        });

        const parser = new Parser();

        const csv = parser.parse(transactions);

        res.header("Content-Type", "text/csv");

        res.attachment("TaxPal_Report.csv");

        return res.send(csv);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to export CSV"
        });
    }
};

module.exports = {
    exportPDF,
    exportCSV
};