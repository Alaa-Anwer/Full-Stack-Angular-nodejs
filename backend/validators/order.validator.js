import Joi from "joi";
import { objectIdSchema, paginationQuerySchema } from "./common.validator.js";

export const orderIdParamsSchema = Joi.object({
  id: objectIdSchema.messages({
    "string.pattern.base": "Order ID is invalid",
  }),
});

const orderProductSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      "string.empty": "Product ID is required",
      "any.required": "Product ID is required",
      "string.pattern.base": "Product ID is invalid",
    }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be greater than 0",
    "number.integer": "Quantity must be greater than 0",
    "number.min": "Quantity must be greater than 0",
    "any.required": "Quantity must be greater than 0",
  }),
});

export const createOrderSchema = Joi.object({
  products: Joi.array().items(orderProductSchema).min(1).required().messages({
    "array.base": "Products array is required and cannot be empty.",
    "array.min": "Products array is required and cannot be empty.",
    "any.required": "Products array is required and cannot be empty.",
  }),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "shipped", "delivered")
    .required()
    .messages({
      "any.only": "Invalid status",
      "any.required": "Invalid status",
      "string.empty": "Invalid status",
    }),
});

export const getAllOrdersQuerySchema = paginationQuerySchema.keys({
  status: Joi.string().valid("pending", "shipped", "delivered").messages({
    "any.only": "Invalid status",
  }),
});

export const getUserOrdersQuerySchema = paginationQuerySchema;
