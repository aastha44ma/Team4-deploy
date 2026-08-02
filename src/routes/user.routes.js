const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

router.get("/profile", authenticateUser, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Protected Route Accessed Successfully",
        user: req.user
    });
});

module.exports = router;