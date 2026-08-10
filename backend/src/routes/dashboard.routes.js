const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {
  getDashboard,
} = require("../controllers/dashboard.controller");

router.get("/", authenticateUser, getDashboard);

module.exports = router;