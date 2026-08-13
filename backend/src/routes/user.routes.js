const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword
} = require("../controllers/userController");

const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();


// GET PROFILE
router.get(
  "/profile",
  authenticateUser,
  getProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  authenticateUser,
  updateProfile
);


// CHANGE PASSWORD
router.put(
  "/password",
  authenticateUser,
  changePassword
);


module.exports = router;