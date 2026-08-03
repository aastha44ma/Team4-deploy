const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");
const { getUserProfile } = require("../controllers/userController");

router.get("/profile", authenticateUser, getUserProfile);

module.exports = router;