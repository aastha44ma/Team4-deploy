const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, country, incomeBracket } = req.body;

        // 1. Validation
        if (!name || !email || !password || !country || !incomeBracket) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Check duplicate email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                country,
                incomeBracket
            }
        });

        // 5. Remove password from response
        const { password: _, ...safeUser } = user;

        // 6. FINAL RESPONSE (👇 YAHAN PASTE KARNA HAI)
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: safeUser
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Remove password
        const { password: _, ...safeUser } = user;

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: safeUser
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};