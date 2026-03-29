import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Valid email is required",
    "any.required": "Valid email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Valid email is required",
    "string.empty": "Valid email is required",
    "any.required": "Valid email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
