const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z.email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  country: z.string().min(2, "Country is required"),

  incomeBracket: z.string().min(1, "Income bracket is required"),
});

const loginSchema = z.object({
  email: z.email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};