import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleGuard from "../middleware/roleGuardMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createProductSchema,
  getProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

const router = express.Router();

/**
 * GET /api/products
 * Get all products with filtering, pagination, and search
 */
router.get(
  "/",
  validateRequest({ query: getProductsQuerySchema }),
  getAllProducts,
);

/**
 * GET /api/products/:id
 * Get single product
 */
router.get(
  "/:id",
  validateRequest({ params: productIdParamsSchema }),
  getProductById,
);

/**
 * POST /api/products
 * Create product (Admin only)
 */
router.post(
  "/",
  authMiddleware,
  roleGuard("admin"),
  upload.single("image"),
  validateRequest({ body: createProductSchema }),
  createProduct,
);

/**
 * PUT /api/products/:id
 * Update product (Admin only)
 */
router.put(
  "/:id",
  authMiddleware,
  roleGuard("admin"),
  validateRequest({ params: productIdParamsSchema }),
  upload.single("image"),
  validateRequest({ body: updateProductSchema }),
  updateProduct,
);

/**
 * PATCH /api/products/:id
 * Partially update product (Admin only)
 */
router.patch(
  "/:id",
  authMiddleware,
  roleGuard("admin"),
  validateRequest({ params: productIdParamsSchema }),
  upload.single("image"),
  validateRequest({ body: updateProductSchema }),
  updateProduct,
);

/**
 * DELETE /api/products/:id
 * Delete product (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  roleGuard("admin"),
  validateRequest({ params: productIdParamsSchema }),
  deleteProduct,
);

export default router;
