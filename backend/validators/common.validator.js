import Joi from "joi";

export const objectIdSchema = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .required()
  .messages({
    "string.empty": "ID is required",
    "any.required": "ID is required",
    "string.pattern.base": "ID is invalid",
  });

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be greater than 0",
  }),
  limit: Joi.number().integer().min(1).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be greater than 0",
  }),
});
