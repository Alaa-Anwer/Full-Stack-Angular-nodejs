import Joi from "joi";
import { objectIdSchema, paginationQuerySchema } from "./common.validator.js";

export const productIdParamsSchema = Joi.object({
  id: objectIdSchema.messages({
    "string.pattern.base": "Product ID is invalid",
  }),
});

export const getProductsQuerySchema = paginationQuerySchema.keys({
  search: Joi.string().trim().allow(""),
  category: Joi.string().trim().allow(""),
  minPrice: Joi.number().min(0).messages({
    "number.base": "Min price must be a number",
    "number.min": "Min price must be a positive number",
  }),
  maxPrice: Joi.number().min(0).messages({
    "number.base": "Max price must be a number",
    "number.min": "Max price must be a positive number",
  }),
});

const baseProductSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a positive number",
    "number.min": "Price must be a positive number",
    "any.required": "Price must be a positive number",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a non-negative integer",
    "number.integer": "Stock must be a non-negative integer",
    "number.min": "Stock must be a non-negative integer",
    "any.required": "Stock must be a non-negative integer",
  }),
  category: Joi.string().trim().required().messages({
    "string.empty": "Category is required",
    "any.required": "Category is required",
  }),
  image: Joi.string().trim().allow(""),
});

export const createProductSchema = baseProductSchema;

export const updateProductSchema = baseProductSchema
  .fork(["title", "description", "price", "stock", "category"], (schema) =>
    schema.optional(),
  )
  .or("title", "description", "price", "stock", "category", "image")
  .messages({
    "object.missing": "At least one product field is required for update",
  });
