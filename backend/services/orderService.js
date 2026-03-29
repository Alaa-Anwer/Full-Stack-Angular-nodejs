import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

const MAX_LIMIT = 100;
const DEFAULT_PRODUCT_IMAGE = "https://via.placeholder.com/60";

const buildAbsoluteUrl = (protocol, host, pathValue) =>
  `${protocol}://${host}${pathValue.startsWith("/") ? pathValue : `/${pathValue}`}`;

const normalizeProductImage = (protocol, host, imageValue) => {
  if (typeof imageValue !== "string") {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const trimmed = imageValue.trim();
  if (!trimmed) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const uploadsPattern = /^\/?uploads\//i;
  if (uploadsPattern.test(trimmed)) {
    return buildAbsoluteUrl(protocol, host, trimmed);
  }

  return DEFAULT_PRODUCT_IMAGE;
};

const normalizeOrderForResponse = (protocol, host, orderDoc) => {
  const plain = orderDoc?.toObject ? orderDoc.toObject() : orderDoc;

  const normalizedProducts = Array.isArray(plain?.products)
    ? plain.products.map((item) => {
        const productSource =
          item?.product && typeof item.product === "object"
            ? item.product
            : null;

        const fallbackProductId =
          item?.product && typeof item.product !== "object"
            ? String(item.product)
            : undefined;

        return {
          ...item,
          product: {
            _id: productSource?._id || fallbackProductId,
            title: productSource?.title || "Product item",
            image: normalizeProductImage(protocol, host, productSource?.image),
            stock: Number.isFinite(Number(productSource?.stock))
              ? Number(productSource?.stock)
              : 0,
          },
        };
      })
    : [];

  return {
    ...plain,
    products: normalizedProducts,
  };
};

export const orderService = {
  async createOrder({ userId, products, protocol, host }) {
    const requestedByProductId = new Map();

    for (const item of products) {
      const safeQuantity = Number(item?.quantity);
      const productId = String(item?.productId ?? "");

      requestedByProductId.set(
        productId,
        (requestedByProductId.get(productId) ?? 0) + safeQuantity,
      );
    }

    const uniqueProductIds = [...requestedByProductId.keys()];
    const productDocs = await Product.find({ _id: { $in: uniqueProductIds } });

    if (productDocs.length !== uniqueProductIds.length) {
      throw new AppError(
        "One or more products were not found.",
        404,
        "NOT_FOUND",
      );
    }

    const productMap = new Map(
      productDocs.map((product) => [String(product._id), product]),
    );

    for (const [productId, requestedQty] of requestedByProductId.entries()) {
      const product = productMap.get(productId);

      if (!product || product.stock <= 0) {
        throw new AppError(
          `Product is out of stock: ${product?.title || productId}`,
          409,
          "STOCK_NOT_AVAILABLE",
        );
      }

      if (requestedQty > product.stock) {
        throw new AppError(
          `Insufficient stock for product: ${product.title}`,
          409,
          "STOCK_NOT_SUFFICIENT",
        );
      }
    }

    const stockUpdateResult = await Product.bulkWrite(
      [...requestedByProductId.entries()].map(([productId, requestedQty]) => ({
        updateOne: {
          filter: { _id: productId, stock: { $gte: requestedQty } },
          update: { $inc: { stock: -requestedQty } },
        },
      })),
    );

    if (stockUpdateResult.modifiedCount !== requestedByProductId.size) {
      throw new AppError(
        "Stock changed during checkout. Please refresh your cart.",
        409,
        "STOCK_CONFLICT",
      );
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const safeQuantity = Number(item.quantity);
      const product = productMap.get(String(item.productId));

      orderProducts.push({
        product: product._id,
        quantity: safeQuantity,
        price: product.price,
      });

      totalPrice += product.price * safeQuantity;
    }

    let createdOrder;
    try {
      createdOrder = await Order.create({
        user: userId,
        products: orderProducts,
        totalPrice,
        status: "pending",
      });
    } catch (orderCreateError) {
      await Product.bulkWrite(
        [...requestedByProductId.entries()].map(
          ([productId, requestedQty]) => ({
            updateOne: {
              filter: { _id: productId },
              update: { $inc: { stock: requestedQty } },
            },
          }),
        ),
      );

      throw orderCreateError;
    }

    const order = await Order.findById(createdOrder._id)
      .populate("user", "name email")
      .populate("products.product", "title image stock");

    return normalizeOrderForResponse(protocol, host, order);
  },

  async getUserOrders({ userId, page = 1, limit = 10, protocol, host }) {
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("products.product", "title image stock")
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    return {
      data: orders.map((order) =>
        normalizeOrderForResponse(protocol, host, order),
      ),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    };
  },

  async getAllOrders({ page = 1, limit = 10, status, protocol, host }) {
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = status ? { status } : {};

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("products.product", "title image stock")
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    return {
      data: orders.map((order) =>
        normalizeOrderForResponse(protocol, host, order),
      ),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    };
  },

  async updateOrderStatus({ orderId, status, protocol, host }) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true },
    )
      .populate("user", "name email")
      .populate("products.product", "title image stock");

    if (!order) {
      throw new AppError("Order not found.", 404, "NOT_FOUND");
    }

    return normalizeOrderForResponse(protocol, host, order);
  },

  async getOrderById({ orderId, requester, protocol, host }) {
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product", "title image stock");

    if (!order) {
      throw new AppError("Order not found.", 404, "NOT_FOUND");
    }

    const ownerId =
      order.user && typeof order.user === "object" && order.user._id
        ? order.user._id.toString()
        : String(order.user ?? "");

    const isOwner = ownerId === requester.userId;
    const isAdmin = requester.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError(
        "You are not allowed to view this order.",
        403,
        "FORBIDDEN",
      );
    }

    return normalizeOrderForResponse(protocol, host, order);
  },

  async deleteOrder({ orderId }) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError("Order not found.", 404, "NOT_FOUND");
    }

    const restockByProductId = new Map();

    for (const item of order.products) {
      const productId = String(item.product);
      restockByProductId.set(
        productId,
        (restockByProductId.get(productId) ?? 0) + Number(item.quantity ?? 0),
      );
    }

    await Product.bulkWrite(
      [...restockByProductId.entries()].map(([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: quantity } },
        },
      })),
    );

    await Order.deleteOne({ _id: order._id });
  },
};
