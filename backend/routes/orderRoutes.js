import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  deleteOrder,
} from "../controllers/orderController.js";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  createOrderSchema,
  getAllOrdersQuerySchema,
  getUserOrdersQuerySchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";

const router = express.Router();

/**
 * POST /api/orders
 * Create order (Authenticated users)
 */
router.post(
  "/",
  auth,
  validateRequest({ body: createOrderSchema }),
  createOrder,
);

/**
 * GET /api/orders/my-orders
 * Get logged-in user's orders
 * IMPORTANT: This route must come before the /:id route
 */
router.get(
  "/my-orders",
  auth,
  validateRequest({ query: getUserOrdersQuerySchema }),
  getUserOrders,
);

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get(
  "/:id",
  auth,
  validateRequest({ params: orderIdParamsSchema }),
  getOrderById,
);

/**
 * GET /api/orders
 * Get all orders (Admin only)
 */
router.get(
  "/",
  auth,
  isAdmin,
  validateRequest({ query: getAllOrdersQuerySchema }),
  getAllOrders,
);

/**
 * PUT /api/orders/:id
 * Update order status (Admin only)
 */
router.put(
  "/:id",
  auth,
  isAdmin,
  validateRequest({
    params: orderIdParamsSchema,
    body: updateOrderStatusSchema,
  }),
  updateOrderStatus,
);

/**
 * PATCH /api/orders/:id
 * Partially update order status (Admin only)
 */
router.patch(
  "/:id",
  auth,
  isAdmin,
  validateRequest({
    params: orderIdParamsSchema,
    body: updateOrderStatusSchema,
  }),
  updateOrderStatus,
);

/**
 * DELETE /api/orders/:id
 * Delete order and restore stock (Admin only)
 */
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateRequest({ params: orderIdParamsSchema }),
  deleteOrder,
);

export default router;
