import express from "express";
import { register, login } from "../controllers/authController.js";
import validateRequest from "../middleware/validateRequest.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", validateRequest({ body: registerSchema }), register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", validateRequest({ body: loginSchema }), login);

export default router;
