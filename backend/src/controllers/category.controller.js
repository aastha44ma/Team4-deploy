const prisma = require("../config/prisma");

// =====================================================
// GET CATEGORIES
// =====================================================

const getCategories = async (req, res) => {
    try {

        const userId = req.user.id;

        const { type } = req.params;

        const where = {
            userId
        };

        // Filter by type when requested
        if (type) {

            const normalizedType =
                type.toLowerCase();

            if (
                !["income", "expense"]
                    .includes(normalizedType)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Category type must be income or expense"
                });

            }

            where.type = normalizedType;
        }

        const categories =
            await prisma.category.findMany({

                where,

                orderBy: {
                    id: "asc"
                }

            });

        console.log(
            `Categories fetched for user ${userId}:`,
            categories
        );

        return res.status(200).json({

            success: true,

            categories

        });

    } catch (error) {

        console.error(
            "Get Categories Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error"

        });

    }
};


// =====================================================
// CREATE CATEGORY
// =====================================================

const createCategory = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            name,
            type
        } = req.body;

        if (!name || !type) {

            return res.status(400).json({

                success: false,

                message:
                    "Category name and type are required"

            });

        }

        const normalizedType =
            type.toLowerCase();

        if (
            !["income", "expense"]
                .includes(normalizedType)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Category type must be income or expense"

            });

        }

        const existingCategory =
            await prisma.category.findFirst({

                where: {

                    userId,

                    name,

                    type: normalizedType

                }

            });

        if (existingCategory) {

            return res.status(409).json({

                success: false,

                message:
                    "Category already exists"

            });

        }

        const category =
            await prisma.category.create({

                data: {

                    name,

                    type: normalizedType,

                    userId

                }

            });

        console.log(
            "Category created:",
            category
        );

        return res.status(201).json({

            success: true,

            message:
                "Category created successfully",

            category

        });

    } catch (error) {

        console.error(
            "Create Category Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error"

        });

    }

};

// =====================================================
// DELETE CATEGORY
// =====================================================

const deleteCategory = async (req, res) => {

    try {

        const userId = req.user.id;

        const categoryId = Number(req.params.id);

        if (!Number.isInteger(categoryId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid category ID"

            });

        }

        // Find category belonging to the logged-in user
        const category =
            await prisma.category.findFirst({

                where: {

                    id: categoryId,

                    userId

                }

            });

        if (!category) {

            return res.status(404).json({

                success: false,

                message: "Category not found"

            });

        }

        // Delete category
        await prisma.category.delete({

            where: {

                id: categoryId

            }

        });

        console.log(
            `Category ${categoryId} deleted for user ${userId}`
        );

        return res.status(200).json({

            success: true,

            message:
                "Category deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete Category Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error"

        });

    }

};

module.exports = {

    getCategories,

    createCategory,

    deleteCategory

};