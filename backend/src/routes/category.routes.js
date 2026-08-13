const express = require("express");

const {
    getCategories,
    createCategory,
    deleteCategory
} = require("../controllers/category.controller");

const authenticateUser = require("../middleware/auth.middleware");

const router = express.Router();


// =====================================================
// GET ALL CATEGORIES
// =====================================================

router.get(
    "/",
    authenticateUser,
    getCategories
);


// =====================================================
// GET CATEGORIES BY TYPE
// =====================================================

router.get(
    "/type/:type",
    authenticateUser,
    getCategories
);


// =====================================================
// CREATE CATEGORY
// =====================================================

router.post(
    "/",
    authenticateUser,
    createCategory
);


// =====================================================
// DELETE CATEGORY
// =====================================================

router.delete(
    "/:id",
    authenticateUser,
    deleteCategory
);


module.exports = router;