const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {exportPDF, exportCSV} = require("../controllers/export.controller");

router.get("/pdf", authenticateUser, exportPDF);

router.get("/csv", authenticateUser, exportCSV);

module.exports = router;