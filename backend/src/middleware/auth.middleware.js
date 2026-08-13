const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // JWT currently stores the user ID as `userId`.
        // Normalize it to `req.user.id` for the rest of the backend.
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };

        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token. User ID not found."
            });
        }

        next();

    } catch (error) {

        console.error("Authentication Error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }
};

module.exports = authenticateUser;